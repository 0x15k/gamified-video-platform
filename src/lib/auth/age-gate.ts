export const AGE_GATE_COOKIE = "age_verified";
export const AGE_GATE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export const AGE_GATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: AGE_GATE_MAX_AGE_SEC,
};
