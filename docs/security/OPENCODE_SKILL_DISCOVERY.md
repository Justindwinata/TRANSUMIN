# OpenCode Skill Discovery Mechanism

## Environment

- **OpenCode version:** 1.18.23
- **Installation:** `/Users/justindwinata/.opencode/bin/opencode`
- **Project root:** `/Users/justindwinata/Documents/TRANSUMIN`
- **Audit date:** 2026-08-27

## Discovery Mechanism

OpenCode discovers Agent Skills through the `.agents/skills/` directory at the project root.

### Current Structure

```
/Users/justindwinata/Documents/TRANSUMIN/
├── .agents/
│   └── skills/
│       ├── api-security-testing/
│       ├── application-security-testing/
│       ├── ci-security-scanning-with-strix/
│       ├── find-security-vulnerabilities-in-code/
│       ├── fix-security-vulnerabilities-with-strix/
│       ├── managed-pentesting-with-strix/
│       ├── owasp-top-10-testing/
│       ├── penetration-testing-with-strix/
│       └── web-app-penetration-testing/
└── skills-lock.json
```

### Skill Lock File

The `skills-lock.json` at project root tracks installed skills with:
- source repository
- source type (github)
- skill path
- computed hash (SHA-256)

### Existing Skills

Currently 9 Strix-based security skills installed from `usestrix/strix` repository:

1. api-security-testing
2. application-security-testing
3. ci-security-scanning-with-strix
4. find-security-vulnerabilities-in-code
5. fix-security-vulnerabilities-with-strix
6. managed-pentesting-with-strix
7. owasp-top-10-testing
8. penetration-testing-with-strix
9. web-app-penetration-testing

All are Strix-focused dynamic security testing skills.

## Skill Structure

Each skill directory contains:

```
<skill-name>/
├── SKILL.md              ← YAML frontmatter + Markdown body
├── references/           ← Optional: standards, workflows
├── scripts/              ← Optional: helper scripts
└── assets/               ← Optional: templates, checklists
```

### SKILL.md Format

```yaml
---
name: skill-name
description: >-
  Detailed description for agent discovery
license: Apache-2.0
metadata:
  author: author-name
  homepage: url
---

# Skill Title

[Markdown content with sections: When to Use, Prerequisites, Workflow, Verification]
```

## Discovery Process

1. OpenCode scans `.agents/skills/` at project root
2. Reads `SKILL.md` frontmatter (~30 tokens per skill)
3. Loads full skill content when task matches description
4. Validates against `skills-lock.json` hash

## Installation Method

Skills are installed via:
- Direct copy/symlink to `.agents/skills/`
- Tracked in `skills-lock.json`
- No global skill directory used in this project

## Verification

To verify skill discovery:
1. Skill directory exists in `.agents/skills/`
2. `SKILL.md` has valid frontmatter
3. Entry exists in `skills-lock.json`
4. OpenCode can read and parse frontmatter
