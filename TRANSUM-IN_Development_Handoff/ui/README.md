# TRANSUM-IN — Mobile UI Reference Handoff

## Purpose

This package is a **cleaned UI/UX reference package** for implementing the TRANSUM-IN mobile application.

It is intentionally smaller than the original Stitch export. The original ZIP contained multiple generations of the same screen. This package keeps only the canonical screen selected for implementation.

## What is canonical here

The implementation reference consists of:

- `DESIGN.md` — canonical visual design system.
- `screens/*/screen.png` — canonical visual screen reference.
- `screens/*/screen.html` — Stitch-generated prototype HTML used only to inspect layout/content structure.
- `UI_CONTRACT.md` — product/navigation/interaction rules that developers must follow.
- `SCREEN_MANIFEST.md` — exact screen list and intended flow.
- `KNOWN_GAPS.md` — items intentionally documented instead of being invented from incomplete Stitch exports.

## Important implementation rule

The Stitch HTML is **not production application code**.

Do not directly port:
- Tailwind CDN
- Google Fonts CDN
- remote Stitch image URLs
- placeholder `href="#"` navigation
- screenshot/mock-map assets as the real map implementation

Use the HTML only as a visual/layout reference. Production behavior must be implemented natively in the chosen mobile stack.

## Canonical product flow

Welcome
→ Onboarding
→ Login/Register
→ Beranda
→ Origin
→ Destination
→ Search
→ Opsi Rute
→ Detail Rute
→ Map
→ Transit
→ Perjalanan Aktif

Secondary:
Perjalanan
Tersimpan
Notifikasi
Profil

## MVP transport scope

- KRL
- TransJakarta
- JakLingko / Mikrotrans
- Jalan Kaki
- Transit

MRT/LRT are future expansion and are not part of the canonical MVP reference.

## Prototype-data rule

Schedules, ETAs, fares, route numbers and example journey data shown in Stitch are illustrative. They are **not the authoritative transit dataset**.

The production data source will be defined separately from the UI package.
