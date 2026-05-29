const PRELOAD_BYTES = 512 * 1024;

export async function preloadVideoChunk(streamUrl: string): Promise<string | null> {
  try {
    const res = await fetch(streamUrl, {
      headers: { Range: `bytes=0-${PRELOAD_BYTES - 1}` },
      credentials: "include",
    });
    if (!res.ok && res.status !== 206) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function revokePreloadUrls(urls: Iterable<string>) {
  for (const url of urls) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
}
