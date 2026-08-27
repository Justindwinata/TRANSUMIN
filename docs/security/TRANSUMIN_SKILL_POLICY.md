# TRANSUM-IN Security Skill Policy

Version: 1.0.0  
Date: 2026-08-27  
Status: Active

## Overview

This policy defines how the TRANSUM-IN project uses OpenCode security skills, which skills are approved for automatic use, restrictions on skill application, and integration with the existing Strix security workflow.

## Approved Automatic Skills

The following 25 skills are approved for automatic discovery and loading by OpenCode agents:

### API Security (8 skills)
- conducting-api-security-testing
- testing-api-security-with-owasp-top-10
- implementing-api-schema-validation-security
- implementing-api-security-posture-management
- implementing-api-gateway-security-controls
- detecting-shadow-api-endpoints
- performing-api-security-testing-with-postman
- implementing-api-rate-limiting-and-throttling

### Authorization & IDOR (5 skills)
- testing-api-for-broken-object-level-authorization
- testing-api-for-mass-assignment-vulnerability
- detecting-broken-object-property-level-authorization
- exploiting-broken-function-level-authorization
- exploiting-idor-vulnerabilities

### Authentication & JWT (4 skills)
- testing-api-authentication-weaknesses
- implementing-jwt-signing-and-verification
- testing-jwt-token-security
- testing-for-json-web-token-vulnerabilities

### Mobile Security (1 skill)
- conducting-mobile-app-penetration-test

### DevSecOps (2 skills)
- implementing-devsecops-security-scanning
- implementing-secret-scanning-with-gitleaks

### Supply Chain (2 skills)
- implementing-supply-chain-security-with-in-toto
- performing-sca-dependency-scanning-with-snyk

### Vulnerability Management (1 skill)
- implementing-vulnerability-management-with-greenbone

### Additional API Security (2 skills)
- implementing-api-abuse-detection-with-rate-limiting
- implementing-api-key-security-controls

## Skill Classification

All approved skills are classified as **APPROVED**:
- Safe for normal coding-agent use
- Non-destructive operational guidance
- Methodology/playbook-focused
- Used for assessment design, not exploitation execution

## Authorization Rules

1. **Authorized targets only** - All skills must only be applied to systems the user owns or has written permission to test
2. **Local/staging preferred** - Apply skills to local environments or staging first; production only with explicit authorization
3. **No destructive testing** - Skills provide assessment methodology; do not use for load testing, denial-of-service, or resource exhaustion
4. **No credential attacks** - Do not use skills for brute-force password attacks or credential stuffing against real users
5. **No production exploitation** - Skills guide testing design; do not execute actual exploits against production systems without formal approval

## Usage Restrictions

### Restricted Skills (not in default auto-load)
- Red team automation
- Credential brute-force tooling
- C2 infrastructure setup
- Destructive testing frameworks
- Phishing simulation frameworks

These remain available as REFERENCE_ONLY if needed for authorized engagements but are not auto-loaded.

### Geographic/Compliance Restrictions
- TRANSUM-IN is based in Indonesia; comply with local data protection laws
- EU GDPR compliance required for any European user data
- No processing of personal data outside authorized scope

## Skill + Strix Workflow Integration

Skills and Strix serve different functions:

```
Security Assessment Flow
    ↓
OpenCode identifies task
    ↓
Load relevant skill (methodology)
    ↓
Skill provides assessment guidance
    ↓
TRANSUM-IN security tests inspect source
    ↓
Strix performs dynamic assessment
    ↓
Finding normalization
    ↓
AI remediation
    ↓
Regression test
    ↓
Strix re-scan
```

**Skills = guidance/playbooks**  
**Strix = dynamic validation/proof**

Skills do NOT replace Strix. Strix results are the source of truth for security findings.

## Skill Loading Policy

OpenCode should load skills progressively:

1. **Scan task description** → identify relevant skill domains
2. **Load matching skills only** → do not load all 25 for every task
3. **Provide methodology** → skills guide assessment approach
4. **Invoke Strix when needed** → skills + Strix together prove findings
5. **Report findings** → based on skill methodology + Strix proof

## Restricted Skill Behavior

Certain skills contain references to exploitation techniques (IDOR exploitation, JWT bypass, etc.) for educational purposes. When these skills are loaded:

1. Used for **assessment design only**
2. Guidance applies to **authorized targets only**
3. Actual exploitation requires **explicit written authorization**
4. Results must be **validated by Strix** before reporting

## Compliance & Governance

- All skill usage is logged in OpenCode session history
- Security tasks using skills are tracked in TRANSUM-IN security audit logs
- Quarterly review of skill usage and incidents
- Incident response applies to misuse of skills (e.g., unauthorized testing)

## Policy Enforcement

- OpenCode respects this policy by design (progressive disclosure, no default destructive actions)
- TRANSUM-IN security tests validate that remediated code maintains regression test coverage
- Strix integration ensures findings are proven, not just predicted by skills

## Maintenance & Updates

- Skills are version-pinned at `597a381a13ffd14c8c9623633dd4d3e9fd57717a`
- Updates are reviewed quarterly and require security team approval
- Adding new skills requires this policy to be updated

## References

- TRANSUM-IN Security Architecture: `docs/security/`
- OpenCode Skill Discovery: `docs/security/OPENCODE_SKILL_DISCOVERY.md`
- Skill Selection Matrix: `docs/security/SKILL_SELECTION_MATRIX.md`
- Strix Integration: `docs/security/SECURITY_AGENT_WORKFLOW.md`