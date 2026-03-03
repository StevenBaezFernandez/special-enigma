# Nivel 5 GraphQL Contract Taxonomy

This document defines the mandatory requirements for all GraphQL contracts within the Virteex Federation.

## 1. Federated Schema Contract
- **Canonical Keys**: Every federated entity must define a `@key`.
- **Ownership**: Each field must have a clear domain owner.
- **Invariants**: Use `@external`, `@requires`, and `@provides` to maintain data integrity across subgraphs.

## 2. Input Contract
- **Validation**: All inputs must be validated for ranges, formats, and business rules.
- **Defaults**: Use explicit defaults; avoid ambiguous optional fields in critical paths.
- **Complexity**: Input types contributing to high complexity must be documented.

## 3. Output Contract
- **Stability**: Breaking changes (removing fields, changing nullability) are prohibited without a formal waiver.
- **Deprecation**: Use `@deprecated` with a `reason` and `targetDate`.
- **Shape**: Maintain a consistent shape to facilitate client-side caching and fragment usage.

## 4. Error Contract
- **Non-leaky**: Stack traces and internal implementation details must be stripped in production.
- **Classification**: Errors must include a `code` (e.g., `UNAUTHENTICATED`, `FORBIDDEN`, `INTERNAL_SERVER_ERROR`).
- **Traceability**: Every error must include a `requestId` for correlation.

## 5. Security Contract
- **Directives**: Use `@auth(role: "ADMIN")` for access control.
- **Masking**: Use `@mask` or `@sensitive` for PII and sensitive fields.
- **Audit**: Operations on sensitive fields must be logged.
