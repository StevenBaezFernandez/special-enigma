# Release Evidence Pack - 2026.03-rc1

- Generated at: 2026-03-04T13:46:44.797Z
- Readiness state: **ready-with-evidence**
- Maturity Score: **5/5**

## Gate results

| Gate | Status | Command |
| --- | --- | --- |
| commercial | PASSED | node tools/readiness/validate-commercial-readiness.mjs |
| docs-consistency | PASSED | node tools/quality-gates/validate-docs-consistency.mjs |
| plugin-isolation | PASSED | node tools/quality-gates/validate-plugin-isolation.mjs |
| production-readiness | PASSED | bash ./tools/enforce-production-readiness.sh |
| rls-audit | PASSED | node tools/quality-gates/check-rls.js |
| isolation-adversarial | PASSED | npx vitest run libs/kernel/tenant/src/lib/tests/adversarial-isolation.spec.ts |
| migration-integrity | PASSED | npx vitest run libs/kernel/tenant/src/lib/tests/migration-validation.spec.ts |
| failover-drill | PASSED | npx vitest run libs/kernel/tenant/src/lib/tests/failover-validation.spec.ts |

## Evidence snapshot

- Commercial matrix version: 2026.03-5.0-Hardened
- SBOM present: ✅
- SBOM signature present: ✅
- POC result folder present: ✅

## Artifacts

- summary.json
- manifest.json
