#!/usr/bin/env bash
set -euo pipefail

if [[ "${NODE_ENV:-development}" == "production" ]]; then
  [[ -n "${PLUGIN_SIGNING_PRIVATE_KEY:-}" ]] || { echo "PLUGIN_SIGNING_PRIVATE_KEY missing"; exit 1; }
  [[ -n "${PLUGIN_SIGNING_PUBLIC_KEY:-}" ]] || { echo "PLUGIN_SIGNING_PUBLIC_KEY missing"; exit 1; }
fi

if [[ ! -f sbom.json ]]; then
  echo "sbom.json not found. Run npm run sbom:generate first."
  exit 1
fi

echo "Signing readiness checks passed."
