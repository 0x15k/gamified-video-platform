-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM', 'WHALE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "account_type" "AccountType";
ALTER TABLE "users" ADD COLUMN "plan" "SubscriptionPlan";

UPDATE "users" SET "account_type" = 'ADMIN', "plan" = 'FREE' WHERE "role" = 'ADMIN';
UPDATE "users" SET "account_type" = 'USER', "plan" = 'FREE' WHERE "role" = 'FREE';
UPDATE "users" SET "account_type" = 'USER', "plan" = 'PREMIUM' WHERE "role" = 'PREMIUM';
UPDATE "users" SET "account_type" = 'USER', "plan" = 'WHALE' WHERE "role" = 'WHALE';

ALTER TABLE "users" ALTER COLUMN "account_type" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "account_type" SET DEFAULT 'USER';
ALTER TABLE "users" ALTER COLUMN "plan" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "plan" SET DEFAULT 'FREE';

ALTER TABLE "users" DROP COLUMN "role";
DROP TYPE "UserRole";
