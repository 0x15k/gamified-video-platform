export type AccountType = "USER" | "ADMIN";
export type SubscriptionPlan = "FREE" | "PREMIUM" | "WHALE";

export type SessionUser = {
  id: string;
  email: string;
  accountType: AccountType;
  plan: SubscriptionPlan;
  displayName?: string | null;
  bio?: string | null;
  tokensBalance: number;
  avatarData: unknown;
};
