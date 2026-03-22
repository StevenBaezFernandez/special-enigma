# Matriz Comercial Integrada País/Módulo/Estado

Fuente de verdad técnica: `config/readiness/commercial-eligibility.matrix.json`.

## Estado por país y módulo

| País | Fiscal | Billing | Inventory | Marketplace | Manufacturing | Projects | Fixed Assets | Payroll |
|---|---|---|---|---|---|---|---|---|
| MX | GA | GA | GA | Beta | GA | GA | GA | Beta |
| BR | Beta | Beta | GA | Beta | GA | GA | - | - |
| CO | Beta | Beta | GA | No listo | No listo | Beta | - | - |
| US | Beta | GA | GA | Beta | GA | GA | Beta | No listo |
| DO | GA | GA | GA | Beta | GA | GA | - | - |

## Reglas de activación y venta

- `GA`: se puede vender como estándar, pero **sin simulación** (`allowSimulation=false`).
- `Beta`: solo con anexo contractual y onboarding controlado.
- `No listo`: bloqueo comercial y técnico de activación.

## Enforcement implementado

1. CI ejecuta `npm run readiness:commercial`.
2. `tools/enforce-production-readiness.sh` bloquea referencias mock en rutas productivas.
3. `virteex-fiscal-service` valida `FISCAL_COUNTRY` y bloquea activación para países no elegibles.
4. `virteex-plugin-host` bloquea producción si no se ejecuta con `PLUGIN_SANDBOX_MODE=hardened` y `PLUGIN_ADMISSION_MODE=enforced`.

## Uso por ventas/contratos

- Cotización y SOW deben consumir esta matriz como baseline.
- País/módulo en `Beta` requiere cláusula de limitación funcional.
- País/módulo en `No listo` no debe aparecer en propuestas estándar.
