# Transit Data Ingestion Security

## Overview
Transit data ingestion processes external input and requires strict security controls.

## Threat Model

### SSRF Protection
- URL whitelist enforcement
- HTTPS-only requirement
- Redirect following disabled (or limited)
- Domain allowlist: `ppid.transjakarta.co.id`

### Archive Safety
- Path traversal prevention
- Zip bomb detection (file size limits)
- Archive structure validation
- No arbitrary file extraction

### File Handling
- Content type verification
- File size limits (500MB default)
- Temporary file cleanup
- No code execution in extracted files

### Data Validation
- Coordinate bounds (Jabodetabek)
- Time format validation
- ID uniqueness enforcement
- Foreign key integrity checks

## Security Controls

### 1. Source URL Validation
```typescript
- Protocol: HTTPS only
- Hostname: Whitelisted operators
- Redirect: Limited/monitored
- Port: Standard ports only
```

### 2. Archive Extraction
```typescript
- Sanitize filenames
- Prevent path traversal
- Check extraction size
- Validate archive integrity
```

### 3. Data Validation
```typescript
- GTFS field validation
- Coordinate range checks
- Time format validation
- Reference integrity
```

### 4. Database Safety
```typescript
- Transaction rollback on error
- Foreign key constraints
- Index uniqueness enforcement
- Null safety
```

## Verified Sources

### TransJakarta (Verified)
- URL: https://ppid.transjakarta.co.id/informasi/berkala/gtfs
- License: CC BY 4.0
- Status: Safe for automated retrieval

### KAI Commuter (Unverified)
- Status: Requires manual verification
- Recommendation: Contact operator first

## Audit Trail

### Provenance Tracking
- Source URL logged
- Retrieval timestamp
- Checksum verification
- Artifact storage

### Data Quality Logging
- Validation errors/warnings
- Rejection reasons
- Record counts

## Recommendations

1. Never run ingestion with elevated privileges
2. Use separate database user with minimal permissions
3. Enable database query logging for audit
4. Monitor ingestion for anomalies
5. Regular backup before ingestion

## Compliance

- GTFS specification compliance
- CC BY 4.0 attribution
- Data minimization (only required fields)
- No personal data ingestion
