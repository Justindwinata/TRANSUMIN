# TRANSUM-IN — Data Bootstrap / Seed Plan

## 1. Purpose

This document defines safe initial reference data for local development and deterministic tests.

It is not intended to replace production ingestion.

## 2. Bootstrap strategy

Use three layers:

```text
official-source-reference
        ↓
normalized test fixtures
        ↓
deterministic seed database
```

## 3. Seed entities

Minimum:

- agencies
- service types
- routes
- stops/stations
- route patterns
- transfer edges
- sample places

For schedule-driven tests also seed:

- trips
- stop_times
- service calendars
- exceptions

## 4. Seed rules

Each seeded record should have:

- stable internal ID;
- source_reference;
- descriptive name;
- deterministic coordinates;
- status `REFERENCE`;
- no claim of current live operation.

## 5. Sample places

Use neutral/known reference destinations for testing:

- Monas
- Stasiun Sudirman
- Stasiun Universitas Indonesia
- Stasiun Juanda
- Blok M
- Halte Bundaran HI
- Kampung Melayu
- Kuningan

The coordinates used in automated fixtures must be explicitly stored and reviewed rather than scraped from screenshots.

## 6. Test journey scenarios

The seed set should enable at least:

### Scenario A — one transit mode

Origin near a KRL station
→ destination near another KRL station

### Scenario B — walking + KRL

Origin
→ walk
→ KRL
→ walk
→ destination

### Scenario C — KRL + TransJakarta

Origin
→ KRL
→ transfer
→ TransJakarta
→ destination

### Scenario D — KRL + Mikrotrans

Origin
→ KRL
→ transfer
→ Mikrotrans
→ destination

### Scenario E — no nearby transit

Origin far from all supported stops
→ `NO_NEARBY_TRANSIT`

### Scenario F — no feasible route

Stops exist
→ constraints prevent a feasible journey
→ `NO_ROUTE_FOUND`

## 7. Schedule test data

Use synthetic schedule fixtures for deterministic automated tests where needed.

Do not represent synthetic schedules as official current schedules.

Example:

```text
SERVICE: TEST_KRL_01
07:45
08:00
08:15
```

Label them as `TEST_ONLY`.

## 8. Data update

Production data must come through ingestion jobs, not handwritten seed changes.

## 9. Official reference examples used for seed design

TransJakarta's current official route directory lists BRT, feeder, Mikrotrans, and Transjabodetabek services. Examples used for this project foundation include Corridor 1 (Blok M–Kota), Corridor 2 (Pulo Gadung–Monas), 5C (Cililitan–Juanda), 6A/6B, 7F, and Mikrotrans JAK01/JAK03/JAK06/JAK18/JAK44.

KAI Commuter's official route guide publishes Jabodetabek service patterns including Bogor/Depok–Manggarai–Jakarta Kota, Cikarang–Bekasi–Jatinegara–Manggarai–Jakarta Kota, Tangerang–Duri, and other patterns.

These examples are reference seeds. They are not a replacement for current feed ingestion.
