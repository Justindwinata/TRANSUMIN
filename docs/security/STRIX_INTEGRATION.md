# TRANSUM-IN Strix Integration

**Status:** Skills Installed | Docker Blocked | Managed Cloud Path Documented
**Installed Skills:** 9/9
**Verified Strix Version:** 1.5.3

## Installed Strix Skills

All 9 official Strix skills installed in `.agents/skills/`:

| Skill | Purpose |
|-------|---------|
| `penetration-testing-with-strix` | Core pentesting workflow (OSS CLI or Cloud) |
| `managed-pentesting-with-strix` | Cloud API orchestration (no Docker/LLM key) |
| `fix-security-vulnerabilities-with-strix` | Remediation + re-scan verification |
| `ci-security-scanning-with-strix` | CI/CD integration (GitHub Actions, GitLab) |
| `application-security-testing` | General application pentesting |
| `web-app-penetration-testing` | Web app specific testing |
| `api-security-testing` | API security testing |
| `owasp-top-10-testing` | OWASP Top 10 focused testing |
| `find-security-vulnerabilities-in-code` | Static/code-focused vulnerability finding |

## Verified Execution Paths

### Path A: Self-Hosted OSS CLI (Requires Docker) — BLOCKED

**Prerequisites:**
- Docker running (`docker info`)
- Strix CLI installed: `curl -sSL https://strix.ai/install | bash`
- LLM configured:
  ```bash
  export STRIX_LLM="openai/gpt-5.4"
  export LLM_API_KEY="<provider-api-key>"
  ```

**Verified CLI Commands:**
```bash
strix -n -t ./ --scan-mode standard --max-budget 20      # White-box (repo)
strix -n -t http://localhost:3000 --scan-mode standard --max-budget 20  # Black-box (API)
strix -n -t ./apps/backend/openapi.yaml -t http://localhost:3000 --max-budget 20  # With OpenAPI
```

**Blocker:** Docker not available in environment. Cannot execute self-hosted scans.

### Path B: Managed Cloud (No Docker Required) — AVAILABLE BUT UNCONFIGURED

**Prerequisites:**
- Strix account at https://app.strix.ai
- API token with `scans:write` scope
- Registered target (domain or repository)

**Verified API Endpoints (from docs):**
```
POST https://app.strix.ai/api/v1/scans              # Launch scan
GET  https://app.strix.ai/api/v1/scans/{scan_id}    # Poll status
GET  https://app.strix.ai/api/v1/scans/{scan_id}/sarif  # Export SARIF
POST https://app.strix.ai/api/v1/pr-reviews/start   # PR review
```

**Blocker:** No Strix cloud account/API token configured.

## TRANSUM-IN Specific Configuration

### Targets to Scan
1. **Local Repository (White-Box):** `/Users/justindwinata/Documents/TRANSUMIN`
2. **Backend API (Black-Box):** `http://localhost:3000` (dev) or staging
3. **OpenAPI Specification:** Need to generate/export from NestJS

### Test Users for Authenticated Scanning
```
security-admin@example.test
security-user@example.test
security-user2@example.test
```

### Environment Variables
```bash
# Self-hosted only (requires Docker)
STRIX_LLM="openai/gpt-5.4"
LLM_API_KEY="sk-..."

# Managed cloud only (requires account)
STRIX_API_TOKEN="strix_..."

# Target configuration
SECURITY_TARGET_ENV=local|staging
SECURITY_TARGET_URL=http://localhost:3000
SECURITY_TEST_USERNAME=security-user@example.test
SECURITY_TEST_PASSWORD=TestPass123
```

## Artifact Collection

Strix outputs to `strix_runs/<run-name>/`:

| File | Purpose |
|------|---------|
| `penetration_test_report.md` | Executive summary |
| `vulnerabilities/*.md` | Individual findings with PoC |
| `vulnerabilities.json` | Structured findings index |
| `vulnerabilities.csv` | CSV export |
| `findings.sarif` | SARIF 2.1.0 for GitHub code scanning |
| `run.json` | Run metadata, budget, status |

## Current Capability Assessment

| Capability | Status | Notes |
|------------|--------|-------|
| CLI Installation | ✅ Verified | v1.5.3 installed via pipx |
| CLI Non-Interactive Mode | ✅ Verified | `-n` flag supported |
| White-Box (Repo) Scan | ❌ BLOCKED | Requires Docker |
| Black-Box (API) Scan | ❌ BLOCKED | Requires Docker |
| Diff-Scoped Scan | ✅ Available | `--scope-mode diff` |
| Managed Cloud API | ✅ Documented | Requires account/token |
| SARIF Export | ✅ Documented | `findings.sarif` output |
| CI Integration | ⚠️ Partial | Workflow exists, needs credentials |
| Structured Findings | ✅ Verified | `vulnerabilities.json` format |

## Next Steps for Phase 3

1. Create `.env.security.example` with placeholders
2. Implement Security Scan Provider abstraction
3. Add finding normalization/deduplication
4. Create vulnerability lifecycle model
5. Implement security gating policy
6. Update CI workflow with proper skip/blocked states
