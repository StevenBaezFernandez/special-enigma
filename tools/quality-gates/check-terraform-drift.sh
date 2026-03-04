#!/usr/bin/env bash
set -euo pipefail

TF_DIR="platform/infrastructure/terraform/regions/v1"

if ! command -v terraform >/dev/null 2>&1; then
  echo "WARN: terraform binary not found; skipping drift check."
  exit 0
fi

terraform -chdir="$TF_DIR" init -backend=false -input=false >/dev/null
terraform -chdir="$TF_DIR" validate

if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
  echo "WARN: AWS credentials not available; drift refresh check skipped after validate."
  exit 0
fi

set +e
terraform -chdir="$TF_DIR" plan -refresh-only -lock=false -detailed-exitcode -input=false -var='db_password=placeholder' >/tmp/terraform-refresh.plan.log 2>&1
status=$?
set -e

if [[ "$status" -eq 1 ]]; then
  cat /tmp/terraform-refresh.plan.log
  echo "ERROR: terraform refresh-only plan failed."
  exit 1
elif [[ "$status" -eq 2 ]]; then
  cat /tmp/terraform-refresh.plan.log
  echo "ERROR: terraform drift detected (refresh-only changes present)."
  exit 1
fi

echo "Terraform drift check passed (no drift detected)."
