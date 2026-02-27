# Catálogo de Servicios y Topología Operativa (Source of Truth)

| Servicio | Dominio | Topología actual | Owner sugerido | Resiliencia mínima requerida | SLO base |
|---|---|---|---|---|---|
| virteex-api-gateway | Edge/API | Federado + proxy | Platform API | timeout, retry, circuit breaker, kill switch | 99.99%, p99 < 120ms |
| virteex-fiscal-service | Fiscal | Microservicio dedicado (Kafka + HTTP) | Fiscal Platform | timeout, retry idempotente, DLQ, kill switch país/provider | 99.95%, error rate < 1% |
| virteex-billing-service | Billing | Microservicio + eventos | Billing Core | outbox, retry con idempotency key, reconciliación diaria | 99.95% |
| virteex-plugin-host | Marketplace | Runtime aislado (V8/Wasm) | Extensibility Platform | sandbox hardened, admission enforced, revocación dinámica | 99.9% |

## Notas de operación

- La topología es mixta; este catálogo evita troubleshooting ambiguo.
- Cada incidente P1 debe mapearse a este catálogo (servicio, owner, SLO impactado).
- Cambios de topología requieren ADR + actualización de este documento.
