# Catálogo por embed (solo IA)

Por ahora **no se suben MP4** al servidor. Los vídeos del catálogo público son **iframes** desde sitios externos (pruebas).

## Flujo admin

1. Inicia sesión como `admin@local.dev` → **Admin → Contenido**.
2. En el vídeo de origen: **Compartir → Embed** y copia la URL `https://…/embed/…` (o el iframe completo).
3. Pega en el formulario. Tags deben incluir **`ai`** (o `animation`, `3d`, etc.).
4. Publica. El catálogo en `/catalog` solo lista nodos con tags IA en vertical ADULT.

## Seed local

En `.env`:

```env
DEMO_EMBED_URLS=https://www.pornhub.com/embed/VIDEO_ID,https://www.xvideos.com/embedframe/VIDEO_ID
```

Luego:

```bash
npm run db:seed
```

Sin URLs, el seed crea entradas **FILE** de respaldo (placeholders MP4).

## Dominios permitidos

Por defecto: Pornhub, XVideos, Spankbang, Eporner. Override:

```env
EMBED_ALLOWED_HOSTS=www.pornhub.com,www.xvideos.com
```

## Legal / ToS

Embeber puede violar los términos del sitio de origen. Esta plataforma **no scrapea** ni rehostea; solo muestra el iframe que el admin pega. Uso bajo tu responsabilidad en producción.
