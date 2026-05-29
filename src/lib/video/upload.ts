import { mkdirSync, createWriteStream, existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { env } from "@/lib/env";

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

export function videoStorageDir() {
  return path.resolve(env.VIDEO_STORAGE_PATH);
}

export async function saveUploadedVideo(
  file: File,
): Promise<{ urlHash: string; size: number }> {
  if (!file.type.startsWith("video/") && !file.name.toLowerCase().endsWith(".mp4")) {
    throw new Error("Solo archivos de vídeo (MP4)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Archivo demasiado grande (máx. 200 MB)");
  }

  const urlHash = randomUUID().replace(/-/g, "");
  const dir = videoStorageDir();
  mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${urlHash}.mp4`);

  const buffer = Buffer.from(await file.arrayBuffer());
  await pipeline(Readable.from(buffer), createWriteStream(dest));

  return { urlHash, size: buffer.length };
}

export function videoFileExists(urlHash: string): boolean {
  return existsSync(path.join(videoStorageDir(), `${urlHash}.mp4`));
}
