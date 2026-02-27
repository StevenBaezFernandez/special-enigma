# POCs críticos (A/B/C) — ejecución y evidencia

## Inventario

| POC | Objetivo | Script | Criterio de aceptación | Estado esperado |
|---|---|---|---|---|
| A | Escala RLS en alta cardinalidad multi-tenant | `tools/k6/suite/rls-load-test.js` | p95 < 200ms y error < 0.1% | Bloqueante para release |
| B | Resiliencia de sincronización offline bajo red inestable | `tools/k6/suite/offline-sync-chaos.js` | Replays sin 500 y convergencia de cola | Bloqueante para release |
| C | Aislamiento + revocación en tiempo real de plugins | `tools/k6/suite/plugin-security.js` | Payloads maliciosos bloqueados y plugin revocado no ejecutable | Bloqueante para marketplace |

## Ejecución

```bash
./tools/run-pocs.sh artifacts/poc-results
```

Cada corrida genera:
- `artifacts/poc-results/<poc>.json` (summary export k6)
- `artifacts/poc-results/<poc>.md` (evidencia mínima)

## Gating

- En ramas `release/*`, `ci-cd.yml` ejecuta `tools/run-pocs.sh` en el job `release-evidence`.
- Un fallo de POC bloquea promoción.
