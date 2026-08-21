# Environment Configuration

## Overview
Environment variables are used to configure the application without modifying code. The backend uses `@nestjs/config` to load from `.env` files. Flutter uses `--dart-define` for compile-time variables.

## Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:postgres@localhost:5432/transumin |
| PORT | Server listening port | 3000 |
| JWT_SECRET | Secret key for signing JWTs (min 32 chars) | (your secret) |
| JWT_EXPIRES_IN | Token expiration time | 1d |

## Flutter (--dart-define)

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

## Security Rules

- Never commit `.env` or `.env.local` files.
- Use `.env.example` as a template.
- Production credentials must be provided via secure environment injection.
