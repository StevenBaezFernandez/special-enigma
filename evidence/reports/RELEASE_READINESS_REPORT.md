# Virteex ERP Release Readiness Report

**Date:** 2026-03-04T22:05:56.205Z
**Version:** DEV-SNAPSHOT
**Single source of truth:** config/readiness/operational-readiness.sot.json
**Source hash (sha256):** 6fe150916a41a5db41d28bbb3faf1222c7b69cd19a66be137db3087a40c77860

## 1. Commercial Readiness

| Module | MX | BR | CO | US |
| --- | --- | --- | --- | --- |
| fiscal | GA | GA | GA | Beta |
| billing | GA | GA | GA | GA |
| inventory | GA | GA | GA | GA |
| marketplace | Beta | Beta | Beta | Beta |
| manufacturing | GA | GA | GA | GA |
| projects | GA | GA | GA | GA |

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

- **Readiness state:** ready-with-evidence
- **Evidence path:** evidence/releases/DEV-SNAPSHOT

| Gate | Status |
| --- | --- |
| commercial | PASSED |
| docs-consistency | PASSED |
| plugin-isolation | PASSED |
| production-readiness | PASSED |
| rls-audit | PASSED |

## 5. SLA by Tenant Mode / Region

| Tenant mode | Region | Availability SLA | p95 latency | Historical window | Samples | Gates |
| --- | --- | --- | --- | --- | --- | --- |
| SHARED | us-east-1 | 99.95% | 180ms | 30d | 216000 | commercial, rls-audit, failover-drill |
| SCHEMA | sa-east-1 | 99.99% | 140ms | 30d | 198000 | commercial, migration-integrity, failover-drill |
| DATABASE | eu-central-1 | 99.995% | 110ms | 30d | 175000 | commercial, isolation-adversarial, failover-drill |

---
*Report generated automatically by Virteex readiness tooling*
