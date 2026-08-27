# Third-Party Security Skills Attribution

Version: 1.0.0  
Date: 2026-08-27

## Source Repository

**Project**: Anthropic Cybersecurity Skills  
**Repository**: https://github.com/costrict-plugins-repo/mukul975-anthropic-cybersecurity-skills-cybersecurity-skills.git  
**Author**: Mahipal Jangra ([@mukul975](https://github.com/mukul975))  
**License**: Apache License 2.0  
**Retrieved Revision**: 597a381a13ffd14c8c9623633dd4d3e9fd57717a  
**Retrieved Date**: 2026-08-27  
**Total Skills in Source**: 817  
**Skills Integrated into TRANSUM-IN**: 25

## Included Skills

All 25 skills are Apache 2.0 licensed and sourced from the upstream repository:

### API Security (8 skills)
1. conducting-api-security-testing
2. testing-api-security-with-owasp-top-10
3. implementing-api-schema-validation-security
4. implementing-api-security-posture-management
5. implementing-api-gateway-security-controls
6. detecting-shadow-api-endpoints
7. performing-api-security-testing-with-postman
8. implementing-api-rate-limiting-and-throttling

### Authorization & IDOR (5 skills)
9. testing-api-for-broken-object-level-authorization
10. testing-api-for-mass-assignment-vulnerability
11. detecting-broken-object-property-level-authorization
12. exploiting-broken-function-level-authorization
13. exploiting-idor-vulnerabilities

### Authentication & JWT (4 skills)
14. testing-api-authentication-weaknesses
15. implementing-jwt-signing-and-verification
16. testing-jwt-token-security
17. testing-for-json-web-token-vulnerabilities

### Mobile Security (1 skill)
18. conducting-mobile-app-penetration-test

### DevSecOps (2 skills)
19. implementing-devsecops-security-scanning
20. implementing-secret-scanning-with-gitleaks

### Supply Chain (2 skills)
21. implementing-supply-chain-security-with-in-toto
22. performing-sca-dependency-scanning-with-snyk

### Vulnerability Management (1 skill)
23. implementing-vulnerability-management-with-greenbone

### Additional API Security (2 skills)
24. implementing-api-abuse-detection-with-rate-limiting
25. implementing-api-key-security-controls

## License Information

### Apache License 2.0

All skills are distributed under the Apache License 2.0. The full license text is available at:

https://www.apache.org/licenses/LICENSE-2.0

**Key terms:**
- Redistribution permitted with license and copyright notice
- Modifications allowed with clear indication of changes
- No warranty or liability
- Patent grant from contributors
- Trademark notice requirement

### Compliance in TRANSUM-IN

TRANSUM-IN preserves all license headers in skill files:

- Each skill directory includes a `LICENSE` file
- Each `SKILL.md` frontmatter includes `license: Apache-2.0`
- Original authorship is preserved in skill metadata
- This attribution file documents the source and licensing

## Attribution Format

When using these skills, attribute as follows:

```
Cybersecurity Skills: 25 skills from Anthropic Cybersecurity Skills
Source: https://github.com/mukul975/Anthropic-Cybersecurity-Skills
Author: Mahipal Jangra
License: Apache-2.0
Revision: 597a381a13ffd14c8c9623633dd4d3e9fd57717a
```

## Framework Mappings

Skills are mapped to multiple security frameworks:

- **MITRE ATT&CK** (v19.1) — 805/817 skills mapped
- **NIST CSF 2.0** — 804/817 skills mapped
- **MITRE ATLAS** (2026.07) — AI/ML adversarial threats
- **MITRE D3FEND** (v1.4.0) — Defensive countermeasures
- **NIST AI RMF** (1.0) — AI risk management
- **MITRE F3** (v1.1) — Cyber-enabled financial fraud

See each skill's `references/standards.md` for specific mappings.

## Original Contributors

The upstream project acknowledges these contributors:

- @mukul975 (maintainer)
- @juliosuas
- @andrewibrah
- @Bortlesboat
- @DevRedious
- @ioxoi
- @shanujans
- @nyxst4ck
- And community contributors (see upstream contributor graph)

## Modifications

TRANSUM-IN has made no functional modifications to the selected skills. All files are copied verbatim from the source repository. The only TRANSUM-IN-specific additions are:

- `docs/security/` documentation
- `security/skills/transumin-security-skills.yaml` manifest
- `scripts/security/validate-installed-skills.py` validation script
- `.agents/skills-lock.json` version pinning

## References

- Upstream Repository: https://github.com/mukul975/Anthropic-Cybersecurity-Skills
- Anthropic Cybersecurity Skills Documentation: https://github.com/mukul975/Anthropic-Cybersecurity-Skills/blob/main/README.md
- MITRE ATT&CK: https://attack.mitre.org
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- MITRE ATLAS: https://atlas.mitre.org
- MITRE D3FEND: https://d3fend.mitre.org
- NIST AI RMF: https://airc.nist.gov/AI_RMF
- MITRE F3: https://ctid.mitre.org/fraud/

## License Compliance Statement

TRANSUM-IN uses Anthropic Cybersecurity Skills in compliance with the Apache License 2.0. All required notices are preserved. Modifications are minimal and documented. This project is not affiliated with or endorsed by Anthropic PBC or the upstream skill authors.

## Support & Issues

For issues or questions about the upstream skills:

- GitHub Issues: https://github.com/mukul975/Anthropic-Cybersecurity-Skills/issues
- Responsible Disclosure: https://github.com/mukul975/Anthropic-Cybersecurity-Skills/security/advisories

For TRANSUM-IN-specific integration issues:

- TRANSUM-IN Security Docs: `docs/security/`
- TRANSUM-IN Repository: https://github.com/Justindwinata/TRANSUMIN