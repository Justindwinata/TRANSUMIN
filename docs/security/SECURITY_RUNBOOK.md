# TRANSUM-IN Security Runbook

**Version:** 1.0
**Last Updated:** 2026-08-26
**Owner:** Security Engineering Team

## Quick Reference

### Critical Security Contacts
- Security Lead: [TBD]
- Backend Team: [TBD]
- Mobile Team: [TBD]
- DevOps/Infrastructure: [TBD]

### Security Incident Response
- **Critical Vulnerability Found:** Page on-call security lead immediately
- **Active Exploitation:** Activate incident response team
- **Data Breach:** Notify stakeholders within 4 hours

---

## Security Configuration Checklist

### Before Deployment

#### Environment Variables (Backend)
```bash
# REQUIRED - Do not deploy without these
JWT_SECRET=<strong-random-secret>              # Min 32 chars, alphanumeric + special
DATABASE_URL=postgresql://user:pass@host/db   # Production DB connection
NODE_ENV=production                            # MUST be 'production'

# REQUIRED - API Configuration
PORT=3000                                      # Use 443 in production with reverse proxy
CORS_ORIGIN=https://yourdomain.com            # Restrict to production domain
API_VERSION=1

# REQUIRED - Security Settings
RATE_LIMIT_WINDOW_MS=900000                   # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100                   # Adjust per your traffic

# OPTIONAL but recommended
JWT_EXPIRES_IN=7d                             # Consider shorter expiry with refresh tokens
LOG_LEVEL=warn                                # Suppress debug logs in production
```

#### Mobile Configuration
```dart
// In build time or environment:
const env = 'production';                     // Never 'development' in release builds
const apiBaseUrl = 'https://api.yourdomain';  // HTTPS only in production
```

### Deployment Checklist
- [ ] All environment variables set and verified
- [ ] Database migrations applied and tested
- [ ] JWT_SECRET changed from default
- [ ] CORS_ORIGIN set to production domain
- [ ] NODE_ENV=production confirmed
- [ ] TLS/HTTPS enabled on all endpoints
- [ ] Security tests passing locally
- [ ] Code review completed by security lead
- [ ] Strix scan completed (if available)
- [ ] No secrets in git history
- [ ] Rate limiting configured appropriately
- [ ] Monitoring/alerts configured
- [ ] Backup/recovery tested

---

## Runtime Security Monitoring

### Logs to Watch For
```
[WARN] JWT_SECRET configuration is missing
[ERROR] Invalid or expired token
[ERROR] Forbidden: Not your resource
[ERROR] Rate limit exceeded
[ERROR] Invalid email format
[ERROR] Private/internal IP address not allowed
```

### Alerts to Configure
1. **Multiple failed authentication attempts** (>10 in 5 min) → Possible brute force
2. **Unusual rate limit hits** → Possible DoS
3. **Authorization failures** (>5 in 5 min) → Possible privilege escalation attempt
4. **Database connection errors** → Possible compromise or misconfiguration
5. **Unhandled exceptions** → Possible attack or bug

### Health Checks
```bash
# Verify API is running
curl -H "Authorization: Bearer $TEST_TOKEN" https://api.example.com/auth/me

# Check database connectivity
npm run prisma:validate

# Verify rate limiting is active
for i in {1..101}; do curl https://api.example.com/health; done
# Should get 429 on request 101+
```

---

## Incident Response Procedures

### Scenario 1: Suspected JWT Secret Compromise

**Indicators:**
- Unauthorized user access detected
- Tokens issued before incident appear valid
- Multiple users report account access from unknown locations

**Response:**
1. **Immediate (5 min):**
   - Change JWT_SECRET to new strong random value
   - Restart API servers with new secret
   - Invalidate all existing sessions (if refresh token mechanism exists)

2. **Short-term (30 min):**
   - Notify all users to re-authenticate
   - Review access logs for unauthorized activity
   - Check for data exfiltration

3. **Post-Incident (24 hours):**
   - Root cause analysis
   - Implement longer JWT_SECRET rotation schedule
   - Add JWT secret change to security runbook automation

### Scenario 2: Active IDOR/Authorization Bypass Attack

**Indicators:**
- Users reporting access to other users' saved places/journeys
- Multiple 403 Forbidden errors in logs
- Rapid sequential requests to different resource IDs

**Response:**
1. **Immediate (5 min):**
   - Enable rate limiting if not already active
   - Monitor database queries for unusual patterns
   - Check if attackers have read/written data

2. **Short-term (30 min):**
   - Identify affected resource IDs
   - Review ownership check logic in backend
   - Deploy hotfix if logic error found
   - Notify affected users

3. **Post-Incident (24 hours):**
   - Add IDOR regression test for affected resource
   - Review all other endpoints for similar patterns
   - Implement automated IDOR testing

### Scenario 3: Denial of Service Attack

**Indicators:**
- API responding slowly or timing out
- Rate limit threshold hit repeatedly
- Spike in error logs

**Response:**
1. **Immediate (5 min):**
   - Verify rate limiting is enforcing
   - Check database performance
   - Look for malicious patterns in request logs

