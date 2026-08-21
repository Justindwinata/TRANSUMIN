# TRANSUM-IN

> "Biar Naik Transum Nggak Bingung."

Multimodal public transportation journey-planning platform for Indonesia, initially focused on Jabodetabek (KRL Commuter Line, TransJakarta, and Mikrotrans).

## Architecture Overview

- `apps/mobile`: Flutter mobile client (Clean Architecture, Riverpod state management)
- `apps/backend`: NestJS backend API (TypeScript, Prisma ORM, PostgreSQL)
- `TRANSUM-IN_Development_Handoff`: Canonical product, UI/UX, and domain contracts

## Quick Start

### Prerequisites

- Node.js v22+
- Dart SDK 3.7+
- PostgreSQL server

### Backend Setup

```bash
cd apps/backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run start:dev
```

### Mobile App Setup

```bash
cd apps/mobile
dart pub get
dart run
```

## Documentation

- `docs/ARCHITECTURE.md`: High-level system design
- `docs/DEVELOPMENT.md`: Setup and workflow details
- `docs/ENVIRONMENT.md`: Environment variables and secrets policy
- `docs/AUTHENTICATION.md`: Auth specs and OAuth adapter design
- `docs/DATA_MODEL.md`: Domain & database schema
- `docs/API_CONTRACT.md`: Endpoints and contracts
- `docs/TRANSIT_DATA.md`: Transit data governance & GTFS alignment
- `docs/ROUTING.md`: Routing engine specs and journey concepts
- `docs/UI_IMPLEMENTATION.md`: Design system, tokens, and widget primitives
- `docs/TESTING.md`: Test strategy and execution
- `docs/KNOWN_LIMITATIONS.md`: Phase 1 scope bounds
- `docs/PHASE_1_FINAL_REPORT.md`: Phase 1 delivery report
