import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TOKEN_PACKS } from "@/lib/store/packs";
import { requireAuth, requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const checkoutSchema = z.object({
  packId: z.string().min(1),
});

/** Dev/shell checkout — simulates a completed purchase without a real gateway. */
export async function POST(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const pack = TOKEN_PACKS.find((p) => p.id === parsed.data.packId);
  if (!pack) return jsonError("Pack not found", 404);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        userId: user.id,
        amount: 0,
        currency: "USD",
        status: "COMPLETED",
        gateway: "INTERNAL",
        metadata: {
          type: "token_purchase_mock",
          packId: pack.id,
          tokensToCredit: pack.tokens,
        },
      },
    });
    return tx.user.update({
      where: { id: user.id },
      data: { tokensBalance: { increment: pack.tokens } },
      select: {
        id: true,
        email: true,
        role: true,
        tokensBalance: true,
        avatarData: true,
      },
    });
  });

  return applySecurityHeaders(
    NextResponse.json({
      ok: true,
      pack: { id: pack.id, tokens: pack.tokens },
      user: updated,
    }),
  );
}
