# Redesign: "Beating the Burnout" — from dashboard to editorial app

## Context
The prototype is well-engineered (token-driven, accessible, responsive) but every screen has
collapsed into the same shape: a vertical stack of near-identical `.apple-card` blocks. It reads
like a generic analytics dashboard. The user wants to **break away from the dashboard feel** — a
more editorial, app-like product where each of the four screens has its own distinctive layout and
rhythm, not a uniform card grid.

We will also fold in the safe, high-value fixes surfaced in the design review, because they directly
support the stated design-system contract ("restyle the whole app by editing the CSS") and dark mode.

Kit note: `@figma/astraui` (`hardcoded-astra-ui`) is already installed and used. Before editing
`package.json` or adding kit components, follow the **make-kit** skill to reconcile the selected kit
version. Do not introduce a second component system — prefer kit primitives + the existing `.apple-*`
/ `.zone-*` helpers, and consume tokens (never raw hex).

## Design direction: editorial, not dashboard
Principles applied across all screens:
- **Asymmetry over grids.** Replace uniform 2-up / 3-up card grids with intentional asymmetric
  layouts (a dominant lead element + smaller supporting satellites).
- **Full-bleed section rhythm.** Alternate surface backgrounds (`--canvas-parchment`,
  `--canvas-white`, dark `--surface-tile-*`) so sections read as chapters, not stacked tiles.
- **Editorial typography.** Introduce eyebrow/kicker labels (small uppercase, `--ink-muted-48`),
  large display headlines (`.headline-display`), and a narrative sentence that interprets the data
  ("You're running near capacity — protect this afternoon"). Data gets a human voice, not just tiles.
- **One focal metric per screen** rendered large, with supporting metrics demoted in scale.
- **Whitespace as structure** — increase vertical spacing between chapters; let the hero breathe.

## Screen-by-screen (in `src/App.tsx`)

### DashboardPage (`~480–710`)
- Replace the welcome/quote card + "Biometric Telemetry" grid with an **editorial hero**: eyebrow
  ("TODAY"), greeting, then the **stress score as a large display statement** with the
  `CircularGauge` set as a large off-center focal element, and a one-line narrative interpretation.
- Demote telemetry (energy / HR / sleep) into a **horizontal supporting strip** below the hero —
  inline stat + `Sparkline`/`SleepBars`, separated by hairlines, not boxed cards.
- Keep Deadlines + Decision content but restyle as an **editorial two-column asymmetric block**
  (wide narrative column + narrow action rail), on a contrasting surface.

### SmartBandPage (`~713–859`)
- Recast as a **product/device showcase**: device connection as a hero band (dark
  `--surface-tile-*` surface), live HR as a large focal readout, and the Stress-Index formula as an
  **explanatory editorial breakdown** (labelled weighted contributions) rather than three equal tiles.

### LoadPage (`~862–1047`)
- Replace the flat "Load Categories" stack and tab-of-cards feel with an **agenda/timeline
  editorial layout**: the week as a horizontal scrubber lead, the selected day as a narrative detail
  panel, and load categories as a ranked list (lead category emphasized, remainder compact) instead
  of identical `LoadBar` rows.

### RecoveryPage (`~1050–1180`)
- Lean into a **calm, spa-like editorial**: generous whitespace, large recovery gauge as a serene
  focal point, restorative actions as a light checklist column, and the communication-assist
  template as a distinct quiet card. Softer rhythm than the other screens.

## Review fixes to fold in (safe, token-aligned)
- **Charts read tokens, not hex.** In `CircularGauge` (App.tsx:47), `SleepBars`, `LoadBar`, replace
  literal `#ff3b30/#ff9500/#34c759` with `var(--zone-red-accent | --zone-amber-accent | --zone-green-accent)`
  (already defined, light `index.css:34–44`, dark `57–62`). This is the highest-leverage fix.
- **Wire the fonts.** Add Instrument Sans (kit display font) via a Google Fonts `@import` at the very
  top of `src/index.css` (before all other non-comment statements, after the two existing `@import`s
  must actually come first — place the Google import as the first line). Or deliberately commit to the
  system stack. Pick one so typography is deterministic.
- **Reconcile the accent.** Blue `--brand-primary:#0066cc` (app) vs kit purple `#5250f3` render side
  by side (Astra `Button`/`Tabs`/`Badge`/`PromptPane` stay purple). Choose one accent and align the
  kit tokens/usages so the app reads as one system.
- **Reduced motion.** Guard the 2s HR `setInterval` visual pulse and `animate-ping`/`animate-spin`
  behind `prefers-reduced-motion` (media query in `index.css` and/or a JS check).

## Constraints
- Preserve the existing app shell: `ThemeProvider`, `SidebarNavigation` (desktop), `MobileNav` +
  floating AI button, `VoiceAssistantPanel` / mobile voice sheet, page-switching, and the AI chat
  modal — these stay. This is a layout/visual redesign of page content, not a re-architecture.
- No raw hex or inline color literals; consume `var(--token)` and existing `.apple-*` / `.zone-*`
  helpers. New shared styles go in `src/index.css`.
- Keep accessibility parity: `.focus-ring`, `aria`/`role` on custom controls, `aria-current`, and
  meaningful labels on all new interactive elements.

## Files
- `src/App.tsx` — the four page components + local viz primitives (all edits here).
- `src/index.css` — font import, any new editorial helper classes, reduced-motion guards, brand
  reconciliation.
- `package.json` — only if make-kit reconciliation requires a version change (follow make-kit skill).

## Verification
- App builds cleanly with zero errors (dev server is already running on `$PORT`; check HMR/preview).
- Toggle dark mode via `ThemeProvider` — confirm gauges/sparklines/bars recolor (proves token wiring).
- Temporarily edit a `--zone-*-accent` value in `index.css` and confirm every chart shifts color.
- Check each screen at 320px, 768px, and desktop widths: no horizontal scroll, no clipped/overlapping
  content, focal hierarchy holds, screens feel visually distinct from one another.
- Keyboard-tab through each screen: visible focus rings, logical order, AI button/chat reachable.
