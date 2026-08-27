# Transfer Architecture

## Overview
TRANSUM-IN now supports multi-operator transfers with proper metadata and quality controls.

## Transfer Model

### Schema Fields
- `id`: Unique identifier
- `fromStopId`: Source stop ID
- `toStopId`: Destination stop ID  
- `transferType`: GTFS transfer type (0=timed, 1=recommended, 2=possible, 3=impossible)
- `minTransferTime`: Minimum time required (seconds)
- `fromOperator`: Source operator authority
- `toOperator`: Destination operator authority
- `walkDistance`: Walking distance (meters)
- `estimatedDuration`: Total transfer time (seconds)
- `source`: Transfer generation method (gtfs, proximity, manual, shape_proximity)
- `confidence`: Trust score (0.0-1.0)

## Transfer Generation Methods

### 1. GTFS-Provided
From official GTFS `transfers.txt` file.

### 2. Proximity-Based
Algorithm:
```
For each stop:
  For each other stop in range (300m):
    If distance <= maxWalkDistance:
      Calculate walk duration
      Set minTransferTime = max(300s, walkDuration + 120s)
      Confidence = 1.0 - (distance / maxWalkDistance)
```

### 3. Shape-Based
From GTFS `shapes.txt` points:
```
For each shape:
  Find stops near shape points
  Generate transfers between nearby stops
  Confidence = 0.8
```

## Transfer Quality Controls

### Maximum Walk Distance
Default: 300 meters (5-minute walk)

### Minimum Transfer Time
Default: 300 seconds (5 minutes)
Includes:
- Walking time
- Platform navigation
- Waiting for next service

### Maximum Transfers Per Stop
Default: 3 closest alternatives

## Routing Integration

### Transfer Feasibility Check
```typescript
// Before allowing transfer:
1. Check arrival time + minTransferTime <= next departure
2. Verify walk distance <= maxWalkDistance
3. Validate operator transition (if cross-operator)
4. Confirm service operating hours overlap
```

### Transfer Score
```
TransferScore = walkingTime + waitingTime + operatorPenalty
OperatorPenalty:
  - Same operator: 0
  - Different operator: 300 (encourages intra-operator routes)
```

## Transfer Types

### Same-Operator Transfer (type=2)
Both stops belong to same agency.
- High confidence
- Usually shorter walk times
- No fare transfer complexity

### Cross-Operator Transfer (type=2)
Stops belong to different agencies.
- Moderate confidence (requires validation)
- May require fare re-validation
- Often requires longer walk times

## Data Quality

### Validation Checks
- ✓ Transfer time >= walking time + buffer
- ✓ Distance <= maximum threshold
- ✓ No self-transfers
- ✓ Valid stop IDs

### Confidence Scoring
- GTFS-provided: 1.0
- Proximity-based: 0.7-1.0 (based on distance)
- Shape-based: 0.8

## Current Status
- **Transfers in DB:** 428
- **Source:** Proximity + GTFS (14 from TransJakarta)
- **Coverage:** TransJakarta only
- **Cross-operator:** None yet (pending KAI/MRT/LRT integration)
EOF