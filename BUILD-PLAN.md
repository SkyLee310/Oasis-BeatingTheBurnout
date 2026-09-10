# Oasis — build plan, steps 4 to 8

Handoff document for coding agents. Steps 1–3 are **done and pushed**; everything
below is open work. Read [AGENTS.md](AGENTS.md) and [DESIGN.md](DESIGN.md) first —
this file assumes both.

Target: **CodeNection 2026 Prototype Phase, 7–13 Sep 2026**, ≤5 minute demo video.

---

## 0. Ground rules — do not break these

| Rule | Why |
|---|---|
| **`src/ds/**` is untouched.** No new files, no edits. | It is a published package with a verified build and ten graded previews. `PhoneFrame` is a future promotion candidate; keep it app-level. |
| **Never hand-edit `index.html`.** | Figma Make owns it through the `<!-- figma:* -->` slots consumed by `figmaSiteConfiguration` in [vite.config.ts](vite.config.ts). Put head content in `.figma/make/site.json → customScripts.headEnd`. |
| **No new hex literals in components.** | Every colour is a CSS variable in [src/index.css](src/index.css). If you need a colour that does not exist, add the token there, not inline. |
| **No new dependencies.** | Zero-dependency posture is deliberate: no router, no state library, no HTTP client. Routing is `window.location.search`. |
| **The design language is settled.** | Neo-brutalist: `2px solid var(--ink)` on every surface, `4px 4px 0` hard shadow, Archivo 800 display, Plus Jakarta Sans 500 body. Compose existing DS primitives and existing utility classes. Do not invent a second component system. |
| **Saturated hue means one thing only: the health zone.** | Green/amber/red is the reading. Pastel tiles are decoration. Never colour something red for emphasis. |
| **Every zone colour keeps a paired text label.** | `<ZoneChip>` next to any zone-coloured element. Colour alone is never the message. |
| **Reducers stay pure.** | No `Date.now()`, no `crypto.randomUUID()` in [src/state/store.tsx](src/state/store.tsx). Ids are derived from state so the demo replays identically on camera. |

`pnpm` is **not on PATH** in the agent shell. Use the binaries directly:

```bash
./node_modules/.bin/tsc --noEmit -p tsconfig.json
```

```bash
./node_modules/.bin/vite build
```

The dev server is already running on `$PORT` (default 8443) — do not start another.

---

## 1. Where the build is now

Three commits on `design-system-extraction`:

| Commit | What landed |
|---|---|
| `26c3671` | Pages split out of `App.tsx`; shared store; `src/logic/energy.ts`. Every screen derives its number instead of hardcoding `38`. |
| `903f926` | Ambient temperature — canvas and surfaces warm as energy rises, cool as it falls. |
| `069cce6` | **Decision Check** — a shared chat is parsed, priced and answered. |

### Still open

- **Steps 4–8 below.**
- **Navigation change** (small, bundle it with step 4): `NAV_ITEMS` at [src/App.tsx:25](src/App.tsx:25) is still `Dashboard · Schedule & load · Recovery · Smart band`. It must become **Home · Schedule · Group · Recovery**. Smart band leaves the bar but stays in the app — its live HR/sleep card moves onto Home with an "Open device" link to the existing `band` page. `NAV_ITEMS` is the only edit; both `SideRail` and `MobileNav` read from it, and the 58px centre mic FAB is unaffected.
- **Known, deliberately unfixed:** `src/state/store.tsx` breaks React Fast Refresh (context + hooks + provider in one module). Dev-only; a full reload clears it. Do not restructure the store to chase it.
- **Queued follow-up:** a design-sync re-run for the ambient temperature tokens. Not a blocker — default rendering is unchanged.

---

## 2. The APIs you already have

**Do not re-derive any of this.** Read the files before writing anything that
touches them.

### State — [src/state/types.ts](src/state/types.ts)

`OasisState` is `{ today, scenario, commitments, recovery, requests, project, commute, checkIn, decisions, record }`.
Dates are ISO `YYYY-MM-DD` throughout so they sort and compare as strings.

