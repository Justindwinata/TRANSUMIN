# Supply Chain Security Domain Guide

Practical examples for SBOM, dependency scanning, and build provenance.

## Skills Used

- `implementing-supply-chain-security-with-in-toto`
- `performing-sca-dependency-scanning-with-snyk`

## SBOM Generation

### With Trivy (in CI)

```yaml
# .github/workflows/supply-chain.yml

- name: Generate SBOM
  uses: aquasecurity/trivy-action@0.28.0
  with:
    image-ref: 'transum-in:${{ github.sha }}'
    format: 'cyclonedx'
    output: 'sbom.json'

- name: Upload SBOM
  uses: actions/upload-artifact@v4
  with:
    name: sbom
    path: sbom.json
```

### With Syft (local development)

```bash
# Install syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Generate SBOM for local image
syft transum-in:latest -o cyclonedx-json > sbom.json

# Generate SBOM for directory (npm/pub packages)
syft dir:./apps/backend -o cyclonedx-json > sbom-backend.json
syft dir:./apps/mobile -o cyclonedx-json > sbom-mobile.json
```

## Dependency Scanning

### With Trivy (CI)

```yaml
- name: Run Trivy SCA Scan
  uses: aquasecurity/trivy-action@0.28.0
  with:
    scan-type: 'fs'
    scan-ref: '.'
    severity: 'CRITICAL,HIGH,MEDIUM'
    exit-code: '1'
    format: 'json'
    output: 'trivy-sca-results.json'
```

### With Snyk (via skill: performing-sca-dependency-scanning-with-snyk)

```bash
# Install snyk
npm install -g snyk

# Authenticate
snyk auth

# Test project
snyk test --all-projects --severity-threshold=high

# Monitor for new vulnerabilities
snyk monitor --all-projects
```

### With npm audit (backend)

```bash
# Backend (NestJS/TypeScript)
cd apps/backend
npm audit --audit-level=high
npm audit fix

# With audit-ci for CI integration
npx audit-ci --config audit-ci.json
```

```json
# audit-ci.json
{
  "moderate": 0,
  "high": 0,
  "critical": 0,
  "registry": "https://registry.npmjs.org/"
}
```

### With pub (Flutter mobile)

```bash
# Mobile (Flutter/Dart)
cd apps/mobile
flutter pub deps --style=compact
dart pub outdated --mode=null-safety

# Dart's built-in vulnerability advisories
dart pub deps --json | jq '.packages[] | select(.version.status == "vulnerable")'
```

## Build Provenance with in-toto

### Generate Signing Keys

```bash
mkdir -p keys

# Project owner key (signs layout)
in-toto-keygen --type ed25519 keys/owner

# CI builder key
in-toto-keygen --type ed25519 keys/builder

# Security scanner key
in-toto-keygen --type ed25519 keys/scanner
```

### Create Supply Chain Layout

```python
# scripts/create_layout.py

from in_toto.models.layout import Layout, Step, Inspection
from in_toto.models.metadata import Envelope
from securesystemslib.signer import CryptoSigner
from securesystemslib.interface import import_ed25519_publickey_from_file

def create_container_build_layout():
    layout = Layout()
    layout.set_relative_expiration(months=6)
    
    builder_key = import_ed25519_publickey_from_file("keys/builder.pub")
    scanner_key = import_ed25519_publickey_from_file("keys/scanner.pub")
    
    layout.keys = {
        builder_key["keyid"]: builder_key,
        scanner_key["keyid"]: scanner_key,
    }
    
    # Step 1: Source checkout
    checkout = Step(name="checkout")
    checkout.expected_materials = []
    checkout.expected_products = [
        ["CREATE", "Dockerfile"],
        ["CREATE", "src/*"],
        ["CREATE", "package.json"],
    ]
    checkout.pubkeys = [builder_key["keyid"]]
    checkout.threshold = 1
    
    # Step 2: Build
    build = Step(name="build")
    build.expected_materials = [
        ["MATCH", "Dockerfile", "WITH", "PRODUCTS", "FROM", "checkout"],
        ["MATCH", "src/*", "WITH", "PRODUCTS", "FROM", "checkout"],
    ]
    build.expected_products = [["CREATE", "image-digest.txt"]]
    build.pubkeys = [builder_key["keyid"]]
    build.threshold = 1
    
    # Step 3: Security scan
    scan = Step(name="scan")
    scan.expected_materials = [
        ["MATCH", "image-digest.txt", "WITH", "PRODUCTS", "FROM", "build"]
    ]
    scan.expected_products = [
        ["CREATE", "vulnerability-report.json"],
        ["CREATE", "sbom.json"],
    ]
    scan.pubkeys = [scanner_key["keyid"]]
    scan.threshold = 1
    
    # Inspection: Verify no critical vulnerabilities
    inspect_vulns = Inspection(name="verify-no-critical-vulns")
    inspect_vulns.expected_materials = [
        ["MATCH", "vulnerability-report.json", "WITH", "PRODUCTS", "FROM", "scan"]
    ]
    inspect_vulns.run = [
        "python", "-c",
        "import json,sys; r=json.load(open('vulnerability-report.json')); "
        "sys.exit(1) if any(v['severity']=='CRITICAL' for v in r.get('vulnerabilities',[])) else sys.exit(0)"
    ]
    
    layout.steps = [checkout, build, scan]
    layout.inspect = [inspect_vulns]
    
    return layout

if __name__ == "__main__":
    layout = create_container_build_layout()
    owner_signer = CryptoSigner.from_priv_key_uri("file:keys/owner")
    envelope = Envelope.from_signable(layout)
    envelope.create_signature(owner_signer)
    envelope.dump("root.layout")
    print("Layout created: root.layout")
```

