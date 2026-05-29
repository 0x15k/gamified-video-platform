# Vertical adulto + monetización por anuncios

## Flujo

1. Visitante entra en `/catalog` o `/watch/[slug]` (público, sin login).
2. Si `vertical=ADULT` y `ageGateEnabled`, middleware redirige a `/age-gate` hasta cookie `age_verified`.
3. Usuarios **FREE** ven zonas `AdSlot` (configura `ADS_ZONE_*` en `.env`).
4. **PREMIUM / WHALE** no ven anuncios (`shouldShowAds`).
5. Contenido **premium** sin plan: vista previa (`previewSec`) + CTA login/upgrade.

## Redes de anuncios

1. Regístrate en una red adult-friendly (ExoClick, TrafficJunky, JuicyAds…).
2. Crea zonas banner / native / preroll.
3. Copia los zone IDs a `.env` y opcionalmente `ADS_SCRIPT_URL`.
4. En producción sustituye el placeholder de `AdSlot` por el tag que te dé la red.

## SEO y tráfico

- Cada vídeo tiene `slug` único → `/watch/[slug]`.
- Tags en array PostgreSQL → `/catalog?tag=ai`.
- Orden **trending** por `viewCount`.
- Añade sitemap y contenido constante para que los ads tengan impresiones.

## Legal (checklist)

- [ ] Términos + privacidad actualizados para +18
- [ ] Age gate + cookie 30 días
- [ ] DMCA / contacto
- [ ] Hosting y CDN adult-friendly
- [ ] 2257 si hay performers reales (no aplica igual a solo IA — consulta abogado)

## Cuentas dev (tras seed)

| Email | Password |
|-------|----------|
| demo@local.dev | Demo1234 |
| admin@local.dev | Admin1234 |

Catálogo: http://localhost:3000/catalog
