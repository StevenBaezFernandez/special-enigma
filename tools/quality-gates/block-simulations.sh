#!/bin/bash
set -e

# Forbidden patterns for productive code paths
FORBIDDEN_PATTERNS=(
    "simulateStep"
    "mock"
    "dummy"
    "placeholder"
    "fake"
    "noop"
    "future implementation"
    "manual step"
    "best effort"
    "skip validation"
    "exit 0"
)

# Productive files are mainly .ts files in apps/ and libs/, excluding tests and mock directories
PRODUCTIVE_TS_FILES=$(find apps libs -type f -name "*.ts" ! -name "*.spec.ts" ! -name "*.test.ts" ! -name "*.hardening.spec.ts" ! -path "*/test/*" ! -path "*/testing/*" ! -path "*/__mocks__/*" ! -path "*/mock/*")

echo "Checking for forbidden simulation patterns in productive TypeScript code..."

FOUND=0

# 1. STRICT CHECK for TypeScript code
for PATTERN in "${FORBIDDEN_PATTERNS[@]}"; do
    # Surgical exceptions for TS code
    # - nx:noop is for JSON, so not here.
    # - rxjs.noop might be used, but we'll flag it for review as requested.
    # - Use word boundaries \b to avoid false positives like 'mfaKey' matching 'fake'

    MATCHES=$(grep -iE "\b$PATTERN\b" $PRODUCTIVE_TS_FILES | \
        grep -vE "rxjs\.noop" | \
        grep -vE "tools/quality-gates/" | \
        grep -vE "libs/kernel/telemetry/" | \
        grep -vE "placeholder(\s*[:=]|\s*\+\=|\b)" | \
        grep -vE "@Input\(\)\s*placeholder" | \
        grep -vE "\.includes\('mock'\)" || true)

    if [ ! -z "$MATCHES" ]; then
        echo "CRITICAL: Forbidden pattern '$PATTERN' found in productive TS code:"
        echo "$MATCHES"
        FOUND=1
    fi
done

# 2. CONTEXT-AWARE CHECK for other files
echo "Performing context-aware checks for non-TS files..."

# - project.json should only allow "nx:noop"
NOOP_MISUSE=$(grep -r "noop" . --include="project.json" | grep -v "nx:noop" || true)
if [ ! -z "$NOOP_MISUSE" ]; then
    echo "CRITICAL: Non-standard 'noop' usage in project.json:"
    echo "$NOOP_MISUSE"
    FOUND=1
fi

# - HTML should only allow 'placeholder' as an attribute (regular or binding)
PLACEHOLDER_MISUSE=$(grep -r "placeholder" . --include="*.html" | grep -vE "(placeholder=|\[placeholder\]=)" || true)
if [ ! -z "$PLACEHOLDER_MISUSE" ]; then
    echo "CRITICAL: 'placeholder' keyword used outside of HTML attribute:"
    echo "$PLACEHOLDER_MISUSE"
    FOUND=1
fi

# 3. MOCKS/FAKES in productive paths (even if not .ts)
# We exclude node_modules, .git, and known test support dirs
echo "Checking for mock/fake files in productive paths..."
MOCK_FILES=$(find apps libs -type f | grep -E "/mock|/fake" | grep -vE "\.(spec|test)\.ts$|/test-utils/|/__mocks__/|/test/|/testing/" || true)
if [ ! -z "$MOCK_FILES" ]; then
    echo "CRITICAL: Mock/Fake files found in productive paths:"
    echo "$MOCK_FILES"
    FOUND=1
fi

if [ $FOUND -eq 1 ]; then
    echo "Gating failure: Level 5 compliance check FAILED."
    exit 1
fi

echo "All productive paths are simulation-free. Level 5 compliance check PASSED."
exit 0
