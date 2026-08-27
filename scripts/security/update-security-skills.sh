#!/bin/bash
# scripts/security/update-security-skills.sh
# 
# Safe update mechanism for TRANSUM-IN curated security skills.
# Downloads source repository, validates skills, updates if safe.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEMP_DIR="/tmp/transumin-skills-update-$$"
SOURCE_REPO="https://github.com/costrict-plugins-repo/mukul975-anthropic-cybersecurity-skills-cybersecurity-skills.git"
ALLOWED_SKILLS_FILE="$PROJECT_ROOT/security/skills/transumin-security-skills.yaml"

trap "rm -rf $TEMP_DIR" EXIT

echo "=========================================="
echo "TRANSUM-IN Security Skills Update"
echo "=========================================="
echo ""

# Step 1: Parse current skills from manifest
echo "[1/5] Reading current skill manifest..."
CURRENT_SKILLS=$(grep "name:" "$ALLOWED_SKILLS_FILE" | awk '{print $3}' | tr -d "'" | sort)
CURRENT_COUNT=$(echo "$CURRENT_SKILLS" | wc -l)
echo "Current skills: $CURRENT_COUNT"

# Step 2: Clone source repository
echo "[2/5] Cloning source repository..."
mkdir -p "$TEMP_DIR"
git clone --depth 1 "$SOURCE_REPO" "$TEMP_DIR/source" > /dev/null 2>&1
NEW_REVISION=$(cd "$TEMP_DIR/source" && git rev-parse HEAD)
echo "New revision: $NEW_REVISION"

# Step 3: Validate all current skills exist in source
echo "[3/5] Validating skills exist in source..."
MISSING_SKILLS=""
for skill in $CURRENT_SKILLS; do
  if [ ! -d "$TEMP_DIR/source/skills/$skill" ]; then
    MISSING_SKILLS="$MISSING_SKILLS $skill"
  fi
done

if [ -n "$MISSING_SKILLS" ]; then
  echo "ERROR: Missing skills in source:$MISSING_SKILLS"
  exit 1
fi

echo "All $CURRENT_COUNT skills found in source ✓"

# Step 4: Run skill validation
echo "[4/5] Validating skill metadata..."
cd "$TEMP_DIR/source"
python3 tools/validate-skill.py --all > /dev/null 2>&1
echo "Skill validation passed ✓"

# Step 5: Ask for confirmation
echo "[5/5] Ready to update"
echo ""
echo "Summary:"
echo "  Source revision: $NEW_REVISION"
echo "  Skills to update: $CURRENT_COUNT"
echo "  Update strategy: Replace .agents/skills/, update skills-lock.json"
echo ""
read -p "Proceed with update? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Update cancelled."
  exit 0
fi

# Step 6: Backup current skills
echo "Backing up current skills..."
BACKUP_DIR="$PROJECT_ROOT/.agents/skills.bak.$(date +%s)"
cp -r "$PROJECT_ROOT/.agents/skills" "$BACKUP_DIR"
echo "Backup saved to: $BACKUP_DIR"

# Step 7: Update skills
echo "Updating skills..."
rm -rf "$PROJECT_ROOT/.agents/skills"
mkdir -p "$PROJECT_ROOT/.agents/skills"

for skill in $CURRENT_SKILLS; do
  cp -r "$TEMP_DIR/source/skills/$skill" "$PROJECT_ROOT/.agents/skills/"
done

echo "Skills updated: $CURRENT_COUNT skills installed"

# Step 8: Validate installation
echo "Validating installation..."
cd "$PROJECT_ROOT"
python3 scripts/security/validate-installed-skills.py > /dev/null 2>&1

echo ""
echo "=========================================="
echo "Update complete ✓"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review changes: git diff .agents/skills/"
echo "2. Commit: git add .agents/skills/ && git commit -m 'chore(skills): update security skills to $NEW_REVISION'"
echo "3. Test: npm run test -- security"
echo "4. Push: git push origin main"
echo ""
