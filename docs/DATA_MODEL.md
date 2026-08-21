# Data Model & Governance

## Entities
- **User**: Core account identity.
- **AuthIdentity**: Linked provider credentials (email, Google, Facebook).
- **Agency**: Transit operator (KAI Commuter, TransJakarta).
- **Route**: Service line (KRL Bogor Line, TransJakarta Corridor 1).
- **Stop / Station**: Physical boarding points.
- **Trip & StopTime**: Scheduled movements.
- **SavedPlace / SavedJourney**: User bookmarks.

## Provenance
Every external data ingestion must retain:
- source_url
- fetched_at
- verified_at
- confidence
- effective_from / effective_to
