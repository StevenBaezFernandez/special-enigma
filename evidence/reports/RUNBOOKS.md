# Runbooks mínimos

## Plugin Host - fallo de arranque por secrets

1. Verificar variables:
   - `PLUGIN_SIGNING_PRIVATE_KEY`
   - `PLUGIN_SIGNING_PUBLIC_KEY`
   - `PLUGIN_HOST_API_TOKEN`
2. Validar que `PLUGIN_DAST_MODE=required` en producción.
3. Reiniciar servicio y comprobar `GET /health`.

## Billing fiscal stamping

1. Revisar `FINKOK_USERNAME`, `FINKOK_PASSWORD`, `FINKOK_URL`.
2. Si el servicio arroja `No production PAC provider configured`, corregir configuración país→PAC.
3. Ejecutar pruebas de stamping/cancelación en sandbox fiscal antes de reintentar producción.

## DR drills enterprise

1. Validar inventario regional de probes en `config/operations/regional-health-inventory.json` o `REGIONAL_HEALTH_INVENTORY_FILE`.
2. Ejecutar drill programado con `npm run dr:scheduled` usando endpoint real (`DR_DRILL_TRIGGER_ENDPOINT`).
3. Confirmar evidencia firmada en `evidence/drills/*.json` con secciones `inputs`, `timeline`, `telemetry`, `rollback`, `postmortem`, `validation`.
4. Antes de promover un release enterprise, ejecutar gate `npm run readiness:dr-evidence`.
