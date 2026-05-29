"use client";

import type { ChildOption } from "@/stores/usePlayerStore";

type Props = {
  options: ChildOption[];
  tokensBalance: number;
  userPlan: "FREE" | "PREMIUM" | "WHALE";
  onSelect: (option: ChildOption) => void;
};

function canAccessPremium(
  opt: ChildOption,
  tokensBalance: number,
  userPlan: Props["userPlan"],
) {
  if (!opt.isPremium) return true;
  if (userPlan === "PREMIUM" || userPlan === "WHALE") return true;
  return tokensBalance >= opt.tokenCost;
}

export function DecisionOverlay({ options, tokensBalance, userPlan, onSelect }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/50 p-6">
      <div className="flex w-full max-w-2xl flex-col gap-3">
        <p className="text-center text-sm font-medium text-white">¿Qué camino eliges?</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((opt) => {
            const locked = !canAccessPremium(opt, tokensBalance, userPlan);
            return (
              <button
                key={opt.id}
                type="button"
                disabled={locked}
                onClick={() => onSelect(opt)}
                className="rounded-lg border border-white/20 bg-zinc-900/90 px-4 py-3 text-left text-white transition hover:border-indigo-400 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="font-semibold">{opt.choiceLabel ?? opt.title}</span>
                {opt.choiceLabel && opt.choiceLabel !== opt.title && (
                  <span className="mt-0.5 block text-xs text-zinc-400">{opt.title}</span>
                )}
                {opt.isPremium && (
                  <span className="mt-1 block text-xs text-amber-300">
                    Premium · {opt.tokenCost} tokens
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
