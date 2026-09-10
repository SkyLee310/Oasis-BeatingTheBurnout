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

Fonts (Archivo 700/800, Plus Jakarta Sans 500–800) ship as real `.woff2` files under `fonts/`, loaded via `styles.css`'s `@import "./fonts/fonts.css"` — no network dependency for the design agent's renders. Don't substitute a different display face.

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

**Ambient temperature**: `--canvas`, `--surface` and `--surface-2` are not fixed. A host app can set `data-ambient` plus a `--temp` number (0 warm → 1 cold) on a root element, and those three tokens `color-mix` between a warm and a cold endpoint — the surface cools as the user's load climbs. Everything else holds still, because saturated hue means health state and nothing else. Nothing is required of a component: read `var(--canvas)` / `var(--surface)` rather than a cream literal and it follows automatically. Without `data-ambient` — which is how this DS's own previews render — every one of those tokens resolves to its plain `:root` value.

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
