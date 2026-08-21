# TRANSUM-IN — Product Requirements

## P0 — Core MVP

### Journey planning

The system MUST support:

- origin;
- destination;
- current location when permission is granted;
- manual location selection;
- place/station/stop search;
- route calculation;
- multiple route alternatives;
- route ranking;
- route detail;
- walking segments;
- transit segments;
- transfer instructions;
- map presentation.

### User experience

The route result MUST expose:

- total duration;
- departure time when schedule data exists;
- arrival time when schedule data exists;
- fare or “Tarif tidak tersedia”;
- one primary route badge;
- number of transfers;
- walking distance;
- each transit service used;
- boarding location;
- alighting location;
- transfer location;
- destination walking leg.

### Active trip

The system SHOULD support:

- current step;
- next step;
- remaining time;
- destination;
- ETA when available;
- current location on map;
- end trip.

### Account

MVP account functionality:

- registration;
- login;
- logout;
- Google sign-in integration point;
- Facebook sign-in integration point;
- forgot-password flow contract;
- verification-state contract;
- profile;
- saved places;
- saved routes;
- route preferences.

### Preferences

Users can select a default optimization:

- fastest;
- least walking;
- least transfers;
- simplest;
- cheapest when fare data is trustworthy.

Users can define walking tolerance.

### Notifications

Information architecture:

- service disruption;
- route change;
- delay;
- active-trip notification;
- general information.

## P1 — Reliability / quality

- offline-friendly cached recent journeys;
- explicit stale-data messaging;
- graceful API error state;
- location permission fallback;
- accessibility labels;
- safe-area support;
- request cancellation for stale searches;
- deterministic seed data.

## P2 — Future expansion

- MRT;
- LRT;
- additional commuter/urban operators;
- richer real-time vehicle tracking;
- fare integration;
- ticket/payment integrations;
- personalization from usage patterns;
- advanced accessibility routing;
- disruption-aware rerouting.

## Explicit behavior rules

### No nearby transit

This is different from no route.

- `NO_NEARBY_TRANSIT`: no usable transit stop/station near the selected endpoint after applying walking tolerance.
- `NO_ROUTE_FOUND`: candidate transit exists, but no feasible multimodal journey satisfies the current constraints.

### Unknown fare

Never render `Rp 0` as a placeholder.

Use:

`Tarif tidak tersedia`

or a clearly labeled estimate.

### Unknown schedule

Do not invent departure/arrival times.

Use:

- “Jadwal tidak tersedia”
- or a frequency/service-window representation when the dataset supports it.

### Unsupported live claim

Never say “real-time” unless a live/validated data source exists for that fact.