### Record Pipeline Steps (in CI)

```yaml
# .github/workflows/supply-chain.yml

- name: Checkout
  uses: actions/checkout@v4
  
- name: Record Checkout Step
  run: |
    in-toto-record start --step-name checkout --key keys/builder
    in-toto-record stop --step-name checkout --key keys/builder \
      --products Dockerfile src/* package.json

- name: Build Image
  run: |
    in-toto-record start --step-name build --key keys/builder
    docker build -t transum-in:${{ github.sha }} .
    docker inspect --format='{{.Id}}' transum-in:${{ github.sha }} > image-digest.txt
    in-toto-record stop --step-name build --key keys/builder \
      --materials Dockerfile src/* --products image-digest.txt

- name: Security Scan
  run: |
    in-toto-record start --step-name scan --key keys/scanner
    trivy image --format json transum-in:${{ github.sha }} > vulnerability-report.json
    syft transum-in:${{ github.sha }} -o cyclonedx-json > sbom.json
    in-toto-record stop --step-name scan --key keys/scanner \
      --materials image-digest.txt --products vulnerability-report.json sbom.json
```

### Verify Before Deploy

```bash
# Verify supply chain
in-toto-verify --layout root.layout \
  --layout-key keys/owner.pub \
  --link-dir ./

# If verification passes, deploy
if [ $? -eq 0 ]; then
  echo "Supply chain verified ✓"
  kubectl apply -f k8s/deployment.yaml
else
  echo "SUPPLY CHAIN VERIFICATION FAILED ✗"
  exit 1
fi
```

## Kubernetes Admission Control

```yaml
# k8s/in-toto-admission.yaml

apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: in-toto-verifier
webhooks:
  - name: verify.in-toto.io
    rules:
      - apiGroups: ["apps"]
        resources: ["deployments"]
        operations: ["CREATE", "UPDATE"]
    clientConfig:
      service:
        name: in-toto-webhook
        namespace: security
        path: /verify
    failurePolicy: Fail
    sideEffects: None
    admissionReviewVersions: ["v1"]
```

## SLSA Level Mapping

| SLSA Level | in-toto Requirement | TRANSUM-IN Status |
|------------|---------------------|-------------------|
| Level 1 | Build process documented | ✓ (layout exists) |
| Level 2 | Signed attestations from hosted build | ✓ (GitHub Actions) |
| Level 3 | Hardened build platform | In Progress |
| Level 4 | Two-party review, hermetic builds | Planned |

## Verification Checklist

- [ ] SBOM generated for every release (CycloneDX format)
- [ ] Dependency scan runs on every PR
- [ ] Known vulnerabilities block merge
- [ ] Build provenance recorded (in-toto link files)
- [ ] Supply chain layout signed by project owner
- [ ] Verification runs before deployment
- [ ] Kubernetes admission controller verifies attestations
- [ ] SLSA level documented and tracked

## Strix Integration

```bash
# Strix can scan SBOM for vulnerable dependencies
strix -t ./apps/backend --instruction "
Scan SBOM at sbom.json for vulnerable packages
Check for dependency confusion attacks
Verify build provenance
"
```