# TRANSUM-IN — Development Handoff

This is the combined pre-development handoff for the TRANSUM-IN mobile application.

## Contents

- `ui/` — canonical Stitch-derived UI reference package.
- `foundation/` — product vision, requirements, user flows, transit-domain model, data-source governance, routing-engine specification, API contract, implementation roadmap, AI-agent guardrails, and reference/seed data.

## AI coding-agent reading order

1. `foundation/README.md`
2. `foundation/docs/01_PRODUCT_VISION.md`
3. `foundation/docs/02_PRODUCT_REQUIREMENTS.md`
4. `foundation/docs/03_USER_FLOWS.md`
5. `foundation/docs/04_TRANSIT_DOMAIN_MODEL.md`
6. `foundation/docs/05_DATA_SOURCE_GOVERNANCE.md`
7. `foundation/docs/06_ROUTING_ENGINE.md`
8. `foundation/docs/07_API_AND_APP_CONTRACT.md`
9. `foundation/docs/08_IMPLEMENTATION_ROADMAP.md`
10. `foundation/docs/09_AI_AGENT_GUARDRAILS.md`
11. `ui/README.md`
12. `ui/UI_CONTRACT.md`
13. `ui/DESIGN.md`
14. `ui/SCREEN_MANIFEST.md`

## Critical rule

The UI package defines how TRANSUM-IN should look and behave.

The foundation package defines why the product exists, how users move through it, how transit data is modeled, how routing should work, and what the coding agent must not invent.

Official transit data remains the source of truth for production route/schedule facts.
