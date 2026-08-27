# Data Quality Metrics

## TransJakarta Dataset Quality Assessment

### Overall Score: 100/100

### Validation Results
- **Agencies:** 1/1 valid (100%)
- **Routes:** 240/240 valid (100%)
- **Stops:** 8,091/8,091 valid (100%)
- **Trips:** 700/700 valid (100%)
- **Stop Times:** 26,427/26,427 valid (100%)
- **Calendars:** 7/7 valid (100%)
- **Transfers:** 14/14 valid (100%)
- **Shapes:** 242,485/242,485 valid (100%)

### Quality Checks Passed
- ✅ No duplicate IDs
- ✅ No invalid coordinates (all within Jabodetabek bounds)
- ✅ No invalid time formats
- ✅ No orphan records (all references valid)
- ✅ All required GTFS fields present
- ✅ Calendar date ranges valid
- ✅ Shape points sequential

### Coordinate Validation
- Latitude: -6.5 to -5.9 (Jakarta bounds)
- Longitude: 106.4 to 107.1 (Jakarta bounds)
- All 8,091 stops within bounds

### Time Validation
- Arrival/Departure times: Valid GTFS format
- Supports >24:00:00 (next-day trips)
- Sequence monotonic increasing

### Reference Integrity
- All trip.route_id → routes exist
- All stop_times.trip_id → trips exist
- All stop_times.stop_id → stops exist
- All transfers.from_stop_id → stops exist
- All transfers.to_stop_id → stops exist

### Completeness
- 240 routes across BRT, Feeders, Royaltrans, Mikrotrans
- 8,091 stops covering Jakarta + Bodetabek
- 7 service calendars (weekday/weekend/holiday)
- 242,485 shape points for map visualization

### License Compliance
- Source: PPID Transjakarta
- License: CC BY 4.0
- Attribution: "GTFS Static Transjakarta © 2026 oleh PT Transportasi Jakarta"
- Redistribution: Permitted with attribution
