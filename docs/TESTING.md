# Testing Strategy

## Backend

Framework: Jest (with ts-jest)

### How to run tests

```bash
cd apps/backend
npm test
```

## Flutter

Framework: Flutter Test (built-in)

### How to run tests

```bash
cd apps/mobile
flutter test
```

## Types of Tests

1. **Unit Tests**: For services, models, and logic isolated from the framework.
2. **Widget Tests**: For reusable UI components (badges, cards, buttons).
3. **Integration/E2E**: To be introduced in later phases for flow validation.
