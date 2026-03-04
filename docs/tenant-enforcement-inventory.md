# Tenant Enforcement Inventory

## API `app.module.ts`

- apps/api/accounting/app/src/app/app.module.ts
- apps/api/admin/app/src/app/app.module.ts
- apps/api/bi/app/src/app/app.module.ts
- apps/api/billing/app/src/app/app.module.ts
- apps/api/catalog/app/src/app/app.module.ts
- apps/api/crm/app/src/app/app.module.ts
- apps/api/fiscal/app/src/app/app.module.ts
- apps/api/fixed-assets/app/src/app/app.module.ts
- apps/api/gateway/app/src/app/app.module.ts
- apps/api/gateway-legacy/app/src/app/app.module.ts
- apps/api/identity/app/src/app/app.module.ts
- apps/api/inventory/app/src/app/app.module.ts
- apps/api/manufacturing/app/src/app/app.module.ts
- apps/api/payroll/app/src/app/app.module.ts
- apps/api/projects/app/src/app/app.module.ts
- apps/api/purchasing/app/src/app/app.module.ts
- apps/api/subscription/app/src/app/app.module.ts
- apps/api/treasury/app/src/app/app.module.ts

## Worker services

- apps/worker/notification
- apps/worker/scheduler

## Enforcement baseline applied

- `TenantModule` imported in all listed `AppModule` roots.
- `CanonicalTenantMiddleware` configured for all `AppModule` roots.
- Notification Kafka consumer enforces tenant context on every payload.
- Scheduler jobs already enforce tenant context through `runWithRequiredTenantContext` and payload mismatch detection.
