# Oasis — Design Language

**Status:** implemented. `src/index.css` is the source of truth; this file explains it.
**Audience:** Huixuan (UI/UX) and Tracia (frontend).

Derived from four reference boards: *Capi Creative* (pastel bento wellness), a dark
bold-display mood app, *Explicai* (neo-brutalist flat colour), and *Suntera* (blob
mascots + mood pills). The agreed direction is a **hybrid — pastel canvas, bold
accents**: the soft cream/bento base of the first, the heavy type, hard strokes,
pill chips and mascot of the other three.

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

### Ambient temperature — the canvas moves with the score

The one thing the whole app shares. **Low load reads warm; overloaded reads cold.**
`--canvas` is already a warm cream, so warm is the resting state and cold is a
desaturated, blue-shifted version of the same token. *Cold room, hot alarm*: an
overloaded screen goes cool and grey with the hot red `ZoneChip` sitting on top of it.

One inherited scalar carries it. `tempFor(energy)` in
[src/logic/energy.ts](src/logic/energy.ts) returns `0` (warm) at 60 energy and `1`
(cold) at 20, and `App.tsx` sets it on the app root exactly once:

```tsx
<div data-ambient style={{ '--temp': temp } as CSSProperties}>
```

The endpoints and the mixing live in the **Ambient temperature** block at the bottom of
`src/index.css` — `--canvas-warm` / `--canvas-cold` and the same pair for `--surface`
and `--surface-2`, combined with `color-mix(in oklab, …)`. **No component ever learns
that a colour moved**, so the no-hex-in-a-component rule still holds.

Four things this is built to protect:

- **Only canvas and surfaces move.** Zone colours, pastel tiles, chips, buttons and the
  mascot are fixed. Saturated hue keeps meaning "how are you doing" and nothing else.
- **The mix is gated behind `[data-ambient]`.** Without that attribute every token
  resolves to exactly its `:root` value — which is why the published DS package and its
  previews render unchanged.
- **`@property --temp` makes it a real animatable number**, so the screen cross-fades
  over 600ms on `--ease` instead of snapping. The `prefers-reduced-motion` block still
  zeroes it: the colour changes, it just stops animating.
- **Temperature never carries meaning alone.** The number, the `ZoneChip` label and the
  mascot expression all still say it in words.

Dark mode needs no second formula — `.dark` overrides the two endpoints and the same
mix re-resolves.

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

Primitives are published from `src/ds`; screens live in `src/pages`, feature UI in
`src/features`, and the shell and navigation in `src/App.tsx`. Note we deliberately
use **only `ThemeProvider`** from `@figma/astraui` — nav, avatar, badges, tabs and
chat are hand-built so nothing renders in the kit's own idiom.

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

### Colour overrides on primitives

Three primitives take an explicit fill so a screen can soften a pill without
inventing a second component: `Tag bg`, `Initials bg`, and `OasisBlob`'s
`fillColor` / `strokeColor` / `mouthFill` / `mouthStroke` / `eyeHighlightFill`.
Two rules govern all of them.

- **Pass a token, never a literal.** These sit under text, and a hex that looks
  right in light mode goes unreadable the moment `.dark` swaps the ground.
- **Do not override `OasisBlob`'s fill on a readout.** The zone owns that colour
  and reporting the zone is the mascot's whole job; an override is for the places
  it is a logo mark. `Tag bg` is the softer case — `DailyCheck` passes `--butter`
  because the pill at full `--highlight` out-shouted the question under it.

### `OasisBlob`

Inline SVG mascot, `viewBox="0 0 200 200"`, `strokeWidth="4"`. Expression is bound
to `ZoneKey`: smile / flat line / frown. It **reports** state, it does not collect
it — it is not a mood-logging feature.

Sizes in use: 124 (dashboard hero), 118 (recovery hero), 104 (band hero), 64
(simulator), 40 (side rail logo), 34 (chat avatar). `float={false}` disables the
idle animation for small instances.

### Oasis AI

One assistant, three routes, all of them spending the same energy model:

- **Consultant** — `logic/assistantDecision.ts` answers questions about the week
  ("can I accept 4h?", "what are my deadlines?").
- **Agent** — `logic/assistantAgent.ts` reads an add-or-remove instruction and
  returns a *proposal*. It never dispatches.
- **Shared chat** — a pasted thread is priced in the transcript, then hands off
  to the Decision Check.

