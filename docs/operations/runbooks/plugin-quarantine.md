# Runbook: Marketplace Preventive Quarantine

## Objective
Place a plugin in quarantine when anomalous telemetry is detected but full revocation is not yet confirmed.

## Steps
1. Set Plugin Status to `quarantined` in the database.
2. Update OPA policy if necessary to limit specific capabilities.
3. Notify the publisher via the Marketplace portal.

## CLI Execution
```bash
# Using virteex-cli
virteex marketplace quarantine {{PLUGIN_NAME}} --reason "Anomalous CPU spike detected"
```
