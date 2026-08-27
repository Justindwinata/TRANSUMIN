# Transit Coverage Status

## Jabodetabek Operators

### TransJakarta
- **Status:** SUPPORTED
- **Data Type:** Real Official GTFS Static
- **Source:** PPID Transjakarta (CC BY 4.0)
- **Ingestion Date:** 2026-08-27
- **Routes:** 240 (BRT, feeders, Mikrotrans)
- **Stops:** 8,091
- **Trips:** 700
- **Coverage:** Jakarta, Bodetabek suburbs
- **Graph Nodes:** 8,091
- **Graph Edges:** 25,741
- **Routing:** Active

### KAI Commuter
- **Status:** SOURCE VERIFIED
- **Data Type:** Not publicly available as GTFS
- **Source:** https://www.kai.id
- **Routes:** 6 (Jabodetabek lines)
- **Coverage:** Bogor, Depok, Tangerang, Bekasi
- **Recommendation:** Direct operator engagement for data partnership

### MRT Jakarta
- **Status:** SOURCE VERIFIED
- **Data Type:** Not publicly available as GTFS
- **Source:** https://www.jakartamrt.co.id
- **Lines:** 7
- **Stations:** 78
- **Coverage:** Jakarta central corridors
- **Recommendation:** Direct operator engagement for data partnership

### LRT Jakarta
- **Status:** SOURCE VERIFIED
- **Data Type:** Not publicly available as GTFS
- **Source:** https://www.jartrans.com
- **Lines:** 6
- **Stations:** 100+
- **Coverage:** Jakarta elevated/grade-separated rail
- **Recommendation:** Direct operator engagement for data partnership

### LRT Jabodebek
- **Status:** SOURCE VERIFIED
- **Data Type:** Not publicly available as GTFS
- **Source:** https://www.lrt.co.id
- **Lines:** 4
- **Coverage:** Bogor, Depok, Bekasi, Tangerang, Serpong
- **Recommendation:** Direct operator engagement for data partnership

### Airport Rail (Railink)
- **Status:** SOURCE VERIFIED
- **Data Type:** Not publicly available as GTFS
- **Source:** https://www.railink.co.id
- **Coverage:** Jakarta Manggarai to Bandara Sokarno-Hatta
- **Recommendation:** Direct operator engagement for data partnership

### JakLingko / Mikrotrans
- **Status:** PARTIAL
- **Data Type:** Proprietary APIs only
- **Coverage:** Micro-mobility within Jakarta
- **Note:** TransJakarta Mikrotrans data included in main BRT feed

## Summary

| Operator | Coverage | Real GTFS | Graph Active | Routing |
|----------|----------|----------|--------------|---------|
| TransJakarta | ✓ | ✓ | ✓ | ✓ |
| KAI Commuter | ✓ | ✗ | ✗ | ✗ |
| MRT Jakarta | ✓ | ✗ | ✗ | ✗ |
| LRT Jakarta | ✓ | ✗ | ✗ | ✗ |
| LRT Jabodebek | ✓ | ✗ | ✗ | ✗ |
| Airport Rail | ✓ | ✗ | ✗ | ✗ |
| JakLingko | Partial | ✗ | ✗ | ✗ |

## Next Steps

1. Pursue direct operator data partnerships for KAI, MRT, LRT
2. Implement inter-operator transfer edges when data available
3. Add GTFS-RT support for real-time vehicle locations
4. Expand to other Jabodetabek municipalities
