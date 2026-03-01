# Enterprise Security Hardening Remediation (P0/P1)

## Matriz brecha → control

| Brecha | Implementación | Evidencia |
|---|---|---|
| JWT hardening (alg deny-by-default, kid/JWKS, revocación, anti-replay jti) | `JwtTokenService` con allowlist, validación `typ/sub/iat/nbf`, revocación y detección de reuse | `libs/kernel/auth/src/lib/services/jwt-token.service.ts` |
| MFA obligatoria para roles privilegiados | `LoginUserUseCase` exige MFA por rol/riesgo, `StepUpGuard` para acciones críticas | `libs/domain/identity/application/src/lib/use-cases/login-user.use-case.ts` |
| Step-up para operaciones sensibles | Decorador `@StepUp` + `StepUpGuard` en endpoints de tenants, billing e invitaciones | `libs/domain/identity/presentation/src/lib/controllers/*.ts` |
| Cookies/CSRF hardening | Política centralizada de cookies + bypass M2M sin cookies + double submit estricto | `libs/kernel/auth/src/lib/cookie-policy.ts`, `csrf.middleware.ts` |
| Aislamiento tenant fail-closed | `TenantRlsInterceptor` bloquea writes sin tenant + `SET LOCAL app.current_tenant` | `libs/kernel/tenant/src/lib/interceptors/tenant-rls.interceptor.ts` |
| Rate limiting contextual | Tracker segmentado por tenant/user/ip/route/risk-tier | `libs/kernel/tenant/src/lib/guards/tenant-throttler.guard.ts` |
| Supply chain formal | Pipeline agrega verificación de SBOM y provenance attestation | `.github/workflows/ci-cd.yml` |

## Política de clientes (cookies + CSRF)

- Browser SPA con cookies: `HttpOnly + Secure + SameSite=Lax/Strict + Path + Domain` y doble submit obligatorio para mutaciones.
- Mobile/API M2M con Bearer y sin cookies: CSRF no aplica, se exige JWT estricto y rotación de token.
- Refresh token limitado a path `/auth/refresh` y rotación de sesión en cada refresh.

## Runbook mínimo de triage

1. Revisar eventos `STEP_UP_REQUIRED`, `STEP_UP_GRANTED`, `INVALID_SIGNATURE`, `JWT replay detected`.
2. Revocar `jti` comprometido y sesión asociada.
3. Forzar re-autenticación MFA para tenants afectados.
4. Validar traces por `requestId`, `tenantId`, `userId`.
