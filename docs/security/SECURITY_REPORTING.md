# TRANSUM-IN Security Reporting

**Version:** 1.0
**Date:** 2026-08-27

## Report Types

### 1. Scan Summary Report (Auto-Generated)

Generated after every security scan. Provides executive overview.

**Format:** Markdown + JSON

**Contents:**
- Scan metadata (ID, provider, status, duration)
- Finding counts by severity
- New vs existing findings
- Regressions detected
- Top 5 findings by severity
- Gate result (PASS/FAIL)

**Example:**
```markdown
# Security Scan Report — scan_1693097400

**Status:** COMPLETED
**Provider:** Strix Managed Cloud
**Duration:** 5m 23s
**Started:** 2026-08-27 09:15:00 UTC
**Completed:** 2026-08-27 09:20:23 UTC

## Summary

| Severity | Count | New | Existing | Fixed |
|----------|-------|-----|----------|-------|
| CRITICAL | 0 | 0 | 0 | 0 |
| HIGH | 1 | 0 | 1 | 0 |
| MEDIUM | 2 | 1 | 1 | 0 |
| LOW | 3 | 0 | 3 | 0 |
| INFO | 4 | 0 | 4 | 0 |

**Total:** 10 findings
**New Findings:** 1
**Regressions:** 0
**Fixed Since Last Scan:** 0

## Gate Result: PASS ✓

No blocking findings detected.

## Top Findings

1. **HIGH** — IDOR in saved-places endpoint (existing)
   - File: `src/modules/saved-places/saved-places.service.ts:42`
   - Status: OPEN
   - Owner: @backend-team
   - Due: 2026-09-10

2. **MEDIUM** — Missing input validation on coordinates (NEW)
   - File: `src/modules/places/places.controller.ts:18`
   - Status: TRIAGED
   - Recommendation: Add coordinate bounds validation

...
```

### 2. Vulnerability Triage Report (Manual)

Generated during vulnerability triage process.

**Contents per Finding:**
- Finding ID and fingerprint
- Source tool and scan date
- Severity and status
- Description with technical details
- Affected component(s)
- Reproduction steps
- Evidence/PoC
- Triage decision (CONFIRMED / FALSE_POSITIVE / ACCEPTED_RISK)
- Assigned owner
- Remediation target date
- Justification (if FP or accepted)

**Storage:** `docs/security/findings/<YYYY-MM-DD>_triage_<finding_id>.md`

### 3. Remediation Report

Generated after fix is implemented.

**Contents:**
- Original finding details
- Root cause analysis
- Fix description
- Changed files
- Testing approach
- Re-scan results
- Regression test status
- Final status (FIXED / REGRESSION_VERIFIED)

### 4. Weekly Summary Report

Generated every Monday 02:00 UTC.

**Contents:**
- Scan results from past week
- Findings aging analysis
- New findings discovered
- Regressions detected
- Remediation progress
- Team assignments
- Acceptance rate metrics
- Mean time to remediation (MTTR)
- Action items

**Recipients:** Security team, Engineering leadership

### 5. Metrics Dashboard (Future)

**Metrics Tracked:**
- Total findings by severity (current snapshot)
- Findings aging > 30 days
- New findings per week
- Remediation success rate
- Mean time to remediation
- False positive rate
- Acceptance justification audit

## Artifact Storage

```
docs/security/
  ├── reports/
  │   ├── <YYYY-MM-DD>_scan_summary.md
  │   ├── <YYYY-MM-DD>_scan_summary.json
  │   ├── <YYYY-MM-DD>_weekly_report.md
  │   └── <YYYY-MM-DD>_metrics.json
  ├── findings/
  │   ├── <YYYY-MM-DD>_triage_<finding_id>.md
  │   └── <YYYY-MM-DD>_remediation_<finding_id>.md
  └── exceptions/
      └── SECURITY_EXCEPTIONS.md (active acceptances)

security/
  └── strix/
      └── <run_name>/
          ├── run.json
          ├── penetration_test_report.md
          ├── vulnerabilities.json
          ├── vulnerabilities.csv
          ├── findings.sarif
          └── vulnerabilities/
```

## Redaction Rules

**Never expose in reports:**
- JWT tokens or Bearer tokens
- API keys or credentials
- Passwords or secrets
- Private IP addresses (except in context)
- PII (emails only if necessary for action items)
- Database connection strings with passwords

**Redaction format:** `[REDACTED]` or `[REDACTED_<TYPE>]`

**Example:**
```
Evidence: Bearer [REDACTED_TOKEN] used to access /admin endpoint
Password field: password=[REDACTED_PASSWORD]
Private IP: 192.168.1.50 → [PRIVATE_IP]
```

## Report Distribution

### PR Comments (Automated)
- Triggered on PR security scan completion
- Posted by GitHub Actions
- Contains findings, gate result, and remediation links
- Mentions assigned teams

### Slack Notifications (Future)
- Weekly summary posted to #security
- Critical findings trigger immediate notification
- Include remediation owner and target date

### Email Distribution (Manual)
- Weekly summary emailed to security@company.com
- Critical findings escalate to leadership
- Monthly metrics email to engineering leads

## Report Examples

### Clean Scan Report
```json
{
  "scanId": "scan_123",
  "status": "COMPLETED",
  "provider": "strix-managed",
  "findings": 0,
  "blockingFindings": 0,
  "gateResult": "PASS",
  "message": "No findings detected."
}
```

### Scan with Findings
```json
{
  "scanId": "scan_124",
  "status": "COMPLETED",
  "provider": "strix-managed",
  "findings": 3,
  "bySeverity": {
    "CRITICAL": 0,
    "HIGH": 1,
    "MEDIUM": 2,
    "LOW": 0,
    "INFO": 0
  },
  "newFindings": 1,
  "blockingFindings": 0,
  "gateResult": "PASS",
  "findings": [
    {
      "id": "f-001",
      "fingerprint": "abc123",
      "title": "Missing rate limiting",
      "severity": "HIGH",
      "status": "OPEN",
      "affectedEndpoint": "/api/v1/auth/login",
      "evidence": "[REDACTED]",
      "remediation": "Implement ThrottlerModule with rate limit of 5 requests per minute"
    }
  ]
}
```

## Validation

All reports must:
- [ ] Contain no exposed secrets
- [ ] Have timestamps in ISO 8601 format
- [ ] Use consistent severity/status enums
- [ ] Include scan ID for traceability
- [ ] Reference findings by fingerprint when possible
- [ ] Link to remediation issue if applicable
- [ ] Redact PII appropriately

---

**Last Updated:** 2026-08-27
**Next Review:** 2026-09-27
