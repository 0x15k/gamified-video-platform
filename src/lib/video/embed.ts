const DEFAULT_ALLOWED = [
  "pornhub.com",
  "www.pornhub.com",
  "phncdn.com",
  "xvideos.com",
  "www.xvideos.com",
  "xvideos-cdn.com",
  "spankbang.com",
  "www.spankbang.com",
  "eporner.com",
  "www.eporner.com",
];

export function getEmbedAllowedHosts(): string[] {
  const raw = process.env.EMBED_ALLOWED_HOSTS;
  if (!raw?.trim()) return DEFAULT_ALLOWED;
  return raw.split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
}

function hostAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return getEmbedAllowedHosts().some(
    (allowed) => host === allowed || host.endsWith(`.${allowed.replace(/^\*\./, "")}`),
  );
}

/** Extrae URL de iframe HTML o URL directa de embed. */
export function normalizeEmbedInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const candidate = (srcMatch?.[1] ?? trimmed).trim();

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    if (!hostAllowed(url.hostname)) return null;
    if (!isLikelyEmbedPath(url)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isLikelyEmbedPath(url: URL): boolean {
  const p = url.pathname.toLowerCase();
  return (
    p.includes("/embed") ||
    p.includes("/embedframe") ||
    p.includes("/xembed") ||
    url.hostname.includes("pornhub") ||
    url.hostname.includes("xvideos") ||
    url.hostname.includes("spankbang") ||
    url.hostname.includes("eporner")
  );
}

export function isAiTagged(tags: string[]): boolean {
  const lower = tags.map((t) => t.toLowerCase());
  return lower.some((t) =>
    ["ai", "ia", "animation", "animated", "3d", "cgi", "generated"].includes(t),
  );
}
