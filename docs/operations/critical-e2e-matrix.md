# Matriz E2E Crítica ERP (Cross-Domain)

## Suites definidas

- O2C: cotización/pedido -> factura -> timbrado -> cobro -> uso/plan.
- P2P: proveedor -> orden de compra -> recepción -> cuentas por pagar.
- R2R: asientos -> mayor -> balance de comprobación.
- Fiscal: timbrado y cancelación con provider real/sandbox certificado.

## Ejecución

- Suite backend crítica integrada: `apps/api/gateway/e2e/src/virteex-api-gateway/critical-flows.spec.ts`.
- Suite web journeys de portal: `apps/web/portal/e2e/src/journeys/o2c-flow.spec.ts`.
- El smoke de gateway se ejecuta con `nx run api-gateway-e2e:e2e`.
- La suite crítica se activa con `RUN_CRITICAL_E2E=true` para evitar falsos positivos fuera de entorno integrado.

## Seeds requeridos

- tenant de pruebas (`E2E_TENANT_ID`)
- catálogos base (productos, cuentas contables)
- credenciales fiscales sandbox
- usuarios por rol (`sales-admin`, `finance-admin`, `auditor`)

## Criterio mínimo para release candidate

- `critical-flows.spec.ts` en verde.
- evidencia del run publicada en `evidence/releases/<release>/summary.json`.
- reconciliación O2C/P2P/R2R sin desbalances detectados por seed checker.
