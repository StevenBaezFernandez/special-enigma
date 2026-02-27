# Soporte Operativo L1/L2/L3 - Virteex ERP

## Severidades y SLA

| Severidad | Descripción | Primera respuesta | Mitigación objetivo | Escalado |
|---|---|---:|---:|---|
| Sev-1 | Caída total de facturación/fiscalización/productivo | 15 min | 60 min | L1 -> L2 inmediato, L3 en <= 15 min |
| Sev-2 | Degradación crítica parcial (timbrado, pagos, sync) | 30 min | 4 h | L1 -> L2 <= 30 min |
| Sev-3 | Error funcional con workaround | 4 h | 2 días hábiles | L1 atiende, L2 planifica |
| Sev-4 | Solicitud menor/no bloqueante | 1 día hábil | backlog | L1 triage |

## Flujo operativo
1. L1 valida tenant, región, módulo impactado, evidencia (requestId / traceId / screenshot).
2. L1 ejecuta checklist básico (`/ops/health`, `/ops/readiness`, estado dependencias).
3. L2 toma incidentes Sev-1/2 o casos sin resolución en <= 30 min.
4. L3 interviene en bugs de código, data repair, incidentes de seguridad/compliance.

## Runbook mínimo por incidente Sev-1
- Activar canal de incidente y comando unificado (Incident Commander).
- Congelar despliegues no críticos.
- Validar DB/Redis/Kafka/fiscal/pagos con readiness endpoint.
- Habilitar degradación controlada (read-only o cola diferida) si aplica.
- Publicar estado cada 15 min en Status Page.
- Ejecutar postmortem en <= 48h.

## Evidencia obligatoria por ticket
- tenantId, region, complianceProfile.
- requestId/traceId.
- dependencia afectada y severidad.
- ETA y acción de contención.
