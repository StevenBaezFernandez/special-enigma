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
- [x] Phase 2: Enforcement (Partial - Dependency isolation and barrel refinement)
- [ ] Phase 3: Hardening

## Specific Notes
- Migrated from a flatter structure to the new layered approach.
- MikroORM schemas moved to Infrastructure.
- DTOs moved to Contracts.
