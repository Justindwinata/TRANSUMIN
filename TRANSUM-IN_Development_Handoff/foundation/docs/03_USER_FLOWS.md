# TRANSUM-IN — User Flows

## 1. First use

```text
Launch
  ↓
Welcome
  ↓
Onboarding
  ↓
Login / Register
  ↓
Permission decision
  ├─ Allow location → Home with current location
  └─ Deny          → Home with manual-location option
```

## 2. Main journey flow

```text
Beranda
  ↓
Origin
  ↓
Destination
  ↓
Search / choose location
  ↓
Opsi Rute
  ↓
Select route
  ↓
Detail Rute
  ↓
Map
  ↓
Mulai Navigasi
  ↓
Perjalanan Aktif
  ↓
Destination
```

## 3. Search flow

```text
Tap origin/destination
  ↓
Search input
  ↓
Semantic results
  ├─ Landmark
  ├─ Station
  ├─ Stop
  ├─ Saved Place
  └─ Recent Search
  ↓
Select result
  ↓
Set as origin/destination
```

## 4. Map-pick flow

```text
Pilih di Peta
  ↓
Full-screen map
  ↓
Move/center map
  ↓
Selected location
  ↓
Gunakan sebagai titik awal
       OR
Gunakan sebagai tujuan
```

## 5. Route ranking flow

The routing service generates candidate journeys.

The application computes or receives ranking metrics:

```text
duration
walking_distance
transfer_count
fare
simplicity_score
```

Then displays one primary badge per route.

## 6. Transfer flow

A transfer MUST be explicit.

```text
Arrive at current service
  ↓
Get off
  ↓
Walk to transfer point
  ↓
Wait if schedule requires
  ↓
Board next service
```

The UI must not compress this into an opaque “1 transfer” label only.

## 7. Active-trip flow

```text
Selected route
  ↓
Mulai Navigasi
  ↓
SEKARANG
  ↓
Complete current step
  ↓
BERIKUTNYA
  ↓
Update progress
  ↓
Destination
```

## 8. Saved place flow

```text
Save place
  ↓
Name: Rumah / Kantor / Kampus / Custom
  ↓
Tersimpan → Tempat
```

## 9. Saved route flow

```text
Route details
  ↓
Save route
  ↓
Tersimpan → Rute
  ↓
Tap saved route
  ↓
Recalculate current journey
```

A saved route is a reusable origin/destination intent, not a promise that the same schedule will still exist.

## 10. Notification flow

```text
Notifikasi
  ↓
Select disruption
  ↓
Read affected service/route
  ↓
Cari rute alternatif
```

## 11. Failure flows

### Offline

```text
Network unavailable
  ↓
Show offline
  ↓
Allow cached/recent data
  ↓
Retry
```

### No nearby transit

```text
Location resolved
  ↓
No stop/station in walking tolerance
  ↓
Expand search
OR
choose another location
```

### No route

```text
Stops found
  ↓
No feasible journey
  ↓
Suggest:
- more walking
- more transfers
- different mode
- different origin/destination
```
