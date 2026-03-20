# Virteex ERP Release Readiness Report

**Date:** 2026-03-15T00:00:00.000Z
**Version:** DEV-SNAPSHOT
**Single source of truth:** config/readiness/operational-readiness.sot.json
**Source hash (sha256):** 5e25c741dd33c62c85ef47febd5578f9a7f6a5e636fe9d35256e5f02ee67cd98

## 1. Commercial Readiness

| Module | MX | BR | CO | US |
| --- | --- | --- | --- | --- |
| fiscal | GA | Beta | Beta | Beta |
| billing | GA | Beta | Beta | GA |
| inventory | GA | GA | GA | GA |
| marketplace | Beta | Beta | No listo | Beta |
| manufacturing | GA | GA | No listo | GA |
| projects | GA | GA | Beta | GA |

## 2. Security Evidence

- **SBOM:** Generated (1.4)
- **Dependencies Count:** 2
- **Firma Digital:** Presente

## 3. POC Evidence

| POC | Status | p95 |
| --- | --- | --- |
| plugin-security | PASSED (REAL) | 210ms |
| poc-a-rls-scale | PASSED (REAL) | 145ms |
| poc-b-offline-sync-network-chaos | PASSED (REAL) | 280ms |
| poc-c-plugin-isolation-revocation | PASSED (REAL) | 210ms |
| rls-load-test | PASSED (REAL) | 145ms |

## 4. Release Evidence Pack

- **Readiness state:** blocked
- **Evidence path:** evidence/releases/DEV-SNAPSHOT

| Gate | Status |
| --- | --- |
| commercial | PASSED |
| docs-consistency | PASSED |
| plugin-isolation | PASSED |
| production-readiness | FAILED |
| rls-audit | FAILED |

## 5. SLA by Tenant Mode / Region

| Tenant mode | Region | Availability SLA | p95 latency | Historical window | Samples | Gates |
| --- | --- | --- | --- | --- | --- | --- |
| SHARED | us-east-1 | 99.95% | 180ms | 30d | 216000 | commercial, rls-audit, failover-drill |
| SCHEMA | sa-east-1 | 99.99% | 140ms | 30d | 198000 | commercial, migration-integrity, failover-drill |
| DATABASE | eu-central-1 | 99.995% | 110ms | 30d | 175000 | commercial, isolation-adversarial, failover-drill |

---
*Report generated automatically by Virteex readiness tooling*
