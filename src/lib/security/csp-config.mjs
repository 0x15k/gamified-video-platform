/** Used by next.config.ts (no TS import in config). Keep in sync with csp.ts */
export const EMBED_FRAME_ORIGINS = [
  "'self'",
  "https://*.pornhub.com",
  "https://www.pornhub.com",
  "https://pornhub.com",
  "https://www.xvideos.com",
  "https://xvideos.com",
  "https://www.spankbang.com",
  "https://spankbang.com",
  "https://www.eporner.com",
  "https://eporner.com",
];

export function buildContentSecurityPolicy() {
  const frameSrc = EMBED_FRAME_ORIGINS.join(" ");
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    `frame-src ${frameSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
