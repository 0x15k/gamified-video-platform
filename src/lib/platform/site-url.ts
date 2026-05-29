export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (url?.startsWith("http")) return url.replace(/\/$/, "");
  if (url) return `https://${url.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}
