# ADR 003: Functional Organization of Use Cases in Accounting Domain

## Status
Proposed

## Context
The standard migration guide (`GUIA_MIGRACION_DOMINIOS_V2.md`) suggests organizing use cases under `application/use-cases/commands|queries|workflows`. However, the `accounting` domain currently organizes them by functional subdomain (e.g., `accounts`, `journal-entries`, `reports`, `fiscal-periods`).

## Decision
We decided to maintain the functional organization for the `accounting` domain instead of the pattern-based organization (`commands`/`queries`).

## Consequences
- **Pros**:
  - Better alignment with the domain's functional boundaries.
  - Easier to locate related features for a specific accounting area.
  - Less nesting for domains with many use cases.
- **Cons**:
  - Slight deviation from the standard v2.0 structure.
  - New developers might expect the `commands`/`queries` split.

## Justification
The `accounting` domain is highly modularized by its nature (Chart of Accounts, Journaling, Reporting, Period Closing). A functional organization provides better discoverability and reflects the business domain more accurately than a technical split between commands and queries.
