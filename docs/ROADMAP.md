# Roadmap producto-agnóstico

La plataforma se construye **sin comprometer vertical** hasta tener el core al máximo.

## Decisión pendiente (al final del cascarón)

| Opción | Modelo | Notas |
|--------|--------|-------|
| **A — Educación** | Cursos de pentesting / ciberseguridad | Stripe/CCBill estándar, certificados, menos fricción de pagos |
| **B — Adulto** | Historias interactivas + IA | Age gate, compliance 2257 (si aplica), pasarelas adult-friendly, CDN restringido |

**No decidir hasta:** shell completo, auth, economía, catálogo, admin, legal placeholders, PWA responsive.

## Orden de implementación

1. ✅ Shell UI + auth + tokens + mapa narrativo
2. ✅ Plataforma neutral (vertical NEUTRAL, admin, legal)
3. ⏳ Core de negocio (roles, reglas premium, analytics básico)
4. ⏳ Creator tools (subir capítulos, metadatos, precios)
5. 🔒 **Pasarela real** (CCBill / crypto / Stripe según vertical)
6. 🔒 **Video engine** (assets reales, pre-buffer, IA motion al final)

## Multiplataforma

- **Fase actual:** Web responsive + PWA manifest (instalable en móvil).
- **Futuro:** Capacitor o Tauri si necesitas app store; mismo backend Next.js.

## Cuentas dev

| Rol | Email | Password |
|-----|-------|----------|
| Usuario | demo@local.dev | Demo1234 |
| Admin | admin@local.dev | Admin1234 |
