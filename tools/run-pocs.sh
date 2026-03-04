#!/usr/bin/env bash
set -euo pipefail

K6_CMD="k6"
if ! command -v k6 >/dev/null 2>&1; then
  if command -v docker >/dev/null 2>&1; then
    K6_CMD="docker run --rm -i -v $(pwd):/src -w /src grafana/k6"
  else
    echo "ERROR: k6 is not installed and docker is unavailable."
    echo "POC suite MUST be executed to achieve Level 5 Certification."
    exit 1
  fi
fi

BASE_URL="${BASE_URL:-http://localhost:3000}"
RESULT_DIR="${1:-artifacts/poc-results}"
mkdir -p "$RESULT_DIR"

run_poc() {
  local key="$1"
  local script="$2"
  local acceptance="$3"

  local out_file="$RESULT_DIR/${key}.json"
  echo "== Running ${key}: ${script}"

  set +e
  BASE_URL="$BASE_URL" VIRTEEX_HMAC_SECRET="${VIRTEEX_HMAC_SECRET:-dev-secret}" \
    ${K6_CMD} run "$script" --summary-export "$out_file"
  local status=$?
  set -e

  if [[ $status -ne 0 ]]; then
    echo "[FAIL] ${key} failed (exit code $status)."
  else
    echo "[PASS] ${key} completed."
  fi

  cat > "$RESULT_DIR/${key}.md" <<POC
# ${key} evidence

- Script: \
  - \
	https://github.com/virteex/special-enigma/blob/main/${script}
- Acceptance criteria: ${acceptance}
- Exit code: ${status}
- Summary export: ${out_file}
POC

  return $status
}

failures=0
run_poc "poc-a-rls-scale" "tools/k6/suite/rls-load-test.js" "p95 < 200ms, error rate < 0.1%" || failures=$((failures + 1))
run_poc "poc-b-offline-sync-network-chaos" "tools/k6/suite/offline-sync-chaos.js" "queue drain succeeds after unstable network and retries" || failures=$((failures + 1))
run_poc "poc-c-plugin-isolation-revocation" "tools/k6/suite/plugin-security.js" "malicious payload blocked + revoked plugins denied" || failures=$((failures + 1))

if [[ $failures -gt 0 ]]; then
  echo "POC suite completed with ${failures} failure(s)."
  exit 1
fi

echo "POC suite completed successfully. Results in ${RESULT_DIR}."
