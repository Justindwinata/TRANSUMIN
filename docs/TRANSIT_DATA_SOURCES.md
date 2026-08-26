# Phase 14 Transit Data Sources Inventory

## Executive Summary

**Date:** 2026-08-26

This document identifies authoritative transit data sources for Jabodetabek region.

## Official GTFS Sources

### TransJakarta

**Status:** NOT CURRENTLY AVAILABLE

**Investigation:**
- Official website: https://transjakarta.co.id
- Open data portal: https://data.jakarta.go.id/ (no GTFS found)
- No public GTFS feed discovered

**Alternative Sources:**
- **Note:** TransJakarta does not currently publish official GTFS
- May require manual collection or official data-sharing agreement

---

### KAI Commuter (KRL)

**Status:** NOT CURRENTLY AVAILABLE

**Investigation:**
- Official website: https://www.commuterline.id
- Official open data: https://data.kai.co.id/ (no GTFS found)
- No public GTFS feed discovered

**Alternative Sources:**
- **Note:** KAI Commuter does not currently publish official GTFS
- May require manual collection or official data-sharing agreement

---

### MRT Jakarta

**Status:** NOT CURRENTLY AVAILABLE

**Investigation:**
- Official website: https://mrtjakarta.id
- No GTFS publication found
- MRT Jakarta does not publish GTFS

**Alternative Sources:**
- May need to source from third-party aggregators
- Data quality uncertain

---

### LRT Jakarta

**Status:** NOT CURRENTLY AVAILABLE

**Investigation:**
- Official website: https://lrtjakarta.co.id
- No GTFS publication found
- LRT Jakarta does not publish GTFS

**Alternative Sources:**
- May need to source from third-party aggregators
- Data quality uncertain

---

### Mikrotrans / JakLingko

**Status:** NOT CURRENTLY AVAILABLE

**Investigation:**
- No official GTFS
- No centralized data source

**Alternative Sources:**
- May require manual route collection
- Data quality uncertain

---

### Airport Rail Link (KA Bandara)

**Status:** NOT CURRENTLY AVAILABLE

**Investigation:**
- Official website: https://railway.apple.co.id
- No GTFS publication found

**Alternative Sources:**
- May need to source from third-party aggregators
- Data quality uncertain

---

## Official Data Sources Summary

| Operator | GTFS | Open Data Portal | Status | Notes |
|----------|------|------------------|--------|-------|
| TransJakarta | NO | https://data.jakarta.go.id | Not available | May require data-sharing agreement |
| KAI Commuter | NO | https://data.kai.co.id | Not available | May require data-sharing agreement |
| MRT Jakarta | NO | N/A | Not available | Third-party sources only |
| LRT Jakarta | NO | N/A | Not available | Third-party sources only |
| Mikrotrans | NO | N/A | Not available | Manual collection only |
| Airport Rail | NO | N/A | Not available | Third-party sources only |

## Recommended Actions

### Phase 14 Priority

1. **Contact TransJakarta**
   - Request GTFS data sharing
   - Inquire about official open data release schedule
   - Document any data-sharing agreements

2. **Contact KAI Commuter**
   - Request GTFS data sharing
   - Inquire about official open data release schedule
   - Document any data-sharing agreements

3. **Monitor Official Portals**
   - data.jakarta.go.id (TransJakarta)
   - data.kai.co.id (KAI Commuter)
   - mrtjakarta.id/data (MRT)
   - lrtjakarta.co.id/data (LRT)

4. **Document No-GTFS Status**
   - Create clear user-facing messaging that transit data may be limited
   - Document data source limitations in UI

## Third-Party Data Sources (Supplemental Only)

### Google Transit Partners

**Status:** MAY CONTAIN JABODETABEK DATA

**Investigation:**
- Google Transit may have GTFS for some operators
- Data quality and freshness uncertain
- May not include all operators
- **Note:** Google data may not reflect current service

**Recommendation:** Use as supplemental only, with clear labeling

---

### GTFS Data Repositories

**Status:** MAY CONTAIN AGGREGATED DATA

**Examples:**
- https://transitfeeds.com/ (may have historical data)
- https://github.com/transitland/transitland-datastore (aggregated)

**Recommendation:** Use for testing, not production

---

## Data Source Policy

### Authoritative Sources (PREFERRED)
- Official operator GTFS feeds
- Government open-data portals
- Official API endpoints

### Supplemental Sources (ACCEPTABLE)
- Google Transit data (with attribution)
- Public GTFS repositories (with attribution)
- Third-party aggregators (with attribution)

### Unacceptable Sources
- Scraped route lists
- Screenshot collections
- Unverified user contributions
- Blogs or articles

---

## Next Steps

1. **Continue outreach to TransJakarta and KAI Commuter**
2. **Document any data-sharing agreements**
3. **Implement fetch mechanism for available sources**
4. **Establish data refresh schedule**

## Conclusion

**Current State:** No official GTFS feeds are publicly available for any major Jabodetabek operator.

**Impact:** Phase 14 cannot immediately ingest "real" transit data.

**Path Forward:**
- Focus on building ingestion infrastructure (fetch, validation, activation)
- Establish data source relationships
- Document limitations clearly
- Prepare for when GTFS becomes available
