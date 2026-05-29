import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform/settings";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET() {
  const settings = await getPlatformSettings();
  return applySecurityHeaders(NextResponse.json({ settings }));
}
