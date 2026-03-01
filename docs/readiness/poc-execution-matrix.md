# POC Execution Matrix (Release Readiness)

## Objetivo

Estandarizar la ejecución y evidencia de POCs críticos por candidate release.

## POCs requeridos

| POC                          | Comando base                                | Evidencia mínima                          |
| ---------------------------- | ------------------------------------------- | ----------------------------------------- |
| A - RLS performance          | `./tools/run-pocs.sh artifacts/poc-results` | `artifacts/poc-results/poc-a-rls.json`    |
| B - ORM read/write split     | `./tools/run-pocs.sh artifacts/poc-results` | `artifacts/poc-results/poc-b-orm.json`    |
| C - Plugin sandbox/admission | `./tools/run-pocs.sh artifacts/poc-results` | `artifacts/poc-results/poc-c-plugin.json` |
| D - Fiscal flow              | `./tools/run-pocs.sh artifacts/poc-results` | `artifacts/poc-results/poc-d-fiscal.json` |

## Consolidación de evidencia por release

1. Ejecutar gates de readiness y seguridad.
2. Generar pack de evidencia:
   ```bash
   RELEASE_VERSION=<version> npm run readiness:evidence
   RELEASE_VERSION=<version> npm run readiness:report
   ```
3. Publicar `evidence/releases/<version>/manifest.json` como artefacto inmutable.

## Gate de promoción

No se promueve un release branch sin:

- `summary.json` con estado `ready-with-evidence`.
- SBOM y firma presentes.
- carpeta `artifacts/poc-results` disponible.
