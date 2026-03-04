# Catálogo obligatorio de métricas SLO (tenant / región / tenant-mode)

## 1) Dimensiones obligatorias en toda métrica

Todas las métricas operativas deben etiquetarse con las siguientes dimensiones mínimas:

- `service`: nombre del servicio (`api-gateway`, `billing-worker`, etc.).
- `region`: región de ejecución (`us-east-1`, `sa-east-1`, `mx-central-1`, `latam-south-1`).
- `tenantId`: identificador del tenant (en logs/traces siempre; en métricas se permite hash si cardinalidad supera límites).
- `tenantMode`: `shared`, `schema`, `database`.
- `sloClass`: `availability`, `latency`, `errors`, `replication`, `failover`, `cost`.

## 2) Métricas obligatorias por categoría

| Categoría | Métrica canónica | Tipo | Objetivo SLO | Alerta inicial |
| --- | --- | --- | --- | --- |
| Latencia | `tenant_request_latency_ms` (p50/p95/p99) | Histogram | p95 < 200 ms (APIs críticas) | p95 > 250 ms durante 10 min |
| Errores | `tenant_request_error_rate` | Gauge/Ratio | < 1% por ventana de 5 min | > 2% por 5 min |
| Replicación | `tenant_replication_lag_ms` | Gauge | < 100 ms sostenido | > 250 ms por 3 min |
| Failover | `tenant_failover_rto_seconds`, `tenant_failover_success_rate` | Histogram + Ratio | RTO <= 300 s, éxito >= 99% | RTO > 300 s o éxito < 99% |
| Costo | `tenant_resource_cost_observed_usd`, `tenant_cost_drift_ratio` | Counter + Gauge | drift <= 5% mensual | drift > 8% por 24 h |

## 3) Dashboards obligatorios

1. **SLO Ejecutivo Multi-región**
   - Vista por `service` y `region` para disponibilidad, latencia y error rate.
   - Semáforo por consumo de error budget (verde < 50%, amarillo 50-70%, rojo > 70%).
2. **Tenant Isolation + Performance**
   - Vista por `tenantMode` y percentile de latencia.
   - Comparativa `shared` vs `schema` vs `database`.
3. **Failover & DR**
   - RTO/RPO, estado de drills, éxito de promoción regional.
4. **FinOps/SLO**
   - Costo por tenant/región/mode y correlación con degradación de SLO.

> Todo dashboard debe enlazar runbook operativo y owner on-call en su panel.

## 4) Alertas mínimas + runbook

| Alerta | Regla | Severidad | Runbook |
| --- | --- | --- | --- |
| `SLO_LATENCY_P95_BREACH` | p95 > 250 ms por 10 min | P1 | `docs/runbooks/slo-incident-response.md#latency-breach` |
| `SLO_ERROR_RATE_BREACH` | error rate > 2% por 5 min | P1 | `docs/runbooks/slo-incident-response.md#error-rate-breach` |
| `SLO_REPLICATION_LAG_BREACH` | lag > 250 ms por 3 min | P1 | `docs/runbooks/slo-incident-response.md#replication-lag-breach` |
| `SLO_FAILOVER_RTO_BREACH` | RTO > 300 s | P0 | `docs/runbooks/slo-incident-response.md#failover-rto-breach` |
| `SLO_COST_DRIFT_BREACH` | drift > 8% por 24 h | P2 | `docs/runbooks/slo-incident-response.md#cost-drift-breach` |

## 5) Política de cardinalidad

- Cardinalidad máxima por métrica: **10k series activas** por región/servicio.
- `tenantId` en métricas debe ofuscarse (`tenantHash`) cuando el servicio exceda 2k tenants activos por hora.
- IDs únicos (`requestId`, `eventId`) prohibidos como labels de métricas; solo permitidos en logs/traces.
- En caso de sobre-cardinalidad:
  1. Reducir labels a `tenantMode`, `region`, `planTier`.
  2. Mover detalles a logs estructurados correlacionados.
  3. Abrir incidente FinOps de observabilidad.

## 6) Error budget y bloqueo de despliegues

- Ventana primaria: 28 días rolling.
- Si `errorBudgetConsumedPct` > 70% por `service+region`, se bloquean despliegues no críticos.
- Si `errorBudgetConsumedPct` > 90%, solo permiten hotfixes P0/P1 con aprobación SRE + Security.
- El bloqueo se aplica por gate CI: `npm run governance:error-budget`.

## 7) Historial y exportación para auditoría

- Evidencia histórica obligatoria: `evidence/slo/slo-compliance-history.json`.
- Formatos exportables: JSON firmado + CSV (para Comercial/Compliance).
- Retención mínima: 365 días.
- Cada snapshot debe incluir:
  - período,
  - servicio,
  - región,
  - SLO objetivo,
  - valor observado,
  - budget consumido,
  - estado (`compliant`, `warning`, `breach`),
  - enlace a incidente/runbook usado.
