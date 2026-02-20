#!/bin/bash
set -e

OPA_BIN="./tools/opa"

if ! command -v opa &> /dev/null; then
    if [ ! -f "$OPA_BIN" ]; then
        echo "OPA not found. Downloading..."
        curl -L -o "$OPA_BIN" https://openpolicyagent.org/downloads/v0.50.0/opa_linux_amd64
        chmod +x "$OPA_BIN"
    fi
else
    OPA_BIN="opa"
fi

echo "Validating OPA policies..."
$OPA_BIN check platform/policies/compliance/*.rego platform/policies/security/*.rego

echo "Policies validated successfully."
