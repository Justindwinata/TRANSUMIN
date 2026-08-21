# TRANSUM-IN — Research Source Registry

Verified/consulted on 2026-08-21.

| Source | Purpose |
|---|---|
| https://transjakarta.co.id/rute | Current TransJakarta route directory, including BRT, feeder, Mikrotrans, and Transjabodetabek listings |
| https://transjakarta.co.id/layanan/brt | BRT service/routing reference |
| https://www.commuterline.id/ | KAI Commuter official service, schedule, fare, route entry point |
| https://commuterline.id/files/download/documents/Pedoman-Naik-KRL-KAI-Commuter_compressed.pdf | Official KRL Jabodetabek/Merak route map and service-pattern reference |
| https://www.jakarta.go.id/jaklingko | Jakarta Government explanation of JakLingko as integrated transport payment/tariff platform |
| https://gtfs.transjakarta.co.id/files/file_gtfs.zip | Official TransJakarta GTFS feed endpoint |
| https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md | Current GTFS specification reference |

## Important interpretation

JakLingko should not be modeled as a single universal vehicle operator. The Jakarta Government describes PT JakLingko Indonesia primarily as an integrated payment/tariff system entity, while TransJakarta publishes Mikrotrans routes as services.

For routing, represent the actual service/operator separately from the integration/branding layer.
