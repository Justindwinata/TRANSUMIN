# TRANSUM-IN — Implementation Roadmap

## Phase 0 — Foundation

Goals:

- choose mobile stack;
- establish monorepo/repository;
- establish lint/type/test;
- import canonical UI handoff;
- define environment configuration;
- create application shell.

Deliverable:
launchable mobile shell matching the UI contract.

## Phase 1 — Transit data foundation

Goals:

- ingest TransJakarta official GTFS;
- normalize route/stops/trips/stop_times;
- define KRL reference model from official route map;
- define Mikrotrans source strategy;
- add provenance;
- validate records.

Deliverable:
database containing validated reference transit network.

## Phase 2 — Place and map foundation

Goals:

- geocoding/place search;
- map provider integration;
- current location;
- manual map picker;
- nearby transit search.

Deliverable:
origin/destination selection works.

## Phase 3 — Routing MVP

Goals:

- nearby stop selection;
- walking access/egress;
- transit path;
- transfer edges;
- time-dependent schedule selection;
- route alternatives;
- ranking.

Deliverable:
real route comparison for the supported dataset.

## Phase 4 — Mobile journey experience

Goals:

- Home;
- Search;
- Route Options;
- Route Detail;
- Map;
- Active Trip.

Deliverable:
end-to-end journey planning flow.

## Phase 5 — Account and persistence

Goals:

- auth;
- profile;
- saved places;
- saved routes;
- preferences;
- trips/history.

Deliverable:
personalized app.

## Phase 6 — Alerts / reliability

Goals:

- disruption model;
- notifications;
- stale-data warnings;
- offline cache;
- recovery UX.

Deliverable:
robust everyday use.

## Phase 7 — Optimization and expansion

Goals:

- better routing performance;
- richer live data;
- accessibility routing;
- additional operators;
- MRT/LRT integration.

Do not start Phase 7 work before the MVP routing path is correct and explainable.

## Completion principle

A smaller correct transit network is better than a larger invented network.

For the first working demo, prioritize a reliable subset of Jabodetabek journeys with provenance.
