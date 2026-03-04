# Runbook DR: drills programados, evidencia firmada y gate de release enterprise

## 1) Inventario regional para health probes

- El servicio de failover ya no usa endpoints hardcodeados.
- El inventario vive en `config/operations/regional-health-inventory.json`.
- Overrides por entorno:
  - `REGIONAL_HEALTH_INVENTORY_FILE`
  - `DR_PROBE_<REGION>_LB_ENDPOINT`
  - `DR_PROBE_<REGION>_API_ENDPOINT`
  - `DR_PROBE_<REGION>_TIMEOUT_MS`

## 2) Ejecución programada de drills en entornos reales

- Workflow: `.github/workflows/dr-drills.yml`.
- Cadencia enterprise: `config/operations/dr-schedule.enterprise.json`.
- Trigger real obligatorio vía endpoint externo:
  - `DR_DRILL_TRIGGER_ENDPOINT`
  - `DR_DRILL_AUTH_TOKEN`
- Cada drill debe devolver telemetría de:
  - `rtoMs`, `rpoMs`
  - backlog de eventos (`backlogBefore`, `backlogAfter`)
  - validación de integridad post-promoción (`integrityPostPromotion`, `integrityHash`)

## 3) Evidencia firmada y versionada por drill

- Evidencias en `evidence/drills/*.json`.
- Campos obligatorios por evidencia:
  - `inputs`, `timeline`, `telemetry`, `rollback`, `postmortem`, `validation`
  - `signature` HMAC SHA-256
- Clave de firma: `EVIDENCE_SIGNING_SECRET`.

## 4) Gate CI/CD enterprise (evidencia DR reciente)

- Script de gate: `tools/readiness/validate-dr-evidence.mjs`.
- Integrado en `.github/workflows/ci-cd.yml` (job `release-evidence`).
- Reglas de bloqueo para `RELEASE_TIER=enterprise`:
  - evidencia exitosa y firmada
  - evidencia no vencida (por defecto 30 días, configurable con `DR_EVIDENCE_MAX_AGE_DAYS`)
  - incluye telemetría y validación de integridad post-promoción