**The types for steps 4, 6 and 7 already exist** — `GroupProject`, `Member`,
`ProjectTask`, `MemberStatus`, `CommuteState`, `CommuteMode`, `DailyCheckIn`,
`DecisionLogEntry`. Use them as written; extend only if you genuinely must, and
say so in the commit message.

`Page` already includes `'group'` and `'how'`.

### Store — [src/state/store.tsx](src/state/store.tsx)

```ts
useOasis(): OasisState
useDispatch(): Dispatch<Action>
useEnergy(): { energy, zone, temp, factors }   // memoised on the state object
```

Actions, all already implemented in the reducer:

```
reset · setScenario · addCommitments · removeCommitment · deferCommitment
addRequest · resolveRequest · checkIn · toggleRecordShare
setMemberStatus · assignTask · toggleTaskDone
```

Persisted to `localStorage` under `oasis.v1`, `SCHEMA = 2`. Seeded from
[src/state/seed.ts](src/state/seed.ts); the demo week is **Mon 7 – Sun 13 Sep 2026**,
anchored on **Wed 9 Sep**, default scenario `nearCapacity`.

### Logic — `src/logic/`

| Module | Exports |
|---|---|
| `energy.ts` | `energyFor` `zoneFor` `tempFor` `projectEnergy` `energyFactors` `commitmentCost` `stressFor` `weekHours` `weekBlocks` `avgSleep` **`tripDays`** **`commuteHours`** `ZONE_GREEN_AT` `ZONE_AMBER_AT` |
| `dates.ts` | `dayOf` `dateOf` `monthOf` `monthLongOf` `shortDate` `longDate` `addDays` `planDate` `nextDow` |
| `week.ts` | `weekStart` `weekDays` `weekLabel` |
| `text.ts` | `lowerFirst` `withoutDue` |
| `decision.ts` | `parseChat` `analyzeRequest` `replyFor` `TONE_ORDER` `toneLabel` `DECISION_THRESHOLDS` `decisionHeadline` `decisionLead` + types `Decision` `Tone` `Verdict` `Reason` |

Energy is `100 − stress`, a transparent five-factor weighted sum:
`{ academic: 30, sleep: 25, density: 20, physiological: 15, commute: 10 }`.
Zones: green ≥ 60, amber ≥ 30, red below.

**Note, after the step 6 cut:** `tripDays()` and `commuteHours()` still exist in
`energy.ts` and commute is **still charged** its 10 points. What went was the UI
— `src/logic/commute.ts`, `src/features/commute/*`, the fifth `LoadTab`. Do not
remove the term from `WEIGHTS` to "finish" the cut: the measurement is the point.

### Design system — `src/ds/index.ts` (import from `'../ds'`)

```
SW · ZONE_LABEL · zoneAccent · zoneTile · type ZoneKey
CALENDAR_WEEK · KIND_STYLE · type CalDay/CalEvent/EventKind
ZoneChip · Tag · Initials · OasisBlob · CircularGauge
Sparkline · SleepBars · StatTile · LoadBar · WeekCalendar
```

Icons are `lucide-react` at `strokeWidth={SW}` (2.25).

### CSS you should be using — [src/index.css](src/index.css)

Classes: `card` `card-pop` · `tile` `tile-mint|sky|blush|butter|lilac|cream` ·
`chip` `chip-lg` `chip-selected` · `btn` `btn-primary` `btn-secondary` `btn-icon` ·
`focus-ring` `press` · `t-hero` `t-title` `t-sub` `t-label` `t-body` `t-eyebrow`
`t-micro` `t-stat` · `text-ink` · `sr-only` · `hide-mobile`

Tokens: `--ink` `--ink-2` `--ink-muted` · `--canvas` `--surface` `--surface-2` ·
`--mint` `--sky` `--blush` `--butter` `--lilac` (+ `-deep` variants) ·
`--highlight` · `--r-sm` (12px) `--r-md` (18px) `--r-lg` (24px) · `--ease` · `--temp`

