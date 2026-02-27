# Matriz E2E Crítica ERP (Cross-Domain)

## Suites definidas
- O2C: cotización/pedido -> factura -> timbrado -> cobro -> uso/plan.
- P2P: proveedor -> orden de compra -> recepción -> cuentas por pagar.
- R2R: asientos -> mayor -> balance de comprobación.
- Fiscal: timbrado y cancelación con provider real.

## Ejecución
- Suite implementada en `apps/gateways/virteex-api-gateway-e2e/src/virteex-api-gateway/critical-flows.spec.ts`.
- Requiere entorno integrado con gateway y microservicios activos.
- Activación con `RUN_CRITICAL_E2E=true`.

## Seeds requeridos
- tenant de pruebas (`E2E_TENANT_ID`)
- catálogos base (productos, cuentas contables)
- credenciales fiscales sandbox
