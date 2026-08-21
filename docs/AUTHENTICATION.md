# Authentication & Security

## Overview
The TRANSUM-IN platform supports multiple authentication providers with strict token handling and secure password storage.

## Supported Providers
- **Email & Password**: Standard registration and login with bcrypt hashing.
- **Google**: OAuth integration point via identity adapter.
- **Facebook**: OAuth integration point via identity adapter.

## Security Baseline
- Passwords hashed using `bcryptjs` with configurable salt rounds.
- Session managed via JSON Web Tokens (JWT).
- Tokens stored securely on the mobile device (Flutter secure storage or secure shared preferences).
- No hardcoded secrets or credentials in the repository.
