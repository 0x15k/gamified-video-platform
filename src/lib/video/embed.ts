const PLATFORM_SUFFIXES = [
  "pornhub.com",
  "xvideos.com",
  "spankbang.com",
  "eporner.com",
];

const DEFAULT_ALLOWED = [
  ...PLATFORM_SUFFIXES,
  "phncdn.com",
  "xvideos-cdn.com",
];

export function getEmbedAllowedHosts(): string[] {
  const raw = process.env.EMBED_ALLOWED_HOSTS;
  if (!raw?.trim()) return DEFAULT_ALLOWED;
  return raw.split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
}

function hostAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  const allowed = getEmbedAllowedHosts();

  return allowed.some((entry) => {
    const base = entry.replace(/^\*\./, "");
    return host === entry || host === base || host.endsWith(`.${base}`);
  });
}

/** Convierte URLs de vista / iframe a URL embed canónica (HTTPS). */
export function canonicalizeEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const candidate = (srcMatch?.[1] ?? trimmed).trim();

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    if (!hostAllowed(url.hostname)) return null;

    const canonical = providerCanonicalEmbed(url);
    if (!canonical) return null;

    const out = new URL(canonical);
    if (!hostAllowed(out.hostname)) return null;
    return out.toString();
  } catch {
    return null;
  }
}

function providerCanonicalEmbed(url: URL): string | null {
  const host = url.hostname.toLowerCase();

  if (host.includes("pornhub")) {
    const viewkey = url.searchParams.get("viewkey");
    if (viewkey) {
      return `https://www.pornhub.com/embed/${viewkey}`;
    }
    const embedId = url.pathname.match(/\/embed\/([^/?#]+)/i)?.[1];
    if (embedId) {
      return `https://www.pornhub.com/embed/${embedId}`;
    }
    return null;
  }

  if (host.includes("xvideos")) {
    const embedframe = url.pathname.match(/\/embedframe\/([^/?#]+)/i)?.[1];
    if (embedframe) {
      return `https://www.xvideos.com/embedframe/${embedframe}`;
    }
    const videoId = url.pathname.match(/\/video\.([^/?#]+)\/([^/?#]+)/i);
    if (videoId) {
      return `https://www.xvideos.com/embedframe/${videoId[2]}`;
    }
    return null;
  }

  if (host.includes("spankbang")) {
    if (url.pathname.includes("/embed/")) {
      return url.toString().replace(/^https?:\/\/[^/]+/i, "https://www.spankbang.com");
    }
    return null;
  }

  if (host.includes("eporner")) {
    if (url.pathname.includes("/embed/")) {
      return url.toString().replace(/^https?:\/\/[^/]+/i, "https://www.eporner.com");
    }
    return null;
  }

  return null;
}

/** @deprecated alias */
export function normalizeEmbedInput(input: string): string | null {
  return canonicalizeEmbedUrl(input);
}

export function isAiTagged(tags: string[]): boolean {
  const lower = tags.map((t) => t.toLowerCase());
  return lower.some((t) =>
    ["ai", "ia", "animation", "animated", "3d", "cgi", "generated"].includes(t),
  );
}
