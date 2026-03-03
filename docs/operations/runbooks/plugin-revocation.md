# Runbook: Marketplace Plugin Immediate Revocation

## Objective
Immediately stop all executions of a specific plugin due to confirmed security risk, malicious behavior, or compliance violation.

## Prerequisites
- Authorized API Token for Plugin Host
- Plugin Name

## Execution (Manual via API)
```bash
curl -X POST https://api.virteex.io/plugin-host/plugins/{{PLUGIN_NAME}}/revoke \
  -H "x-plugin-host-token: {{AUTH_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Security Revocation: Malicious egress pattern detected"}'
```

## Validation
1. Attempt to execute the plugin:
   ```bash
   curl -X POST https://api.virteex.io/plugin-host/execute ...
   ```
2. Verify response is `403 Forbidden` with error `Plugin is revoked`.
3. Check `MeteringRecord` table for zero new executions of this plugin.

## MTTR Goal
5 minutes (P95)
