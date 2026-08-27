# TRANSUM-IN Security Scan Setup

**Version:** 1.0
**Date:** 2026-08-27

## Prerequisites

- Node.js 22+
- Strix 1.5.3+ CLI installed (`strix --version`)
- GitHub repository access
- PostgreSQL running (for local API testing)

## Environment Configuration

### Option A: Managed Cloud (Recommended)

**Step 1: Create Strix Account**
1. Visit https://app.strix.ai
2. Sign up with GitHub or email
3. Create organization

**Step 2: Generate API Token**
1. Navigate to Settings → API Tokens
2. Create token with `scans:write` scope
3. Copy token (save securely)

**Step 3: Register Repository**
1. In app.strix.ai, go to Assets → Repositories
2. Add new repository: `https://github.com/Justindwinata/TRANSUMIN.git`
3. Note the domain UUID

**Step 4: Configure GitHub Secret**
1. Go to repository Settings → Secrets and variables → Actions
2. Add new secret: `STRIX_API_TOKEN` = (token from Step 2)

**Step 5: Verify CI Workflow**
- Push a commit to main or create PR
- Observe `.github/workflows/security.yml` running
- Check for `strix-cloud-pr-review` job starting

### Option B: Self-Hosted CLI (Requires Docker)

**Prerequisites:**
- Docker Desktop installed and running
- LLM API key (OpenAI, Anthropic, etc.)

**Step 1: Install Docker**
- macOS: Install Docker Desktop from https://www.docker.com/products/docker-desktop
- Linux: `sudo apt-get install docker.io`
- Verify: `docker --version`

**Step 2: Configure LLM**
Create `.env.security` in repository root:
```bash
STRIX_LLM="openai/gpt-4"
LLM_API_KEY="sk-..."
```

**Step 3: Test Strix CLI**
```bash
cd /Users/justindwinata/Documents/TRANSUMIN
strix -n -t ./ --scan-mode quick --max-budget 5
```

**Step 4: Configure GitHub Secrets**
1. Add `STRIX_LLM` secret: `openai/gpt-4`
2. Add `LLM_API_KEY` secret: (your API key)

**Step 5: Verify CI Workflow**
- Push a commit
- Observe `strix-scan` job executing

## Local Development Testing

### Start Backend
```bash
cd apps/backend
npm install
npx prisma migrate dev
npm run dev
```

Backend runs on http://localhost:3000

### Create Test Users
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "security-user@example.test",
    "fullName": "Security Test User",
    "password": "TestPass123"
  }'
```

### Run Local Scan (Managed Cloud)
```bash
export STRIX_API_TOKEN="strix_..."
strix -n -t http://localhost:3000 \
  --scan-mode quick \
  --max-budget 10 \
  --instruction "Test authentication and authorization with credentials: security-user@example.test / TestPass123"
```

### Run Local Scan (Self-Hosted)
```bash
export STRIX_LLM="openai/gpt-4"
export LLM_API_KEY="sk-..."
strix -n -t ./ \
  --scan-mode quick \
  --max-budget 10
```

## Scan Targets

### Repository (White-Box)
- **Target:** `/Users/justindwinata/Documents/TRANSUMIN`
- **Type:** Source code review
- **Scope:** Backend (NestJS), Mobile (Flutter), Configuration
- **Mode:** `--scope-mode diff` for PR scans

### Backend API (Black-Box)
- **Target:** `http://localhost:3000`
- **Type:** Runtime API security
- **Requires:** Running backend + test users
- **Focus:** Authentication, authorization, input validation, error handling

### OpenAPI (future)
- **Target:** To be generated from NestJS
- **Type:** API specification review
- **Scope:** Endpoint definitions, auth requirements, request/response validation

## Troubleshooting

### "Strix not found"
```bash
which strix
# If empty, reinstall:
curl -sSL https://strix.ai/install | bash
```

### "Docker not running"
```bash
# macOS
open /Applications/Docker.app

# Linux
sudo systemctl start docker
```

### "API Token invalid"
1. Verify token in app.strix.ai Settings → API Tokens
2. Ensure token has `scans:write` scope
3. Check GitHub secret is set correctly: `gh secret list`

### "Scan timeout"
- Increase `--max-budget` flag
- Reduce scan scope with `--scope-mode diff`
- Check network connectivity

### "No findings output"
- Scan may have succeeded with no findings detected (clean scan)
- Check `strix_runs/<run-name>/run.json` for status
- Verify artifacts exist: `ls -la strix_runs/*/`

## Artifact Location

After scan completes:
```
strix_runs/
  └── <run_name>/
      ├── run.json                 # Scan metadata & status
      ├── penetration_test_report.md
      ├── vulnerabilities.json     # Structured findings
      ├── vulnerabilities.csv
      ├── findings.sarif           # GitHub code scanning format
      └── vulnerabilities/         # Individual finding details
```

## Automation

### Daily
- No automatic scans (on-demand only)

### Per PR
- Diff-scoped scan (if configured)
- Results posted as PR comment
- Gate enforced if blocking findings

### Weekly (Monday 2 AM UTC)
- Full standard scan
- Report generated
- Email sent to security team

### Manual
```bash
# Quick scan (5-10 min)
strix -n -t ./ --scan-mode quick --max-budget 10

# Standard scan (20-30 min)
strix -n -t ./ --scan-mode standard --max-budget 20

# Deep scan (60+ min)
strix -n -t ./ --scan-mode deep --max-budget 50
```

## Next Steps

1. [ ] Choose execution path (Managed vs Self-Hosted)
2. [ ] Configure credentials (API token or LLM key)
3. [ ] Test local scan execution
4. [ ] Verify CI workflow integration
5. [ ] Document findings and triage
6. [ ] Set up scheduled scans
7. [ ] Train team on vulnerability lifecycle

## Support

- **Strix Docs:** https://docs.strix.ai
- **Strix Cloud:** https://app.strix.ai
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **GitHub Actions:** https://docs.github.com/en/actions

---

**Last Updated:** 2026-08-27
**Next Review:** 2026-09-27
