import type { SubscriptionPlan } from "@/lib/rbac/types";
import { hasPremiumPlan } from "@/lib/rbac/permissions";

/** Premium / Whale subscribers and staff never see ads. */
export function shouldShowAds(input: {
  adsEnabled: boolean;
  plan?: SubscriptionPlan | null;
  isStaff?: boolean;
}): boolean {
  if (!input.adsEnabled) return false;
  if (input.isStaff) return false;
  if (input.plan && hasPremiumPlan(input.plan)) return false;
  return true;
}
