# TRANSUM-IN Skill Selection Matrix

Maps security tasks to the curated cybersecurity skills for automatic OpenCode agent loading.

## Skill Categories

| Category | Skills | Auto-Load |
|----------|--------|-----------|
| API Security | conducting-api-security-testing, testing-api-security-with-owasp-top-10, implementing-api-schema-validation-security, implementing-api-security-posture-management, implementing-api-gateway-security-controls, detecting-shadow-api-endpoints, performing-api-security-testing-with-postman, implementing-api-abuse-detection-with-rate-limiting, implementing-api-key-security-controls, implementing-api-rate-limiting-and-throttling | Yes |
| Authorization / IDOR | testing-api-for-broken-object-level-authorization, testing-api-for-mass-assignment-vulnerability, detecting-broken-object-property-level-authorization, exploiting-broken-function-level-authorization, exploiting-idor-vulnerabilities | Yes |
| Authentication / JWT | testing-api-authentication-weaknesses, implementing-jwt-signing-and-verification, testing-jwt-token-security, testing-for-json-web-token-vulnerabilities | Yes |
| Mobile Security | conducting-mobile-app-penetration-test | Yes |
| DevSecOps | implementing-devsecops-security-scanning, implementing-secret-scanning-with-gitleaks | Yes |
| Supply Chain | implementing-supply-chain-security-with-in-toto, performing-sca-dependency-scanning-with-snyk | Yes |
| Vulnerability Management | implementing-vulnerability-management-with-greenbone | Yes |

## Task → Skill Mapping

| Task Description | Primary Skills | Secondary Skills |
|------------------|----------------|------------------|
| API endpoint audit | conducting-api-security-testing, testing-api-security-with-owasp-top-10 | implementing-api-schema-validation-security |
| JWT/authentication review | testing-api-authentication-weaknesses, testing-jwt-token-security, implementing-jwt-signing-and-verification | testing-for-json-web-token-vulnerabilities |
| Saved journey ownership / IDOR test | testing-api-for-broken-object-level-authorization, exploiting-idor-vulnerabilities | detecting-broken-object-property-level-authorization |
| BOLA/IDOR regression | testing-api-for-broken-object-level-authorization | exploiting-idor-vulnerabilities |
| Function-level auth (BFLA) | exploiting-broken-function-level-authorization | testing-api-for-mass-assignment-vulnerability |
| Mass assignment | testing-api-for-mass-assignment-vulnerability | detecting-broken-object-property-level-authorization |
| Rate limiting validation | implementing-api-rate-limiting-and-throttling, implementing-api-abuse-detection-with-rate-limiting | conducting-api-security-testing |
| API gateway security | implementing-api-gateway-security-controls | implementing-api-security-posture-management |
| Shadow API detection | detecting-shadow-api-endpoints | conducting-api-security-testing |
| Flutter/Dart secure storage | conducting-mobile-app-penetration-test | testing-mobile-api-authentication |
| Mobile API traffic inspection | conducting-mobile-app-penetration-test | performing-api-security-testing-with-postman |
| GitHub Actions security hardening | implementing-devsecops-security-scanning | implementing-secret-scanning-with-gitleaks |
| CI/CD security gates | implementing-devsecops-security-scanning | performing-sca-dependency-scanning-with-snyk |
| Dependency vulnerability scan | performing-sca-dependency-scanning-with-snyk | implementing-supply-chain-security-with-in-toto |
| SBOM generation | performing-sca-dependency-scanning-with-snyk | implementing-supply-chain-security-with-in-toto |
| Build provenance | implementing-supply-chain-security-with-in-toto | performing-sca-dependency-scanning-with-snyk |
| Secret detection in CI | implementing-secret-scanning-with-gitleaks | implementing-devsecops-security-scanning |
| Vulnerability prioritization | implementing-vulnerability-management-with-greenbone | performing-sca-dependency-scanning-with-snyk |
| OWASP API Top 10 assessment | testing-api-security-with-owasp-top-10 | conducting-api-security-testing |
| Postman-based API testing | performing-api-security-testing-with-postman | testing-api-security-with-owasp-top-10 |

## Auto-Loading Rules

OpenCode should auto-load skills based on task keywords:

```
API Security tasks     → conducting-api-security-testing + testing-api-security-with-owasp-top-10
Authorization/IDOR     → testing-api-for-broken-object-level-authorization
JWT/Auth review        → testing-api-authentication-weaknesses + implementing-jwt-signing-and-verification
Mobile security        → conducting-mobile-app-penetration-test
DevSecOps/CI           → implementing-devsecops-security-scanning + implementing-secret-scanning-with-gitleaks
Supply chain/SBOM      → implementing-supply-chain-security-with-in-toto + performing-sca-dependency-scanning-with-snyk
Vulnerability mgmt     → implementing-vulnerability-management-with-greenbone
```

## Restrictions

- Only load skills relevant to the current task (progressive disclosure)
- Do not load all 25 skills for general coding tasks
- Skills provide methodology guidance; Strix provides dynamic validation
- No production testing without explicit authorization
- No destructive testing against real targets

## Integration with Strix

| Skill Layer | Strix Layer |
|-------------|-------------|
| Methodology/playbooks | Dynamic assessment/exploitation |
| Static analysis guidance | Runtime vulnerability proof |
| Regression test design | Finding normalization |
| Remediation guidance | Re-scan validation |