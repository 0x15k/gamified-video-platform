# Publicar en internet (plan ~0 €/mes)

Stack recomendado para **probar en público** con **embeds** (no requiere disco en el servidor).

## Qué NO se sube a Vercel

El archivo `.vercelignore` excluye del deploy:

- `docs/` y todos los `.md` (roadmap, monetización, esta guía)
- `scripts/`, `docker-compose.yml`, `.github/` (solo desarrollo/CI)
- `prisma/seed.ts` (contraseñas demo; el seed se ejecuta **desde tu Mac** contra Neon)
- `storage/` (vídeos locales)
- `.env*` (secretos solo en el panel de Vercel)
- tests y coverage

Plantilla de variables: `.env.production.example` (sin valores, sí en Git).

| Servicio | Free | Uso |
|----------|------|-----|
| [Vercel](https://vercel.com) | Hobby | Next.js (tu app) |
| [Neon](https://neon.tech) | Free | PostgreSQL |
| [Upstash](https://upstash.com) | Free | Redis (login, sesiones) |

Dominio: `https://tu-proyecto.vercel.app` (gratis). Dominio propio opcional después.

---

## 1. Base de datos (Neon) — ~3 min

1. Cuenta en [neon.tech](https://neon.tech) → **New project**.
2. Copia la **connection string** (`postgresql://...?sslmode=require`).
3. Guárdala como `DATABASE_URL`.

## 2. Redis (Upstash) — ~2 min

1. Cuenta en [upstash.com](https://upstash.com) → **Create database** (Redis).
2. Pestaña **Connect** → copia la URL **TLS** (`rediss://...`).
3. Guárdala como `REDIS_URL`.

## 3. Desplegar en Vercel — ~5 min

1. Sube tu rama a GitHub (ya está en `0x15k/gamified-video-platform`).
2. [vercel.com/new](https://vercel.com/new) → **Import** el repo.
3. **Root directory:** `/` (raíz del repo).
4. **Environment variables** (Production):

   ```
   DATABASE_URL=...
   REDIS_URL=...
   JWT_SECRET=...          (mín. 32 caracteres, aleatorio)
   JWT_REFRESH_SECRET=...
   MEDIA_SIGNING_SECRET=...
   NEXT_PUBLIC_SITE_URL=https://TU-PROYECTO.vercel.app
   PLATFORM_VERTICAL=ADULT
   PLATFORM_AGE_GATE=true
   ADS_ENABLED=false
   ```

   Genera secrets: `openssl rand -base64 32` (3 veces).

5. **Deploy**. La primera build ejecuta `prisma migrate deploy` automáticamente.

## 4. Seed (cuentas demo + datos) — una vez

Desde tu Mac, con la URL de Neon:

```bash
cd ~/Projects/gamified-video-platform
export DATABASE_URL="postgresql://...neon..."
export REDIS_URL="rediss://...upstash..."
export DEMO_EMBED_URLS="https://www.pornhub.com/embed/TU_ID"
npm run db:seed
```

Cuentas:

- Admin: `admin@local.dev` / `Admin1234`
- Usuario: `demo@local.dev` / `Demo1234`

**En producción cambia la contraseña del admin** después de probar.

## 5. Probar

- Home: `https://TU-PROYECTO.vercel.app`
- Historias: `/stories`
- Admin: `/admin` → login admin
- Clips embed: `/admin/clips` (pegar URL embed)
- Age gate: primera visita a `/catalog` o `/stories`

---

## Qué funciona en Vercel sin pagar extra

| Feature | ¿Funciona? |
|---------|------------|
| Login, admin, historias (metadatos) | Sí |
| **Embeds** en `/watch` | Sí |
| Catálogo, modelos, age gate | Sí |
| Subir MP4 al servidor (`/admin/content`) | **No** (sin disco persistente; usa R2 más adelante) |

Para pruebas públicas usa **embeds** en Admin → Clips.

---

## Dominio propio (opcional)

Vercel → Project → **Domains** → añade `tudominio.com` y actualiza:

```
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

---

## CLI alternativa

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL
# ... resto de variables
vercel --prod
```
