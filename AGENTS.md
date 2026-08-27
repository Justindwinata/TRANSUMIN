# TRANSUM-IN OpenCode Agent Instructions

Version: 1.0.0  
Date: 2026-08-27

## Overview

This document explains how OpenCode agents should use the TRANSUM-IN security skill set and how skills integrate with the existing security infrastructure (Strix, regression tests, authorization checks).

## Available Security Skills

TRANSUM-IN provides 25 curated cybersecurity skills covering:

- **API Security** (8 skills) — endpoint testing, validation, rate limiting
- **Authorization/IDOR** (5 skills) — object-level access control
- **Authentication/JWT** (4 skills) — token validation, signing
- **Mobile Security** (1 skill) — Flutter/Dart app testing
- **DevSecOps** (2 skills) — CI/CD scanning, secrets detection
- **Supply Chain** (2 skills) — SBOM, dependency scanning, provenance
- **Vulnerability Management** (1 skill) — scanning and prioritization

See: `docs/security/SKILL_SELECTION_MATRIX.md`

## When to Load Skills

OpenCode automatically detects when to load skills based on task keywords:

| Keyword | Load Skills |
|---------|-------------|
| `API`, `endpoint`, `REST` | conducting-api-security-testing, testing-api-security-with-owasp-top-10 |
| `authorization`, `IDOR`, `BOLA` | testing-api-for-broken-object-level-authorization, exploiting-idor-vulnerabilities |
| `JWT`, `authentication`, `token` | testing-api-authentication-weaknesses, implementing-jwt-signing-and-verification |
| `mobile`, `Flutter`, `Dart` | conducting-mobile-app-penetration-test |
| `GitHub Actions`, `CI/CD`, `secrets` | implementing-devsecops-security-scanning, implementing-secret-scanning-with-gitleaks |
| `dependency`, `SBOM`, `supply chain` | performing-sca-dependency-scanning-with-snyk, implementing-supply-chain-security-with-in-toto |
| `vulnerability`, `scan` | implementing-vulnerability-management-with-greenbone |

**Do NOT load all 25 skills for every task.** Only load skills relevant to the current work.

## How to Use Skills

### 1. Skill Provides Methodology

When a skill is loaded, it provides:
- **When to use**: Trigger conditions
- **Prerequisites**: Required setup
- **Workflow**: Step-by-step assessment approach
- **Key concepts**: Terminology and definitions
- **Tools**: Specific commands and techniques

**Example**: `testing-api-for-broken-object-level-authorization` skill teaches:
- How to identify object ID parameters
- How to classify ID types (sequential, UUID, slug)
- How to create baseline requests for User A
- How to systematically substitute User B's IDs
- How to interpret results (403 = secure, 200 = vulnerable)

### 2. Skill Guides Test Design

Use skill guidance to create regression tests:

```python
# Skill guidance → Test implementation

# Skill says: "Test BOLA on GET, PUT, PATCH, DELETE methods"
# Test code:
@pytest.mark.parametrize("method", ["GET", "PUT", "PATCH", "DELETE"])
def test_saved_journey_idor_protection(method):
    user_a = create_user()
    user_b = create_user()
    journey_b = create_journey(user_b)
    
    token_a = get_token(user_a)
    
    if method == "GET":
        response = client.get(f"/api/journeys/{journey_b.id}", headers=token_a)
    elif method == "PUT":
        response = client.put(f"/api/journeys/{journey_b.id}", 
                              json={"name": "hacked"}, 
                              headers=token_a)
    # ... etc
    
    assert response.status_code == 403, f"{method} should deny access"
```

### 3. Skill Identifies Assessment Approach

Skill + codebase inspection → Strix target:

```
Skill says: "Check if GET /orders/{order_id} enforces ownership"
Code review finds: No ownership check in getOrder()
Write test: Test passes (currently fails, proves bug exists)
Run Strix: Confirms IDOR exploitable
Fix: Add ownership check
Test: Now passes
Strix re-scan: Vulnerability closed ✓
```

## Integration with Strix

**Skills ≠ Strix. They work together.**

| Layer | Role |
|-------|------|
| **Skill** | Design what to test (methodology, playbook) |
| **Test** | Formalize security requirements (regression anchor) |
| **Strix** | Prove vulnerability exists (dynamic proof) |

**Workflow:**
```
Skill guidance
    ↓
Write regression test
    ↓
Test fails (bug confirmed)
    ↓
Run Strix (dynamic proof)
    ↓
Fix code
    ↓
Test passes (regression protected)
    ↓
Strix re-scan (confirmed fixed)
```

Strix findings are the **source of truth** for security issues. Skills guide the investigation; Strix proves the finding.

## Authorization Rules

All skills operate under these constraints:

