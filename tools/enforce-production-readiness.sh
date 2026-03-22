#!/usr/bin/env bash
set -euo pipefail

failures=0
tmpfile="$(mktemp)"
trap 'rm -f "$tmpfile"' EXIT

check_pattern() {
  local pattern="$1"
  local target="$2"
  local reason="$3"
  if rg -n "$pattern" $target >"$tmpfile" 2>/dev/null; then
    echo "[FAIL] $reason"
    cat "$tmpfile"
    failures=$((failures + 1))
  fi
}

check_required_paths() {
  local reason="$1"
  shift
  local missing=0
  for target in "$@"; do
    if [[ ! -e "$target" ]]; then
      echo "[FAIL] $reason: missing '$target'"
      missing=1
    fi
  done

  if [[ "$missing" -eq 1 ]]; then
    failures=$((failures + 1))
  fi
}

check_pattern "sk_test_placeholder|SIMULATED_PRIVATE_KEY_CONTENT_FOR_DEMO|dev-secret-change-me-in-production" "libs apps -g !**/*.spec.ts -g !**/*.test.ts" "Detected embedded placeholder/test secrets in non-test source"
check_pattern "KMS decryption requested .* placeholder|Placeholder for KMS decryption logic" "libs apps" "Detected KMS placeholder implementation"
check_pattern "workflow_dispatch:\n  # CI/CD Triggers temporarily disabled" ".github/workflows/ci-cd.yml" "CI triggers appear disabled"
check_pattern "MockFiscalProvider" "apps libs -g !**/*.spec.ts -g !**/*.test.ts -g !libs/domain/fiscal/infrastructure/src/lib/test-utils/mock-fiscal-provider.adapter.ts" "Detected mock fiscal provider reference in runtime source"
check_pattern "mock-jwt-token|Create Invoice Flow \(mocked\)" "apps/client/web apps/client/mobile apps/client/desktop libs/shared/ui -g !**/*.spec.ts -g !**/*.test.ts" "Detected mock UI data markers in runtime GA paths"
check_pattern "simulation mode|demo[-_ ]?mode|fake provider|sample payload" "apps libs -g !**/*.spec.ts -g !**/*.test.ts -g !**/*e2e*" "Detected demo/simulation residue in production-scoped artifacts"

check_required_paths "Critical release-readiness documents are required" \
  "docs/commercial/country-module-readiness-matrix.md" \
  "docs/commercial/packaging-and-plan-limits.md" \
  "docs/operations/support-l1-l2-l3-runbook.md" \
  "docs/readiness/poc-execution-matrix.md"

if ! node tools/readiness/validate-commercial-readiness.mjs; then
  failures=$((failures + 1))
fi

echo "Checking for exhausted error budgets via EVIDENCE_PACK..."
# Enforcement: Block release if any tenant SLO error budget is exhausted (> 90%)
# Use evidence/EVIDENCE_PACK.md which is the source of truth for current operational health
if grep -q "ERROR_BUDGET_EXHAUSTED: true" evidence/EVIDENCE_PACK.md; then
  echo "[FAIL] Critical SLO Error Budgets are exhausted according to EVIDENCE_PACK. Freeze active."
  failures=$((failures + 1))
fi

if [[ $failures -gt 0 ]]; then
  echo "Production readiness policy failed with $failures violation(s)."
  exit 1
fi

echo "Production readiness policy passed."
