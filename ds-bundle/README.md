# Oasis DS — conventions

Ten primitives on `window.OasisDS` (React 19). **No provider wrapper needed** — none of these components read context; mount directly.

## Setup

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

```jsx
const { StatTile, Sparkline, SW } = window.OasisDS;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<StatTile ... />);
```

Fonts (Archivo, Plus Jakarta Sans) load at runtime from a Google Fonts `@import` baked into `styles.css` — a network dependency, not a shipped file. Don't substitute a different display face if they're slow to load.

## The idiom: bespoke utility classes + CSS custom properties, never hex literals

This is not Tailwind — it's hand-authored. Every visual decision routes through a named class from `_ds_bundle.css` or a `var(--token)`; reach for the class first, fall back to the token only when no class covers it (the components' own source mixes both this way, e.g. a `.t-eyebrow` class alongside an inline `style={{ color: 'var(--ink)' }}`).

**Structure & depth**
| Class | Effect |
|---|---|
| `.card` | white surface, `2px solid var(--ink)` border, `--r-lg` radius |
| `.card-pop` | adds `--shadow-hard` (`4px 4px 0 var(--ink)`) — **one per screen**, reserved for the element you want seen first |
| `.tile-{mint,sky,blush,butter,lilac,cream}` | pastel bento unit — pick the color by *meaning*, never by rotation |
| `.panel-ink` | inverted surface, ink bg / `--on-ink` text — at most one per screen |

Every surface takes the 2px ink stroke; there's no 1px hairline variant in this language.

**Type — two families, nothing between them**
`.t-hero` / `.t-display` / `.t-title` / `.t-sub` / `.t-stat` are Archivo 700–800 (display, headings, numerals). `.t-eyebrow` / `.t-body` / `.t-label` / `.t-micro` are Plus Jakarta Sans 500–800 (everything read as prose). `.t-stat` carries no font-size of its own — set it inline per instance (46px in a `StatTile`, larger in a hero band).

**Color — action is monochrome, hue means health**
Primary action is ink black (`.btn-primary`, or `var(--action)`); selection/emphasis is yellow (`.chip-selected`, `.btn-accent`, or `var(--highlight)` = `#f7d046`). Saturated color is reserved for the three health zones (`green`/`amber`/`red`) — never used decoratively elsewhere. Drive zone styling through the exported helpers instead of re-deriving the mapping: `window.OasisDS.zoneAccent(zone)` (accent color for bars/rings), `zoneTile(zone)` (bento tile class), `ZONE_LABEL[zone]`, or just render `<ZoneChip zone="amber" />`.

**Icons**: icon props accept any `ReactNode`. This DS's own previews use `lucide-react` at `strokeWidth={window.OasisDS.SW}` (2.25) — match that stroke weight with whatever icon set you use, since the default (1.5) reads as a hairline next to the 2px card borders everywhere else.

**Chips/pills**: `.chip` (idle, outlined) / `.chip-selected` (yellow flood) for interactive tags; `.zone-chip zone-{green,amber,red}` for the static status pill — always pair a zone color with this labelled chip, never color alone.

**Explicit fills on three primitives**: `Tag` and `Initials` take a `bg`, and `OasisBlob` takes `fillColor` / `strokeColor` / `mouthFill` / `mouthStroke` / `eyeHighlightFill`. Pass a `var(--token)`, never a hex — these sit under text, and a literal that reads fine on the cream ground goes unreadable the moment a host swaps to the dark values. Leave `OasisBlob`'s fill alone on anything that reports state: the zone owns that color and reporting the zone is the mascot's only job. Override it where the blob is a logo mark. `Tag bg` is the softer case — reach for it when a pill at full `--highlight` out-shouts the thing it labels, and note the text color still follows `tone`, so keep the pair legible.

**Touch targets**: there is no 44px helper class in this bundle. A control drawn smaller than 44×44 needs a real `minHeight` / `minWidth` on the element itself — `.chip` and `.btn-icon` both draw smaller than that (34px for `.btn-icon`), so any composition that makes them the primary tap target has to say so explicitly. The app that consumes this DS has a `.hit-44` utility that claims the ring with a transparent `::after` instead, but it does not ship here, and it is the wrong tool twice over: on a replaced element (`<select>`, `<input>`) there is no pseudo-element to claim it, and on a row that wraps the overflowing ring lands on the chip below and eats its taps. Both cases want the real minimum.

**Headings and names**, for anything composed into a screen rather than a preview: one `h1` per screen and first in the DOM (`sr-only` when the design opens on a readout instead of a title); section headings `h2`; a sheet's title `h2` carrying the `id` its `aria-labelledby` points at. Never skip a level to reach a size — the `t-*` classes set size and weight outright, so any tag renders at any size for free. And when a control carries both visible text and an `aria-label`, start the label with that visible text: a name that only paraphrases it leaves a speech-input user saying what they can see and hitting nothing.

## Where the truth lives

`styles.css` (root) `@import`s `_ds_bundle.css` — the one compiled stylesheet carrying every token *and* every component class (this DS doesn't split them into separate files). Read it before hand-styling anything. Per-component contract: `components/general/<Name>/<Name>.prompt.md` + `<Name>.d.ts`.

## Example — real composition (from a verified preview)

```jsx
const { StatTile, Sparkline, SW } = window.OasisDS;
<StatTile variant="blush" zone="amber" label="Heart rate" value="78" unit="bpm" note="+6 bpm"
  icon={<Heart size={14} strokeWidth={SW} />}>
  <Sparkline values={[74, 76, 79, 82, 78, 80, 77]} zone="amber" height={44} />
</StatTile>
```

# OasisDS (.@1.0.0)

This design system is the published . React library, bundled as a single
browser global. All 10 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.OasisDS`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.OasisDS.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { CircularGauge } = window.OasisDS;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<CircularGauge />);
```

## Tokens

216 CSS custom properties from .. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (64): `--tw-border-style`, `--tw-shadow-color`, `--tw-inset-shadow-color`, …
- **spacing** (11): `--tw-space-y-reverse`, `--tw-inset-shadow`, `--tw-inset-shadow-alpha`, …
- **typography** (14): `--tw-font-weight`, `--tw-tracking`, `--font-sans`, …
- **radius** (5): `--radius-sm`, `--radius-md`, `--radius-lg`, …
- **shadow** (10): `--tw-shadow`, `--tw-shadow-alpha`, `--tw-ring-shadow`, …
- **other** (112): `--tw-translate-x`, `--tw-translate-y`, `--tw-translate-z`, …

## Components

### general
- `CircularGauge` — The hero ring gauge: a conic sweep, an ink-stroked disc, and a zone chip.
- `Initials` — The avatar stand-in: a yellow disc with the user's initials.
- `LoadBar` — A labelled capacity bar with its percentage and zone called out above it.
- `OasisBlob` — The Oasis mascot. A single blob whose expression is bound to the current
- `SleepBars` — A week of sleep, each night in its own stroked track.
- `Sparkline` — A compact trend strip. Thin bars are stroked by their container rather than
- `StatTile` — The bento tile: one figure, one meaning, one optional sub-visual.
- `Tag` — A small stroked pill for metadata  dates, counts, short labels.
- `WeekCalendar` — A seven-cell week scrubber. Selection floods yellow today reads sky blue.
- `ZoneChip` — The canonical status pill. Never write a zone label by hand  use this.
