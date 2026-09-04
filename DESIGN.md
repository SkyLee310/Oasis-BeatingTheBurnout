# Oasis — Design Language

**Status:** implemented. `src/index.css` is the source of truth; this file explains it.
**Audience:** Huixuan (UI/UX) and Tracia (frontend).

Derived from four reference boards: *Capi Creative* (pastel bento wellness), a dark
bold-display mood app, *Explicai* (neo-brutalist flat colour), and *Suntera* (blob
mascots + mood pills). The agreed direction is a **hybrid — pastel canvas, bold
accents**: the soft cream/bento base of the first, the heavy type, hard strokes,
pill chips and mascot of the other three.

> This file **replaces** the Apple-style system that previously lived at this path, and
> its byte-identical duplicate at `src/imports/DESIGN.md` has been deleted. That system
> is gone — its text stays in git history (`git show 5696ce7:DESIGN.md`).

---

## The five rules

Everything below is a consequence of these. If a new screen breaks one of them, the
screen is wrong, not the rule.

1. **Cream canvas, pastel fills, saturated accents.** No gradients on chrome. The
   only gradient in the app is the conic sweep inside a gauge ring.
2. **Every surface is outlined `2px solid var(--ink)`.** Never a hairline. A 1px
   border reads as a different design system.
3. **Depth comes from a hard offset shadow, not a blur.** `4px 4px 0 var(--ink)`.
4. **Type jumps hard.** Archivo 800 for display, Plus Jakarta Sans 500 for body.
   Nothing in between — no 600-weight mid-tier.
5. **Radius is generous or full.** 18 / 24 / 32px, or a 999px pill.

---

## Colour

Tokens live in `:root` in `src/index.css`, with a `.dark` override block.
**Never hardcode a hex in a component.** The old file was full of `#0066cc` /
`#f5f5f7` literals; that is exactly what we removed.

### Ink — also the colour of every stroke

| Token | Value | Use |
|---|---|---|
| `--ink` | `#14140f` | Text, **and every border in the system** |
| `--ink-2` | `#46443c` | Secondary body copy |
| `--ink-muted` | `#83817a` | Eyebrows, timestamps, captions |
| `--ink-faint` | `#a8a69c` | List index numerals only |
| `--on-ink` | `#ffffff` | Text on an ink panel |

### Canvas & surfaces

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#f6f2e8` | App background. Never white. |
| `--surface` | `#ffffff` | Cards |
| `--surface-2` | `#fbf8f0` | Inset wells, input fields |

### Pastel fills — the bento palette

`--mint #d7edbb` · `--sky #c6e4f5` · `--blush #fbd5dc` · `--butter #fbe6a2` ·
`--lilac #ded7f5`

Each has a `-deep` variant (`--mint-deep #b6de8e`, `--sky-deep #9ad0ee`,
`--blush-deep #f7b4c0`, `--butter-deep #f8d765`) used for mascot bodies and fills
that sit on top of a pastel.

### Saturated accents

`--bold-orange #f2542d` · `--bold-yellow #f7d046` · `--bold-blue #2e6be6` ·
`--bold-green #2e7d4f` · `--bold-pink #ef5da8`

Illustration, dots, emphasis. Not backgrounds for large areas.

### The action model — read this before adding any button

**Primary action is INK (a black pill). Selection is YELLOW (`--highlight`, `#f7d046`).**

This is copied straight from the references and it is load-bearing. A green or blue
primary button would collide with the red/amber/green health semantics that carry
the actual product meaning. Keeping action monochrome leaves the entire colour axis
free to mean "how are you doing".

| Token | Value |
|---|---|
| `--action` / `--brand-primary` | `#14140f` |
| `--action-hover` / `--brand-hover` | `#2e2e24` |
| `--highlight` / `--brand-secondary` | `#f7d046` |

The `--brand-*` aliases exist so `@figma/astraui` components inherit this language
instead of falling back to the kit's own purple.

### Health zones

Three states, each a pastel background + dark text + a saturated accent for bars
and rings.

| Zone | bg | text | accent | Label |
|---|---|---|---|---|
| green | `#d7edbb` | `#1f5a33` | `#4fa45f` | OPTIMAL |
| amber | `#fbe6a2` | `#7a4e00` | `#f2a529` | NEAR CAPACITY |
| red | `#fbd5dc` | `#9e1f2b` | `#f2542d` | OVERLOADED |

In code: `zoneAccent(zone)` returns the accent var, `zoneTile(zone)` returns the
matching tile class. Use them — do not re-derive the mapping.

---

## Type

Two families, loaded from Google Fonts at the top of `src/index.css`.

- **Archivo** 400–900 — display, titles, all numerals
- **Plus Jakarta Sans** 400–800 — body, labels, eyebrows

Body default: Plus Jakarta Sans **500 / 15px / 1.55**.

