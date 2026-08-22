# UI Implementation Notes

## Design System Compliance

All UI components follow the TRANSUM-IN design system defined in `TRANSUM-IN_Development_Handoff`.

### Color Tokens

| Usage | Token | Hex |
|-------|-------|-----|
| Primary | `primaryColor` | `#2563EB` (blue) |
| Secondary | `secondaryColor` | `#016A61` (teal) |
| Accent | `tertiaryColor` | `#943700` (amber) |
| Error | `errorColor` | `#BA1A1A` (red) |
| Surface | `surfaceColor` | `#F8F9FF` (light blue-gray) |
| KRL | `krlRed` | `#BA1A1A` |
| TransJakarta | `transjakartaBlue` | `#0053DB` |
| JakLingko | `jaklingkoGreen` | `#006A61` |
| Walking | — | `#737686` (gray) |
| Transfer | — | `#943700` (amber) |

### Typography

Using Google Fonts Inter:

| Role | Size | Weight | Letter Spacing |
|------|------|--------|----------------|
| Display Large | 32 | 700 | -0.02 |
| Headline Small | 24 | 700 | -0.01 |
| Title Large | 18 | 600 | — |
| Body Large | 16 | 400 | — |
| Body Medium | 14 | 400 | — |
| Label Medium | 12 | 600 | 0.05 |

### Spacing

- Screen padding: 16dp
- Card padding: 16dp
- Card corner radius: 24dp
- Input field height: 48dp
- Input field corner radius: 12dp
- List item spacing: 12dp
- Section spacing: 24dp

## Screen Implementations

### HomeScreen

**Layout:**
```
AppBar: "TRANSUM-IN"
Body: Padding(16dp)
  ├─ LocationInputWidget (Origin)
  │   ├─ Hint: Journey origin name or "Dari mana?"
  │   └─ onTap → navigate to SearchScreen
  ├─ SizedBox(height: 16)
  ├─ LocationInputWidget (Destination)
  │   ├─ Hint: Journey destination name or "Mau ke mana?"
  │   └─ onTap → navigate to SearchScreen
  ├─ SizedBox(height: 24)
  └─ AppButton ("Cari Rute")
      ├─ Disabled: when origin/destination incomplete
      └─ Enabled: initiates search + navigation
```

**Interaction:**
1. User taps origin input → navigates to `SearchScreen`
2. User selects place → `JourneyLocation` returned via `Navigator.pop`
3. Repeat for destination
4. When both set, "Cari Rute" button enables
5. Tap → creates `JourneyRequest`, starts search, navigates to `RouteOptionsScreen`

### RouteOptionsScreen

**Layout:**
```
AppBar:
  ├─ Title: "Opsi Rute"
  ├─ Leading: Back button
  └─ Actions:
      ├─ Swap button (↔️): exchanges origin/destination
      └─ Refresh button (🔄): re-runs search

Body (state-dependent):
  ├─ Loading: LoadingState widget with spinner + message
  ├─ Success: ListView of route cards
  ├─ NoRoute: EmptyState with message + retry
  └─ Error: ErrorState with message + retry
```

**Route Card:**
```
AppCard (rounded corners)
  ├─ Row (duration | badge)
  │   ├─ Duration: bold blue text
  │   └─ Badge: "Tercepat" etc. on blue background (only for best route)
  ├─ Row (times | fare)
  │   ├─ Departure - Arrival times
  │   └─ Fare: "Tarif tidak tersedia" or price
  ├─ Divider
  ├─ Wrap (transit mode badges)
  │   └─ TransitBadge for each unique mode
  ├─ Row (walk distance | transfer count)
  │   ├─ e.g. "800 m jalan kaki"
  │   └─ e.g. "0 transit"
```

### JourneyDetailScreen

