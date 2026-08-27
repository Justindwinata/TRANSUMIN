#!/usr/bin/env python3
"""Test restricted skill handling - ensure no offensive skills in default set."""

import os
import sys

SKILLS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..", ".agents", "skills"
)

# Skills that should NOT be in the default auto-load set
# Note: "exploiting" is allowed for IDOR/BFLA testing (assessment methodology)
RESTRICTED_PATTERNS = [
    "red-team",
    "phishing",
    "c2",
    "malware",
    "brute-force",
    "credential-access",
    "lateral-movement",
    "command-and-control",
    "exfiltration",
    "persistence",
    "privilege-escalation",
    "initial-access",
    "reconnaissance",
    "resource-development",
    "execution",
    "defense-evasion",
    "credential-access",
    "discovery",
    "collection",
    "impact",
    "ot-ics",
    "hardware",
    "firmware",
    "deception",
]

# Skills that ARE allowed (our curated 25)
ALLOWED_SKILLS = [
    "conducting-api-security-testing",
    "conducting-mobile-app-penetration-test",
    "detecting-broken-object-property-level-authorization",
    "detecting-shadow-api-endpoints",
    "exploiting-broken-function-level-authorization",
    "exploiting-idor-vulnerabilities",
    "implementing-api-abuse-detection-with-rate-limiting",
    "implementing-api-gateway-security-controls",
    "implementing-api-key-security-controls",
    "implementing-api-rate-limiting-and-throttling",
    "implementing-api-schema-validation-security",
    "implementing-api-security-posture-management",
    "implementing-devsecops-security-scanning",
    "implementing-jwt-signing-and-verification",
    "implementing-secret-scanning-with-gitleaks",
    "implementing-supply-chain-security-with-in-toto",
    "implementing-vulnerability-management-with-greenbone",
    "performing-api-security-testing-with-postman",
    "performing-sca-dependency-scanning-with-snyk",
    "testing-api-authentication-weaknesses",
    "testing-api-for-broken-object-level-authorization",
    "testing-api-for-mass-assignment-vulnerability",
    "testing-api-security-with-owasp-top-10",
    "testing-for-json-web-token-vulnerabilities",
    "testing-jwt-token-security"
]

def test_no_restricted_skills():
    """Ensure no restricted patterns in installed skills."""
    print("Testing for restricted skills...")
    
    installed = [d for d in os.listdir(SKILLS_DIR) 
                 if os.path.isdir(os.path.join(SKILLS_DIR, d))]
    
    for skill in installed:
        # Check against restricted patterns
        for pattern in RESTRICTED_PATTERNS:
            if pattern in skill.lower():
                # Exception: some allowed skills contain "exploiting" for IDOR/BFLA
                if "exploiting" in pattern and skill in ["exploiting-idor-vulnerabilities", "exploiting-broken-function-level-authorization"]:
                    continue
                print(f"FAIL: Restricted skill found: {skill} (matches '{pattern}')")
                return False
        
        # Check it's in allowed list
        if skill not in ALLOWED_SKILLS:
            print(f"FAIL: Unknown skill installed: {skill}")
            return False
        
        print(f"  ✓ {skill}")
    
    print(f"All {len(installed)} installed skills are approved ✓")
    return True

def test_all_allowed_present():
    """Ensure all allowed skills are present."""
    print("\nVerifying all allowed skills present...")
    
    installed = [d for d in os.listdir(SKILLS_DIR) 
                 if os.path.isdir(os.path.join(SKILLS_DIR, d))]
    
    for skill in ALLOWED_SKILLS:
        if skill not in installed:
            print(f"FAIL: Missing allowed skill: {skill}")
            return False
    
    print(f"All {len(ALLOWED_SKILLS)} allowed skills present ✓")
    return True

if __name__ == "__main__":
    success = test_no_restricted_skills() and test_all_allowed_present()
    sys.exit(0 if success else 1)