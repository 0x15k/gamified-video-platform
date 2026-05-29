import { NextRequest, NextResponse } from "next/server";
import { saveUploadedVideo } from "@/lib/video/upload";
import { requireAuth, requireRateLimit, requireAdmin, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function POST(request: NextRequest) {
  const limited = await requireRateLimit(request, "api");
  if (limited) return limited;

  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;
  const denied = requireAdmin(user);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("FormData inválido", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Campo file requerido", 400);
  }

  try {
    const { urlHash, size } = await saveUploadedVideo(file);
    return applySecurityHeaders(
      NextResponse.json({ urlHash, size, fileName: `${urlHash}.mp4` }),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al subir";
    return jsonError(msg, 400);
  }
}
