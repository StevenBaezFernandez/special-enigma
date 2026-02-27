# Security Policy

## Reporting

Reporta vulnerabilidades a security@virteex.com con:
- impacto,
- pasos de reproducción,
- alcance de tenant/región.

## Secure defaults implementados

- Providers simulados no permitidos en producción para stamping fiscal (PAC).
- Stripe no acepta `sk_test_*` en producción ni placeholders.
- Plugin Host falla en arranque productivo si faltan claves de firma o token de autenticación.
- Admission pipeline de plugins falla cerrado si no hay SAST operativo en producción.

## Requisitos mínimos de despliegue productivo

- `NODE_ENV=production`
- secretos obligatorios cargados por KMS/Vault
- ejecución de `./tools/enforce-production-readiness.sh` antes de promover release.
