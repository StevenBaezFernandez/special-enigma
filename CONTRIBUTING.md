# Contributing

## Pull Requests

1. Ejecuta validaciones locales:
   - `./tools/enforce-production-readiness.sh`
   - `npx nx affected --target=lint --base=origin/main --head=HEAD`
   - `npx nx affected --target=test --base=origin/main --head=HEAD`
2. No introducir providers mock/simulated en rutas productivas.
3. No usar secretos hardcoded, placeholders o fallbacks silenciosos para producción.
4. Si hay breaking change, documentar migración en el PR.
