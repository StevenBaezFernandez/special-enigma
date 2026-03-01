# Release Evidence Pack - 2026.03-rc1

- Generated at: 2026-03-01T13:28:45.005Z
- Readiness state: **ready-with-evidence**

## Gate results

| Gate | Status | Command |
| --- | --- | --- |
| commercial | PASSED | node tools/readiness/validate-commercial-readiness.mjs |
| docs-consistency | PASSED | node tools/quality-gates/validate-docs-consistency.mjs |
| plugin-isolation | PASSED | node tools/quality-gates/validate-plugin-isolation.mjs |
| production-readiness | PASSED | bash ./tools/enforce-production-readiness.sh |

## Evidence snapshot

- Commercial matrix version: 2026.02
- SBOM present: no
- SBOM signature present: no
- POC result folder present: yes

## Artifacts

- summary.json
- manifest.json
