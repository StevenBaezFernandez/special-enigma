# Migration Guide: Accounting Domain

## Context
This domain is being migrated to the standardized architecture defined in `docs/architecture/GUIA_MIGRACION_DOMINIOS_V2.md`.

## Progress
- [x] Phase 1: Structural Alignment
  - [x] Metadata files (README, OWNERS, CHANGELOG)
  - [x] Canonical folder structure for Domain
  - [x] Canonical folder structure for Application
  - [x] Canonical folder structure for Contracts
  - [x] Canonical folder structure for Infrastructure
  - [x] Canonical folder structure for Presentation
  - [x] Canonical folder structure for UI
- [x] Phase 2: Enforcement
- [x] Phase 3: Hardening

## Specific Notes
- **Functional Organization**: Use cases are organized by functional area (e.g., `accounts`, `journal-entries`) rather than `commands`/`queries`. See [ADR 003: Functional Organization of Use Cases](./adr/003-functional-organization.md).
- **Tenancy**: `HeaderTenantResolver` enforces mandatory `x-tenant-id` header without fallback.
- **DTOs**: Shared DTOs in `contracts` and specialized GraphQL inputs in `presentation` with minimal duplication via inheritance.
- Migrated from a flatter structure to the new layered approach.
- MikroORM schemas moved to Infrastructure.
- DTOs moved to Contracts.
