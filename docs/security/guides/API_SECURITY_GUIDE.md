# API Security Domain Guide

Practical examples for using TRANSUM-IN API security skills.

## Common Tasks

### Task: Test New Endpoint for Authorization

**Skills**: `conducting-api-security-testing`, `testing-api-for-broken-object-level-authorization`

**Workflow**:

1. Load skill: `testing-api-for-broken-object-level-authorization`
2. Identify object ID parameters in endpoint
3. Create two test users with different data
4. Send request as User A to access User B's object
5. Expect 403 Forbidden if authorization enforced
6. Write regression test if vulnerable

**Example Test**:

```typescript
describe('GET /api/journeys/:id authorization', () => {
  it('should deny access to other users journeys', async () => {
    const userA = await createUser();
    const userB = await createUser();
    const journeyB = await createJourney(userB);
    
    const tokenA = await getToken(userA);
    
    const res = await request(app)
      .get(`/api/journeys/${journeyB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });
});
```

### Task: Validate Rate Limiting

**Skill**: `implementing-api-rate-limiting-and-throttling`

**Workflow**:

1. Identify endpoints needing rate limits (auth, password reset, OTP)
2. Configure rate limit middleware
3. Test with rapid requests
4. Expect 429 Too Many Requests after threshold

### Task: Test for Mass Assignment

**Skill**: `testing-api-for-mass-assignment-vulnerability`

**Workflow**:

1. Find endpoints accepting JSON body (PUT, PATCH, POST)
2. Identify model fields (e.g., `role`, `isAdmin`, `balance`)
3. Add unexpected fields to request
4. Check if server processes them

**Example**:

```typescript
// Test: User cannot escalate to admin via mass assignment
it('should ignore role field in user update', async () => {
  const user = await createUser({ role: 'user' });
  const token = await getToken(user);
  
  const res = await request(app)
    .patch(`/api/users/${user.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Updated', role: 'admin' })
    .expect(200);
  
  expect(res.body.role).toBe('user'); // Role unchanged
});
```

## Integration with Strix

After writing tests, validate with Strix:

```bash
strix -t ./apps/backend -t https://staging.transum-in.local/api \
  --instruction "Test IDOR on journey endpoints with tokens: $TOKEN_A, $TOKEN_B"
```