1. **Authorized targets only** — Never test systems you don't own or have written permission to test
2. **Local/staging preferred** — Run tests locally or in staging first; production only with explicit approval
3. **No destructive testing** — Skills provide methodology; do not execute DoS, resource exhaustion, or brute-force attacks
4. **No credential attacks** — Do not use skills for password brute-force or credential stuffing
5. **No production exploitation** — Skills guide assessment design; do not execute actual exploits against production

See: `docs/security/TRANSUMIN_SKILL_POLICY.md`

## Skill File Locations

Skills are installed in `.agents/skills/`:

```
.agents/skills/
├── conducting-api-security-testing/
│   ├── SKILL.md                    ← Skill definition
│   ├── references/                 ← Deep technical docs
│   └── scripts/                    ← Helper scripts
├── testing-api-for-broken-object-level-authorization/
│   ├── SKILL.md
│   ├── references/
│   └── scripts/
└── ... (23 more skills)
```

Each skill's `SKILL.md` can be read directly for guidance.

## Version & Updates

- **Current version**: 1.0.0
- **Source revision**: 597a381a13ffd14c8c9623633dd4d3e9fd57717a
- **Retrieved**: 2026-08-27
- **License**: Apache 2.0 (all skills)

To update skills safely:

```bash
scripts/security/update-security-skills.sh
```

This validates source, backs up current skills, updates `.agents/skills/`, and prompts for review before commit.

See: `docs/security/THIRD_PARTY_SECURITY_SKILLS.md`

## Validation

Installed skills are validated by:

```bash
python3 scripts/security/validate-installed-skills.py
```

This checks:
- All 25 skills exist
- Each has valid SKILL.md
- All required metadata fields present
- No duplicates
- Source revision matches

## Documentation

- **Skill selection matrix**: `docs/security/SKILL_SELECTION_MATRIX.md` — which skill for which task
- **Security policy**: `docs/security/TRANSUMIN_SKILL_POLICY.md` — authorization rules, restrictions
- **Agent workflow**: `docs/security/SECURITY_AGENT_WORKFLOW.md` — how skills + Strix work together
- **Attribution**: `docs/security/THIRD_PARTY_SECURITY_SKILLS.md` — licensing, source info
- **Skill discovery**: `docs/security/OPENCODE_SKILL_DISCOVERY.md` — how OpenCode finds skills

## Examples

### Example 1: API Authorization Audit

**User request**: "Audit SavedJourney authorization to prevent IDOR"

**OpenCode action**:
1. Load: `testing-api-for-broken-object-level-authorization`, `exploiting-idor-vulnerabilities`
2. Skill provides: Object ID testing methodology
3. Code review: Identify where authorization checks are (or missing)
4. Write test: test_saved_journey_idor_protection() → should fail if bug exists
5. Run Strix: Confirm IDOR exploitable
6. Fix: Add ownership check
7. Test: Regression passes
8. Strix re-scan: Vulnerability gone ✓

### Example 2: DevSecOps Pipeline Hardening

**User request**: "Add secret detection to CI/CD"

**OpenCode action**:
1. Load: `implementing-devsecops-security-scanning`, `implementing-secret-scanning-with-gitleaks`
2. Skill provides: GitHub Actions integration steps, Gitleaks config
3. Implementation: Add `.gitleaks.toml`, create secrets-scan job
4. Test: Commit dummy API key, verify CI blocks it
5. Merge: Secret scanning now automatic on every PR

### Example 3: Mobile App Security Review

**User request**: "Audit Flutter app for secure storage"

**OpenCode action**:
1. Load: `conducting-mobile-app-penetration-test`
2. Skill provides: Static analysis, dynamic testing, storage inspection, cert pinning bypass
3. Inspection: Review code for SharedPreferences misuse, hardcoded secrets
4. Test: Verify sensitive data encrypted at rest
5. Strix (if applicable): Dynamic check via test harness
6. Report: Findings + remediation guidance

## When NOT to Use Skills

- **General coding tasks** — Don't load skills for bug fixes unrelated to security
- **Infrastructure/DevOps only** — Don't load authorization skills for networking tasks
- **Performance work** — Don't load security skills for optimization
- **UI/UX tasks** — Don't load skills unless there's a specific security angle

Load skills **only when the task is security-related**.

## Questions & Support

- **Skill guidance**: Read the skill's `SKILL.md` in `.agents/skills/<skill-name>/`
- **Policy questions**: See `docs/security/TRANSUMIN_SKILL_POLICY.md`
- **Integration questions**: See `docs/security/SECURITY_AGENT_WORKFLOW.md`
- **Task-to-skill mapping**: See `docs/security/SKILL_SELECTION_MATRIX.md`

## Summary

TRANSUM-IN security skills are **guidance + playbooks**, not automated exploits. They:

1. Teach methodology for security assessment
2. Guide regression test design
3. Work alongside Strix for dynamic validation
4. Operate within authorization constraints
5. Never replace code review or manual testing

Use them to **assess**, **design tests**, and **guide remediation**. Use Strix to **prove** findings. Regression tests **anchor** security requirements.