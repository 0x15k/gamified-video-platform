import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  pool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: env.DATABASE_URL,
    });
  const adapter = new PrismaPg(pool);
  return { prisma: new PrismaClient({ adapter }), pool };
}

/** After schema changes, dev HMR can keep an old PrismaClient without new delegates. */
function clientHasCurrentSchema(client: PrismaClient): boolean {
  return "aiModel" in client;
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma && clientHasCurrentSchema(globalForPrisma.prisma)) {
    return globalForPrisma.prisma;
  }

  const { prisma, pool } = createPrismaClient();
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
  return prisma;
}

/** Lazy proxy so hot reload picks up regenerated Prisma delegates. */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = getPrismaClient();
}
