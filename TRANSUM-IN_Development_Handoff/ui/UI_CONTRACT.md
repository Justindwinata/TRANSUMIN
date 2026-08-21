# TRANSUM-IN — UI Contract

## 1. Brand

Canonical product name: **TRANSUM-IN**

Primary language: Bahasa Indonesia.

## 2. Primary navigation

Every authenticated primary screen uses exactly:

1. Beranda
2. Perjalanan
3. Tersimpan
4. Notifikasi
5. Profil

Do not use legacy labels such as Home, Trips, Saved, Alerts, Profile.

## 3. Core journey

`Beranda → Origin → Destination → Search → Opsi Rute → Detail Rute → Map → Perjalanan Aktif`

The product is a journey-understanding app, not a transport-route directory.

The UI should answer, in order:

- dari mana?
- ke mana?
- naik apa?
- turun di mana?
- transit di mana?
- berapa lama?
- bagaimana sampai tujuan?

## 4. Route option card

Each route option communicates:

- total duration
- departure time
- arrival time
- fare or fare availability
- one primary ranking badge
- transport sequence
- walking distance
- transfer count

At most one primary ranking badge per route card:
`Tercepat`, `Minim Jalan`, `Minim Transit`, `Paling Sederhana`, or `Paling Murah`.

Other values stay as metadata.

Never use `Rp 0` as placeholder fare. Use `Tarif tidak tersedia` or an explicitly labeled estimate.

## 5. Transport semantics

MVP:
- KRL
- TransJakarta
- JakLingko / Mikrotrans
- walking
- transfer

The UI must not rely on color alone to identify a mode.

## 6. Map semantics

The map reference includes these concepts:

- origin
- destination
- current location
- station
- stop
- transfer
- walking segment
- transit segment
- recenter
- zoom
- route line

The Stitch map image is only a visual reference. Use a real map provider in production.

## 7. Active trip

Active trip prioritizes:

`SEKARANG → BERIKUTNYA → DESTINATION → ETA`

The current action is always the most prominent information.

## 8. Location permission

GPS is helpful but not a hard requirement for route planning.

Fallback:

`Pilih lokasi manual → Search / Map → set origin or destination`

## 9. System states

Treat these as independent runtime states:

- Loading
- No Route Found
- No Nearby Transit
- Offline
- Location Permission
- API/System Error

The combined Stitch state-board is documentation, not one runtime page.

## 10. Authentication

Login:
- email
- password
- forgot password
- Google
- Facebook

Registration:
- full name
- email
- password
- confirm password
- terms/privacy

Verification and password recovery are application states even when their visual reference is not represented by a dedicated canonical image.

## 11. Saved

The intended information architecture is:

`Tersimpan`
- Tempat
- Rute

Saved places:
- Rumah
- Kantor
- Kampus

Saved routes:
- origin → destination

## 12. Notifications

The intended information architecture is:

`Notifikasi`
- gangguan layanan
- perubahan rute
- keterlambatan
- perjalanan aktif
- informasi umum

A notification may contain:
- title
- time
- severity
- operator/route
- optional action

CTA example:
`Cari rute alternatif`

## 13. Accessibility

For the production mobile implementation:

- minimum interactive target: 48px
- all icon-only actions have accessible labels
- color is not the only semantic signal
- support safe areas and readable text

## 14. Prototype vs production

The Stitch HTML is not the production architecture.

Replace:
- Tailwind CDN
- Google-hosted fonts
- external Stitch images
- placeholder links
- mock map images

with the application's actual implementation.

