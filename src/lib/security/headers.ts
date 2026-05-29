import { env } from "@/lib/env";
import { buildContentSecurityPolicy } from "@/lib/security/csp";

export function getSecurityHeaders(): Record<string, string> {
  const isProd = env.NODE_ENV === "production";

  const headers: Record<string, string> = {
    "Content-Security-Policy": buildContentSecurityPolicy(),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-DNS-Prefetch-Control": "off",
  };

  if (isProd) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  return headers;
}

export function applySecurityHeaders<T extends Response>(response: T): T {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
