import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  MEDIA_SIGNING_SECRET: z.string().min(32),
  MEDIA_TOKEN_TTL_SEC: z.coerce.number().int().positive().default(120),
  VIDEO_STORAGE_PATH: z.string().min(1).default("./storage/videos"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();

export function getWebhookSecrets(): { ccbill?: string; crypto?: string } {
  const ccbill = process.env.WEBHOOK_CCBILL_SECRET;
  const crypto = process.env.WEBHOOK_CRYPTO_SECRET;
  return {
    ...(ccbill && ccbill.length >= 16 ? { ccbill } : {}),
    ...(crypto && crypto.length >= 16 ? { crypto } : {}),
  };
}
