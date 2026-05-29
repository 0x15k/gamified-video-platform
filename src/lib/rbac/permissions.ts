import type { AccountType, SubscriptionPlan } from "@/lib/rbac/types";

/** Staff: plataforma, contenido, analytics, usuarios. No consume la app como alumno. */
export function isAdmin(accountType: AccountType): boolean {
  return accountType === "ADMIN";
}

/** Usuario final: catálogo, progreso, tienda, avatar. Sin panel creator ni analytics. */
export function isEndUser(accountType: AccountType): boolean {
  return accountType === "USER";
}

export function hasPremiumPlan(plan: SubscriptionPlan): boolean {
  return plan === "PREMIUM" || plan === "WHALE";
}

export const RBAC = {
  admin: {
    routes: ["/admin"],
    capabilities: [
      "platform.settings",
      "content.crud",
      "analytics.read",
      "users.read",
    ],
  },
  user: {
    routes: [
      "/dashboard",
      "/catalog",
      "/story",
      "/player",
      "/avatar",
      "/store",
      "/wallet",
      "/bookmarks",
      "/notifications",
      "/upgrade",
      "/settings",
    ],
    capabilities: [
      "content.consume",
      "progress.save",
      "bookmarks",
      "profile.edit",
      "store.checkout_mock",
    ],
  },
} as const;
