# Monorepo Governance Source of Truth

## Clasificación documental

### 1) Normativo (obligatorio)
- `docs/nx-governance.md`: taxonomía de tags, enforcement y política de evolución.
- `eslint.config.mjs`: boundaries ejecutables (`@nx/enforce-module-boundaries`).
- `config/governance/tag-catalog.json`: catálogo canónico de tags/scope/type/platform/criticality.
- `config/governance/e2e-policy.json`: política ejecutable de cobertura e2e + excepciones justificadas.
- `.github/workflows/ci-cd.yml`: gates oficiales de CI/CD.

### 2) Operativo (runbooks/comandos)
- `README.md`: golden path de comandos oficiales y visión general.
- `CONTRIBUTING.md`: flujo de contribución y checks locales previos a PR.
- `tools/quality-gates/validate-operational-consistency.mjs`: auditoría cross-check docs/scripts/workflows/config.

### 3) Referencia (contexto técnico)
- `docs/MONOREPO_MAP.md`: mapa estructural y ubicación de artefactos.
- `docs/readiness/*`, `docs/commercial/*`: guías de readiness y comercialización.

### 4) Histórico (evidencia/versiones)
- `evidence/releases/*`: evidencias por release.
- `evidence/reports/*`: reportes derivados de ejecuciones pasadas.

## Regla de precedencia
1. Normativo
2. Operativo
3. Referencia
4. Histórico

Si hay conflicto, prevalece el documento de categoría superior.
