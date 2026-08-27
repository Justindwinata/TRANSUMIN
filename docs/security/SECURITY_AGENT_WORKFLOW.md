# TRANSUM-IN Security Agent Workflow

Version: 1.0.0  
Date: 2026-08-27

## Overview

The TRANSUM-IN security agent workflow integrates three layers:

1. **OpenCode Skills** — Methodology, playbooks, assessment guidance
2. **TRANSUM-IN Security Tests** — Regression tests, authorization checks, codebase inspection
3. **Strix** — Dynamic security assessment, vulnerability proof, finding validation

This document describes how they work together.

## Workflow: Authorization Bug Fix Example

### User Request
> "Audit SavedJourney authorization. Make sure other users can't access each other's saved journeys."

### Step 1: OpenCode Task Identification

OpenCode recognizes keywords: `authorization`, `SavedJourney`, `access`

**Action**: Load relevant skills
- `testing-api-for-broken-object-level-authorization`
- `testing-api-for-mass-assignment-vulnerability`
- `detecting-broken-object-property-level-authorization`

### Step 2: Skill Layer — Methodology

Skill `testing-api-for-broken-object-level-authorization` provides:

**Guidance:**
- Identify object ID parameters (e.g., `journeyId` in URLs/body)
- Determine ID format (sequential, UUID, slug)
- Create baseline requests as User A
- Substitute User B's IDs
- Test GET, PUT, PATCH, DELETE methods
- Check error responses for authorization bypasses

**Output**: Test plan, not proof

### Step 3: TRANSUM-IN Security Tests

Inspect the codebase:

```typescript
// apps/backend/src/journeys/journeys.controller.ts

@Get('/:journeyId')
async getJourney(@Param('journeyId') journeyId: string, @Req() req) {
  const journey = await this.journeyService.findById(journeyId);
  if (!journey) throw new NotFoundException();
  // BUG: Missing ownership check
  return journey;
}
```

**Finding**: Authorization check missing on GetJourney endpoint

**Action**: Write regression test

```typescript
// apps/backend/test/journeys.idor.test.ts

describe('SavedJourney IDOR Protection', () => {
  it('should deny access to other users journeys', async () => {
    const userA = await createUser();
    const userB = await createUser();
    
    const journeyA = await createJourney(userA, { name: 'My Trip' });
    const userBToken = await getToken(userB);
    
    const res = await request(app)
      .get(`/api/journeys/${journeyA.id}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .expect(403);  // Should fail
  });
});
```

Test fails (proves bug exists).

### Step 4: Strix Layer — Dynamic Validation

Before fix, run Strix to prove IDOR:

```bash
strix -t ./apps/backend \
      -t https://staging.transum-in.local/api \
      --instruction "User A (ID: user-1): token $TOKEN_A
User B (ID: user-2): token $TOKEN_B
Test: Can User B access User A's journeys via ID manipulation?"
```

Strix output:
```
Finding: IDOR on GET /api/journeys/{journeyId}
User B accessed User A's journey (journey-123)
Response: 200 OK with full journey details
CVSS: 7.5 (High)
```

**Proof**: Vulnerability is real and exploitable.

### Step 5: Fix Implementation

Based on skill guidance + test requirement + Strix proof:

```typescript
// Fix: Add ownership check
@Get('/:journeyId')
async getJourney(@Param('journeyId') journeyId: string, @Req() req) {
  const journey = await this.journeyService.findById(journeyId);
  if (!journey) throw new NotFoundException();
  
  if (journey.userId !== req.user.id) {
    throw new ForbiddenException('Not authorized to view this journey');
  }
  
  return journey;
}
```

### Step 6: Regression Test Validation

Re-run regression test:

```bash
npm run test -- journeys.idor.test.ts
✓ should deny access to other users journeys (42ms)
✓ should allow access to own journeys (39ms)
```

**Result**: Tests pass. Authorization now enforced.

### Step 7: Re-scan with Strix

Run Strix again to confirm fix:

```bash
strix -t ./apps/backend \
      -t https://staging.transum-in.local/api \
      --instruction "User A (ID: user-1): token $TOKEN_A
