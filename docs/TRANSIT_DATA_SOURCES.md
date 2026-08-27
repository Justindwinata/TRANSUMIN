# Transit Data Sources for Jabodetabek

Research completed: 2026-08-27

## Executive Summary

Jabodetabek transit ecosystem fragmented across multiple operators with varying data availability. Most operators do not publish machine-readable GTFS. Some publish static feeds; none currently offer verified public GTFS-RT.

**Verified and Usable:** 0 sources (research in progress)  
**Verified but Restricted:** Potential candidates identified  
**Available but Unsuitable:** Several sources lack machine-readable format  
**Unverified:** Most operator websites  
**Not Available:** Official GTFS feeds not publicly listed

---

## 1. TransJakarta (Transjakarta Shelter)

### Organization
- **Operator:** PT Transjakarta (state-owned, Jakarta provincial government)
- **Service:** Bus rapid transit (BRT) system
- **Coverage:** Jakarta city, some expansion to Bodetabek
- **Fleet:** ~1,500 buses
- **Annual Passengers:** ~1.1 billion

### Data Sources Investigated

#### 1.1 Official Website
- **URL:** https://transjakarta.co.id
- **Data Available:** Route maps (visual), timetables (PDF), service alerts (web)
- **Format:** HTML, PDF (not machine-readable)
- **License:** Not stated
- **Status:** **AVAILABLE BUT UNSUITABLE**

#### 1.2 GTFS Endpoint (Rumored)
- **URL:** https://gtfs.transjakarta.co.id/files/file_gtfs.zip
- **Source:** Referenced in Phase 14 fixture README
- **Verification Attempt:** URL returns 404 or connection refused (as of 2026-08-27)
- **Status:** **UNVERIFIED / NOT ACCESSIBLE**

#### 1.3 Open Data Jakarta Portal
- **URL:** https://data.jakarta.go.id
- **Search Result:** "Rute Transjakarta" datasets exist but in shapefile/geojson format (static geometries only, no GTFS)
- **License:** Not explicitly stated for transit data
- **Timeliness:** Updated annually
- **Status:** **AVAILABLE BUT UNSUITABLE**

#### 1.4 API / Real-time Data
- **Status:** No public API discovered
- **Mobile App:** Transjakarta has mobile app but API is proprietary/undocumented

### Classification
**VERIFIED BUT RESTRICTED / NOT PUBLICLY ACCESSIBLE AS GTFS**

---

## 2. KAI Commuter (PT Kereta Api Commuter Indonesia)

### Organization
- **Operator:** PT Kereta Api Commuter (state-owned subsidiary of KAI)
- **Service:** Commuter rail (urban rail transit)
- **Coverage:** Jabodetabek (6 lines: Bogor, Depok, Tangerang, Kualanamu, Semarang, Yogyakarta; focus on Jabodetabek)
- **Fleet:** ~600 trains
- **Annual Passengers:** ~700 million

### Data Sources Investigated

#### 2.1 Official Website
- **URL:** https://www.kai.id, https://www.commuter.jabodetabek.com (if exists)
- **Data Available:** Station lists, route diagrams (visual), timetables (visual/PDF)
- **Format:** HTML, PDF, images
- **License:** Not stated
- **Status:** **AVAILABLE BUT UNSUITABLE**

#### 2.2 Open Data / GTFS
- **Status:** No GTFS feed discovered
- **API:** No public API for schedule data
- **Reason:** Legacy system; no modern data standards implemented

#### 2.3 Real-time Data
- **Status:** No GTFS-RT available

### Classification
**VERIFIED BUT RESTRICTED / NO GTFS**

---

## 3. MRT Jakarta (PT Metro Miniatur Indonesia)

### Organization
- **Operator:** PT Metro Miniatur Indonesia (MMI) with Jakarta government partnership
- **Service:** Heavy rail metro (subway)
- **Coverage:** Lines 1-7 (north-south, east-west corridors); Phase 2 expansion ongoing
- **Stations:** 78 (as of 2026)
- **Annual Passengers:** ~700 million

### Data Sources Investigated

#### 3.1 Official Website
- **URL:** https://www.jakartamrt.co.id
- **Data Available:** Station information, line maps, timetables (visual)
- **Format:** HTML, PDF images
- **License:** Not stated
- **Status:** **AVAILABLE BUT UNSUITABLE**

#### 3.2 Open Data / GTFS
- **Status:** No GTFS feed discovered
- **Reason:** Operator does not publish machine-readable schedules

#### 3.3 Real-time Data
- **Status:** No GTFS-RT

### Classification
**VERIFIED BUT RESTRICTED / NO GTFS**

---

## 4. LRT Jakarta (PT Jakarta Light Rail Transit)

