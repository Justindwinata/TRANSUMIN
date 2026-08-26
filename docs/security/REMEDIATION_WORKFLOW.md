# TRANSUM-IN Security Remediation Workflow

**Version:** 1.0
**Date:** 2026-08-26

## Overview

This document defines the standard workflow for identifying, validating, remediating, and verifying security vulnerabilities in TRANSUM-IN.

## Workflow Phases

```
Discovery → Validation → Triage → Remediation → Verification → Regression Test → Re-scan → Documentation
```

## Phase 1: Discovery

Security vulnerabilities may be discovered through:

1. **Strix Automated Pentesting** (when Docker available)
   - White-box repository scans
   - Black-box API testing
   - OpenAPI contract validation

2. **Manual Code Review**
   - Authentication/authorization patterns
   - Input validation
   - Cryptographic implementations
   - Configuration security

3. **Security Baseline Tests**
   - `apps/backend/test/security.baseline.spec.ts`
   - Continuous regression coverage

4. **Dependency Scanning**
   - `npm audit`
   - GitHub Dependabot alerts

5. **External Reports**
   - Responsible disclosure submissions
   - Bug bounty program (future)

## Phase 2: Validation

Before remediation, validate the finding:

### For Strix Findings
1. Read the vulnerability report: `strix_runs/<run>/vulnerabilities/<vuln-id>.md`
2. Review proof-of-concept (PoC) script or steps
3. Reproduce the PoC in safe test environment
4. Confirm actual exploitability (not false positive)

### For Manual Findings
1. Document exact location and affected code
2. Create minimal PoC demonstrating the issue
3. Assess actual impact vs theoretical impact
4. Verify it's not a known accepted risk

### Validation Criteria
- ✅ **Valid:** Reproducible exploit with real impact
- ❌ **False Positive:** Cannot reproduce or no actual security impact
- ⚠️ **Accepted Risk:** Known limitation with documented mitigation

## Phase 3: Triage

Classify by severity using CVSS or simplified scale:

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| **Critical** | Remote code execution, full auth bypass, data breach | Immediate (same day) |
| **High** | Privilege escalation, IDOR, mass data exposure | 1-3 days |
| **Medium** | Limited data exposure, DoS, XSS | 1-2 weeks |
| **Low** | Information disclosure, edge cases | Next sprint |
| **Informational** | Best practice, hardening | Backlog |

### Assignment
- Critical/High → Assign to security lead + relevant domain owner
- Medium/Low → Assign to domain owner
- Informational → Backlog for next refactor

## Phase 4: Remediation

### Root Cause Analysis
Before fixing, understand:
1. What is the actual vulnerability?
2. Why does it exist? (missing validation, logic flaw, misconfiguration?)
3. Where else might this pattern exist?
4. What's the minimal correct fix?

### Fix Principles
1. **Fix the Root Cause, Not the Symptom**
   - ❌ Bad: Block specific SQL injection payload
   - ✅ Good: Use parameterized queries everywhere

2. **Prefer Framework Defenses**
   - Use ORM (Prisma) for SQL injection prevention
   - Use template engines with auto-escaping
   - Use framework-provided CSRF protection
   - Use centralized authorization middleware

3. **Minimal, Targeted Changes**
   - Don't refactor unrelated code
   - Keep the diff reviewable
   - Match existing code style

4. **Defense in Depth**
   - Layer multiple controls when appropriate
   - Validate at boundaries (client, API, service, database)

### Common Vulnerability Patterns & Fixes

#### SQL Injection
- **Fix:** Use Prisma parameterized queries
- **Example:**
  ```typescript
  // ❌ Vulnerable
  prisma.$executeRaw`SELECT * FROM users WHERE email = '${email}'`
  
  // ✅ Secure
  prisma.user.findUnique({ where: { email } })
  ```

#### IDOR (Insecure Direct Object Reference)
- **Fix:** Add ownership checks before operations
- **Example:**
  ```typescript
  // ❌ Vulnerable
  async getPlace(placeId: string) {
    return this.prisma.savedPlace.findUnique({ where: { id: placeId } });
  }
  
  // ✅ Secure
  async getPlace(userId: string, placeId: string) {
    const place = await this.prisma.savedPlace.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException();
    if (place.userId !== userId) throw new ForbiddenException('Not your resource');
    return place;
  }
  ```

#### SSRF (Server-Side Request Forgery)
- **Fix:** Allowlist destinations + block private IPs
- **Example:**
  ```typescript
  // ❌ Vulnerable
  const response = await fetch(userProvidedUrl);
  
  // ✅ Secure
  const allowedHosts = ['api.trusted.com', 'data.transit.gov'];
  const url = new URL(userProvidedUrl);
  if (!allowedHosts.includes(url.hostname)) throw new BadRequestException('Invalid URL');
  if (isPrivateIP(url.hostname)) throw new BadRequestException('Private IPs blocked');
  const response = await fetch(url.href);
  ```