User B (ID: user-2): token $TOKEN_B
Test: Can User B access User A's journeys via ID manipulation?"
```

Strix output:
```
Result: Authorization enforced
User B attempted access to User A's journey
Response: 403 Forbidden
Status: RESOLVED ✓
```

**Proof**: Vulnerability is fixed.

### Step 8: Documentation & Close

Commit:

```
fix(journeys): enforce object-level authorization on SavedJourney endpoints

- Add ownership check to GET /api/journeys/{journeyId}
- Extend check to PUT, PATCH, DELETE methods
- Add regression test for IDOR protection
- Validate with Strix re-scan

Fixes: IDOR vulnerability on journey access
```

## Workflow Patterns

### Pattern 1: New Feature Security Review

```
Feature: Add saved journey sharing

OpenCode
  ↓ (load API + authorization skills)
  
Skill guidance
  ↓ (identify sharing logic risk points)
  
TRANSUM-IN tests
  ↓ (write: user A cannot access user B shared journey without permission)
  
Implementation
  ↓ (add permission check)
  
Regression test
  ↓ (test passes)
  
Strix
  ↓ (dynamic check: verify sharing ACL enforced)
  
Merge ✓
```

### Pattern 2: Dependency Vulnerability Fix

```
Alert: Flask has critical vulnerability

OpenCode
  ↓ (load supply-chain + DevSecOps skills)
  
Skill guidance
  ↓ (identify update strategy, breaking changes)
  
TRANSUM-IN tests
  ↓ (run existing test suite against new version)
  
Update Flask version in requirements.txt
  
Regression test
  ↓ (all tests pass)
  
Strix SCA
  ↓ (re-scan dependencies, confirm vuln gone)
  
Merge ✓
```

### Pattern 3: Authentication Token Review

```
Task: Review JWT implementation

OpenCode
  ↓ (load JWT + auth skills)
  
Skill guidance
  ↓ (check token expiration, refresh strategy, algorithm, claims)
  
TRANSUM-IN tests
  ↓ (run: expired token rejected, refresh works, algorithm is RS256)
  
Inspection
  ↓ (all checks pass)
  
Strix
  ↓ (dynamic check: attempt token tampering, algorithm confusion)
  
Report: All tests pass + Strix confirms hardening ✓
```

## Key Principles

1. **Skills guide, Strix proves** — Skills suggest what to test; Strix proves it's exploitable
2. **Tests are regression anchors** — Every security finding has a regression test
3. **Dynamic > static** — Strix's proof is more reliable than code review alone
4. **One source of truth** — Regression tests are the canonical security requirements
5. **Feedback loop** — Fix → test → re-scan confirms closure

## When to Use Each Layer

| Layer | Use When |
|-------|----------|
| **Skill** | Designing security tests, choosing assessment methodology, learning patterns |
| **Test** | Formalizing security requirements, regression prevention, CI/CD gates |
| **Strix** | Proving vulnerability exists, validating fix, demonstrating exploitation |

## Limitations

- **Skills** cannot prove vulnerabilities; they guide assessment design
- **Tests** can prove absence of bugs but cannot simulate all attack vectors
- **Strix** is limited to what can be tested dynamically; logic flaws may not be obvious to scanners

## Integration with CI/CD

```yaml
# .github/workflows/security.yml

on: [push, pull_request]

jobs:
  security-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run regression tests
        run: npm run test -- security
        # Ensures new code doesn't break authorization/auth tests
      
      - name: Run Strix scan
        run: strix -t ./apps/backend --max-budget 20
        # Dynamically validates security posture
      
      - name: Block merge if critical findings
        run: |
          if grep -q "CRITICAL" strix_runs/*/vulnerabilities.json; then
            echo "BLOCKED: Critical security findings"
            exit 1
          fi
```

## References

- OpenCode Skills: `docs/security/SKILL_SELECTION_MATRIX.md`
- Security Tests: `apps/backend/test/security/`
- Strix Integration: `.github/workflows/security.yml`
- Policy: `docs/security/TRANSUMIN_SKILL_POLICY.md`