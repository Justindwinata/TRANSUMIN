# Known Limitations (Phase 1)

- Backend uses Prisma but requires a live PostgreSQL server; environment bootstrap is not yet automated.
- OAuth (Google/Facebook) flows are architectural placeholders — actual credentials and adapter wiring pending.
- The Flutter app structure is initialized but does not yet render all canonical screens; design system primitives are ready.
- Routing engine is not implemented in Phase 1 (planned Phase 3).
- Map provider is abstracted but no specific SDK is wired yet.
- CI requires additional config for Postgres service container in later phases.
