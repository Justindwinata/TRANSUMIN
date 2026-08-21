# System Architecture — TRANSUM-IN

## High-Level Diagram

```text
+-------------------------------------------------------------+
|                      Flutter Mobile App                     |
|                                                             |
|  [ Presentation (UI / Riverpod) ]                           |
|  [ Domain (Entities / UseCases) ]                           |
|  [ Data (Repositories / ApiClient / Storage) ]              |
+------------------------------+------------------------------+
                               | HTTPS / JSON
                               v
+-------------------------------------------------------------+
|                        NestJS Backend                       |
|                                                             |
|  [ Auth Module (JWT / OAuth Adapters) ]                     |
|  [ Transit Domain Module (Agencies, Routes, Stops) ]         |
|  [ Routing Module (Multimodal Pathing Engine Foundation) ]  |
|  [ User/Saved Module (Saved Places & Routes) ]              |
|  [ Health Module (Monitoring & Status) ]                    |
+------------------------------+------------------------------+
                               | Prisma ORM
                               v
+-------------------------------------------------------------+
|                    PostgreSQL Database                      |
|                                                             |
|  Users, AuthIdentities, Agencies, Routes, Stops, Stations,  |
|  Trips, StopTimes, Transfers, SavedPlaces, SavedJourneys    |
+-------------------------------------------------------------+
```

## Architectural Decoupling

1. **Mobile Application**: Clean Architecture with strict layer separation. No direct SQL or raw HTTP calls from UI screens.
2. **Backend API**: Feature-based NestJS modules exposing domain-driven REST API endpoints.
3. **Data Layer**: Prisma ORM with strict migration control and strong TypeScript typing.
4. **Map Provider**: Abstracted map layer in Flutter to easily substitute Google Maps, Mapbox, or OpenStreetMap.
