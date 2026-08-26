# TRANSUM-IN Strix Integration

**Status:** Skills Installed | Docker Blocked | Managed Cloud Path Documented
**Installed Skills:** 9/9

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

## Execution Paths

### Path A: Self-Hosted OSS CLI (Requires Docker)

**Prerequisites:**
- Docker running (`docker info`)
- Strix CLI installed: `curl -sSL https://strix.ai/install | bash`
- LLM configured:
  ```bash
  export STRIX_LLM="openai/gpt-5.4"
  export LLM_API_KEY="<provider-api-key>"
  ```

**Run White-Box Scan (Repository):**
```bash
strix -n -t ./ --scan-mode standard --max-budget 20
```

**Run Black-Box Scan (API):**
```bash
strix -n -t http://localhost:3000 --scan-mode standard --max-budget 20 --instruction "Test authenticated endpoints with test users"
```

**Run with OpenAPI Spec:**
```bash
strix -n -t ./apps/backend/openapi.yaml -t http://localhost:3000 --max-budget 20
```

### Path B: Managed Cloud (No Docker Required)

**Prerequisites:**
- Strix account at https://app.strix.ai
- API token with `scans:write` scope
- Registered target (domain or repository)

**Launch Scan:**
```bash
export STRIX_API_TOKEN="<org-scoped-token>"
BASE=https://app.strix.ai/api/v1

scan_id=$(curl -sS "$BASE/scans" \
  -H "Authorization: Bearer $STRIX_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"engagement_type":"live_test","domain_ids":["<domain-uuid>"]}' | jq -r .scan_id)
```

**Poll & Export SARIF:**
```bash
curl -sS "$BASE/scans/$scan_id" -H "Authorization: Bearer $STRIX_API_TOKEN" | jq '.status'
curl -sS "$BASE/scans/$scan_id/sarif" -H "Authorization: Bearer $STRIX_API_TOKEN" -o findings.sarif
```

## TRANSUM-IN Specific Configuration

### Targets to Scan

1. **Local Repository (White-Box):**
   - Path: `/Users/justindwinata/Documents/TRANSUMIN`
   - Includes: backend (NestJS), mobile (Flutter), shared docs

2. **Backend API (Black-Box):**
   - URL: `http://localhost:3000` (dev) or staging
   - Requires: Test users, seeded database

3. **OpenAPI Specification (if available):**
   - Path: TBD - need to generate/export from NestJS

### Test Users for Authenticated Scanning

Create deterministic test accounts:
```
security-admin@example.test
security-user@example.test
security-user2@example.test
```

### LLM Configuration

Create `.env.security` from `.env.security.example`:

```bash
# Self-hosted only
STRIX_LLM="openai/gpt-5.4"
LLM_API_KEY="sk-..."

# Managed cloud only
STRIX_API_TOKEN="strix_..."
```

**Never commit secrets.** Use `.env.security.example` with placeholders.

## CI Integration Design

### GitHub Actions (Self-Hosted OSS CLI)

File: `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  pull_request:

jobs:
  strix-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Strix
        run: curl -sSL https://strix.ai/install | bash

      - name: Run Security Scan (diff-scoped)
        env:
          STRIX_LLM: ${{ secrets.STRIX_LLM }}
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
        run: strix -n -t ./ --scan-mode quick --max-budget 10

      - name: Verify scan completed
        run: |
          run_json=$(ls -t strix_runs/*/run.json | head -1)
          status=$(jq -r .status "$run_json")
          if [ "$status" != "completed" ]; then
            echo "Strix run status is '$status' — scan did not complete" >&2
            exit 1
          fi

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: strix_runs
```

### GitHub Actions (Managed Cloud - Recommended)

No workflow file needed — install Strix GitHub App from dashboard. For API-triggered:

```yaml
- name: Strix PR review (managed)
  if: github.event_name == 'pull_request'
  env:
    STRIX_API_TOKEN: ${{ secrets.STRIX_API_TOKEN }}
  run: |
    curl -sS --fail https://app.strix.ai/api/v1/pr-reviews/start \
      -H "Authorization: Bearer $STRIX_API_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"repository_full_name\":\"${{ github.repository }}\",\"pr_number\":${{ github.event.pull_request.number }}}"
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

Store in `security/strix/` (gitignored for large runs, commit reports).

## Remediation Workflow

Per `fix-security-vulnerabilities-with-strix` skill:

1. **Triage** — Read `vulnerabilities/*.md` and `vulnerabilities.json`
2. **Reproduce** — Run PoC from finding
3. **Fix Root Cause** — Parameterize queries, enforce authz, allowlist URLs
4. **Verify** — Re-scan with `--scope-mode diff --diff-base <base>`
5. **Regression Test** — Run project test suite

## Current Blockers

| Blocker | Impact | Workaround |
|---------|--------|------------|
| Docker not installed | Cannot run self-hosted OSS CLI | Use managed cloud path |
| No LLM API key configured | Cannot run self-hosted OSS CLI | Use managed cloud or add key |
| No Strix cloud account | Cannot run managed cloud | Create account at app.strix.ai |

## Next Steps

1. [ ] Decide execution path (Docker install vs managed cloud)
2. [ ] Configure LLM credentials or Strix API token
3. [ ] Prepare test environment (PostgreSQL, test users, seeded data)
4. [ ] Generate/export OpenAPI spec from NestJS
5. [ ] Run baseline white-box scan
6. [ ] Run black-box API scan
7. [ ] Collect and triage findings
8. [ ] Remediate validated findings
9. [ ] Add regression tests
10. [ ] Create CI security workflow
11. [ ] Document runbook

## References

- Strix Docs: https://docs.strix.ai
- Strix Cloud API: https://docs.app.strix.ai
- Skills: https://github.com/usestrix/strix/tree/main/skills
- AGENTS.md: https://github.com/usestrix/strix/blob/main/AGENTS.md