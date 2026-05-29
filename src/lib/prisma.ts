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

const { prisma, pool } =
  globalForPrisma.prisma && globalForPrisma.pool
    ? { prisma: globalForPrisma.prisma, pool: globalForPrisma.pool }
    : createPrismaClient();

export { prisma };

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
