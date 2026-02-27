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

## Variables JWT obligatorias en producción

- `JWT_ALLOWED_ALGORITHMS`: lista separada por comas. En producción se permiten algoritmos asimétricos (`RS*`/`ES*`) por defecto.
- `JWT_JWKS`: JWKS serializada en JSON con al menos una key válida; sin esta variable el servicio falla en arranque (fail-closed).
- `JWT_CURRENT_KID`: `kid` activo para firmado.
- `REDIS_URL`: obligatorio para checks de revocación y protección anti-replay; sin Redis la validación de tokens falla cerrado.

### Override excepcional de HMAC en producción (auditado)

Solo permitido para contingencias aprobadas por Seguridad:

- `JWT_ALLOW_HS_IN_PRODUCTION=true`
- `JWT_HS_OVERRIDE_AUDIT_REF=<ticket/risk-acceptance-id>`

Si falta cualquiera de estas variables, el servicio bloquea arranque en producción cuando `JWT_ALLOWED_ALGORITHMS` incluye `HS*`.

## Runbook mínimo de rotación de keys JWT (JWKS)

1. **Preparar nueva key** en KMS/HSM y publicar nueva entrada en `JWT_JWKS` con `kid` nuevo, manteniendo la key anterior.
2. **Desplegar configuración** sin cambiar `JWT_CURRENT_KID` y verificar emisión/validación en canary.
3. **Promover key activa** cambiando `JWT_CURRENT_KID` al nuevo `kid`.
4. **Monitorear 2x TTL máximo** de token (access/refresh/service) para asegurar expiración natural de tokens firmados con key anterior.
5. **Retirar key anterior** de `JWT_JWKS` y registrar evidencia de cambio en ticket de seguridad/compliance.
6. **Validar post-rotación**: pruebas de autenticación, revocación Redis y revisión de alertas 401 anómalas por región.