**Ambient temperature:** the app root carries `data-ambient` and `--temp`.
`--canvas` / `--surface` / `--surface-2` are `color-mix`ed from warm and cold
endpoints behind that attribute. Components know nothing about it — **do not read
`--temp` in a component**, and do not add a second mixing rule.

### Reference implementation

**Read [src/features/decision/](src/features/decision/) before starting any step.**
It is the worked example of everything above: `DecisionSheet` (orchestrator with
phases), `ShareIntake` (phone mock + paste + sample chips), `VerdictCard`
(gauge + zone chip + expandable reasoning), `ReplyComposer` (tone chips +
editable text + clipboard). Match its structure, comment density and idiom.

---

## 3. Step 4 — Group project + shared stress link

**The second of the three specialisms.** Takes Smart band's navigation slot.

### Files

| File | Status | What it does |
|---|---|---|
| `src/logic/group.ts` | new | `balance(project)` → per-member share of total task weight, flagging anyone above **1.5× fair share**. `proposeRebalance(project)` → a group-chat message naming which tasks to move and to whom. |
| `src/pages/GroupPage.tsx` | new | Project header (name, course, deadline, your share, team fairness bar), members list, tasks list. |
| `src/features/group/InviteSheet.tsx` | new | Generates `oasis.app/j/<code>`, a prefilled group-chat message, real `navigator.clipboard` copy, and a **`wa.me` deep link that genuinely works on a phone**. |
| `src/features/group/JoinLanding.tsx` | new | What the invitee sees at `?join=<code>`. |
| `src/App.tsx` | modify | `NAV_ITEMS` → Home · Schedule · Group · Recovery; add the `group` page to the switch; read `?join=` from `window.location.search` once and render `JoinLanding` instead of the shell. |
| `src/pages/DashboardPage.tsx` | modify | Add the Smart band card (live HR/sleep) with an "Open device" link to the `band` page, since Band leaves the nav bar. |

### Behaviour

- **Members have three visible states**, driven by `MemberStatus`:
  `joined` — has Oasis, their task load shows;
  `invited` — link sent, waiting on install;
  `none` — an INVITE button.
  `you` is the user.
- **Fairness is measured in task weight, not task count.** `ProjectTask.weight`
  is 1–5 and already seeded.
- **"Propose a rebalance"** produces a copyable message. This is the actual answer
  to "group assignment problems" — a member list alone is not.
- **`?join=<code>` is a real URL you can open on a second phone during the video.**
  Has the app → "Add this project", and it lands in their Oasis. No app → install
  prompt with Add-to-Home-Screen steps.
- **Privacy, stated on screen:** teammates see the project split, never anyone's
  personal energy score. Put this in the UI as a sentence — it is a real product
  decision and a strong pitch line.

### Done when

Invite a member → copy the link → open `?join=<code>` in a second tab → add the
project → it appears on the Group page. Fairness bar reflects `assignTask` and
`toggleTaskDone` immediately.

---

## 4. Step 5 — Widget + installable PWA — **CUT**

> **Cut on 10 Sep 2026** by the REPLAN restructure. `src/features/widget/*` and the
> `?view=widget` branch in `src/App.tsx` are deleted; nothing below was kept. The
> section stays because the reasoning is worth reading before anyone proposes it
> again: a home-screen mock is a camera-facing asset, and the prototype has four
> days left to spend on the thing that actually breaks a student. Everything from
> here to the end of this section is history, not a task list.

**The "would students keep it on their phone" answer.**

| File | Status | What it does |
|---|---|---|
| `src/features/widget/PhoneFrame.tsx` | new | One reusable device frame. Also retrofit `ShareIntake`'s inline mock to use it. |
| `src/features/widget/WidgetPreview.tsx` | new | Home-screen mock across all four scenario states + a lock-screen variant. Reached from Home ("On your phone"). **This is the camera-facing asset.** |
| `src/features/widget/WidgetView.tsx` | new | The **real** glanceable view at `?view=widget`: energy number, zone, next free slot, one action. What the installed app opens to. |
| `public/manifest.webmanifest` | new | **Relative `start_url` and `scope`** so the Figma subpath deploy still resolves. |
| `public/sw.js` | new | Tiny cache-first shell. Register **only** under `import.meta.env.PROD`. |
| `public/icon.svg` | new | The Oasis blob with maskable safe-zone padding, listed as `"sizes": "any"`. |
| `.figma/make/site.json` | modify | `title` → `Oasis`; PWA meta via `customScripts.headEnd`; **`accessibility.addBypassLinks: true`** (currently `false` — the plugin already ships a skip-to-content link; one line, free rubric point). |
| `src/App.tsx` | modify | `?view=widget` branch. |

