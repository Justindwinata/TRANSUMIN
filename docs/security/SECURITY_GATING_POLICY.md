# TRANSUM-IN Security Gating Policy

**Version:** 1.0
**Date:** 2026-08-27
**Scope:** All CI/CD workflows and merge gates

## Policy Overview

Security gating enforces minimum security standards on code changes. The policy distinguishes between:

- **Blocking findings** — Must be addressed or explicitly accepted before merge
- **Warning findings** — Reported but do not block merge
- **Info findings** — Reported for awareness

## Severity Levels

| Severity | Definition | Default Action |
|----------|-----------|-----------------|
| CRITICAL | Immediate exploitation possible, severe impact | BLOCK |
| HIGH | Likely exploitable, significant impact | BLOCK (if new) |
| MEDIUM | Possible exploitation, moderate impact | WARN |
| LOW | Unlikely exploitation or low impact | REPORT |
| INFO | Informational, no security impact | REPORT |

## Gating Rules

### Rule 1: No Unaddressed Critical Findings
**Condition:** Any OPEN and CRITICAL
**Action:** FAIL gate
**Exception:** Must be explicitly accepted via documented risk assessment
**Exception Process:** 
1. Create security issue documenting risk
2. Security lead approval required
3. Exception expires after 30 days, must be renewed
4. Log in SECURITY_EXCEPTIONS.md

### Rule 2: No New High Findings
**Condition:** HIGH severity and status=OPEN and first_seen > baseline_timestamp
**Action:** FAIL gate
**Exception:** Same as Rule 1
**Rationale:** High findings may be acceptable in existing code, but new findings must be addressed

### Rule 3: Medium/Low/Info Findings Reported Only
**Condition:** MEDIUM, LOW, or INFO severity
**Action:** Report findings, do not block
**Exception:** None required

### Rule 4: False Positives and Accepted Risks Ignored
**Condition:** status=FALSE_POSITIVE OR status=ACCEPTED_RISK
**Action:** Do not contribute to gate result
**Requirement:** Justification must be documented

### Rule 5: Expired Acceptances Block Merge
**Condition:** status=ACCEPTED_RISK and acceptance_expiry < now
**Action:** FAIL gate, require renewal
**Renewal:** Same process as initial acceptance

## CI Workflow Behavior

### Pull Request Gate
```yaml
if no security credentials configured:
  status = SKIPPED_NOT_CONFIGURED
  message = "Security scan not configured. Configure STRIX_API_TOKEN to enable."
  result = PASS (do not block)

else if scan blocked by environment:
  status = BLOCKED
  message = "Security scan blocked: [reason]"
  result = PASS (do not block)

else if scan completed:
  findings = normalize(raw_findings)
  findings = deduplicate(findings)
  blocking = evaluate_gate_policy(findings)
  
  if blocking.length > 0:
    result = FAIL
    comment_pr with findings
  else:
    result = PASS
    comment_pr with summary ("no blocking findings")
```

### Push to Main Gate
Same as PR gate. Enforce same policy.

### Scheduled Deep Scan
- Run full standard/deep scan
- Generate report
- Email to security team
- Do NOT block anything (informational only)

## Exceptions & Waivers

### Creating an Exception
1. **Issue filed** in security tracker with:
   - Finding ID and fingerprint
   - Severity and risk assessment
   - Business justification
   - Expiration date (max 30 days)
   - Required approvals

2. **Approval chain:**
   - Engineering lead: confirms engineering feasibility
   - Security lead: confirms risk is acceptable
   - Product/business: confirms business impact acceptable

3. **Documentation:**
   - Exception recorded in `docs/security/SECURITY_EXCEPTIONS.md`
   - Finding status set to ACCEPTED_RISK
   - Acceptance reason and approvers recorded in finding metadata

### Expiration & Renewal
- Exceptions expire automatically after 30 days
- Renewal required for continued acceptance
- Lapsed exceptions restore blocking behavior

## Known Limitations

### Docker Unavailable
- Self-hosted Strix CLI scans cannot run
- Managed cloud path is available but requires credentials
- If no credentials: scan skipped, gate passes

### Unverified Execution
- Strix managed cloud integration not yet authenticated
- When credentials absent: gate skipped automatically

## Metrics & Reporting

**CI Result Codes:**
- `PASS` — No blocking findings
- `FAIL` — Blocking findings present
- `SKIPPED_NOT_CONFIGURED` — Credentials absent
- `BLOCKED` — Technical blocker (Docker, network, etc.)

**PR Comments:**
```
Security Scan Result: [PASS|FAIL|SKIPPED]

Findings: 0 critical, 0 high, 1 medium

[if findings] Blocking findings:
- [Finding title] (severity, file, line)
  Remediation: [recommendation]

[if SKIPPED] Security scanning is not configured.
To enable: create STRIX_API_TOKEN secret in GitHub.
```

**Weekly Report:**
- Total findings by severity
- New findings this week
- Regressions
- Aging findings (>30 days)
- Acceptance rate
- Mean time to remediation

## Testing & Validation

Gate policy must pass these scenarios:

1. **Clean scan** — No findings, gate passes ✓
2. **New critical** — Gate fails ✓
3. **New high** — Gate fails ✓
4. **New medium** — Gate passes with warning ✓
5. **Existing high (from baseline)** — Gate passes ✓
6. **Existing high + accepted risk** — Gate passes ✓
7. **False positive** — Gate passes ✓
8. **Scan not configured** — Gate passes ✓
9. **Scan blocked** — Gate passes ✓
10. **Acceptance expired** — Gate fails ✓

---

**Next Review:** 2026-09-27
**Owner:** Security Engineering Team
