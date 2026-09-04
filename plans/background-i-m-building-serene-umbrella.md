# Design Review Fixes — Beating the Burnout

## Context
Design review of the burnout-prevention app found accessibility gaps, dark-mode token gaps, and a broken design-system contract: the charts read hardcoded JS hex literals instead of the CSS variables the user updates. The user asked to apply all the clear, safe fixes. Subjective/restructuring items stay as recommendations. The whole app is one file: `src/App.tsx`; tokens live in `src/index.css` layered over the `@figma/astraui` kit.

## Fixes to apply

### 1. Focus + labels on custom buttons (accessibility) — `src/App.tsx`, `src/index.css`
- Add a shared `:focus-visible` rule (reuse kit `--brand-primary`):
  `outline: 2px solid var(--brand-primary); outline-offset: 2px;` applied to the custom controls (calendar day cells, smart-band toggle, check-in rows, voice mic, mobile nav, FAB).
- Add `aria-label` to icon-only controls: FAB → "Open AI stress coach", mic → "Start voice input", smart-band toggle → connect/disconnect, calendar day cells → the date.
- Add `aria-current="page"` to active mobile-nav / sidebar item.
- Add `role="switch"` + `aria-checked` on the smart-band toggle.

### 2. Dark-mode zone tokens — `src/index.css`
Add a `.dark { --zone-red/amber/green-bg/text }` block with lightened text on desaturated dark fills, mirroring the existing light-only tokens (lines 5–12).

### 3. Token-driven charts (core fix) — `src/App.tsx`
- Replace the `ZONE_HEX` JS literals (lines 33–37) so chart colors resolve from CSS vars. Read once via
  `getComputedStyle(document.documentElement).getPropertyValue('--zone-red-text')` (in a small helper/`useMemo`), or pass `currentColor`/CSS-var strings into `CircularGauge`, `Sparkline`, `SleepBars`.
- Goal: editing `index.css` restyles the visualizations.

### 4. Replace raw neutrals/sizes with tokens — `src/App.tsx`
- Map neutral hexes (`#1a1a2e`, `#6b7280`, `#e8e8ed`, `#f3f4f6`, `#9ca3af`) to `var(--text-primary/secondary/tertiary)` and track colors to `var(--border-primary)`/`var(--bg-subtle)`.
- Map `borderRadius:5/12` to `var(--corner-sm/lg)`.
- Snap big-stat inline `fontSize` (40/36/28/22) and the gauge `size*0.22` label to the kit type scale where practical.

### 5. Emoji → Lucide — `src/App.tsx`
Part-time decision card: swap `⏱ 📅 ⚠` for `Clock`, `Calendar`, `AlertTriangle` (`lucide-react`), `size={16}`, colored via token.

### 6. Contrast — `src/App.tsx`
Remove `opacity:0.8` on `.text-label-sm` over tinted zone backgrounds (DayDetail, Upcoming Commitments); use `var(--text-secondary)` and verify ≥4.5:1.

## Left as recommendations (not applied)
Intermediate tablet breakpoint; FAB shadow as a token; broader single-file refactor.

## Verification
- App runs on the already-running Vite dev server; open preview, confirm no visual regressions.
- Keyboard-tab through FAB, mic, nav, calendar, toggle — visible focus ring on each.
- Edit a `--zone-*` value in `index.css` and confirm gauges/bars/sparkline recolor.
- Spot-check contrast on zone chips and label text.
