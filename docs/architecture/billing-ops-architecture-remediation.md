# Billing + Ops Architecture Remediation (Fase incremental)

## Cambios aplicados

- `CreateInvoiceUseCase` dejó de depender de `ClientKafka` y `EventEmitter2` de forma directa.
- Se introdujo el puerto `InvoiceIntegrationPublisherPort` para publicar integración/eventos técnicos desde infraestructura.
- Se separó la orquestación técnica en `InvoiceStampingOrchestrator` y validación de precio en `PriceValidationPolicy`.
- `Invoice` y `InvoiceItem` pasaron a ser modelos de dominio puros (sin anotaciones ORM).
- Se agregó persistencia ORM separada (`InvoiceRecord` / `InvoiceItemRecord`) y mapper explícito dominio ↔ persistencia.
- Se eliminó `as any` en `BillingResolver` y se introdujo presenter dedicado.
- En frontend ops se separaron responsabilidades de auth (`AuthApiClient`, `AuthSessionStore`, `AuthService`) y tenants (`TenantsApiClient`, `TenantsFacade`, `TenantsTableComponent`).
- Se corrigió naming semántico `Company` -> `TenantSummary`.
- Se formalizó el proyecto Nx de `libs/domains/billing/presentation`.

## Enforcement agregado

- Regla ESLint para prohibir imports `@nestjs/*` y `@mikro-orm/*` en `libs/domains/**/domain/src/lib/entities/**/*.ts`.
- Tagging de `ops-console-web` actualizado para reflejar scope real (`scope:admin`, `scope:identity`, `type:app`).

## Deuda residual / siguiente fase recomendada

1. Migrar `PaymentMethod`, `TaxLine`, `TaxRule` a modelos de dominio puros + records ORM.
2. Extraer `virteex-ops` a librerías Nx (`feature`, `ui`, `data-access`) fuera de `apps/frontend/virteex-ops`.
3. Completar reglas anti-framework para **todo** `type:domain` cuando finalice migración de entidades legacy.
4. Reorganizar `AppModule` de billing por módulos de bootstrap (transport, observability, persistence).
