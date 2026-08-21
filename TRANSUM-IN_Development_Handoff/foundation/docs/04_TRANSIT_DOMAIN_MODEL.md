# TRANSUM-IN — Transit Domain Model

## 1. Important terminology

### Transit operator vs integration brand

Do not model “JakLingko” as if it were a single vehicle operator.

The Jakarta Government describes PT JakLingko Indonesia as a joint venture focused on integrated transport payment/tariff systems across multiple transport entities. TransJakarta separately publishes Mikrotrans routes.

Therefore:

- `agency/operator`: the entity operating the service;
- `service_type`: KRL, TransJakarta BRT, TransJakarta feeder, Mikrotrans, etc.;
- `integration_brand`: JakLingko where applicable;
- `payment_brand`: a separate concern.

For MVP routing, Mikrotrans should be represented as a transit service type in the TransJakarta ecosystem, while “JakLingko” can be used as an integration/branding attribute where appropriate.

Source: https://www.jakarta.go.id/jaklingko
Source: https://transjakarta.co.id/rute

## 2. Canonical entities

### Agency

Represents a service operator or data publisher.

Fields:

- id
- name
- short_name
- authority
- website
- source_url
- feed_url
- last_verified_at

### Route

Represents a service path/line.

Fields:

- id
- agency_id
- short_name
- long_name
- route_type
- service_type
- color
- source_reference
- active_from
- active_to
- status

### Stop

Represents a bus/Mikrotrans boarding point.

Fields:

- id
- agency_id
- name
- lat
- lon
- parent_station_id
- wheelchair_boarding
- source_reference

### Station

Represents a rail station or station complex.

Fields:

- id
- name
- lat
- lon
- operator
- parent_station_id
- accessibility
- facilities
- source_reference

### Trip

A concrete service movement for a route.

Fields:

- id
- route_id
- service_id
- direction_id
- headsign
- departure_pattern

### StopTime

Scheduled arrival/departure at a stop.

Fields:

- trip_id
- stop_id
- arrival_time
- departure_time
- stop_sequence
- pickup_type
- drop_off_type

### Service Calendar

Fields:

- service_id
- monday..sunday
- start_date
- end_date

### Calendar Exception

Fields:

- service_id
- date
- exception_type

### Transfer

Explicit or derived movement between stops/stations.

Fields:

- from_stop_or_station
- to_stop_or_station
- walk_distance_m
- walk_duration_s
- transfer_type
- accessibility_notes
- source
- confidence

### Place

User-facing destination/search entity.

Fields:

- id
- name
- type
- lat
- lon
- address
- source
- confidence

Types:

- landmark
- station
- stop
- address
- saved_place

### Journey

A calculated end-to-end trip.

Fields:

- origin
- destination
- requested_departure_time
- requested_arrival_time
- total_duration_s
- walking_distance_m
- transfer_count
- fare
- ranking
- segments

### Journey Segment

A segment is one actionable movement.

Types:

- WALK
- TRANSIT
- TRANSFER
- WAIT

## 3. GTFS alignment

Where official GTFS exists, map the canonical model to GTFS:

- agency.txt
- routes.txt
- stops.txt
- trips.txt
- stop_times.txt
- calendar.txt
- calendar_dates.txt
- shapes.txt
- fare-related files when available

Do not invent GTFS data to fill missing fields.

GTFS reference:
https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md

## 4. Additional internal fields

The application should retain:

- source;
- source_url;
- source_version;
- fetched_at;
- validated_at;
- confidence;
- effective_from;
- effective_to.

This enables auditability and prevents stale data from being silently treated as current.
