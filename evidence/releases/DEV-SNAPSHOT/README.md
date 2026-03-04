# Release Evidence Pack - DEV-SNAPSHOT

- Generated at: 2026-03-04T22:06:01.411Z
- Readiness state: **blocked**
- Maturity Score: **2.9/5**

## Gate results

| Gate | Status | Command |
| --- | --- | --- |
| commercial | FAILED | node tools/readiness/validate-commercial-readiness.mjs |
| consistency | FAILED | node tools/readiness/validate-readiness-consistency.mjs |
| docs-consistency | PASSED | node tools/quality-gates/validate-docs-consistency.mjs |
| plugin-isolation | PASSED | node tools/quality-gates/validate-plugin-isolation.mjs |
| production-readiness | FAILED | bash ./tools/enforce-production-readiness.sh |
| rls-audit | FAILED | node tools/quality-gates/check-rls.js |
| isolation-adversarial | PASSED | npx vitest run libs/kernel/tenant/src/lib/tests/adversarial-isolation.spec.ts |
| migration-integrity | PASSED | npx vitest run libs/kernel/tenant/src/lib/tests/migration-validation.spec.ts |
| failover-drill | FAILED | npx vitest run libs/kernel/tenant/src/lib/tests/failover-validation.spec.ts |

## Evidence snapshot

- Commercial matrix version: 2026.03-5.0-Hardened
- SBOM present: ✅
- SBOM signature present: ✅
- POC result folder present: ✅

## Artifacts

- summary.json
- manifest.json