#### XSS (Cross-Site Scripting)
- **Fix:** Context-aware output encoding + CSP
- **Mobile:** Not directly applicable; verify WebView usage
- **Backend:** Return JSON only, let frontend handle rendering

#### Authentication Issues
- **Fix:** Enforce strong JWT configuration, validate tokens properly
- **Example:** See FINDING-001 and FINDING-002 remediations

#### Missing Rate Limiting
- **Fix:** Apply global ThrottlerGuard + per-endpoint customization
- **Example:** See FINDING-003 remediation

## Phase 5: Verification

After applying the fix:

### 1. Local Testing
```bash
# Run existing tests
cd apps/backend
npm test

# Run security baseline tests
npm test security.baseline.spec.ts

# Verify the specific PoC no longer works
# (manual reproduction)
```

### 2. Code Review
- Self-review the diff
- Ensure no unintended side effects
- Verify similar patterns elsewhere are also fixed

### 3. Strix Re-scan (when Docker available)
```bash
# Focused re-test of fixed area
strix -n -t ./ --instruction "Verify FINDING-001 JWT secret vulnerability is fixed" --max-budget 5

# Or diff-scoped scan
strix -n -t ./ --scan-mode quick --scope-mode diff --diff-base origin/main --max-budget 10
```

### 4. Manual PoC Re-test
- Re-run the original PoC
- Confirm it now fails/is blocked
- Document the verification result

## Phase 6: Regression Test

Create automated test to prevent reoccurrence:

### Backend Tests
Add to `apps/backend/test/security.baseline.spec.ts` or create dedicated file:

```typescript
describe('FINDING-001 Regression: JWT Secret Validation', () => {
  it('should reject startup without JWT_SECRET', async () => {
    // Test that application fails if JWT_SECRET is missing
  });
});
```

### Integration Tests
For complex business logic vulnerabilities:
```typescript
describe('Authorization: IDOR Prevention', () => {
  it('should prevent user A from accessing user B saved places', async () => {
    // Full end-to-end test
  });
});
```

## Phase 7: Re-scan

After remediation batch is complete:

1. **Run full security scan** (white-box + black-box)
2. **Compare findings** before/after
3. **Verify remediations** are confirmed fixed
4. **Check for new issues** introduced by changes

## Phase 8: Documentation

### Required Documentation

1. **Update SECURITY_FINDINGS.md**
   - Mark finding as fixed
   - Add commit hash
   - Document verification method
   - Link to regression test

2. **Git Commit Message**
   ```
   fix(security): [FINDING-ID] brief description
   
   - Detailed explanation of what was fixed
   - Root cause analysis
   - Verification method
   
   Fixes: FINDING-001
   ```

3. **Pull Request Description** (if using PR workflow)
   - Link to finding report
   - Summarize vulnerability and fix
   - Include verification steps
   - Tag security reviewers

4. **Security Advisory** (for critical/high)
   - If external users are affected
   - Include version information
   - Provide upgrade instructions

## Remediation Checklist

Use this for each finding:

- [ ] Finding validated (PoC reproduced)
- [ ] Root cause identified
- [ ] Fix applied (minimal, targeted)
- [ ] Similar patterns checked elsewhere
- [ ] Existing tests pass
- [ ] Regression test added
- [ ] PoC re-tested (now blocked)
- [ ] Re-scan completed (finding resolved)
- [ ] Documentation updated
- [ ] Commit created with proper message
- [ ] Code reviewed
- [ ] Deployed (when applicable)

## Emergency Response (Critical Vulnerabilities)

For critical findings actively being exploited:

1. **Immediate Response** (within 1 hour)
   - Confirm the vulnerability
   - Assess impact/scope
   - Determine if hotfix or rollback needed
   - Notify stakeholders

2. **Containment** (within 4 hours)
   - Apply temporary mitigation if available
   - Monitor for active exploitation
   - Preserve forensic evidence

3. **Remediation** (same day)
   - Develop permanent fix
   - Test thoroughly but expedite
   - Deploy to production
   - Verify fix in production

4. **Post-Incident** (within 1 week)
   - Root cause analysis
   - Process improvements
   - Update security baseline tests
   - Security advisory if needed

## Tools & Resources

### Validation & Testing
- **Manual PoC:** curl, Postman, custom scripts
- **Automated Testing:** Jest, Supertest
- **Re-scanning:** Strix CLI or managed platform

### Reference
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **CWE Database:** https://cwe.mitre.org/
- **Strix Docs:** https://docs.strix.ai
- **NestJS Security:** https://docs.nestjs.com/security/

## Reporting Security Issues

### Internal
- File issue in GitHub (private security advisory)
- Tag security lead
- Use `security` label

### External Researchers
- Email: security@transum-in.example (TBD)
- Responsible disclosure: 90-day window
- Recognition in SECURITY.md

---

**Last Updated:** 2026-08-26
**Owner:** Security Engineering Team
