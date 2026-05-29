export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function buildNodeSlug(title: string, idSuffix: string): string {
  const base = slugifyTitle(title) || "video";
  return `${base}-${idSuffix.slice(0, 8)}`;
}
