#!/usr/bin/env bash
#
# TRANSUM-IN Security Preflight Check
# Validates security configuration before starting local API for testing
#
# Usage: scripts/security/security-preflight.sh
#

set -euo pipefail

echo "=== TRANSUM-IN Security Preflight ==="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
SKIP=0

check() {
  local name="$1"
  local command="$2"
  echo -n "Checking: $name... "
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC}"
    FAIL=$((FAIL + 1))
  fi
}

warn() {
  local name="$1"
  local command="$2"
  echo -n "Checking: $name... "
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${YELLOW}WARN${NC}"
    SKIP=$((SKIP + 1))
  fi
}

# === Environment Checks ===
echo ""
echo "--- Environment Checks ---"

check "Node.js available" "command -v node"
check "npm available" "command -v npm"
check "PostgreSQL available" "command -v psql"
check "PostgreSQL running" "pg_isready"

# === Backend Checks ===
echo ""
echo "--- Backend Security Checks ---"

cd "$(dirname "$0")/../.."/apps/backend

# Check .env file exists
warn ".env file exists" "test -f .env"

# Check critical env vars
check "JWT_SECRET is set and strong (>=32 chars)" "
  test -f .env && \
  grep -q 'JWT_SECRET' .env && \
  SECRET=\$(grep 'JWT_SECRET' .env | cut -d'=' -f2 | tr -d '\"') && \
  test \${#SECRET} -ge 32
"

check "NODE_ENV is set" "test -f .env && grep -q 'NODE_ENV' .env"
check "DATABASE_URL is set" "test -f .env && grep -q 'DATABASE_URL' .env"
check "CORS_ORIGIN is configured" "test -f .env && grep -q 'CORS_ORIGIN' .env"

# Check no hardcoded secrets in source
check "No hardcoded secrets in source (excluding .env)" "
  ! grep -rn 'sk-\|AKIA\|password\s*[:=]\s*[\"\x27][^\"\x27{]' --include='*.ts' src/ 2>/dev/null | grep -v 'node_modules' | grep -v '.spec.' | grep -v '.env' | grep -v 'test' | wc -l | grep -q '^0$'
"

# Check JWT_SECRET is not using known defaults
check "JWT_SECRET is not default/placeholder value" "
  test -f .env && ! grep -qi 'your-super-secret' .env
"

# === Code Security Checks ===
echo ""
echo "--- Code Security Checks ---"

check "No eval() usage in TypeScript" "! grep -rn 'eval(' --include='*.ts' src/ 2>/dev/null | grep -v 'node_modules' | grep -v '.spec.' | grep -v 'test'"
check "No innerHTML usage" "! grep -rn 'innerHTML' --include='*.ts' src/ 2>/dev/null | grep -v 'node_modules'"
check "No dangerous console.log in business logic" "! grep -rn 'console.log' --include='*.ts' src/ 2>/dev/null | grep -v 'node_modules' | grep -v '.spec.' | grep -v 'main.ts' | grep -v 'logging.service' | grep -v 'ingest.ts' | grep -v 'list-datasets.ts'"
check "No process.env in source without config" "! grep -rn 'process\.env\.' --include='*.ts' src/ 2>/dev/null | grep -v 'node_modules' | grep -v '.spec.' | grep -v 'test' | grep -v 'ConfigModule' | grep -v 'ConfigService' | wc -l | grep -q '^0$'"

# === Mobile Checks ===
echo ""
echo "--- Mobile Security Checks ---"

cd ../mobile

check "flutter_secure_storage is a dependency" "grep -q 'flutter_secure_storage' pubspec.yaml"
check "Environment-based API config (not hardcoded)" "
  ! grep -rn 'http://localhost\|http://127.0.0.1' lib/ 2>/dev/null | grep -v 'AppConfig' | grep -v 'environment.dart' | wc -l | grep -q '^0$'
"

# === Test Readiness ===
echo ""
echo "--- Test Readiness ---"

cd ../backend
check "Security baseline tests exist" "test -f test/security.baseline.spec.ts || test -f test/auth/jwt-auth.guard.spec.ts"
check "OWASP Top 10 tests exist" "test -f test/owasp-top-10.spec.ts"
check "Authorization tests exist" "test -f test/authorization.security.spec.ts"
check "Validation tests exist" "test -f test/validation.service.spec.ts"

# === Results ===
echo ""
echo "=== Preflight Results ==="
echo -e "Passed: ${GREEN}${PASS}${NC}"
echo -e "Failed: ${RED}${FAIL}${NC}"
echo -e "Warn/Skipped: ${YELLOW}${SKIP}${NC}"

if [ "$FAIL" -gt 0 ]; then
  echo -e "\n${RED}Security preflight FAILED. Fix issues before proceeding.${NC}"
  exit 1
fi

echo -e "\n${GREEN}Security preflight PASSED. Safe to start testing.${NC}"
exit 0
