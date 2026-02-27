# Inventory & Fixed Assets Architectural Remediation (Phase 1)

## Completed in this phase
- Fixed Assets domain purified (no MikroORM/shared-contract imports).
- ORM entities and persistence mappers moved to fixed-assets infrastructure.
- Inventory application no longer imports infrastructure module directly.
- Inventory use-cases updated to throw domain/application errors instead of Nest HTTP exceptions.
- Warehouse domain entity enriched with explicit behavior/invariants.
- Stock domain entity now throws typed domain errors.
- Inventory presentation split into cohesive controllers by capability.
- Tenant resolution centralized for authenticated endpoints and query override removed.
- Global architecture checks introduced (`npm run arch:check`).

## Residual debt for next phases
1. Move Nest decorators (`@Injectable`) out of inventory application use-cases to application services/adapters if strict framework-agnostic policy is required.
2. Add transaction abstraction port in inventory application to replace any persistence transaction strategy needs.
3. Add comprehensive contract tests for fixed-assets persistence mappers and inventory error mapping.
4. Extend architecture check to all domains and wire into CI workflow.
5. Migrate additional fixed-assets repository operations to cover Asset + Depreciation aggregate persistence lifecycle.
