#!/usr/bin/env python3
"""Test that all installed security skills are discoverable by OpenCode."""

import os
import json
import sys

SKILLS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..", ".agents", "skills"
)
SKILLS_LOCK = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..", "skills-lock.json"
)

def test_skill_discovery():
    """Verify all skills are discoverable by OpenCode."""
    print("Testing OpenCode skill discovery...")
    
    if not os.path.isdir(SKILLS_DIR):
        print(f"FAIL: Skills directory not found: {SKILLS_DIR}")
        return False
    
    with open(SKILLS_LOCK, 'r') as f:
        lock_data = json.load(f)
    
    skills_from_lock = lock_data.get('skills', {})
    skills_on_disk = sorted([d for d in os.listdir(SKILLS_DIR) 
                             if os.path.isdir(os.path.join(SKILLS_DIR, d))])
    
    print(f"Skills in lock file: {len(skills_from_lock)}")
    print(f"Skills on disk: {len(skills_on_disk)}")
    
    # Check lock file
    for skill_name in skills_from_lock:
        skill_path = os.path.join(SKILLS_DIR, skill_name)
        if not os.path.exists(skill_path):
            print(f"FAIL: Skill in lock but not on disk: {skill_name}")
            return False
        
        skill_md = os.path.join(skill_path, "SKILL.md")
        if not os.path.exists(skill_md):
            print(f"FAIL: SKILL.md not found for {skill_name}")
            return False
        
        print(f"  ✓ {skill_name}")
    
    # Check disk
    for skill_name in skills_on_disk:
        if skill_name not in skills_from_lock:
            print(f"WARN: Skill on disk but not in lock: {skill_name}")
    
    print("All skills discoverable by OpenCode ✓")
    return True

if __name__ == "__main__":
    success = test_skill_discovery()
    sys.exit(0 if success else 1)
