# Testing Status

## Critical Modules (Vitest)
- **domain-fiscal-infrastructure:** 100% Pass (Infrastructure verified).
- **api-fiscal-app:** 100% Pass.
- **domain-subscription-application:** Configuration Fixed.

## Legacy Modules (Jest)
- Many E2E suites still require preset realignment (G01 partial).
- **Remediation Strategy:** Recommended continued migration to Vitest for all libraries.

## Manual Validations
- **Secrets:** Logic verified to throw in production without AWS connection.
- **US Fiscal:** Verified to throw error if unconfigured.
- **Billing:** Wiring verified.
