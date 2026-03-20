# Readiness Governance - Virteex ERP

## 1. Source of Truth (SOT)

The **Single Source of Truth (SOT)** for all readiness states (by country, module, and tenant mode) is:
`config/readiness/operational-readiness.sot.json`

All other readiness artifacts, including documentation and commercial matrices, must be derived from or validated against this file.

## 2. Readiness States

- **GA (General Availability):** Product is 100% production-ready. No simulations allowed. Requires recent successful DR drills and RLS audit evidence.
- **Beta:** Product is functional but may require controlled onboarding or has some external blockers (e.g., pending legal/partner certification).
- **No listo:** Product is not available for commercial or technical use in the specified context.

## 3. Validation Gates (CI/CD)

The following gates are enforced in the CI/CD pipeline to ensure readiness consistency and production hardening:

### Consistency Validation
- **Tool:** `tools/readiness/validate-readiness-consistency.mjs`
- **Checks:**
    - Synchronicity between `operational-readiness.sot.json` and `commercial-eligibility.matrix.json`.
    - Verification that the readiness table in `docs/commercial/country-module-readiness-matrix.md` matches the SOT.
    - Verification of release evidence (summary/manifest) against the SOT.

### Security & Hardening
- **TLS/Secrets Check:** `tools/quality-gates/check-tls-hardening.js` ensures no `rejectUnauthorized: false` or unsafe fallback secrets are used in productive code.
- **Simulation Blocking:** `tools/quality-gates/block-simulations.sh` prevents merging code with "mock", "simulate", or "fake" patterns in productive paths.

## 4. Operational Readiness Evidence

A release is only considered "Ready with Evidence" if it contains:
1. **POC Execution Results:** Validated results for RLS, Plugin Sandbox, and Fiscal Flow.
2. **SBOM & Signatures:** Verified software bill of materials and digital signatures.
3. **DR Drills:** Evidence of successful regional failover drills within the last 30 days.

## 5. Fiscal Onboarding Tools

To industrialize country-specific onboarding:
- `tools/fiscal/validate-certificate.js`: Validates digital certificates (NFe/DIAN).
- `tools/fiscal/smoke-test-fiscal.js`: Validates the end-to-end transmission pipeline using sandbox/homologation environments.