2. **Short-term (30 min):**
   - Increase rate limit temporarily if legitimate traffic
   - Block source IPs if attack is obvious
   - Scale infrastructure if needed

3. **Post-Incident (24 hours):**
   - Adjust rate limits based on legitimate traffic patterns
   - Implement WAF/DDoS protection if needed
   - Add monitoring for sustained rate limit hits

### Scenario 4: Suspected Data Breach

**Indicators:**
- Unauthorized database access logs
- Data appears modified without user action
- Third-party reports of leaked credentials

**Response:**
1. **Immediate (5 min):**
   - Isolate affected database if possible
   - Preserve logs and forensic evidence
   - Notify stakeholders

2. **Short-term (1 hour):**
   - Determine scope (which users/data affected)
   - Notify affected users
   - Change database credentials
   - Review access logs

3. **Post-Incident (24 hours):**
   - Full forensic investigation
   - Implement additional access controls
   - Reset user passwords
   - Notify regulators if required (GDPR, CCPA, etc.)

---

## Security Testing

### Manual Testing Checklist

#### Authentication
```bash
# Test missing auth header
curl -X GET http://localhost:3000/saved-places

# Test invalid token
curl -H "Authorization: Bearer invalid" http://localhost:3000/saved-places

# Test expired token
# Generate token with short expiry, wait, then use it

# Test valid token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"TestPass123"}' | jq -r .accessToken)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/auth/me
```

#### Authorization (IDOR Prevention)
```bash
# Create two test users
USER1_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"TestPass123"}' | jq -r .accessToken)

USER2_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"TestPass123"}' | jq -r .accessToken)

# User 1 creates a saved place
PLACE_ID=$(curl -X POST http://localhost:3000/saved-places \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","address":"123 St","lat":0,"lon":0}' | jq -r .id)

# User 2 tries to access User 1's place (should fail)
curl -X GET http://localhost:3000/saved-places/$PLACE_ID \
  -H "Authorization: Bearer $USER2_TOKEN"
# Expected: 403 Forbidden
```

#### Rate Limiting
```bash
# Send 101 rapid requests (limit is 100)
for i in {1..101}; do
  curl -s http://localhost:3000/health -w "Status: %{http_code}\n"
done
# Request 101 should return 429 Too Many Requests
```

#### Input Validation
```bash
# Test email validation
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","fullName":"Test","password":"TestPass123"}'
# Expected: 400 Bad Request

# Test password strength
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","fullName":"Test","password":"weak"}'
# Expected: 400 Bad Request (password too short)

# Test invalid coordinates
curl -X POST http://localhost:3000/saved-places \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","address":"123 St","lat":91,"lon":0}'
# Expected: 400 Bad Request (invalid latitude)
```

---

## Regular Security Tasks

### Daily
- [ ] Monitor security logs for errors/warnings
- [ ] Check rate limit hit frequency
- [ ] Verify backup completion
- [ ] Review error rates and exceptions

### Weekly
- [ ] Review authentication failure logs
- [ ] Check for dependency security updates (`npm audit`)
- [ ] Run security baseline tests
- [ ] Review access logs for anomalies

### Monthly
- [ ] Full security audit of critical endpoints
- [ ] Rotate access keys/credentials (non-JWT)
- [ ] Review and update rate limit thresholds
- [ ] Run comprehensive security tests

### Quarterly
- [ ] Full Strix pentesting scan
- [ ] Review and update security documentation
- [ ] Security training for team
- [ ] Dependency security audit

### Annually
- [ ] Full security assessment by external firm
- [ ] Penetration testing
- [ ] Security architecture review
- [ ] Update security policies

---

## Useful Commands

### Backend Testing
```bash
cd apps/backend

# Run all tests
npm test

# Run security tests only
npm test -- security

# Run specific test file
npm test security.baseline.spec.ts

# Run linting
npm run lint

# Build and check for errors
npm run build
```

### Database
```bash
# Validate Prisma schema
npx prisma validate

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (dev only!)
npx prisma migrate reset
```

### Strix Scanning (when Docker available)
```bash
# Quick scan (5-10 min)
strix -n -t ./ --scan-mode quick --max-budget 10

# Standard scan (20-30 min)
strix -n -t ./ --scan-mode standard --max-budget 20

# View latest scan results
strix view

# Test specific endpoint
strix -n -t http://localhost:3000 --instruction "Test authentication bypass" --max-budget 5
```

### Manual Testing
```bash
# Start backend
cd apps/backend
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User","password":"TestPass123"}'
```

---

## Documentation References

- **SECURITY_FINDINGS.md** — Current findings and remediations
- **REMEDIATION_WORKFLOW.md** — How to fix vulnerabilities
- **STRIX_INTEGRATION.md** — Strix setup and usage
- **STRIX_TARGETS.md** — Security testing scope
- **PHASE_1_SECURITY_BASELINE_AUDIT.md** — Initial assessment

---

## Questions?

- Review SECURITY_FINDINGS.md for common issues
- Check REMEDIATION_WORKFLOW.md for how to fix vulnerabilities
- Consult STRIX_INTEGRATION.md for security scanning
- Contact security lead for policy questions

---

**Last Updated:** 2026-08-26
**Next Review:** 2026-09-26
