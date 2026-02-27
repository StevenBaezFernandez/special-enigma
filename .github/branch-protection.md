# Branch protection baseline (manual GitHub setting)

Configurar en `main`:

- Require pull request before merging.
- Require status checks:
  - `lint`
  - `typecheck`
  - `unit`
  - `integration`
  - `readiness-gates`
  - `security`
- Require branches to be up to date before merging.
- Require conversation resolution.
- Include administrators.
