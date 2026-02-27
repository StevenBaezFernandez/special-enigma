# Packaging Comercial y Límites por Plan

## Planes y límites base

| Plan | Facturas/mes | Usuarios | Storage (GB) | Plugins | Soporte |
|---|---:|---:|---:|---:|---|
| Starter | 100 | 3 | 5 | 2 | 8x5 |
| Growth | 2,000 | 25 | 50 | 15 | 12x5 |
| Enterprise | Ilimitado | Ilimitado | Ilimitado contractual | Ilimitado con cuotas | 24x7 |

## Enforcement técnico
- Límite de facturas: bloquea emisión al superar límite (excepto ilimitado).
- Overuse: generar evento de uso con idempotency key para reconciliación y billing.
- Upgrade/downgrade: toma efecto en siguiente ciclo de facturación salvo urgencia contractual.

## Reglas comerciales
- Países y módulos Beta deben venderse con cláusula de limitación y roadmap firmado.
- Funcionalidad fiscal no-GA no puede incluirse como compromiso contractual de cumplimiento.
