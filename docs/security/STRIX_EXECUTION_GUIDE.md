# TRANSUM-IN Strix Execution Guide

**Version:** 1.0
**Date:** 2026-08-28

## Overview

This guide documents the verified execution paths for security scanning with Strix in TRANSUM-IN.

## Current Status

| Capability | Status |
|------------|--------|
| Strix CLI | INSTALLED (v1.5.3) |
| Docker | NOT AVAILABLE |
| Managed Cloud | CONFIGURED BUT UNCONFIGURED (no token) |
| Self-Hosted | BLOCKED (Docker required) |

## Execution Paths

### Path A: Managed Cloud (Recommended)

**Prerequisites:**
1. Strix account at https://app.strix.ai
2. API token with `scans:write` scope
3. GitHub secret `STRIX_API_TOKEN` configured

**Steps:**
```bash
# 1. Create account at app.strix.ai
# 2. Generate API token in Settings → API Tokens
# 3. Add to GitHub repository secrets as STRIX_API_TOKEN
# 4. CI workflow will automatically execute scans on PRs
```

**Verification:**
```bash
# Check if token is configured (without exposing it)
gh secret list | grep STRIX_API_TOKEN
```

**Expected Result:** `REAL_SCAN_EXECUTED` or `PROVIDER_FAILURE`

### Path B: Self-Hosted CLI (Blocked)

**Prerequisites:**
1. Docker Desktop installed and running
2. LLM API key (OpenAI, Anthropic, etc.)
3. Environment variables configured

**Steps:**
```bash
# 1. Install Docker Desktop
# 2. Verify Docker is running
docker info

# 3. Configure environment
export STRIX_LLM="openai/gpt-4"
export LLM_API_KEY="sk-..."

# 4. Execute scan
strix -n -t ./ --scan-mode quick --max-budget 10
```

**Current Blocker:** Docker not available

**Expected Result:** `BLOCKED_BY_ENVIRONMENT`

### Path C: No Credentials (Current State)

**Behavior:**
- Scan status: `SKIPPED_NOT_CONFIGURED`
- CI passes without blocking
- No fake findings generated

**Verification:**
```bash
cd apps/backend
npm run build
node -e "
const { SecurityScanExecutor } = require('./dist/core/security/scan');
const executor = new SecurityScanExecutor();
executor.executeScan({target: './', targetType: 'repository', scanMode: 'quick'})
  .then(r => console.log('STATUS:', r.status));
"
# Output: STATUS: SKIPPED_NOT_CONFIGURED
```

## Scan Execution States

| State | Meaning | Action |
|-------|---------|--------|
| READY | Provider configured and validated | Proceed with scan |
| NOT_CONFIGURED | Missing credentials | Skip scan, report in CI |
| RUNNING | Scan in progress | Wait for completion |
| COMPLETED | Scan finished successfully | Process findings |
| FAILED | Scan execution error | Report error, investigate |
| TIMED_OUT | Scan exceeded time limit | Retry or increase budget |
| SKIPPED_NOT_CONFIGURED | No provider available | Configure credentials |
| BLOCKED | Environment blocker (Docker) | Fix blocker or use managed |
| UNSUPPORTED | Execution mode not supported | Use alternative path |

## Target Authorization

### Allowed Targets
- Local repository: `./`, `./apps/backend`
- Local URLs: `http://localhost:3000`, `http://127.0.0.1:*`
- Staging URLs: `*.staging.*`, `*.test.*`, allowlisted URLs

### Blocked Targets
- Production URLs: `*.transumin.com`, `prod.*`, `production.*`
- Arbitrary external URLs not in allowlist
- Targets with production indicators

### Production Override

Production scanning requires explicit configuration:
```bash
# NEVER do this without explicit authorization
# SECURITY_ALLOW_PRODUCTION=true
```

## Artifact Handling

### Storage Location
```
apps/backend/strix_runs/
  └── <run_name>/
      ├── run.json
      ├── vulnerabilities.json
      ├── findings.sarif
      └── vulnerabilities/
```

### Security Controls
- Path traversal prevention
- Size limits (50MB default)
- Checksum verification
- Secret redaction in stored evidence

### Git Ignore
Add to `.gitignore`:
```
strix_runs/
*.sarif
```

## CI Integration

### Workflow File
`.github/workflows/security.yml`

### Behavior
1. PR opened → trigger managed scan if `STRIX_API_TOKEN` configured
2. No token → report `SKIPPED_NOT_CONFIGURED`, pass CI
3. Scan completes → evaluate gate policy
4. Blocking findings → fail CI, post PR comment
5. No blocking findings → pass CI

### Fork PRs
- Secrets not available
- Scan skipped automatically
- CI passes without scan

## Honest Reporting

### When Scan Runs
- Status: `REAL_SCAN_EXECUTED`
- Findings: Actual vulnerabilities detected
- Evidence: Redacted for secrets

### When Scan Skips
- Status: `SKIPPED_NOT_CONFIGURED`
- Findings: Empty (not fabricated)
- Reason: Clear explanation in report

### Never
- Fabricate findings
- Report clean scan without execution
- Expose secrets in logs or artifacts
- Bypass gate policy without waiver

## Troubleshooting

### Scan Returns FAILED
1. Check `run.json` for error details
2. Verify network connectivity
3. Check API token validity
4. Review scan budget

### Scan Returns TIMED_OUT
1. Increase `maxBudgetUsd`
2. Reduce scan scope
3. Use `quick` mode instead of `standard`

### Scan Returns SKIPPED_NOT_CONFIGURED
1. Verify `STRIX_API_TOKEN` secret exists
2. Check secret is not empty
3. Verify workflow has access to secrets

## Next Steps

1. [ ] Create Strix account
2. [ ] Generate API token
3. [ ] Configure GitHub secret
4. [ ] Run first scan
5. [ ] Triage findings
6. [ ] Remediate confirmed issues
7. [ ] Add regression tests
8. [ ] Re-scan to verify fixes

---

**Last Updated:** 2026-08-28
**Next Review:** 2026-09-28
