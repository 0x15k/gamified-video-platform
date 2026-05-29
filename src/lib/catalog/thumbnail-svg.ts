function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) % 360;
  return h;
}

export function buildThumbnailSvg(title: string, tags: string[] = []): string {
  const raw = hashHue(title);
  const hue = 25 + (raw % 35);
  const hue2 = hue + 12;
  const tag = tags[0] ?? "video";
  const safeTitle = title.slice(0, 48).replace(/[<>&'"]/g, "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue},55%,35%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2},60%,22%)"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <circle cx="320" cy="165" r="36" fill="rgba(255,255,255,0.15)"/>
  <polygon points="308,150 308,180 338,165" fill="white" opacity="0.9"/>
  <text x="32" y="300" fill="white" font-family="system-ui,sans-serif" font-size="22" font-weight="600">${safeTitle}</text>
  <text x="32" y="330" fill="rgba(255,255,255,0.6)" font-family="system-ui,sans-serif" font-size="14">#${tag}</text>
</svg>`;
}
