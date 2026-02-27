# US Fiscal Partner Readiness (sandbox -> production)

## Arquitectura

- Puerto fiscal: `FiscalProvider`.
- Adapter US: `UsTaxPartnerFiscalAdapter`.
- Variables obligatorias en producción:
  - `US_TAX_PARTNER_URL`
  - `US_TAX_PARTNER_API_KEY`

## Flujo

1. Sandbox partner (`/sandbox/validate`, `/sandbox/sign`, `/sandbox/transmit`).
2. Validación de contratos + retries idempotentes.
3. Certificación de partner por estado (nexus/tax jurisdiction).
4. Activación productiva por tenant con feature gate.

## Bloqueo de sobrepromesa

`US` no puede marcarse como fiscal `GA` con provider `TAX_PARTNER` placeholder en la matriz comercial.
