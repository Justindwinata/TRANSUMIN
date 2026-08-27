# DevSecOps Domain Guide

Practical examples for CI/CD security integration using TRANSUM-IN skills.

## Skills Used

- `implementing-devsecops-security-scanning`
- `implementing-secret-scanning-with-gitleaks`

## GitHub Actions Security Pipeline

### Complete Security Workflow

```yaml
# .github/workflows/security.yml

name: Security Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1. Secrets Detection (runs first - highest priority)
  secrets-scan:
    name: Secrets Detection (Gitleaks)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for commit scanning
      
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # 2. SAST Scanning
  sast-scan:
    name: SAST (Semgrep)
    runs-on: ubuntu-latest
    container:
      image: semgrep/semgrep
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Semgrep SAST
        run: |
          semgrep scan \
            --config p/security-audit \
            --config p/owasp-top-ten \
            --config p/secrets \
            --severity ERROR \
            --error \
            --json \
            --output semgrep-results.json \
            .
      
      - name: Upload SAST Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: semgrep-results
          path: semgrep-results.json

  # 3. SCA Scanning
  sca-scan:
    name: SCA & Container Scan (Trivy)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy Filesystem Scan
        uses: aquasecurity/trivy-action@0.28.0
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
          format: 'json'
          output: 'trivy-fs-results.json'
      
      - name: Run Trivy IaC Scan
        uses: aquasecurity/trivy-action@0.28.0
        with:
          scan-type: 'config'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
          format: 'json'
          output: 'trivy-iac-results.json'
      
      - name: Upload SCA Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: trivy-results
          path: trivy-*.json

  # 4. Container Scan (after SAST passes)
  container-scan:
    name: Container Image Scan (Trivy)
    runs-on: ubuntu-latest
    needs: [sast-scan]
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker Image
        run: docker build -t transum-in:${{ github.sha }} .
      
      - name: Scan Container Image
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: 'transum-in:${{ github.sha }}'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
          format: 'json'
          output: 'trivy-image-results.json'
      
      - name: Generate SBOM
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: 'transum-in:${{ github.sha }}'
          format: 'cyclonedx'
          output: 'sbom.json'
      
      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.json

  # 5. DAST Scan (against staging)
  dast-scan:
    name: DAST (OWASP ZAP)
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - name: Run ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.14.0
        with:
          target: ${{ vars.STAGING_URL }}
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a -j'

  # 6. Security Gate (aggregates all results)
  security-gate:
    name: Security Gate
    runs-on: ubuntu-latest
    needs: [secrets-scan, sast-scan, sca-scan, container-scan]
    if: always()
    steps:
      - name: Check Scan Results
        run: |
          echo "Checking security scan results..."
          
          # Fail if any critical job failed
          if [[ "${{ needs.secrets-scan.result }}" == "failure" ]]; then
            echo "BLOCKED: Secrets detected in repository"
            exit 1
          fi
          
          if [[ "${{ needs.sast-scan.result }}" == "failure" ]]; then
            echo "BLOCKED: SAST found critical/high vulnerabilities"
            exit 1
          fi
          
          if [[ "${{ needs.sca-scan.result }}" == "failure" ]]; then
            echo "BLOCKED: SCA found critical/high vulnerable dependencies"
            exit 1
          fi
          
          if [[ "${{ needs.container-scan.result }}" == "failure" ]]; then
            echo "BLOCKED: Container image has critical/high vulnerabilities"
            exit 1
          fi
          
          echo "All security gates passed"

  # 7. Strix Dynamic Assessment (optional, on schedule or manual)
  strix-scan:
    name: Strix Dynamic Assessment
    runs-on: ubuntu-latest
    needs: [security-gate]
    if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Strix Scan
        run: |
          strix -t ./apps/backend \
                -t ${{ vars.STAGING_URL }} \
                --max-budget 30 \
                --instruction "Test all endpoints with user/admin tokens"
      
      - name: Upload Strix Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: strix-report
          path: strix_runs/*/penetration_test_report.md
```

### Gitleaks Configuration

```toml
# .gitleaks.toml

[extend]
useDefault = true

[allowlist]
description = "TRANSUM-IN allowlist"
paths = [
  '''\.gitleaks\.toml''',
  '''test/fixtures/.*''',
  '''docs/examples/.*''',
  '''\.example\.env$''',
]

[[rules]]
id = "transum-internal-api-key"
description = "TRANSUM-IN internal API key pattern"
regex = '''TRANSUM_KEY_[A-Za-z0-9]{32}'''
tags = ["internal", "api-key"]
```

### Semgrep Custom Rules

```yaml
# .semgrep/custom-rules.yml

rules:
  - id: no-sql-injection
    patterns:
      - pattern: |
          $QUERY = "...$X..."
          $DB.execute($QUERY)
      - metavariable-regex:
          metavariable: $X
          regex: .*[${].*
    message: "Potential SQL injection - use parameterized queries"
    severity: ERROR
    languages: [typescript, javascript]
    metadata:
      cwe: "CWE-89"
      owasp: "A03:2021"

  - id: no-direct-object-access
    pattern-either:
      - pattern: |
          const $X = await $REPO.findById($ID);
          return $X;  // Missing ownership check
    message: "Direct object access without ownership verification"
    severity: ERROR
    languages: [typescript]
    metadata:
      cwe: "CWE-639"
      owasp: "API1:2023"

  - id: jwt-secret-in-config
    pattern: |
      process.env.JWT_SECRET || "..."
    message: "JWT secret should not have hardcoded fallback"
    severity: ERROR
    languages: [typescript]
```

### Branch Protection

```bash
# Configure via GitHub UI or API
# Settings > Branches > Branch protection rules

Branch: main
  Require status checks:
    - Secrets Detection (Gitleaks)
    - SAST (Semgrep)
    - SCA & Container Scan (Trivy)
    - Security Gate
  Require branches up to date: true
  Require review: true
  Dismiss stale reviews: true
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml

repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.22.1
    hooks:
      - id: gitleaks
        stages: [commit, push]

  - repo: https://github.com/semgrep/semgrep
    rev: v1.102.0
    hooks:
      - id: semgrep
        args: ['--config', 'p/security-audit', '--config', 'p/owasp-top-ten', '--error']
        stages: [commit]

  - repo: local
    hooks:
      - id: test-security
        name: Run security tests
        entry: npm run test -- security
        language: system
        stages: [commit]
        pass_filenames: false
```

## Verification Checklist

- [ ] Gitleaks blocks dummy API key in commit
- [ ] Semgrep runs on PR and shows annotations
- [ ] Trivy detects known vulnerable dependency
- [ ] Container scan passes for clean image
- [ ] SBOM generated in CycloneDX format
- [ ] ZAP baseline scan completes against staging
- [ ] Security gate blocks merge on critical findings
- [ ] Branch protection enforces all checks
- [ ] Pre-commit catches secrets locally
- [ ] Strix scan runs on schedule and reports findings

## Strix Integration

```bash
# In CI after security gate passes
strix -t ./apps/backend -t https://staging.transum-in.local/api \
  --max-budget 30 \
  --instruction "
Tokens: user=$TOKEN_USER admin=$TOKEN_ADMIN
Focus: BOLA, BFLA, rate limiting, auth bypass
Out of scope: billing, notifications
"

# Fail build on critical findings
if grep -q '"severity": "CRITICAL"' strix_runs/*/vulnerabilities.json; then
  echo "Strix found critical vulnerabilities"
  exit 1
fi
```