import type { SubscriptionPlan } from "@/lib/rbac/types";

const STYLES: Record<SubscriptionPlan, string> = {
  FREE: "bg-[var(--bg-hover)] text-[var(--text-muted)]",
  PREMIUM: "bg-[var(--accent-muted)] text-[var(--accent)]",
  WHALE: "bg-amber-500/20 text-[var(--premium)]",
};

const LABELS: Record<SubscriptionPlan, string> = {
  FREE: "Free",
  PREMIUM: "Premium",
  WHALE: "Whale",
};

export function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${STYLES[plan]}`}>
      {LABELS[plan]}
    </span>
  );
}
