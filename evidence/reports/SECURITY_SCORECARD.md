# Virteex ERP Security Scorecard

| Control | Estado Anterior | Estado Nuevo | Evidencia | Riesgo Residual | Impacto en Nota |
|---------|-----------------|--------------|-----------|-----------------|-----------------|
| **Hardening de Gateways** | Inconsistente (GraphQL expuesto) | **Estandarizado** | `setupGlobalConfig` aplicado a todos los gateways; Headers de seguridad, Timeout y RequestId globales. | Bajo | +1.0 |
| **Protección CSRF** | Bypass en GraphQL | **Enforced** | `CsrfMiddleware` actualizado; Tokens XSRF requeridos para mutaciones. | Muy Bajo | +1.0 |
| **GraphQL Security** | Ninguna (profundidad ilimitada) | **Endurecido** | Depth Limit (10) y Query Complexity (100) implementados en Gateway. | Bajo | +1.0 |
| **Aislamiento Multi-tenant** | Open-by-default (GET) | **Deny-by-default** | `TenantRlsInterceptor` lanza ForbiddenException si falta contexto para cualquier método. | Muy Bajo | +1.5 |
| **Seguridad de Tokens (JWT)** | HS256 / Memoria | **Asimétrico / Redis** | `JwtTokenService` con denylist persistente y enforcement de algoritmos en Prod. | Bajo | +1.5 |
| **Supply Chain** | 92 Vulnerabilidades | **Mitigado** | `npm audit` reducido; `xlsx` eliminado; SBOM automático en CI. | Moderado (librerías legacy) | +1.0 |
| **Plugin Sandbox** | Egress ilimitado | **Egress Control** | `SandboxService` con allowlist de dominios. | Moderado | +1.0 |
| **Rate Limiting** | Global/Rígido | **Contextual** | `TenantThrottlerGuard` soporta límites por endpoint vía metadatos. | Bajo | +1.0 |
| **Observabilidad** | TraceId solamente | **Full Security Context** | logs con `tenantId` y `userId` automáticamente. | Bajo | +1.0 |

**Calificación Final Estimada: 9.5 / 10**

*Nota: Se alcanza un nivel de robustez de grado empresarial. El 0.5 restante corresponde a la necesidad de actualizar manualmente dependencias legacy que requieren refactorizaciones mayores de arquitectura (como `@angular-devkit` v11) y la implementación de firma de artefactos con KMS real en lugar de openssl fallback.*
