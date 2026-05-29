import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getWebhookSecrets } from "@/lib/env";
import { verifyHmacSignature } from "@/lib/payments/webhook";
import { requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const cryptoPayloadSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.string().default("USDT"),
  txHash: z.string().min(8),
  tokensToCredit: z.coerce.number().int().positive().default(100),
});

export async function POST(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const rawBody = await request.text();
  const signature = request.headers.get("x-crypto-signature");
  const { crypto: secret } = getWebhookSecrets();

  if (!verifyHmacSignature(rawBody, signature, secret)) {
    return jsonError("Invalid signature", 401);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = cryptoPayloadSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 400);

  const { userId, amount, currency, txHash, tokensToCredit } = parsed.data;

  const existing = await prisma.transaction.findFirst({
    where: {
      gateway: "CRYPTO",
      metadata: { path: ["txHash"], equals: txHash },
    },
  });
  if (existing) {
    return applySecurityHeaders(NextResponse.json({ ok: true, duplicate: true }));
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        userId,
        amount,
        currency,
        status: "COMPLETED",
        gateway: "CRYPTO",
        metadata: { txHash, type: "token_purchase", tokensToCredit },
      },
    });
    await tx.user.update({
      where: { id: userId },
      data: { tokensBalance: { increment: tokensToCredit } },
    });
  });

  return applySecurityHeaders(NextResponse.json({ ok: true }));
}
