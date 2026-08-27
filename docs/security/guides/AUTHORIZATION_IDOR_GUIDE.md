# Authorization / IDOR Domain Guide

Practical examples for testing object-level authorization using TRANSUM-IN skills.

## Skills Used

- `testing-api-for-broken-object-level-authorization`
- `exploiting-idor-vulnerabilities`
- `detecting-broken-object-property-level-authorization`
- `exploiting-broken-function-level-authorization`
- `testing-api-for-mass-assignment-vulnerability`

## IDOR Testing Workflow

### Step 1: Identify Object References

Find all endpoints using object IDs:

```bash
# From OpenAPI spec
curl -s https://api.example.com/swagger.json | \
  jq -r '.paths | to_entries[] | .value | to_entries[] | select(.value.parameters) | .value.parameters[] | select(.in=="path") | .name'
```

### Step 2: Classify ID Types

| ID Type | Example | Enumeration Risk |
|---------|---------|------------------|
| Sequential Integer | `/orders/1042` | Critical |
| UUID v4 | `/orders/550e8400-e29b...` | Medium |
| Encoded/Hash | `/orders/base64value` | High |
| Composite | `/users/42/orders/1042` | Critical |

### Step 3: Test Matrix

Test each endpoint with each HTTP method:

| Method | Test | Expected Secure |
|--------|------|-----------------|
| GET | Access other user's object | 403 |
| PUT | Modify other user's object | 403 |
| PATCH | Partially modify | 403 |
| DELETE | Delete other user's object | 403 |

### Example: SavedJourney IDOR Protection

```typescript
// test/journeys.idor.test.ts

describe('SavedJourney Object Authorization', () => {
  let userA: User, userB: User;
  let tokenA: string, tokenB: string;
  let journeyA: Journey, journeyB: Journey;

  beforeEach(async () => {
    userA = await createUser({ email: 'a@test.com' });
    userB = await createUser({ email: 'b@test.com' });
    tokenA = await getToken(userA);
    tokenB = await getToken(userB);
    journeyA = await createJourney(userA, { name: 'A Trip' });
    journeyB = await createJourney(userB, { name: 'B Trip' });
  });

  const methods = ['get', 'put', 'patch', 'delete'] as const;
  
  methods.forEach(method => {
    it(`should deny ${method.toUpperCase()} access to other user's journey`, async () => {
      const url = `/api/journeys/${journeyB.id}`;
      
      const requestFn = method === 'get' ? 'get' : method;
      const res = await request(app)[requestFn](url)
        .set('Authorization', `Bearer ${tokenA}`)
        .send(method === 'delete' ? {} : { name: 'Hacked' })
        .expect(403);
    });
  });
});
```

## BFLA Testing (Function-Level)

Test admin endpoints with regular user:

```typescript
it('should deny admin endpoints to regular users', async () => {
  const user = await createUser({ role: 'user' });
  const token = await getToken(user);
  
  const adminEndpoints = [
    { method: 'get', path: '/api/admin/users' },
    { method: 'delete', path: '/api/admin/users/123' },
    { method: 'get', path: '/api/admin/stats' },
  ];
  
  for (const endpoint of adminEndpoints) {
    const res = await request(app)[endpoint.method](endpoint.path)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  }
});
```

## BOPLA Testing (Property-Level)

Test for excessive data exposure and mass assignment:

```typescript
it('should not expose internal fields in user response', async () => {
  const user = await createUser({ email: 'test@test.com' });
  const token = await getToken(user);
  
  const res = await request(app)
    .get(`/api/users/${user.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  
  // Should NOT contain internal fields
  expect(res.body).not.toHaveProperty('passwordHash');
  expect(res.body).not.toHaveProperty('resetToken');
  expect(res.body).not.toHaveProperty('internalId');
});

it('should reject mass assignment of restricted fields', async () => {
  const user = await createUser({ role: 'user' });
  const token = await getToken(user);
  
  const res = await request(app)
    .patch(`/api/users/${user.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ role: 'admin', isVerified: true, balance: 99999 })
    .expect(200);
  
  // Verify restricted fields unchanged
  expect(res.body.role).toBe('user');
  expect(res.body.isVerified).toBe(false);
});
```

## Strix Validation

```bash
strix -t ./apps/backend \
  -t https://staging.transum-in.local/api \
  --instruction "User A: $TOKEN_A, User B: $TOKEN_B
Test IDOR on /api/journeys/{id} - GET, PUT, PATCH, DELETE
Test BFLA on /api/admin/* endpoints with User A token"
```

## Remediation Pattern

```typescript
// Standard ownership check middleware
async function authorizeOwnership(req, res, next) {
  const resourceId = req.params.id;
  const resource = await Resource.findById(resourceId);
  
  if (!resource) return res.status(404).json({ error: 'Not found' });
  if (resource.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
}

// Apply to all object endpoints
app.get('/api/journeys/:id', authorizeOwnership, getJourney);
app.put('/api/journeys/:id', authorizeOwnership, updateJourney);
app.patch('/api/journeys/:id', authorizeOwnership, patchJourney);
app.delete('/api/journeys/:id', authorizeOwnership, deleteJourney);
```