| Class | Family | Weight | Size | Notes |
|---|---|---|---|---|
| `.t-hero` | Archivo | 800 | `clamp(2.5rem, 8.5vw, 4.75rem)` | lh 0.9, ls −0.035em, **uppercase** |
| `.t-display` | Archivo | 800 | `clamp(1.75rem, 4.5vw, 2.5rem)` | lh 0.98, ls −0.03em |
| `.t-title` | Archivo | 700 | 22px | Section headings |
| `.t-sub` | Archivo | 700 | 17px | Card headings |
| `.t-stat` | Archivo | 800 | set per use | `tabular-nums`, lh 0.92 |
| `.t-eyebrow` | Jakarta | 800 | 11px | ls 0.14em, uppercase, `--ink-muted` |
| `.t-body` | Jakarta | 500 | 15px | lh 1.55 |
| `.t-label` | Jakarta | 600 | 13px | |
| `.t-micro` | Jakarta | 600 | 11.5px | |

**One `.t-hero` per screen, maximum.** It is the whole point of the page it sits on.

`.t-stat` has no size of its own — set `fontSize` inline at the call site, because a
stat is 46px in a bento tile and 80px in the band hero.

---

## Geometry, stroke, depth

```
--r-xl 32px   --r-lg 24px   --r-md 18px   --r-sm 12px   --r-pill 999px
--sw-thin 1.5px   --sw 2px   --sw-thick 3px
--shadow-hard-sm 3px 3px 0   --shadow-hard 4px 4px 0   --shadow-hard-lg 6px 6px 0
```

Stroke width by element size: **2px** is the default for anything card-sized or
larger; **1.5px** only for small pills, dots under ~12px, and inner tracks;
**3px+** for the mascot outline.

**Lucide icons must be `strokeWidth={2.25}`** — exported as `SW` at the top of
`App.tsx`. The library default of 1.5 reads as a hairline sitting next to a 2px
card border and visibly breaks the language.

Motion easing is `--ease: cubic-bezier(0.16, 1, 0.3, 1)` everywhere. A
`prefers-reduced-motion` block disables the decorative animations.

---

## Components

All in `src/App.tsx`. Note we deliberately use **only `ThemeProvider`** from
`@figma/astraui` — nav, avatar, badges, tabs and chat are hand-built so nothing
renders in the kit's own idiom.

| Class / component | What it is |
|---|---|
| `.card` | White, 2px ink, `--r-lg` |
| `.card-pop` | Adds the hard shadow. **Reserved for the one element you want seen first** |
| `.tile` + `.tile-{mint,sky,blush,butter,lilac,cream}` | Pastel bento unit, flex column |
| `.panel-ink` | Inverse surface — ink bg, `--on-ink` text, `--r-xl`. **At most one per screen** |
| `.btn-primary` | Ink pill, `3px 3px 0` shadow |
| `.btn-secondary` | Outlined pill on surface |
| `.btn-accent` | Yellow pill |
| `.btn-icon` | 34px circle, hover floods yellow |
| `.chip` / `.chip-lg` | Outlined pill. `.chip-selected` floods `--highlight` |
| `.zone-chip` | Static status pill, `.zone-{green,amber,red}` |
| `.track` + `.bar-fill` | Stroked capsule with a 2px inset flat fill |
| `.press` | Hover lifts `translate(-2px,-2px)` into the shadow; active presses `translate(1px,1px)` |
| `.rule-b` / `.rule-t` / `.rule-divide` | 2px ink dividers |

Both `.chip` and `.zone-chip` carry `width: fit-content` so a column-flex parent
cannot stretch them into a full-width bar. Keep that if you clone them.

### `OasisBlob`

Inline SVG mascot, `viewBox="0 0 200 200"`, `strokeWidth="4"`. Expression is bound
to `ZoneKey`: smile / flat line / frown. It **reports** state, it does not collect
it — it is not a mood-logging feature.

Sizes in use: 124 (dashboard hero), 118 (recovery hero), 104 (band hero), 64
(simulator), 40 (side rail logo), 34 (chat avatar). `float={false}` disables the
idle animation for small instances.

### Navigation

- **Desktop `SideRail`** — 78px, 2px ink right border. Active item = yellow +
  `--shadow-hard-sm`.
- **Mobile `MobileNav`** — 70px, 2px ink top border, four items with a **58px centre
  mic button** (yellow; `--bold-orange` while the sheet is open) that overhangs the
  bar by 20px with `--shadow-hard`.
- Breakpoint is 767px via `.hide-mobile` / `.show-mobile`.

---

## Accessibility

- Focus is `outline: 3px solid var(--ink); outline-offset: 3px` via `.focus-ring`.
  Every interactive element gets it — the hard-shadow style makes a subtle focus
  ring invisible.
- Zone is **never** communicated by colour alone; a `ZoneChip` with a text label
  always accompanies it.
- The mascot carries `role="img"` and a zone-specific `aria-label`.
- Tab rows use `role="tablist"` / `role="tab"` / `aria-selected`; checklists use
  `role="checkbox"` / `aria-checked`; the band toggle uses `role="switch"`.

---

## Adding a screen — checklist

1. Background `--canvas`. Never white.
2. One `.t-hero` or `.t-display`, then drop straight to `.t-body`.
3. Group metrics into a **bento grid of pastel `.tile`s**, not a flat list.
4. Every surface: 2px ink border. Reach for `.card-pop` **once**.
5. Primary action = ink pill. Selected state = yellow flood. Nothing else.
6. Health state = zone token + a labelled `ZoneChip`.
7. Icons at `strokeWidth={SW}`.
8. No hex literals — token or nothing.
