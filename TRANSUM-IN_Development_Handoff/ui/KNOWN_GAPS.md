# TRANSUM-IN — Known Gaps / Explicit Handoff Notes

These are not design failures. They are intentionally documented so an AI coding agent does not infer unsupported requirements.

## 1. Notifications dedicated screen
The export contains notification affordances and profile notification settings, but no single canonical notification inbox screen was exported.

Implementation contract is therefore behavioral/information-architectural only:
- gangguan layanan
- perubahan rute
- keterlambatan
- perjalanan aktif
- informasi umum

## 2. Saved dedicated screen
The export shows saved places and saved-route concepts, but not one canonical final dedicated Saved screen.

Implementation contract:
- Tempat
- Rute
- saved place CRUD
- saved route reuse

## 3. Forgot password / verification visuals
The login/register export establishes the authentication hierarchy, but a dedicated final screenshot for every recovery/verification state is not available.

Treat them as application states using the canonical auth visual system.

## 4. Official transit data
Stitch example schedules/fares/route numbers are not authoritative. Production routing must be driven by official/validated transit datasets.

## 5. Map
Stitch map screenshots are visual references only. Production must use a real map provider and actual transit geometry.

## 6. HTML artifacts
The original Stitch HTML is retained only for reference. It is not production source code.

## 7. Export artifacts removed
Invalid/mislabeled PNG artifacts and obsolete design-iteration duplicates are not included in this handoff package.
