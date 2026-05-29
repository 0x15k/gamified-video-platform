export type NavItem = {
  href: string;
  label: string;
  badge?: "notifications";
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

/** Navegación usuario final — estilo app consumer 2026 */
export const USER_NAV: NavSection[] = [
  {
    title: "Explorar",
    items: [
      { href: "/dashboard", label: "Inicio" },
      { href: "/catalog", label: "Catálogo" },
      { href: "/story", label: "Mapa" },
      { href: "/player", label: "Reproductor" },
    ],
  },
  {
    title: "Tu cuenta",
    items: [
      { href: "/avatar", label: "Avatar" },
      { href: "/wallet", label: "Billetera" },
      { href: "/bookmarks", label: "Favoritos" },
      { href: "/notifications", label: "Notificaciones", badge: "notifications" },
      { href: "/store", label: "Tienda" },
      { href: "/upgrade", label: "Planes" },
      { href: "/settings", label: "Ajustes" },
    ],
  },
];

/** Panel staff — separado del producto usuario */
export const ADMIN_NAV: NavSection[] = [
  {
    title: "Plataforma",
    items: [
      { href: "/admin", label: "Resumen" },
      { href: "/admin/content", label: "Contenido" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/settings", label: "Configuración" },
    ],
  },
];
