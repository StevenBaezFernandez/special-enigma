# Production Readiness Hardening (Phase 0)

## 1) Secret management (KMS)

`KmsSecretProvider` now performs real decrypt operations during startup via AWS CLI (`aws kms decrypt`) and blocks startup in production when critical configuration is incomplete.

Required env vars for production:

- `AWS_REGION` (or `KMS_REGION`)
- `KMS_SECRET_KEYS` (comma-separated key names, e.g. `JWT_SECRET,FINKOK_PASSWORD`)
- `<KEY>_KMS` for each key declared in `KMS_SECRET_KEYS` (base64 ciphertext)
- Optional: `KMS_KEY_ID`, `KMS_REQUIRED_IN_PRODUCTION`

## 2) Stripe hardening

`StripePaymentProvider` no longer allows implicit placeholder keys.

- `STRIPE_SECRET_KEY` is mandatory in all environments.
- In `NODE_ENV=production`, `sk_test_*` keys are rejected at startup.

## 3) Fiscal simulated provider guard

`PacStrategyFactoryImpl` now blocks `ALLOW_SIMULATED_PROVIDERS=true` in production.

This keeps dev/test flexibility while enforcing fail-fast behavior in production.

## 4) Plugin admission / DAST operability

Plugin admission now supports a real DAST endpoint:

- `PLUGIN_DAST_MODE=required`
- `PLUGIN_DAST_URL`
- `PLUGIN_DAST_TOKEN`

Behavior:

- deny-by-default when DAST integration is missing/unavailable,
- `verdict=malicious` => `rejected`,
- `verdict=quarantine` => `pending` (manual review),
- `verdict=clean` => eligible for approval/signing.

## 5) FinOps metering persistence

In-memory usage metering was replaced by a persistent append-only JSONL repository with:

- persisted usage records,
- idempotency key deduplication (`idempotencyKey`),
- aggregation by metric and period,
- auditable append-only event history per tenant.

Env:

- `FINOPS_DB_PATH` (default: `data/finops/usage.jsonl`)

## 6) CI/readiness guard

`tools/enforce-production-readiness.sh` now fails if non-test source contains known demo/placeholder secrets or KMS placeholder logic.
