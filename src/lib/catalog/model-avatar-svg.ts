function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) % 360;
  return h;
}

export function buildModelAvatarSvg(name: string, slug: string): string {
  const raw = hashHue(slug);
  const hue = 18 + (raw % 40);
  const hue2 = hue + 18;
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  const safeName = name.slice(0, 24).replace(/[<>&'"]/g, "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue},62%,42%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2},55%,24%)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="200" cy="175" r="72" fill="rgba(0,0,0,0.2)"/>
  <text x="200" y="195" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="72" font-weight="700">${initial}</text>
  <text x="200" y="340" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="system-ui,sans-serif" font-size="20" font-weight="600">${safeName}</text>
  <text x="200" y="368" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif" font-size="13">IA</text>
</svg>`;
}
