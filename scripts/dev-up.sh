#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose up -d
echo "Waiting for Postgres..."
until docker compose exec -T postgres pg_isready -U gamified -d gamified >/dev/null 2>&1; do
  sleep 1
done
npx prisma migrate dev
npx prisma db seed
echo "Ready. Run: npm run dev"
