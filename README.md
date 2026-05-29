# Gamified Video Platform

Self-hosted interactive branching video platform with 3D avatars, token economy, and OWASP-first security.

## Quick start (macOS)

```bash
npm install
cp .env.example .env   # edit secrets in production
npm run dev:infra      # PostgreSQL + Redis via Docker
npx prisma migrate dev
npm run db:seed
chmod +x scripts/generate-placeholder-videos.sh
./scripts/generate-placeholder-videos.sh   # requiere ffmpeg
npm run dev
```

Demo account: `demo@local.dev` / `Demo1234`

## Post-MVP

- **Premium replay:** re-watching an unlocked premium node does not charge tokens again.
- **Session refresh:** client calls `POST /api/auth/refresh` every 13 minutes when logged in.
- **Payment webhooks (stubs):** `POST /api/webhooks/ccbill` (`x-ccbill-signature`) and `POST /api/webhooks/crypto` (`x-crypto-signature`) — HMAC-SHA256 body verification via `WEBHOOK_*_SECRET` in `.env`.

## Stack

- Next.js App Router, TypeScript, Tailwind, Zustand
- PostgreSQL + Prisma, Redis (sessions, rate limits, media tokens)
- Video.js interactive player with pre-buffering
- React Three Fiber avatars

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run dev:infra` | Docker Compose (Postgres + Redis) |
| `npm run db:migrate` | Prisma migrations |
| `npm run db:seed` | Seed demo data + placeholder videos |
