import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireRateLimit,
  deductTokensForNode,
  jsonError,
} from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const spendSchema = z.object({
  nodeId: z.string().min(1),
});

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

  const parsed = spendSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  const node = await prisma.videoNode.findUnique({
    where: { id: parsed.data.nodeId },
  });
  if (!node) return jsonError("Node not found", 404);

  const result = await deductTokensForNode(user.id, node);
  if (!result.ok) return result.response;

  return applySecurityHeaders(
    NextResponse.json({
      user: {
        id: result.user.id,
        tokensBalance: result.user.tokensBalance,
        role: result.user.role,
      },
    }),
  );
}
