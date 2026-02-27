#!/usr/bin/env bash
set -euo pipefail

failures=0

check_pattern() {
  local pattern="$1"
  local target="$2"
  local reason="$3"
  if rg -n "$pattern" "$target" >/tmp/readiness_scan.txt 2>/dev/null; then
    echo "[FAIL] $reason"
    cat /tmp/readiness_scan.txt
    failures=$((failures + 1))
  fi
}

check_pattern "sk_test_placeholder|SIMULATED_PRIVATE_KEY_CONTENT_FOR_DEMO" "libs apps" "Detected embedded placeholder secrets in source"
check_pattern "workflow_dispatch:\n  # CI/CD Triggers temporarily disabled" ".github/workflows/ci-cd.yml" "CI triggers appear disabled"

if [[ $failures -gt 0 ]]; then
  echo "Production readiness policy failed with $failures violation(s)."
  exit 1
fi

echo "Production readiness policy passed."
