import { createReadStream, statSync, existsSync } from "fs";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { consumeMediaToken, resolveVideoPath } from "@/lib/security/media-token";
import { requireRateLimit, jsonError } from "@/lib/security/api-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

export const runtime = "nodejs";

function nodeStreamToWeb(stream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });
}

export async function GET(request: NextRequest) {
  const limited = await requireRateLimit(request, "media");
  if (limited) return limited;

  const token = request.nextUrl.searchParams.get("token");
  if (!token) return jsonError("Missing token", 400);

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const payload = await consumeMediaToken(token, clientIp);
  if (!payload) return jsonError("Invalid or expired token", 403);

  const filePath = resolveVideoPath(payload.fileName);
  if (!filePath || !existsSync(filePath)) {
    return jsonError("Media not found", 404);
  }

  const stat = statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get("range");

  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) return jsonError("Invalid range", 416);

    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
    if (start >= fileSize || end >= fileSize || start > end) {
      return jsonError("Range not satisfiable", 416);
    }

    const chunkSize = end - start + 1;
    const stream = createReadStream(filePath, { start, end });
    const response = new NextResponse(nodeStreamToWeb(stream), {
      status: 206,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(chunkSize),
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
      },
    });
    return applySecurityHeaders(response);
  }

  const stream = createReadStream(filePath);
  const response = new NextResponse(nodeStreamToWeb(stream), {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
    },
  });
  return applySecurityHeaders(response);
}
