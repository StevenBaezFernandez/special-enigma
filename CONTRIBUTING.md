# Contributing

## Pull Requests

1. Ejecuta validaciones locales:
   - `./tools/enforce-production-readiness.sh`
   - `npx nx affected --target=lint --base=origin/main --head=HEAD`
   - `npx nx affected --target=test --base=origin/main --head=HEAD`
2. No introducir providers mock/simulated en rutas productivas.
3. No usar secretos hardcoded, placeholders o fallbacks silenciosos para producción.
4. Si hay breaking change, documentar migración en el PR.

## Taxonomía de tags Nx

`tools/validate-project-tags.mjs` valida `project.json` de `apps/` y `libs/` con estas reglas:

- Familias base obligatorias: `scope:*`, `type:*`, `platform:*`, `criticality:*`.
- Catálogos de valores permitidos para `type`, `platform`, `criticality`, `compliance`, `tenant-mode` y `region`.
- Formato de tags: `familia:valor` en minúsculas y kebab-case (`[a-z0-9-]`).
- Regla condicional: `criticality:high` requiere `compliance:*`, `tenant-mode:*` y `region:*` con valor no vacío.

Migración gradual:

- Modo por defecto: `TAG_POLICY_MODE=warn` (las nuevas reglas emiten warnings).
- Modo estricto: `TAG_POLICY_MODE=error` (warnings de política pasan a errores bloqueantes).

Ejemplos:

- `npm run validate:nx-tags`
- `TAG_POLICY_MODE=error npm run validate:nx-tags`

