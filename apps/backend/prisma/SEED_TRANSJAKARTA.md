# Seed: TransJakarta Real Data

This file documents the initial seed data for TRANSUM-IN Phase 16.

## Data Source
- **Operator:** TransJakarta
- **License:** CC BY 4.0
- **Source:** https://ppid.transjakarta.co.id/informasi/berkala/gtfs
- **Download Date:** 2026-08-27
- **SHA256:** [checksum stored in DatasetVersion.provenanceJson]

## Database Seed

### Agencies
```sql
INSERT INTO agencies (id, name, short_name, authority, website) 
VALUES ('transjakarta-agency-Tije', 'Transjakarta', 'Tije', 'transjakarta', 'https://transjakarta.co.id/');
```

### Routes
240 routes covering:
- BRT (Transjakarta Express)
- Angkutan Pengumpan (Feeders)
- Royaltrans
- Wisata
- Mikrotrans (JAK01-JAK99 series)

### Stops
8,091 stops across:
- Jakarta (main city)
- Bogor, Depok, Bekasi (Bodetabek suburbs)
- Tangerang, Serpong

### Trips
700 trips across all routes with:
- Regular service
- Express service (Royaltrans)
- Circular routes

### Calendar
7 service calendars:
- Weekday service
- Weekend service
- Public holiday service
- Special event calendars

### Transfers
14 transfer points:
- Key interchange stations
- BRT to BRT connections

## Quality Metrics
- **Duplicate IDs:** 0
- **Invalid Coordinates:** 0
- **Invalid Times:** 0
- **Orphans:** 0

## Graph Statistics
- Nodes: 8,091
- Ride Edges: 25,727
- Transfer Edges: 14
- Connected Nodes: 7,823 (96.7%)
