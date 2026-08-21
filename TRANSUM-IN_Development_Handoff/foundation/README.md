# TRANSUM-IN — Project Foundation

**Document package date:** 2026-08-21

This package is the pre-development foundation for the TRANSUM-IN mobile application.

It complements the canonical UI handoff package and defines the product intent, user flows, transit-domain assumptions, data boundaries, routing expectations, seed/reference data, implementation guardrails, and development order.

## Important hierarchy of truth

1. **TRANSUM-IN UI Handoff Canonical** — visual/UI reference.
2. **This Project Foundation package** — product, domain, data, routing, and engineering reference.
3. **Official transit data feeds / operator publications** — source of truth for live or production transit facts.
4. Prototype examples from Stitch — illustrative only and never authoritative for schedules, fares, stop order, or service availability.

## Core product statement

TRANSUM-IN helps people in Jabodetabek understand how to travel by public transport without having to understand the transit network first.

The user gives an origin and a destination. TRANSUM-IN explains the practical journey:

- where to walk;
- what service to board;
- which direction to take;
- where to get off;
- where to transfer;
- how far to walk between modes;
- estimated duration;
- fare availability/estimate;
- and the final path to the destination.

## MVP service scope

Initial implementation focuses on:

- KRL Commuter Line Jabodetabek
- TransJakarta
- Mikrotrans services in the TransJakarta/JakLingko ecosystem
- walking
- transfers between those modes

MRT/LRT/other operators remain architecture-compatible but are not MVP routing requirements.

## Package contents

- `docs/01_PRODUCT_VISION.md`
- `docs/02_PRODUCT_REQUIREMENTS.md`
- `docs/03_USER_FLOWS.md`
- `docs/04_TRANSIT_DOMAIN_MODEL.md`
- `docs/05_DATA_SOURCE_GOVERNANCE.md`
- `docs/06_ROUTING_ENGINE.md`
- `docs/07_API_AND_APP_CONTRACT.md`
- `docs/08_IMPLEMENTATION_ROADMAP.md`
- `docs/09_AI_AGENT_GUARDRAILS.md`
- `docs/10_DATA_BOOTSTRAP.md`
- `data/transit_reference.json`
- `contracts/route_response.example.json`
- `contracts/journey_segment.example.json`

## Source verification rule

Transit facts change. Route lists, schedules, stop patterns, fares, temporary diversions, and operating windows MUST be revalidated against current official sources before being presented as live information.

Official/current sources used to establish the initial reference:

- TransJakarta route directory: https://transjakarta.co.id/rute
- TransJakarta BRT information: https://transjakarta.co.id/layanan/brt
- KAI Commuter: https://www.commuterline.id/
- KAI Commuter route map / guide: https://commuterline.id/files/download/documents/Pedoman-Naik-KRL-KAI-Commuter_compressed.pdf
- Jakarta Government page on JakLingko: https://www.jakarta.go.id/jaklingko
- Official TransJakarta GTFS feed endpoint referenced by Transitland: https://gtfs.transjakarta.co.id/files/file_gtfs.zip
- GTFS specification: https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md

The initial route-reference data in this package is intentionally conservative and includes source labels/status fields.