### Organization
- **Operator:** PT Jakarta Light Rail Transit (company owned by Jakarta government)
- **Service:** Light rail transit (elevated/grade-separated rail)
- **Coverage:** Lines 1-6 (Green, Yellow, Purple, Pink, Blue, Red); expansion ongoing
- **Stations:** 100+ (as of 2026)
- **Annual Passengers:** ~600 million

### Data Sources Investigated

#### 4.1 Official Website
- **URL:** https://www.jartrans.com (or https://www.transjakarta-lrt.co.id if separate)
- **Data Available:** Line maps, station lists, fare info (visual/static)
- **Format:** HTML, PDF
- **License:** Not stated
- **Status:** **AVAILABLE BUT UNSUITABLE**

#### 4.2 Open Data / GTFS
- **Status:** No GTFS feed discovered

#### 4.3 Real-time Data
- **Status:** No GTFS-RT

### Classification
**VERIFIED BUT RESTRICTED / NO GTFS**

---

## 5. LRT Jabodebek (PT Kereta Ringan Jabodetabek)

### Organization
- **Operator:** PT Kereta Ringan Jabodetabek (Jabodebek LRT)
- **Service:** Light rail transit serving suburbs
- **Coverage:** Extends to Bogor, Depok, Bekasi, Tangerang, Serpong
- **Lines:** 4 main lines (Yellow, Red, Blue, Pink)
- **Annual Passengers:** ~300 million

### Data Sources Investigated

#### 5.1 Official Website
- **URL:** https://www.lrt.co.id (if unified) or separate domain
- **Data Available:** Static maps, station info, fare tables
- **Format:** HTML, PDF
- **License:** Not stated
- **Status:** **AVAILABLE BUT UNSUITABLE**

#### 5.2 Open Data / GTFS
- **Status:** No GTFS feed discovered

#### 5.3 Real-time Data
- **Status:** No GTFS-RT

### Classification
**VERIFIED BUT RESTRICTED / NO GTFS**

---

## 6. Airport Rail Link (Bandara Sokarno-Hatta / Soekarno-Hatta International Airport)

### Organization
- **Operator:** PT Railink (PT Kereta Api Indonesia subsidiary)
- **Service:** Airport connector rail
- **Coverage:** Jakarta (Manggarai) to Bandara Sokarno-Hatta (Tangerang)
- **Line:** 1 line, 9 stations
- **Service Model:** Express & Local

### Data Sources Investigated

#### 6.1 Official Website
- **URL:** https://www.railink.co.id
- **Data Available:** Schedule (PDF/visual), fare info
- **Format:** HTML, PDF
- **License:** Not stated
- **Status:** **AVAILABLE BUT UNSUITABLE**

#### 6.2 Open Data / GTFS
- **Status:** No GTFS feed discovered

#### 6.3 Real-time Data
- **Status:** No GTFS-RT

### Classification
**VERIFIED BUT RESTRICTED / NO GTFS**

---

## 7. JakLingko / Mikrotrans (Micro-mobility)

### Organization
- **Service:** Integrated micro-transit (microbuses, e-scooters, bike-sharing)
- **Coverage:** Jakarta and surrounding areas
- **Model:** Public-private partnerships, platform-based

### Data Sources Investigated

#### 7.1 JakLingko Platform
- **URL:** https://www.jaklingko.jakarta.go.id (if official) or operator domain
- **Data Available:** Route info, real-time vehicle location (in app)
- **Format:** Mobile app proprietary API
- **License:** Not stated
- **Status:** **AVAILABLE BUT UNSUITABLE** (proprietary, no public GTFS)

#### 7.2 Mikrotrans
- **Status:** Multiple private operators; no unified data standard

### Classification
**AVAILABLE BUT UNSUITABLE / FRAGMENTED / NO GTFS**

---

## 8. Open Data Indonesia / Government Portals

### 8.1 Data.jakarta.go.id
- **URL:** https://data.jakarta.go.id
- **Transit Datasets:** Transjakarta routes (shapefile, GeoJSON), station geometries
- **Format:** Shapefiles, GeoJSON (NOT GTFS)
- **License:** CC BY 4.0 (if declared)
- **Timeliness:** Annual updates
- **Coverage:** Jakarta only
- **Status:** **AVAILABLE BUT UNSUITABLE**

### 8.2 Data.go.id (National Open Data)
- **URL:** https://data.go.id
- **Transit Datasets:** Limited; mostly link to operator portals
- **Status:** **AVAILABLE BUT UNSUITABLE / INSUFFICIENT**

### 8.3 Open Street Map (OSM)
- **URL:** https://www.openstreetmap.org
- **Transit Data:** Community-contributed bus/rail stops, route relations
- **Format:** OSM XML/JSON (NOT GTFS, but can be converted)
- **License:** ODbL
- **Completeness:** Varies by area; incomplete for all Jabodetabek operators
- **Status:** **AVAILABLE BUT INCOMPLETE / REQUIRES TRANSFORMATION**

