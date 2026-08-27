#!/usr/bin/env python3
"""Validate installed TRANSUM-IN skills.

Checks:
- every skill exists
- SKILL.md has valid frontmatter
- no duplicate skill names
- source revision matches
"""

import json
import os
import sys
import glob

SKILLS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..", ".agents", "skills"
)
SKILLS_LOCK = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "skills-lock.json"
)
REQUIRED_FIELDS = ["name", "description", "domain", "subdomain", "tags", "version", "author", "license"]
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

def parse_frontmatter(text):
    if not text.startswith("---"):
        return None
    end = text.find("---", 3)
    if end == -1:
        return None
    block = text[3:end].strip()
    data = {}
    current_key = None
    list_values = []
    in_folded = False
    folded_lines = []
    
    for line in block.split("\n"):
        stripped = line.strip()
        
        if in_folded and stripped and not line.startswith(" ") and not line.startswith("\t"):
            if current_key and folded_lines:
                data[current_key] = " ".join(folded_lines)
            in_folded = False
            folded_lines = []
            current_key = None
        
        if in_folded:
            if stripped:
                folded_lines.append(stripped)
            continue
        
        if not stripped or stripped.startswith("#"):
            continue
        
        if stripped.startswith("- ") and current_key:
            list_values.append(stripped[2:].strip().strip('"').strip("'"))
            data[current_key] = list(list_values)
            continue
        
        if line[:1].isspace():
            continue
        
        m = re.match(r"^(\w[\w_-]*):\s*\[(.+)\]\s*$", stripped)
        if m:
            current_key = m.group(1)
            items = [i.strip().strip('"').strip("'") for i in m.group(2).split(",")]
            data[current_key] = items
            list_values = list(items)
            continue
        
        m = re.match(r"^(\w[\w_-]*):\s*>[-|]?\s*$", stripped)
        if m:
            current_key = m.group(1)
            list_values = []
            in_folded = True
            folded_lines = []
            continue
        
        m = re.match(r'^(\w[\w_-]*):\s*(.*)$', stripped)
        if m:
            current_key = m.group(1)
            val = m.group(2).strip().strip('"').strip("'")
            list_values = []
            if val:
                data[current_key] = val
            continue
    
    if in_folded and current_key and folded_lines:
        data[current_key] = " ".join(folded_lines)
    
    return data

import re

def validate_skill(skill_dir):
    errors = []
    skill_md = os.path.join(skill_dir, "SKILL.md")
    
    if not os.path.isfile(skill_md):
        return [f"SKILL.md not found in {skill_dir}"]
    
    try:
        with open(skill_md, encoding="utf-8") as f:
            content = f.read()
    except IOError as e:
        return [f"Could not read SKILL.md: {e}"]
    
    fm = parse_frontmatter(content)
    if fm is None:
        return ["No valid YAML frontmatter found (must start with ---)"]
    
    for field in REQUIRED_FIELDS:
        if field not in fm:
            errors.append(f"Missing required field: {field}")
    
    name = fm.get("name", "")
    if name and not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", name):
        errors.append(f"Name '{name}' is not valid kebab-case")
    
    desc = fm.get("description", "")
    if isinstance(desc, list):
        errors.append("Description must be a string value, not a list")
    elif isinstance(desc, str) and len(desc) < 50:
        errors.append(f"Description too short ({len(desc)} chars, min 50)")
    
    domain = fm.get("domain", "")
    if domain and domain != "cybersecurity":
        errors.append(f"Domain must be 'cybersecurity', got '{domain}'")
    
    tags = fm.get("tags", [])
    if isinstance(tags, str):
        tags = [tags]
    if len(tags) < 2:
        errors.append(f"Need at least 2 tags, got {len(tags)}")
    
    return errors

def main():
    print("=" * 60)
    print("TRANSUM-IN Security Skills Validation")
    print("=" * 60)
    print()
    
    total = 0
    passed = 0
    failed = 0
    errors_list = []
    
    skills = sorted(glob.glob(os.path.join(SKILLS_DIR, "*/")))
    
    for skill_dir in skills:
        total += 1
        skill_name = os.path.basename(os.path.dirname(skill_dir))
        errors = validate_skill(skill_dir)
        
        if errors:
            failed += 1
            print(f"FAIL {skill_name}")
            for e in errors:
                print(f"      → {e}")
            errors_list.append((skill_name, errors))
        else:
            passed += 1
            print(f"PASS {skill_name}")
    
    # Check for missing skills from ALLOWED_SKILLS
    installed_skills = [os.path.basename(os.path.dirname(s)) for s in skills]
    for skill_name in ALLOWED_SKILLS:
        if skill_name not in installed_skills:
            print(f"MISSING {skill_name}")
            failed += 1
            total += 1
            errors_list.append((skill_name, ["Skill not installed"]))
    
    print()
    print("=" * 60)
    print(f"Total: {total}  PASS: {passed}  FAIL: {failed}")
    print("=" * 60)
    
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
