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
