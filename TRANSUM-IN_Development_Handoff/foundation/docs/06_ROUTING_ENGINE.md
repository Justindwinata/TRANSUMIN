# TRANSUM-IN — Routing Engine Specification

## 1. Routing problem

Input:

- origin coordinate
- destination coordinate
- departure/arrival preference
- enabled modes
- walking tolerance
- accessibility constraints
- optimization preference

Output:

multiple feasible journey alternatives.

## 2. Core constraints

A route is valid only if:

- origin can reach a usable transit stop/station within the user's walking tolerance;
- each transit segment is temporally feasible;
- transfers are physically plausible;
- destination can be reached from the final stop/station;
- service calendars allow the selected trip;
- disabled modes are not used.

## 3. Recommended initial architecture

### Layer A — place/road access

Responsible for:

- origin snapping;
- destination snapping;
- walking paths;
- walking distances;
- nearby transit search.

### Layer B — transit graph

Nodes:

- stops;
- stations;
- platform/stop variants when required.

Edges:

- ride;
- transfer;
- walk;
- wait.

### Layer C — time-dependent routing

Start with a correct, testable time-dependent graph search.

A practical first version can use time-dependent Dijkstra/A* over a multimodal graph.

Do not optimize prematurely.

### Layer D — ranking

Candidate journeys are ranked by:

- earliest arrival / total duration;
- walking distance;
- transfers;
- fare when trustworthy;
- simplicity.

## 4. Optimization profiles

### FASTEST

Primary:
minimum total travel time.

Tie-break:
fewer transfers, then less walking.

### LEAST_WALKING

Primary:
minimum walking distance.

Secondary:
total duration.

### LEAST_TRANSFERS

Primary:
minimum number of transfers.

Secondary:
total duration.

### SIMPLEST

A weighted score should penalize:

- transfers;
- long walking;
- confusing service changes;
- excessive waits.

### CHEAPEST

Use only when fare data is sufficiently trustworthy.

If fare is unavailable, do not falsely rank a journey as cheapest.

## 5. Transfer generation

A transfer edge may be:

- explicit from source data;
- inferred from station/stop proximity;
- manually validated.

Never infer a transfer solely from similar names.

Minimum fields:

- from node
- to node
- distance_m
- estimated_walk_s
- accessibility
- confidence
- source

## 6. Walking tolerance

Default should be configurable.

Reference values for UI:

- 300m
- 500m
- 800m
- 1km
- 2km+

The routing engine should use meters internally.

## 7. Route alternatives

Avoid returning duplicate routes that differ only by internal trip ID.

Deduplicate by meaningful journey structure:

- sequence of modes;
- service identities;
- transfer points;
- meaningful time differences.

## 8. Explainability requirement

Every returned journey must be explainable as ordered segments.

Example:

```text
WALK
450m
to Stasiun UI

TRANSIT
KRL
direction: Jakarta Kota
alight: Stasiun Juanda

TRANSFER
180m walk
to Halte Juanda

TRANSIT
TransJakarta
Koridor 1
direction: Blok M

WALK
250m
to destination
```

The mobile UI must never have to reconstruct the journey from opaque IDs.

## 9. Future optimization

After correctness is established, consider:

- RAPTOR for transit routing;
- Connection Scan Algorithm;
- contraction/indexing;
- route/station caching;
- precomputed transfer graph;
- tile/geometry caching.

Correctness comes before algorithmic sophistication.
