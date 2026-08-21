# TRANSUM-IN — Screen Manifest

| ID | Screen | Canonical source | Role |
|---|---|---|---|
| 01 | Welcome | `welcome_splash_revised` | entry |
| 02 | Login | `login_register_revised` | authentication |
| 03 | Onboarding | `onboarding_revised` | first-use education |
| 04 | Beranda | `beranda_final_source_of_truth` | primary journey planner |
| 05 | Search | `location_search_results` | semantic place/station/stop search |
| 06 | Pilih di Peta | `pilih_di_peta` | map-based origin/destination selection |
| 07 | Opsi Rute | `opsi_rute_final_source_of_truth` | route comparison |
| 08 | Detail Rute | `route_detail_map_revised` | step-by-step journey |
| 09 | Perjalanan Aktif | `perjalanan_aktif_final_source_of_truth` | active navigation |
| 10 | Perjalanan | `perjalanan_final_standard` | active/history/saved trips |
| 11 | Detail Stasiun/Halte | `station_stop_details` | transit place detail |
| 12 | Profil | `profil_final_source_of_truth` | account/preferences |
| 13 | No Nearby Transit | `no_nearby_transit_final_source_of_truth` | failure state |
| 14 | System States | `system_error_states_revised` | state-board/reference |

## Canonical sequence

Welcome → Onboarding → Login/Register → Beranda → Search → Opsi Rute → Detail Rute → Map → Perjalanan Aktif

## Note

`Tersimpan` and `Notifikasi` have defined behavior contracts in `UI_CONTRACT.md`, but the Stitch export did not provide a single clean dedicated final screen for either. Do not invent a visual design that is not present in the source package; implement the listed information architecture using the canonical design system.
