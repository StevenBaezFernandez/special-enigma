# Security Decisions

1. **Fail-Fast for Secrets:** In production, if AWS Secrets Manager is unavailable or a secret is missing, the system will throw a hard error and prevent startup/operation. No local fallbacks are permitted.
2. **Mandatory Persistent Keys for SEFAZ:** Ephemeral keys are strictly forbidden. The system will fail to initialize the SEFAZ adapter without a provided `FISCAL_PRIVATE_KEY`.
3. **Transparent US Fiscal Failure:** Replaced the "valid: true" mock with an explicit error. This prevents accidental illegal operations in the US region while the integration is pending configuration.
4. **Hardened Plugin Sandbox:** Confirmed region-based policies (e.g., MX/BR require hardened mode). Denied fallback to standard mode in production.
