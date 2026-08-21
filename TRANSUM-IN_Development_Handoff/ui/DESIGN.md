# TRANSUM-IN — Canonical Design System

> Canonical design specification extracted from the latest Stitch export (`transum_in_2/DESIGN.md`).
> This handoff package treats this file as the single visual-token source of truth.

---
name: TRANSUM-IN
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f9'
  surface-container: '#eceef3'
  surface-container-high: '#e7e8ee'
  surface-container-highest: '#e1e2e8'
  on-surface: '#191c20'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3135'
  inverse-on-surface: '#eff0f6'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#016a61'
  on-secondary: '#ffffff'
  secondary-container: '#9defe3'
  on-secondary-container: '#0d6f66'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b44e1a'
  on-tertiary-container: '#ffece5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#a0f1e6'
  secondary-fixed-dim: '#84d5ca'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f8f9ff'
  on-background: '#191c20'
  surface-variant: '#e1e2e8'
  krl-red: '#ba1a1a'
  transjakarta-blue: '#0053db'
  jaklingko-green: '#006a61'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  gutter: 12px
---

## Brand & Style
The design system is rooted in **Corporate Modernism**, specifically tailored for high-frequency urban transit navigation. It prioritizes utility, speed of recognition, and trust. The visual language is clean and systematic, utilizing a light-dominant interface that allows vibrant semantic transit identifiers to serve as the primary navigational cues.

The target audience consists of daily commuters in dense metropolitan areas. The design style is **Modern / Corporate**, characterized by balanced proportions, generous whitespace, and a "neutral foundation" strategy. By using a sophisticated Indigo as the primary brand anchor, the system evokes a sense of reliability and technical precision, while soft shadows and rounded corners maintain an approachable, human-centric feel.

## Colors
This design system employs a hierarchical color strategy to manage complex multimodal information.

- **Primary Brand:** Indigo (#2563eb) is used for primary actions, active navigation states, and brand-level identifiers.
- **Semantic Transit Palette:** Specific hex codes are reserved strictly for route identification (Red for KRL, Blue for TransJakarta, and Green for JakLingko). These must never be used for generic UI buttons or decorative elements to avoid cognitive interference.
- **Surface Strategy:** The background uses a very soft Slate-tinted White (#f8f9ff) to reduce eye strain in outdoor lighting. Pure White (#ffffff) is reserved for interactive cards and elevated surfaces to create distinct containers of information.
- **Status Colors:** Use standard semantic reds and ambers only for system errors or critical transit delays.

## Typography
**Inter** is the exclusive typeface for the design system, selected for its tall x-height and exceptional legibility in data-dense transit schedules.

**Application Guidelines:**
- **Primary Information:** Destination names and headings should use `headline-md` for maximum impact while the user is in motion.
- **Critical Data:** Time, duration, and pricing should utilize `title-lg` in the primary Indigo color to stand out from secondary details.
- **Transit Codes:** Use `label-md` in all-caps for route numbers (e.g., "M1", "GR2") to mimic physical station signage.
- **Mobile Scaling:** Headlines larger than 24px must transition to their `-mobile` variants on small screens to maintain layout integrity.

## Layout & Spacing
The system follows a rigorous **8pt grid**. All layout dimensions, including heights and paddings, must be increments of 8px. The 4px unit (`xs`) is reserved strictly for internal component spacing, such as icons within badges or small labels.

- **Grid Model:** A 12-column fluid grid is used for desktop, transitioning to a single-column layout on mobile with fixed 16px side margins.
- **Touch Targets:** All interactive elements must maintain a minimum height of 48px.
- **Navigation Placement:** The bottom navigation bar and primary call-to-action buttons must respect a 24px safe area from the screen bottom to ensure optimal ergonomics for one-handed use.

## Elevation & Depth
Hierarchy is established through **Tonal Layering** and subtle **Ambient Shadows**. This prevents the UI from appearing too cluttered when displaying complex maps.

- **Foundation:** The main app background is #f8f9ff (Level 0).
- **Surface:** All primary cards and input containers sit on Level 1 (#ffffff) with a 1px `outline-variant` border.
- **Interactive Elevation:** Elements that are draggable or floating (like "Current Location" buttons) use Level 2 elevation. This features a soft, diffused shadow: `Y: 4px, Blur: 12px, Color: #0b1c30` at 5% opacity.
- **Overlays:** Bottom sheets and modals use a 40% opacity scrim to dim the background and focus attention on the specific transit task.

## Shapes
The shape language is consistently **Rounded**, providing a modern and friendly aesthetic that balances the technical nature of transit data.

- **Route Cards:** Must strictly use `rounded-2xl` (1.5rem / 24px) to create soft, distinct containers for journey information.
- **Primary Buttons:** Use the standard `rounded-lg` (1rem / 16px).
- **Transit Badges:** Use a smaller `rounded-sm` (0.25rem / 4px) to create a "ticket" or "tag" appearance that differentiates them from interactive buttons.
- **Input Fields:** Adhere to the standard 12px radius to match the primary button style.

## Components

### Bottom Navigation
The navigation bar is fixed at exactly 5 tabs, using `label-sm` for captions and 24px icons.
1. **Beranda** (Home)
2. **Perjalanan** (Trips/Routes)
3. **Tersimpan** (Saved)
4. **Notifikasi** (Notifications)
5. **Profil** (Profile)

### Route Card Badges
Route results must include standardized semantic badges in the top right or bottom left of the card using `label-md`:
- **Tercepat:** Primary Indigo background.
- **Minim Jalan:** Green background.
- **Minim Transit:** Blue background.
- **Paling Sederhana:** Neutral-dim background.
- **Paling Murah:** Tertiary (Orange/Gold) background.

### Buttons
- **Primary:** Solid `#2563eb` with White text. Minimum 48px height.
- **Secondary:** Outlined with 1px `#2563eb` and matching text color.

### Transfer UX
- **Connection Nodes:** Vertical dashed lines (`#737686`) connect transit mode icons.
- **Transfer Wait Time:** Displayed in `body-md` bold, nested between the arrival of one mode and the departure of the next.
- **Walk Segments:** Indicated by a walking person icon and a grey dashed line on map views.

### Input Fields
- Use `#ffffff` background with a 1px `#c3c6d7` border. Upon focus, the border transitions to 2px `#2563eb` with a subtle outer glow.