PNG icons at 192/512/180 are a later drop-in — Huixuan can export them from Figma
with no code change. Without `apple-touch-icon.png` iOS falls back to a screenshot:
acceptable for the prototype, but **tell the team**.

### Done when

`lighthouse_audit` reports the app installable, and `?view=widget` shows the same
number as Home after a decision changes it.

---

## 5. Step 6 — Commute — **CUT, except the charge**

> **Cut on 10 Sep 2026** by the REPLAN restructure. `src/logic/commute.ts`, all of
> `src/features/commute/*` and the fifth `LoadTab` are deleted, and no `setCommute`
> or `toggleTrip` action was ever added.
>
> **What survives, deliberately:** `commuteHours()` and `tripDays()` still run in
> `energy.ts` and commute still carries its **10 points** in `WEIGHTS`, and
> `state.commute` is still seeded and still read. Commute is measured and still
> counted — it just has no screen. Do not remove the term to "finish" the cut.
>
> Everything from here to the end of this section is history, not a task list.

**The third specialism.** A fifth tab on the Schedule page.

| File | Status | What it does |
|---|---|---|
| `src/logic/commute.ts` | new | `parseTimetable(text)` → `Commitment[]` from blocks like `MON 0900-1100 DES2201`. `mergeSuggestions(state)` → days carrying one short class. |
| `src/features/commute/*` | new | Trip setup (campus, mode, door-to-door minutes each way), timetable import, weekly total, merge cards. |
| `src/pages/LoadPage.tsx` | modify | Add `'commute'` to the `LoadTab` union at [line 17](src/pages/LoadPage.tsx:17) and a fifth entry to the `tabs` array at [line 76](src/pages/LoadPage.tsx:76). The existing `role="tablist"` chip pattern extends directly. |

### Behaviour

- **Import timetable** — paste a block, or pick one of three sample university
  timetables. Real parse, with a manual "add class" fallback.
- **Weekly total as a real number** — *"6h 10m on the road this week — that's 8
  energy points."* The charge already exists (`commuteHours` in `energy.ts`); the
  tab surfaces and explains it.
- **Merge trips** — find days carrying one short class:
  *"Tuesday: 2h travel for a 1h class. Move the DS consult to Wednesday and skip
  the trip → +6 energy."* One tap applies it (`toggleTrip` + `deferCommitment`);
  the store updates and the week reflows.

### Done when

Import a timetable → merge a trip → the week and the energy total both reflow, and
the ambient canvas warms.

---

## 6. Step 7 — Daily check, How-it-works, demo switcher

Three small features; one step because none is big enough to be its own.

| File | Status | What it does |
|---|---|---|
| `src/features/checkin/DailyCheck.tsx` | new | Three 3-option questions (slept / mood / load), ~10 seconds, at the top of Home. Writes via `checkIn` and **visibly moves the number**. Shows once per day (`checkIn.date`); skip always available. |
| `src/pages/HowItWorksPage.tsx` | new | The `'how'` page. Plain-language walkthrough of the formula **with the user's current values plugged in** — render `energyFactors(state)`, quote `DECISION_THRESHOLDS`, and state what Oasis never does (it does not read your chats in the background; you choose what to share). Reachable from any energy number via a small "How?" affordance. |
| `src/features/demo/ScenarioBar.tsx` | new | Hidden behind `?demo=1` or `Shift+D`. Flips `state.scenario` between **Week 1 (empty) / All clear / Near capacity / Red zone** via `setScenario`. Everything downstream is derived, so one click restages the whole app. **Hidden by default so judges never see scaffolding.** |

