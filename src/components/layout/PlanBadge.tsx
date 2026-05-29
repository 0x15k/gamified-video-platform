import type { SubscriptionPlan } from "@/lib/rbac/types";

const STYLES: Record<SubscriptionPlan, string> = {
  FREE: "bg-zinc-800 text-zinc-300",
  PREMIUM: "bg-indigo-600/30 text-indigo-300",
  WHALE: "bg-amber-600/20 text-amber-300",
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
