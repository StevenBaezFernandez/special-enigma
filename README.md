# Virteex ERP Monorepo

Repositorio Nx para servicios backend, frontend y runtimes de plugins de Virteex ERP.

## Production Readiness Gates

- `./tools/enforce-production-readiness.sh` bloquea placeholders de secretos y regresiones de pipeline.
- En producción quedan prohibidos providers simulados para timbrado fiscal y claves efímeras para firma de plugins.
- `virteex-plugin-host` exige `PLUGIN_HOST_API_TOKEN` y claves de firma (`PLUGIN_SIGNING_PRIVATE_KEY`, `PLUGIN_SIGNING_PUBLIC_KEY`).

## CI/CD

Workflow principal: `.github/workflows/ci-cd.yml`.
Incluye jobs separados para `lint`, `typecheck`, `unit`, `integration`, `readiness-gates` y `security` en `push`/`pull_request`.
