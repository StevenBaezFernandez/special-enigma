# 2. Domain Contracts First

Date: 2025-05-15

## Status

Accepted

## Context

The repository had a "Shared Monster" (`libs/shared/contracts`) that contained domain-specific Enums and DTOs (e.g., `PayrollType`, `AttendanceStatus`). This created:
- Tight coupling: Domains depended on Shared for their own definitions.
- Circular dependencies risk.
- Poor ownership: Who owns `libs/shared/contracts`? Everyone and no one.
- Duplication: Some domains (like Payroll) had their own `contracts` library but definitions were duplicated or different.

## Decision

We have decided to move domain-specific contracts (Enums, DTOs, Interfaces) to their respective domain libraries: `libs/domain/<domain>/contracts`.

`libs/shared/contracts` should only contain truly generic contracts (e.g., `PaginationDto`, `SortOrder`).

As a Proof of Concept (POC), we have migrated the **Payroll** domain contracts:
- Consolidated duplicated Enums (`PayrollType`, `AttendanceStatus`, etc.) into `libs/domain/payroll/contracts`.
- Updated imports in `libs/domain/payroll` to use `@virteex/contracts-payroll-contracts`.
- Removed Payroll Enums from `libs/shared/contracts`.

## Consequences

### Positive
- **Decoupling:** Payroll domain is now self-contained.
- **Single Source of Truth:** No more confusion between Shared and Domain definitions.
- **Better API:** `@virteex/contracts-payroll-contracts` is the clear public API for Payroll data structures.

### Negative
- **Refactor Effort:** Requires updating imports across the codebase (though `grep` helps).
- **Versioning:** If we had versioned packages, breaking changes would need management. In monorepo, it's atomic.

## Compliance

This aligns with Domain-Driven Design (DDD) and Clean Architecture principles.
