# TRANSUM-IN Strix Execution Guide

**Version:** 1.0
**Date:** 2026-08-28

## Overview

This guide documents the verified execution paths for running Strix security scans against TRANSUM-IN.

## Current Status

| Capability | Status | Notes |
|------------|--------|-------|
| Strix CLI | ✅ v1.5.3 | Installed via pipx |
| Docker | ❌ | Not available locally |
| Managed Cloud | ✅ Supported | Requires STRIX_API_TOKEN |
| Self-Hosted CLI | ❌ Blocked | Requires Docker |

## Execution Paths

### Path A: Managed Cloud (Recommended)

**Prerequisites:**
1. Strix account at https://app.strix.ai
2. API token with `scans:write` scope
3. GitHub repository secret: `STRIX_API_TOKEN`

**Setup:**
```bash
# 1. Create account at https://app.strix.ai
# 2. Generate API token (Settings → API Tokens)
# 3. Add to GitHub repo: Settings → Secrets → Actions → STRIX_API_TOKEN
```

**CI Execution:**
- Push to main or open PR
- `.github/workflows/security.yml` → `strix-managed-scan` job
- `SecurityScanExecutor` uses `StrixManagedProvider`
- Scan runs via REST API

**Local Test (if token available):**
```bash
export STRIX_API_TOKEN="strix_..."
cd apps/backend
node -e "
const { SecurityScanExecutor } = require('./dist/core/security/scan');
const executor = new SecurityScanExecutor(process.env.STRIX_API_TOKEN);
const request = {
  target: process.env.SECURITY_TARGET_URL || './',
  targetType: 'repository',
  scanMode: 'quick',
  maxBudgetUsd: 10,
};
executor.executeScan(request).then(r => console.log('STATUS:', r.status));
"
```

### Path B: Self-Hosted CLI (Not Available)

**Prerequisites:**
1. Docker Desktop running
2. Strix CLI: `curl -sSL https://strix.ai/install | bash`
3. LLM configured:
   ```bash
   export STRIX_LLM="openai/gpt-4"
   export LLM_API_KEY="sk-..."
   ```

**Execution:**
```bash
# White-box (repository)
strix -n -t ./ --scan-mode quick --max-budget 10

# Black-box (API)
strix -n -t http://localhost:3000 --scan-mode quick --max-budget 10
```

**Current Blocker:** Docker not available.

## Authorized Targets

| Target | Type | Environment | Authorization |
|--------|------|-------------|---------------|
| `./` | Repository | local | ✅ Always allowed |
| `http://localhost:3000` | URL | local | ✅ Always allowed |
| `https://staging-api.transumin.test` | URL | staging | ✅ Allowlisted |
| `https://api.transumin.com` | URL | production | ❌ BLOCKED |

**TargetValidator** enforces this. Do not weaken it.

## Test Environment Setup

### Backend
```bash
cd apps/backend
npm install
npx prisma migrate dev
npm run dev
# Runs on http://localhost:3000
```

### Test Users
Create via API:
```bash
# User A
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"security-a@test","fullName":"Test A","password":"TestPass123"}'

# User B
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"security-b@test","fullName":"Test B","password":"TestPass123"}'
```

### Test Credentials (if API scan)
```bash
export SECURITY_TEST_USERNAME="security-a@test"
export SECURITY_TEST_PASSWORD="TestPass123"
```

## Scan Modes

| Mode | Duration | Budget | Use Case |
|------|----------|--------|----------|
| quick | ~5-10 min | $10 | PR gate |
| standard | ~20-30 min | $20 | Regular scan |
| deep | ~60+ min | $50 | Comprehensive |

## Artifact Handling

**Output Location:** `apps/backend/strix_runs/<run_name>/`

**Expected Artifacts:**
- `run.json` - Scan metadata & status
- `vulnerabilities.json` - Structured findings
- `vulnerabilities.csv` - CSV export
- `findings.sarif` - SARIF for GitHub
- `penetration_test_report.md` - Executive summary
- `vulnerabilities/*.md` - Individual finding details

**Security Controls:**
- Path traversal prevention (allowlisted directories)
- Size limits (50MB default)
- SHA256 checksums
- Secret redaction in evidence

**Never commit raw artifacts** — they may contain sensitive evidence.

## CI Integration

**Workflow:** `.github/workflows/security.yml`

**Jobs:**
- `security-preflight` - lint, tests, dependency audit
- `strix-managed-scan` - Managed cloud scan (if token)
- `strix-cloud-pr-review` - PR review (if token)
- `scheduled-deep-scan` - Weekly deep scan

**Secret Handling:**
- `STRIX_API_TOKEN` only on main repo (not forks)
- Never echoed in logs
- Conditional execution: `if: secrets.STRIX_API_TOKEN != ''`

**State Reporting:**
```
SECURITY_SCAN_STATUS=COMPLETED|SKIPPED_NOT_CONFIGURED|FAILED|TIMED_OUT|BLOCKED
SECURITY_FINDINGS_COUNT=<n>
SECURITY_CRITICAL_COUNT=<n>
SECURITY_HIGH_COUNT=<n>
```

## Finding Triage Process

1. **Read** finding evidence
2. **Inspect** affected TRANSUM-IN code
3. **Reproduce** safely
4. **Classify:**
   - CONFIRMED - Real vulnerability
   - FALSE_POSITIVE - Not exploitable
   - NOT_APPLICABLE - Not relevant
   - ACCEPTED_RISK - Documented waiver
   - NEEDS_INVESTIGATION - Unclear

## Remediation Workflow

1. **Root Cause Fix** - Not scanner-specific workaround
2. **Add Regression Test** - Must fail before fix, pass after
5. **Run Tests** - All security + unit + integration
6. **Re-scan** - Verify finding resolved
7. **Verify** - Fingerprint comparison

## Reporting

**Real Scan Output:** Actual Strix findings, evidence, severities
**Skipped Scan Output:** Status = SKIPPED_NOT_CONFIGURED, 0 findings
**Never:** Fabricate findings or scan completion

---

**Last Updated:** 2026-08-28
**Strix Version:** 1.5.3