### Done when

`Shift+D` cycles all four scenarios and every screen restages, Week 1 empty
included; the temperature sweeps smoothly both ways.

---

## 7. Step 8 — Accessibility pass and full verification

**Do not defer this — it is an explicit rubric line.**

- **Sheets:** focus trap, `Esc` closes, focus returns to the trigger,
  `role="dialog"` + `aria-modal` + `aria-labelledby` on the heading.
  ~~**`DecisionSheet` currently renders as an inline panel with `Esc`-to-close but
  no focus trap and no dialog role — promoting it is part of this step.**~~
  **Done** — every sheet now goes through `useSheet({ trap: true })` and carries
  `role="dialog"` + `aria-modal` + a labelled `h2`.
- Verdict results and energy changes announced with `aria-live="polite"`.
- ≥44×44px touch targets on every new mobile control.
- Demo switcher fully keyboard reachable; `.focus-ring`
  (`3px solid var(--ink)`) on every new interactive element.
- Bypass link on via `site.json`.
- New pastel-on-pastel combinations reach **≥4.5:1** — and re-check the existing
  ones against the **cold** end of the ambient scale, light and dark, since the
  canvas they sit on now moves.
- Ambient temperature never carries meaning alone: the number, the `ZoneChip`
  label and the mascot all still say it in words, and the transition is disabled
  under `prefers-reduced-motion`.

### Full verification

- `tsc --noEmit` and `vite build` clean; **`build:ds` still clean**, and a DS
  component mounted **without** `data-ambient` renders identically to today — the
  check that `src/index.css` stayed additive.
- Browser pane at **375×812 mobile** and desktop:
  - Paste a chat → verdict → decline → the energy number changes on Home and on
    the schedule, **and the canvas visibly warms**.
  - `Shift+D` Red zone ⇄ All clear, light and dark, and with reduced motion
    forced on it snaps instantly.
  - Invite → copy → `?join=<code>` in a second tab → add → appears on Group.
  - Import timetable → merge a trip → week and total reflow.
- Keyboard-only pass on each sheet: tab in, `Esc` out, focus returns.
- `lighthouse_audit` accessibility score on Home and Group. (Installability is
  moot — step 5 is cut.)
- Dark mode holds on every new surface (`.dark` on `<html>`).

---

## 8. Working in parallel

Steps 4–7 touch mostly disjoint files. **Steps 5 and 6 are cut**, so what remains
to parallelise is 4, 7 and 8. The contention points:

| File | Wanted by | How to avoid conflicts |
|---|---|---|
| `src/App.tsx` | 4 (nav + `?join=`), 7 (`?demo=1`) | **Step 4 lands the URL-mode switch first**, as one `useState` reading `window.location.search` once. Step 7 then adds a branch. Do not have two agents restructure the shell. |
| `src/pages/DashboardPage.tsx` | 4 (band card), 7 (daily check) | Each adds one section. Land them in step order, rebase between. |
| `src/index.css` | any step needing a token | Append only. Never edit the `:root` or `.dark` literals — the ambient scale depends on them staying exactly as they are. |
| `src/state/types.ts` | any step extending a shape | The shapes for 4, 6 and 7 already exist. If you must change one, bump `SCHEMA` in `store.tsx` and say so loudly. |

Suggested split: **one agent takes 4 + 8's Group items**, step 7 next by whoever
is free. Step 4 must land its `App.tsx` change before the others start on theirs.

## 9. Definition of done, every step

1. `./node_modules/.bin/tsc --noEmit -p tsconfig.json` clean.
2. `./node_modules/.bin/vite build` clean.
3. Clicked through in the browser at 375×812 **and** desktop, light **and** dark.
4. One commit per step, message in the repo's existing voice — say what changed
   and why it matters, not which files moved.
5. `DESIGN.md` updated if you added a pattern; per that file's own rule,
   `.design-sync/conventions.md` gets a matching hand-derived sentence.
