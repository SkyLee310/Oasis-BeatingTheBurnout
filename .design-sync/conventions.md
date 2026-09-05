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

**Icons**: icon props accept any `ReactNode`. This DS's own previews use `lucide-react` at `strokeWidth={window.OasisDS.SW}` (2.25) — match that stroke weight with whatever icon set you use, since the default (1.5) reads as a hairline next to the 2px card borders everywhere else.

**Chips/pills**: `.chip` (idle, outlined) / `.chip-selected` (yellow flood) for interactive tags; `.zone-chip zone-{green,amber,red}` for the static status pill — always pair a zone color with this labelled chip, never color alone.

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
