# Release Trust Packet (Customer-facing)

Este documento define la estructura mínima del paquete de evidencia que se comparte con clientes enterprise durante evaluación técnica/compliance.

## Artefactos obligatorios por release

- `evidence/releases/<release>/summary.json`: estado de gates y snapshot de readiness comercial.
- `evidence/releases/<release>/manifest.json`: hash SHA-256 de artefactos incluidos.
- `evidence/releases/<release>/README.md`: resumen humano de estado.
- `evidence/reports/RELEASE_READINESS_REPORT.md`: reporte consolidado técnico/comercial.

## Qué valida el summary

1. gates de readiness (`commercial`, `docs-consistency`, `plugin-isolation`, `production-readiness`)
2. presencia de SBOM (`sbom.json`)
3. presencia de firma de SBOM (`sbom.json.sig`)
4. presencia de resultados POC (`artifacts/poc-results`)

## Comandos operativos

```bash
npm run readiness:evidence
npm run readiness:report
```

## Política comercial

- Un módulo/país en estado `Beta` o `No listo` no puede venderse como GA.
- Toda excepción comercial debe reflejarse en `config/readiness/commercial-eligibility.matrix.json` y en `docs/commercial/country-module-readiness-matrix.md`.
- Si los gates fallan, el paquete se marca `blocked` y no se promueve release candidato.