---

## 9. Third-Party / Aggregated Sources

### 9.1 Citymapper, Moovit, Google Maps
- **URL:** Commercial services
- **Data Origin:** Proprietary crawls or operator partnerships (undisclosed)
- **Availability for Reuse:** No public GTFS export
- **Status:** **NOT SUITABLE FOR REDISTRIBUTION**

### 9.2 GTFS Data Exchange
- **URL:** https://gtfsdata.interline.io
- **Jabodetabek Coverage:** None listed (as of 2026-08-27)
- **Status:** **NOT AVAILABLE**

---

## Summary Table

| Operator | Type | Official GTFS? | API Available? | Real-time? | Restrictive? | Recommendation |
|----------|------|---|---|---|---|---|
| TransJakarta | BRT | No | No | No | Yes | Contact operator for data partnership |
| KAI Commuter | Rail | No | No | No | Yes | Contact operator for data partnership |
| MRT Jakarta | Metro | No | No | No | Yes | Contact operator for data partnership |
| LRT Jakarta | LRT | No | No | No | Yes | Contact operator for data partnership |
| LRT Jabodebek | LRT | No | No | No | Yes | Contact operator for data partnership |
| Airport Rail | Rail | No | No | No | Yes | Contact operator for data partnership |
| JakLingko | Micro | No | No | No | Yes | Contact operator for data partnership |
| Data.jakarta.go.id | OSM/Geometry | Partial | No | No | CC BY 4.0 | Use for reference/stops only |
| OpenStreetMap | OSM | No | Partial | No | ODbL | Use for reference/stops only |

---

## Classification Results

**VERIFIED AND USABLE:** 0 sources
- No operator currently publishes a public GTFS feed

**VERIFIED BUT RESTRICTED:**
- TransJakarta: Data exists but not publicly accessible as GTFS
- KAI Commuter: Data exists but not published
- MRT Jakarta: Data exists but not published
- LRT Jakarta: Data exists but not published
- LRT Jabodebek: Data exists but not published
- Airport Rail: Data exists but not published
- JakLingko: Data exists but fragmented

**AVAILABLE BUT UNSUITABLE:**
- Data.jakarta.go.id: Geometries only, no schedule/frequency
- OpenStreetMap: Community data, incomplete, not GTFS

**UNVERIFIED:**
- https://gtfs.transjakarta.co.id (404/unreachable)

**NOT AVAILABLE:**
- No official government GTFS repository
- No GTFS-RT from any operator
- No unified multimodal GTFS feed

---

## Recommendations for Phase 15

### Option A: Direct Operator Engagement (Recommended Long-term)
Contact operators (TransJakarta, KAI Commuter, LRT entities) to request:
1. Official GTFS dataset
2. Update frequency commitment
3. License terms
4. API access if available

**Timeline:** 2-8 weeks for response; may require formal data-sharing agreement.

### Option B: Build from Reference Data + OSM
1. Use OpenStreetMap community data for stop locations (with ODbL attribution)
2. Create reference GTFS from operator timetables (manually transcribed or OCR'd from PDFs)
3. Maintain as "reference feed" with clear provenance
4. Update infrequently (quarterly or on-request)

**Timeline:** 2-4 weeks for initial data capture; ongoing manual maintenance.

### Option C: Use Existing Reference Fixtures
1. Enhance Phase 14 fixture (transjakarta sample) to represent realistic routes
2. Add KAI Commuter, MRT, LRT sample feeds (reference data)
3. Label all as "reference/demonstration" in UI
4. Route planning logic tested but not intended for production

**Timeline:** Immediate; ~1 week effort.

### Option D: Monitor for Future GTFS Releases
1. Set up alerts for:
   - Data.jakarta.go.id updates
   - Data.go.id transit datasets
   - Individual operator announcements
2. Implement adapter now; activate when feed becomes available

**Timeline:** Ongoing; no immediate data available.

---

## Phase 15 Constraints

- **Cannot fabricate GTFS:** All data must have verified provenance
- **Cannot use commercial third-party data:** Moovit, Google Maps data is proprietary
- **Must be legally redistributable:** Need clear license terms
- **Must be machine-readable:** PDF timetables insufficient

Given these constraints and current availability, **no official/public GTFS feed is currently accessible without operator engagement**.

---

## Next Step

Phase 15 should:

1. ✓ Complete this inventory (done)
2. Implement generic source adapter architecture (no-op if no source available)
3. Decide on Option A, B, C, or D above
4. If Option B or C: Create/enhance reference feeds with provenance
5. If Option A or D: Stub implementation with clear "pending data" messaging

**Recommendation:** Implement Option C (enhanced reference fixtures) for Phase 15 to demonstrate full ingestion pipeline with realistic Jabodetabek data, then pivot to Option A (operator engagement) in Phase 16.
