# Matriz Fiscal por País / Estado Comercial

| País | Provider principal | Estado | Evidencia técnica mínima | Bloqueos de venta |
|---|---|---|---|---|
| MX | Finkok PAC | GA Condicional | Timbrado + cancelación + retries | Ninguno si credenciales PAC operativas |
| BR | SEFAZ Adapter | Beta | Validación de documento, health endpoint, pruebas de homologación | Requiere homologación certificada por UF |
| CO | DIAN Adapter | Beta | Validación esquema y envío controlado | Requiere certificación DIAN en sandbox/prod |
| US | Tax Strategy + e-invoice provider según estado | Beta | Cálculo tributario + reconciliación | Requiere integración partner por estado |
| DO/CL/PE/AR | N/A consolidado | No listo | N/A | Bloqueado para venta enterprise fiscal |

## Política de selección y gating
- Producción no permite providers simulados/null.
- País sin provider GA/Beta explícito debe fallar en preflight fiscal.
- Cualquier cambio normativo requiere versión de provider y regressions fiscales.

## Clasificación comercial
- **GA**: vendible enterprise con SLA y soporte 24x7.
- **Beta**: solo con anexo contractual de limitaciones.
- **No listo**: no ofertar cumplimiento fiscal completo.


> Fuente sincronizada de elegibilidad comercial/técnica: `config/readiness/commercial-eligibility.matrix.json`.