A proposal renders as a card under the reply, carrying the task, the date, the
hours and the projected score. Nothing reaches the store until **Confirm**. An
app whose argument is "see what this costs before you say yes" cannot be the
thing that quietly adds four hours to your Thursday, so the confirm step is
where the cost gets shown — which makes the confirm step the product.

`App.tsx` owns `DecisionSheet`, not the panel: on mobile the assistant is itself
a full-screen sheet, and two nested focus traps would fight over one Escape key.

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
- Every dismissable surface uses `useSheet()` (`src/features/shell/useSheet.ts`):
  focus in on open, `Escape` to close, focus returned to the trigger. Pass
  `{ trap: true }` **only** for a surface that covers the screen behind a
  backdrop — trapping focus in an inline panel the page is visible around holds
  a keyboard user inside content they can see past. Inline panels take
  `role="dialog"` + `aria-labelledby` and no `aria-modal`; overlays take all three.
- New mobile controls are ≥44×44px. Results that appear without a navigation —
  a verdict, a recomputed score, a parse readout — sit in an `aria-live="polite"`
  region.

### Reaching a small control: `.hit-44`

Some controls have to stay small to read correctly — a 22px tick inside a card
that is itself a button would become the card's control if drawn at full size.
`.hit-44` buys the reach without changing what is drawn: `position: relative`
plus a centred transparent `::after` at `max(100%, 44px)` square. The drawn box
keeps its size; the tappable one grows around it.

It does not work everywhere, and the two exceptions are not stylistic:

- **Replaced elements** — `<select>`, `<input>` — have no `::after`. Give those a
  real `minHeight: 44`.
- **A row that wraps.** The claimed ring overflows the element, so on a wrapped
  line it lands on top of the chip below and swallows its taps. `DailyCheck`'s
  mood chips use a real `minHeight: 44` for exactly this reason.

Before reaching for it, check the ring it claims still fits inside its parent's
padding. An 11px ring inside a `p-3` card does; inside a `p-1` one it does not.

### Headings

- **One `h1` per screen, first in the DOM.** Where the design opens on a readout
  rather than a title, the `h1` is `sr-only` — the dashboard's is. Do not promote
  a heading that sits below other content to fix this: reordering the DOM to put
  it first splits focus order from visual order, which is the worse trade.
- **A sheet's title is an `h2`**, and carries the `id` that the dialog's
  `aria-labelledby` points at. Content headings inside the sheet go `h3` down.
- Section headings on a page are `h2`. Never skip a level to get a size — the
  `t-*` classes set size and weight outright, so any heading tag renders at any
  size with no visual cost.

### Accessible names

- **The accessible name leads with the words on the control.** A name that only
  paraphrases the visible text leaves a speech-input user saying what they can
  see and hitting nothing (WCAG 2.5.3). `aria-label="How is this worked out? The
  energy score, explained"` on a button reading *How is this worked out?* — the
  visible string first, the disambiguation after.
- **The exception is a composite row**, where the visible content is a block
  rather than a label: `RequestInbox`'s rows carry
  `aria-label="Open request from {asker}: {title}"` rather than the concatenated
  name, sleeve, hours and date that a screen reader would otherwise read out.
  Full containment is not achievable there, and the summary is the better name.

### Focus, when the thing you clicked disappears

`useSheet()` restores focus to its opener on unmount. That contract breaks when
answering removes the opener from the DOM — a request row that leaves the inbox
once it is answered has nothing to hand focus back to, and focus falls to
`<body>`. **The list owns the restore in that case**, not the sheet: move focus
to the next row, or to the heading above an emptied list.

A live region has to be **mounted and empty before it has anything to say**. A
region that appears at the same moment as its text is a new node, not a changed
one, and screen readers announce nothing.

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
9. Read colour from `--canvas` / `--surface`, never a fixed cream. The ambient
   scale moves them, and anything hardcoded will drift off the page around it.
10. Anything dismissable goes through `useSheet()`; anything that changes a
    number without a page change announces it with `aria-live="polite"`.
11. One `h1`, first in the DOM — `sr-only` if the design has no title. Section
    headings `h2`, sheet titles `h2`, nothing skipped.
12. Any `aria-label` on a control with visible text starts with that text.
13. Under 44px and it has to stay that way? `.hit-44` — unless the element is
    replaced or its row wraps, and then a real `minHeight`.
