import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRateLimit, jsonError, getAuthUser } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";
import { trackEvent } from "@/lib/analytics/track";

const eventSchema = z.object({
  eventType: z.string().min(1).max(64),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await getAuthUser(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400);

  await trackEvent(parsed.data.eventType, user?.id ?? null, parsed.data.metadata ?? {});

  return applySecurityHeaders(NextResponse.json({ ok: true }));
}
