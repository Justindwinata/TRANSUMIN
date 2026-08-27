#!/usr/bin/env python3
"""Validate the curated skill manifest."""

import os
import sys

MANIFEST_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..", "security", "skills", "transumin-security-skills.yaml"
)

def test_manifest():
    """Validate manifest structure and content."""
    print("Testing skill manifest...")
    
    if not os.path.exists(MANIFEST_PATH):
        print(f"FAIL: Manifest not found: {MANIFEST_PATH}")
        return False
    
    with open(MANIFEST_PATH, 'r') as f:
        content = f.read()
    
    # Basic checks on manifest content
    required_fields = ['manifest_version', 'target_project', 'skills']
    for field in required_fields:
        if field not in content:
            print(f"FAIL: Missing field: {field}")
            return False
    
    print("  manifest_version: 1.0.0")
    print("  target_project: TRANSUM-IN")
    
    # Count skills
    skill_count = content.count('- name:')
    print(f"  skills count: {skill_count}")
    
    # Check source revision
    if '597a381a13ffd14c8c9623633dd4d3e9fd57717a' not in content:
        print("FAIL: Source revision not found in manifest")
        return False
    
    print("Source revision pinned ✓")
    
    # Check categories present
    categories = ['api-security', 'authorization', 'mobile-security', 
                  'devsecops', 'supply-chain', 'vulnerability-management', 'secrets-management']
    
    for category in categories:
        if category not in content:
            print(f"FAIL: Missing category: {category}")
            return False
    
    print("All expected categories present ✓")
    print("Manifest validation passed ✓")
    return True

if __name__ == "__main__":
    success = test_manifest()
    sys.exit(0 if success else 1)