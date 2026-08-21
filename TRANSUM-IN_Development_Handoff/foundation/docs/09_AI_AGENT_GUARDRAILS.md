# TRANSUM-IN — AI Coding Agent Guardrails

## 1. Role

The coding agent is implementing a real product, not generating a visual mockup.

Prioritize:

1. correctness;
2. explainability;
3. maintainability;
4. testability;
5. source traceability;
6. UX fidelity.

## 2. Source hierarchy

When files disagree:

1. official transit source;
2. project foundation docs;
3. canonical UI handoff;
4. prototype examples.

Never use a Stitch screenshot to override an official transit fact.

## 3. Never invent transit facts

Do not fabricate:

- stations;
- stops;
- route numbers;
- route ordering;
- schedules;
- fares;
- service windows;
- transfer points;
- accessibility facilities.

Use `unknown` or `not_available` where necessary.

## 4. UI implementation

Do not copy Stitch HTML directly.

Rebuild the UI using native components and the chosen mobile framework.

Keep:

- information hierarchy;
- navigation;
- copy meaning;
- state behavior;
- spacing tokens;
- semantic colors.

## 5. Domain modeling

Do not collapse:

- station into stop;
- operator into integration brand;
- route into trip;
- journey into route;
- transfer into transit segment.

These distinctions are central to the routing engine.

## 6. Data ingestion

Every external dataset should be:

- versioned;
- validated;
- attributable;
- reproducible.

Do not mutate raw source files.

Use a raw → normalized → application model pipeline.

## 7. Testing

At minimum:

### Unit

- coordinate/proximity utilities;
- route ranking;
- transfer generation;
- fare handling;
- schedule selection.

### Integration

- feed import;
- database integrity;
- journey search;
- route response contract.

### End-to-end

- origin/destination search;
- route comparison;
- route detail;
- active trip;
- error states.

## 8. Performance

Do not sacrifice correctness for premature optimization.

Profile before optimizing.

## 9. Security

Protect:

- authentication tokens;
- saved places;
- user location history;
- notification preferences.

User location is sensitive operational data and must not leak in logs.

## 10. Documentation

Every major technical decision should be documented.

At least:

- ADR or decision log;
- data source notes;
- API contract changes;
- routing assumptions;
- known limitations.

## 11. Commit discipline

Use meaningful commits.

Examples:

- `feat(data): ingest TransJakarta GTFS feed`
- `feat(routing): add walking access graph`
- `test(routing): cover transfer timing`
- `fix(api): reject stale schedule response`

Do not create filler commits to satisfy a count.

## 12. MVP discipline

Do not implement payment, social, marketplace, or extra operators merely because a screen can accommodate them.

Stay within the defined MVP.
