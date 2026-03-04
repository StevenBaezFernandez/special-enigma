# Runbook: respuesta a incidentes SLO multi-tenant/multi-región

## Latency breach

1. Confirmar alcance por `service`, `region`, `tenantMode`.
2. Revisar `tenant_request_latency_ms` y top endpoints impactados.
3. Validar saturación (CPU/IOPS), colas y dependencia externa.
4. Aplicar mitigación:
   - activar degradación controlada,
   - escalar réplicas,
   - reducir tráfico no crítico.
5. Registrar incidente y decisión de rollback/canary stop.

## Error rate breach

1. Filtrar por tipo (`4xx` funcional vs `5xx` plataforma).
2. Validar despliegues recientes y feature flags.
3. Ejecutar rollback si incremento coincide con release.
4. Si persiste: habilitar circuit-breakers y modo read-only.

## Replication lag breach

1. Confirmar `tenant_replication_lag_ms` y salud del primario/secundario.
2. Pausar migraciones y workloads batch pesados.
3. Ejecutar política de throttling sobre writes no críticos.
4. Escalar a DBA/SRE si lag > 500 ms por más de 10 min.

## Failover RTO breach

1. Activar puente de crisis P0 e incidente mayor.
2. Ejecutar script de failover regional validado.
3. Verificar integridad de routing y estado de writes.
4. Si RTO excedido, activar protocolo de comunicación comercial.
5. Completar postmortem con acciones preventivas en 48h.

## Cost drift breach

1. Confirmar diferencias entre costo observado y cloud bill.
2. Validar cardinalidad de métricas e ingestión de observabilidad.
3. Identificar tenants/anomalías causantes del drift.
4. Aplicar límites de ingestión o sampling adaptativo.
5. Notificar a FinOps y actualizar forecast mensual.