**Layout:**
```
AppBar:
  ├─ Title: "Detail Perjalanan"
  └─ Leading: Back button

SingleChildScrollView:
  ├─ Header (origin → destination)
  │   ├─ Origin name
  │   ├─ Arrow → (→ destination name)
  │   └─ Duration + badge chips
  ├─ Summary (4 stats in AppCard)
  │   ├─ Total Waktu
  │   ├─ Transit (count)
  │   ├─ Jalan Kaki (distance)
  │   └─ Moda (modes)
  ├─ Map Preview (FlutterMap)
  │   ├─ Origin marker (blue circle)
  │   ├─ Destination marker (flag)
  │   ├─ Transit markers (boarding/alighting icons)
  │   ├─ Transfer markers (station icon)
  │   ├─ Polylines: walking (gray), transit (route color)
  │   └─ Approximate geometry indicated by lack of intermediate points
  ├─ Journey Steps Section
  │   └─ "Langkah Perjalanan" header
  ├─ Journey Timeline (step-by-step)
  │   └─ JourneyStepWidget for each instruction
  └─ Footer spacing
```

## Journey Step Types

Each step uses a distinct icon and color:

| Kind | Icon | Color | Meaning |
|------|------|-------|---------|
| start | Circle | Blue (`#2563EB`) | Journey begins |
| walk | Walking | Gray (`#737686`) | Walking segment |
| wait | Schedule | Gray (`#737686`) | Waiting at stop |
| board | Bus | Blue (`#2563EB`) | Board transit |
| ride | Transit | Teal (`#006A61`) | In transit |
| alight | Transit Filled | Blue (`#0053DB`) | Exit transit |
| transfer | Swap | Amber (`#943700`) | Change routes |
| arrive | Flag | Red (`#BA1A1A`) | Journey complete |

## Map Visualization

### Markers

| Kind | Icon | Description |
|------|------|-------------|
| origin | Radio button checked | Journey start point |
| destination | Flag | Journey end point |
| boarding | Directions transit | Transit boarding stop |
| alighting | Directions transit filled | Transit alighting stop |
| stop | Train | Transfer/transfer stop |

### Lines

| Kind | Color | Style | Description |
|------|-------|-------|-------------|
| walking | Gray (`#737686`) | Straight | Approximate walking path |
| transit | Route color | Straight | Stop-to-stop transit |
| transfer | Amber (`#943700`) | Point | Transfer location |

**Important:** Walking lines are geodesic approximations, not true pedestrian paths.

## State Management Patterns

### Riverpod Usage

```dart
// Watching state reactively:
final state = ref.watch(routeOptionsProvider);
final notifier = ref.read(routeOptionsProvider.notifier);

// Reading without rebuild:
final current = ref.read(routeOptionsProvider.notifier);

// State updates in tests:
container.read(routeOptionsProvider.notifier).state = RouteOptionsState.error(...);
```

### State Immutability

All state classes use copy-on-write:
```dart
final newState = oldState.copyWith(newValue: value);
notifier.state = newState;
```

## Navigation Patterns

```dart
// Push screen:
Navigator.push(context, MaterialPageRoute(builder: (_) => Screen()));

// Pop with result:
final result = await Navigator.push<JourneyLocation?>(context, ...);
if (result != null) { /* use result */ }

// Pop without result:
Navigator.pop(context);
```

## Error States

### Network Error

```
Icon: Error outline (red)
Title: "Tidak Ada Koneksi"
Description: "Periksa koneksi internet Anda dan coba lagi."
Button: "Coba Lagi"
```

### API Error

```
Icon: Error outline (red)
Title: "Terjadi Masalah"
Description: [Exception message]
Button: "Coba Lagi"
```

### No Route Found

```
Icon: Location off (gray)
Title: "Belum menemukan rute yang sesuai"
Description: "Available data coverage may not support this journey."
Button: "Coba Lagi"
Action: Change location
```

## Accessibility

- All interactive elements have minimum 48dp touch targets
- Semantic labels on journey steps
- Meaningful button labels
- Text scales with system font size
- Non-color-only distinction (icons + text)
- Sufficient color contrast (WCAG AA minimum)

## Responsive Design

- Uses `Expanded` and `Flexible` for adaptive layouts
- `SingleChildScrollView` prevents overflow
- `TextOverflow.ellipsis` for long names
- `Wrap` for transit mode badges (multi-line)
- `SafeArea` not explicitly required (Material handles)

## Internationalization

All user-facing strings in Bahasa Indonesia:
- Loading messages
- Error states
- Navigation labels
- Time/distance formatting

Future enhancement: Add `intl` package for full i18n support.
