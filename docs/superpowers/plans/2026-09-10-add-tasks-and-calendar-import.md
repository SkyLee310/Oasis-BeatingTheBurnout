# Add Tasks, Add Schedule Items, Calendar Import — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a student add a group task, add a schedule item, and bulk-import a real calendar (Google, Outlook, Apple, university timetable) into the week Oasis plans.

**Architecture:** Bottom-up in three layers. A shared pure factory (`compose.ts`) mints deterministic `Commitment` objects so the reducer stays pure. Two small forms write through it. Then a dependency-free `.ics` parser plus a mapping layer turn a calendar export into a reviewable list of the same drafts — import is "add a schedule item" at volume, reusing every rule the manual form established.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8, Tailwind v4, `lucide-react`. **No new dependencies anywhere in this plan.**

**Spec:** None separate — the design was agreed in chat and is stated in "Design decisions" below.

---

## Design decisions

**Why `.ics` is the Google Calendar path.** No backend exists, so:

| Route | Verdict |
|---|---|
| Google Calendar → Settings → Import & export → **Export** (`.ics`), user picks the file | **Chosen.** No credentials, no network. The same code imports Outlook, Apple Calendar, Notion Calendar and university timetables — that is the "something else". |
| Google's **secret iCal URL** | **Impossible in a browser.** Google serves it with no `Access-Control-Allow-Origin`; a `fetch` is blocked by CORS. Needs a proxy. Do not spend an evening on it. |
| **Calendar API v3 + OAuth** | Real, specified as optional Task 10, deliberately after the demo — needs a Cloud project and shows an unverified-app warning unless the account is a listed test user. |

**RRULE is required — reversing an earlier call.** It was said in chat that recurrence "buys you nothing on camera". That is wrong here: a Google Calendar export of a class timetable is almost entirely `RRULE:FREQ=WEEKLY` — each weekly lecture is *one* VEVENT with a rule, not thirteen entries. Skipping RRULE imports a nearly empty week. Scope stays small because Oasis renders exactly 7 days, so expansion tests at most 7 candidate dates and never materialises an unbounded series.

**Timezones, bounded.** Only a local date and a display string are needed, never cross-zone arithmetic, so no tzdata ships. UTC (`...Z`) converts through the browser's zone; `TZID=` is taken as wall clock — correct for a student importing their own timetable, and the preview shows every time before anything is written.

**Everything is reviewed before it is written.** The sheet lists what it found, pre-unticks duplicates, shows the energy consequence, then dispatches once.

---

## Global Constraints

Implicitly part of every task.

- **`pnpm` is not on PATH; `npm` 11.12.1 is.** Verify with `npm run typecheck`. Fallback: `node node_modules/typescript/bin/tsc --noEmit`.
- **No test framework, by the user's explicit decision.** Do not add vitest or jest. Verification = typecheck + a named browser check + (for the two pure modules only) a throwaway Node probe.
- **Do not run `npm run format`** — bare `oxfmt` rewrites the whole repo. Match style by hand: 2-space indent, no semicolons, single quotes, trailing commas.
- **The reducer is pure.** No `Date.now()`, `crypto.randomUUID()` or `Math.random()` in `src/state/store.tsx`. Callers mint ids. This is what makes the demo replay identically on camera.
- **Dates are ISO `'YYYY-MM-DD'`.** `state.today = '2026-09-09'`; the rendered week is `2026-09-07` … `2026-09-13`.
- **`SCHEMA` stays 4.** Every change here leaves stored state incomplete, never wrong, and `hydrate()` spreads it over a fresh seed.
- **Design system only:** `card`, `card-pop`, `tile`, `chip`, `chip-selected`, `btn`, `btn-primary`, `btn-secondary`, `btn-icon`, `focus-ring`, `hit-44`, `t-sub`, `t-body`, `t-label`, `t-micro`, `sr-only`, and `var(--ink)`, `var(--ink-2)`, `var(--ink-muted)`, `var(--surface)`, `var(--surface-2)`, `var(--butter)`, `var(--mint-deep)`, `var(--r-sm)`, `var(--r-md)`. Invent no CSS.
- **Form controls carry inline styles** matching `ShareIntake.tsx:99-114`: `background: 'var(--surface)'`, `color: 'var(--ink)'`, `border: '2px solid var(--ink)'`, `borderRadius: 'var(--r-sm)'`, `minHeight: 44`. Every input gets a label, `sr-only` where there is no room.
- **Dev server:** `.claude/launch.json` name `oasis-dev`, port 5177. Start it with the preview tool, never Bash.
- **Reset between browser checks:** `localStorage.removeItem('oasis.v1')` then reload.
- Commit after every task. Do not push.

---

### Task 1: `addTask` action and the `'manual'` origin

**Files:**
- Modify: `src/state/types.ts:32`
- Modify: `src/state/store.tsx` — type imports (16-19), action union (after :59), reducer (after :163)

**Interfaces:**
- Consumes: `inProject()` — existing private helper, `src/state/store.tsx:70-76`.
- Produces: `{ type: 'addTask'; projectId: string; task: ProjectTask }`; `Commitment['origin']` widened with `'manual'`.

- [ ] **Step 1: Widen `origin`**

`src/state/types.ts:32`, replace `origin: 'seed' | 'chat' | 'timetable' | 'group'` with:

```ts
  /** Where this came from. Written everywhere, branched on nowhere — it exists
   *  so a later screen can say "you added this". 'manual' is the add form;
   *  'timetable' is the calendar importer. */
  origin: 'seed' | 'chat' | 'timetable' | 'group' | 'manual'
```

Safe because `origin` is assigned in six places and compared in none.

- [ ] **Step 2: Re-import `ProjectTask`**

`src/state/store.tsx:16-19` — add `ProjectTask` to the type import list (it was removed earlier when nothing used it; `noUnusedLocals` fails on an unused import, so Step 4 must land in the same commit).

- [ ] **Step 3: Action variant**

After the `toggleTaskDone` line in the union (`src/state/store.tsx:59`):

```ts
  | { type: 'addTask'; projectId: string; task: ProjectTask }
```

- [ ] **Step 4: Reducer case**

After the `toggleTaskDone` case (ends `src/state/store.tsx:163`):

```ts
    case 'addTask':
      return inProject(s, a.projectId, p => ({ ...p, tasks: [...p.tasks, a.task] }))
```

Nothing else needs wiring — `balance()`, `capacityOf()` and `proposeRebalance()` all re-derive from `project.tasks`.

- [ ] **Step 5:** Run `npm run typecheck` → PASS, zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/state/types.ts src/state/store.tsx && git commit -m "feat(state): add addTask action and a 'manual' commitment origin"
```

---

### Task 2: Add-task form on the Group page

**Files:**
- Create: `src/features/group/AddTaskRow.tsx`
- Modify: `src/pages/GroupPage.tsx` — imports; inside the Tasks `<section>`, after the task-list ternary closes (~`:249`)

**Interfaces:**
- Consumes: `addTask` (Task 1), `GroupProject`, `useDispatch`, `SW`.
- Produces: default export `AddTaskRow({ project }: { project: GroupProject })`.

- [ ] **Step 1: Create `src/features/group/AddTaskRow.tsx`**

```tsx
import { useState } from 'react'
import { Plus, X } from 'lucide-react'

import { SW } from '../../ds'
import { useDispatch } from '../../state/store'
import type { GroupProject } from '../../state/types'

// ─── Add a task ───────────────────────────────────────────────────────────────
// A split you cannot add to is a split you stop trusting the moment the group
// agrees on something new in the chat. Weight is chips rather than a number
// field because the scale is 1-5 and every share on the page is a percentage of
// the total — one absurd figure rewrites everybody else's number.

const WEIGHTS = [1, 2, 3, 4, 5]

export default function AddTaskRow({ project }: { project: GroupProject }) {
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [weight, setWeight] = useState(3)
  const [assignee, setAssignee] = useState('')

  const reset = () => {
    setTitle(''); setWeight(3); setAssignee(''); setOpen(false)
  }

  const submit = () => {
    const clean = title.trim()
    if (!clean) return
    dispatch({
      type: 'addTask',
      projectId: project.id,
      task: {
        // Derived, never random: the reducer stays pure and the demo replays to
        // the same week. Scoped by project so two projects cannot collide.
        id: `${project.id}-t${project.tasks.length}`,
        title: clean,
        weight,
        assignee: assignee === '' ? null : assignee,
        done: false,
      },
    })
    reset()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="btn btn-secondary focus-ring hit-44 flex items-center gap-2 self-start">
        <Plus size={15} strokeWidth={SW} />
        Add task
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3.5" style={{
      background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)',
    }}>
      <div className="flex items-center justify-between gap-3">
        <span className="t-label text-ink">New task</span>
        <button onClick={reset} className="btn-icon focus-ring hit-44" aria-label="Cancel adding a task">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <label className="sr-only" htmlFor="new-task-title">Task name</label>
      <input id="new-task-title" value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Report write-up"
        className="t-body focus-ring w-full p-3"
        style={{
          background: 'var(--surface)', color: 'var(--ink)',
          border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)', minHeight: 44,
        }} />

      <div className="flex flex-col gap-2">
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Weight</span>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Task weight">
          {WEIGHTS.map(w => (
            <button key={w} onClick={() => setWeight(w)} aria-pressed={weight === w}
              className={`chip focus-ring hit-44 ${weight === w ? 'chip-selected' : ''}`}>
              {w}
            </button>
          ))}
        </div>
      </div>

      <label className="sr-only" htmlFor="new-task-assignee">Who is doing it</label>
      <select id="new-task-assignee" value={assignee} onChange={e => setAssignee(e.target.value)}
        className="t-micro focus-ring"
        style={{
          background: 'var(--surface)', color: 'var(--ink)', border: '2px solid var(--ink)',
          borderRadius: 'var(--r-sm)', padding: '6px 8px', minHeight: 44,
        }}>
        <option value="">Nobody yet</option>
        {project.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>

      <button onClick={submit} disabled={title.trim() === ''}
        className="btn btn-primary focus-ring hit-44 self-start"
        style={{ opacity: title.trim() === '' ? 0.5 : 1 }}>
        Add to the split
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Mount it**

Import in `src/pages/GroupPage.tsx`:

```tsx
import AddTaskRow from '../features/group/AddTaskRow'
```

Inside the Tasks `<section>`, after the `)}` closing the `project.tasks.length === 0 ? … : (…)` ternary and before `</section>`:

```tsx
          <AddTaskRow project={project} />
```

Outside the ternary on purpose, so it is reachable from the empty state too — which already promises "Add them and the split appears."

- [ ] **Step 3:** `npm run typecheck` → PASS.

- [ ] **Step 4: Browser check**

Group page, seed data.
1. Note "You hold" on Data Structures — **69%**.
2. **Add task** → `Poster design`, weight **5**, assignee **Maya** (`status: 'you'`) → **Add to the split**.
3. Expect: row appears on `var(--surface-2)`; "You hold" rises to **73%**; the "Across every project" bar for Data Structures grows; the form collapses.
4. Add another with **Nobody yet** → row renders on `var(--butter)` and the "N unclaimed" counter increments.
5. Console: zero errors. Then reset storage and reload.

- [ ] **Step 5: Commit**

```bash
git add src/features/group/AddTaskRow.tsx src/pages/GroupPage.tsx && git commit -m "feat(group): add a task to the split from the Group page"
```

---

### Task 3: `compose.ts` — the deterministic commitment factory

Shared dependency of Tasks 4 and 7. Also fixes a live id-collision bug and relocates two constants out of `assistantAgent.ts`.

**Files:**
- Create: `src/logic/compose.ts`
- Modify: `src/logic/assistantAgent.ts` — delete local `DEFAULT_HOURS` (49-51) and `MAX_HOURS` (53); import from `compose`; replace the commitment literal (131-147)

**Interfaces:**
- Produces: `MAX_HOURS` (12); `DEFAULT_HOURS: Record<EventKind, number>`; `CommitmentDraft { title; kind; date; time; hours; origin }`; `newCommitment(s, draft, offset?): Commitment`.

- [ ] **Step 1: Create `src/logic/compose.ts`**

```ts
import type { EventKind } from '../ds'
import type { Commitment, OasisState } from '../state/types'

// ─── Composing a commitment ───────────────────────────────────────────────────
// The reducer is pure — no Date.now(), no crypto.randomUUID() — so the same
// actions always replay to the same week and the demo cannot drift on camera.
// The cost is that the dispatcher mints the id, and there are now three of them:
// the assistant, the add form, and the calendar importer. This knows how.

/** Nothing costs more than this in a day. A 26-hour event is a typo, not a Tuesday. */
export const MAX_HOURS = 12

/** Per-kind fallback when no figure is stated. Rest costs 0. */
export const DEFAULT_HOURS: Record<EventKind, number> = {
  deadline: 3, class: 2, commitment: 2, rest: 0, alert: 1,
}

/** Everything about a commitment except its identity. */
export interface CommitmentDraft {
  title: string
  kind: EventKind
  date: string
  /** Display time, e.g. '9am', 'all day'. Never parsed back. */
  time: string
  hours: number
  origin: Commitment['origin']
}

const slug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'item'

/**
 * A commitment with a derived id.
 *
 * The old id was `${prefix}-${commitments.length}` alone, which collides: add,
 * delete a different one, add again, and the length is back where it started —
 * two commitments then share an id, so commitmentCost() prices the wrong one and
 * removeCommitment deletes both. Folding the title in fixes that without
 * randomness, which the pure reducer forbids.
 *
 * `offset` is for callers writing several at once: an import dispatches one
 * addCommitments with N drafts, each needing a different length to count from.
 */
export function newCommitment(s: OasisState, draft: CommitmentDraft, offset = 0): Commitment {
  return {
    id: `${draft.origin}-${s.commitments.length + offset}-${slug(draft.title)}`,
    title: draft.title,
    kind: draft.kind,
    date: draft.date,
    time: draft.time,
    hours: Math.round(Math.min(draft.hours, MAX_HOURS) * 10) / 10,
    // A deadline is a fixed point; a class is somebody else's timetable. Only
    // what you chose to put in your week can be moved back out of it.
    movable: draft.kind === 'commitment' || draft.kind === 'rest',
    origin: draft.origin,
  }
}
```

- [ ] **Step 2:** In `src/logic/assistantAgent.ts` delete lines 49-53 (the local `DEFAULT_HOURS` block and `MAX_HOURS`) and add:

```ts
import { DEFAULT_HOURS, MAX_HOURS, newCommitment } from './compose'
```

- [ ] **Step 3:** Replace the return object at the end of `parseAgentIntent` (131-147) with:

```ts
  return {
    kind: 'add',
    commitment: newCommitment(s, {
      title,
      kind,
      date: dateFrom(rest, s.today),
      time: timeFrom(rest),
      hours,
      origin: 'chat',
    }),
  }
```

**Behaviour change a reviewer must accept:** `movable` for an assistant-added `class` goes from `true` (old rule `kind !== 'deadline'`) to `false` (new rule: only `commitment` and `rest` move). That is the intended rule — a lecture is not yours to defer. Ids also change shape from `ai-3` to `chat-3-gym-session`; ids are opaque and `LoadPage.tsx:73` compares only *seed* ids, which are untouched.

- [ ] **Step 4:** `npm run typecheck` → PASS. If it flags `EventKind` as unused in `assistantAgent.ts`, drop it from that file's type imports and re-run.

- [ ] **Step 5: Browser check** — open the assistant, type `add a 3h gym session on friday`. Expect the offer, then "gym session" on Friday with a fresh energy figure. Zero console errors. Reset storage.

- [ ] **Step 6: Commit**

```bash
git add src/logic/compose.ts src/logic/assistantAgent.ts && git commit -m "refactor(logic): extract a deterministic commitment factory and fix id collisions"
```

---

### Task 4: Add-schedule form on the Load page

**Files:**
- Create: `src/features/schedule/AddCommitmentForm.tsx`
- Modify: `src/pages/LoadPage.tsx` — imports; the "Interactive schedule" card, after the header row closes (~`:145`)

**Interfaces:**
- Consumes: `newCommitment`, `DEFAULT_HOURS`, `MAX_HOURS` (Task 3); existing `addCommitments`; `weekStart`; `addDays`, `dayOf`, `dateOf`.
- Produces: default export `AddCommitmentForm({ onAdded }: { onAdded: (date: string) => void })`.

- [ ] **Step 1: Create `src/features/schedule/AddCommitmentForm.tsx`**

```tsx
import { useState } from 'react'
import { Plus, X } from 'lucide-react'

import { KIND_STYLE, SW } from '../../ds'
import type { EventKind } from '../../ds'
import { addDays, dateOf, dayOf } from '../../logic/dates'
import { DEFAULT_HOURS, MAX_HOURS, newCommitment } from '../../logic/compose'
import { weekStart } from '../../logic/week'
import { useDispatch, useOasis } from '../../state/store'

// ─── Add to this week ─────────────────────────────────────────────────────────
// The schedule was readable and unwritable, which made every number on it an
// argument the student could not answer. Only the seven days the app plans are
// offered: a date picker that accepts March would produce a commitment no
// screen renders.

const KINDS: { kind: EventKind; label: string }[] = [
  { kind: 'deadline', label: 'Deadline' },
  { kind: 'commitment', label: 'Commitment' },
  { kind: 'class', label: 'Class' },
  { kind: 'rest', label: 'Rest' },
]

const DAYS_IN_WEEK = 7

export default function AddCommitmentForm({ onAdded }: { onAdded: (date: string) => void }) {
  const state = useOasis()
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<EventKind>('commitment')
  const [date, setDate] = useState(state.today)
  const [hours, setHours] = useState(DEFAULT_HOURS.commitment)
  const [time, setTime] = useState('')

  const start = weekStart(state.today)
  const week = Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(start, i))

  const reset = () => {
    setTitle(''); setKind('commitment'); setDate(state.today)
    setHours(DEFAULT_HOURS.commitment); setTime(''); setOpen(false)
  }

  // Switching kind re-defaults the hours: the figure that is right for a
  // deadline is not right for a rest block, and rest costing 3h would read as
  // the app punishing you for recovering.
  const pickKind = (k: EventKind) => { setKind(k); setHours(DEFAULT_HOURS[k]) }

  const submit = () => {
    const clean = title.trim()
    if (!clean) return
    dispatch({
      type: 'addCommitments',
      commitments: [newCommitment(state, {
        title: clean,
        kind,
        date,
        time: time.trim() || 'all day',
        hours: kind === 'rest' ? 0 : hours,
        origin: 'manual',
      })],
    })
    // Jump to the day it landed on. An add that leaves you looking elsewhere is
    // indistinguishable from an add that failed.
    onAdded(date)
    reset()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="btn btn-secondary focus-ring hit-44 flex items-center gap-2">
        <Plus size={15} strokeWidth={SW} />
        Add to this week
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 w-full" style={{
      background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)',
    }}>
      <div className="flex items-center justify-between gap-3">
        <span className="t-sub text-ink">Add to this week</span>
        <button onClick={reset} className="btn-icon focus-ring hit-44" aria-label="Cancel adding to the week">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <label className="sr-only" htmlFor="new-commitment-title">What is it</label>
      <input id="new-commitment-title" value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Statistics problem set"
        className="t-body focus-ring w-full p-3"
        style={{
          background: 'var(--surface)', color: 'var(--ink)',
          border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)', minHeight: 44,
        }} />

      <div className="flex flex-col gap-2">
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Kind</span>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Kind of commitment">
          {KINDS.map(k => (
            <button key={k.kind} onClick={() => pickKind(k.kind)} aria-pressed={kind === k.kind}
              className={`chip focus-ring hit-44 flex items-center gap-1.5 ${kind === k.kind ? 'chip-selected' : ''}`}>
              <span style={{
                width: 9, height: 9, borderRadius: 999,
                background: KIND_STYLE[k.kind].dot, border: '1.5px solid var(--ink)',
              }} />
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Day</span>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Day of the week">
          {week.map(isoDay => (
            <button key={isoDay} onClick={() => setDate(isoDay)} aria-pressed={date === isoDay}
              className={`chip focus-ring hit-44 ${date === isoDay ? 'chip-selected' : ''}`}>
              {dayOf(isoDay)} {dateOf(isoDay)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-2">
          <label className="t-micro" style={{ color: 'var(--ink-muted)' }} htmlFor="new-commitment-time">Time</label>
          <input id="new-commitment-time" value={time} onChange={e => setTime(e.target.value)}
            placeholder="2pm" className="t-body focus-ring p-3"
            style={{
              background: 'var(--surface)', color: 'var(--ink)', border: '2px solid var(--ink)',
              borderRadius: 'var(--r-sm)', minHeight: 44, width: 120,
            }} />
        </div>

        {/* Rest costs nothing by definition, so asking how many hours it takes
            would invite the student to price their own recovery. */}
        {kind !== 'rest' && (
          <div className="flex flex-col gap-2">
            <label className="t-micro" style={{ color: 'var(--ink-muted)' }} htmlFor="new-commitment-hours">
              Hours of effort
            </label>
            <input id="new-commitment-hours" type="number" min={0} max={MAX_HOURS} step={0.5} value={hours}
              onChange={e => setHours(Math.min(Number(e.target.value) || 0, MAX_HOURS))}
              className="t-body focus-ring p-3"
              style={{
                background: 'var(--surface)', color: 'var(--ink)', border: '2px solid var(--ink)',
                borderRadius: 'var(--r-sm)', minHeight: 44, width: 100,
              }} />
          </div>
        )}
      </div>

      <button onClick={submit} disabled={title.trim() === ''}
        className="btn btn-primary focus-ring hit-44 self-start"
        style={{ opacity: title.trim() === '' ? 0.5 : 1 }}>
        Add it
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Mount it**

Import in `src/pages/LoadPage.tsx`:

```tsx
import AddCommitmentForm from '../features/schedule/AddCommitmentForm'
```

Immediately after the `</div>` that closes the "Interactive schedule" header row (the one holding the title and the kind legend, ~`:145`):

```tsx
            <AddCommitmentForm onAdded={isoDay => setSelectedDate(dateOf(isoDay))} />
```

`dateOf` is already imported (`LoadPage.tsx:12`); `setSelectedDate` is already in scope (`:39`).

- [ ] **Step 3:** `npm run typecheck` → PASS.

- [ ] **Step 4: Browser check** — Load page, "Weekly schedule".

1. Note the energy figure — **62** on seed data.
2. **Add to this week** → `Statistics problem set`, kind **Commitment**, day **Fri 11**, time `2pm`, hours `4` → **Add it**.
3. Expect: form collapses; selection jumps to Friday 11; the day detail lists it with an energy cost; the header energy drops.
4. Reopen, pick kind **Rest** → the "Hours of effort" field disappears entirely.
5. `Evening walk`, **Sat 12**, **Add it** → lands with time `all day` and no energy-cost line (rest costs 0).
6. **Smart deferral** tab → "Statistics problem set" is offered (it is `movable`).
7. Reload *without* clearing storage → both survive (`SCHEMA` 4 unchanged).
8. Console: zero errors. Then reset storage.

- [ ] **Step 5: Commit**

```bash
git add src/features/schedule/AddCommitmentForm.tsx src/pages/LoadPage.tsx && git commit -m "feat(schedule): add a commitment to the week from the Load page"
```

---

### Task 5: `ics.ts` — parse an iCalendar file

Pure string→data. **Imports nothing, from anywhere** — that is what makes it probeable in Node without a test framework, and it must stay that way.

**Files:**
- Create: `src/logic/ics.ts`
- Create: `docs/superpowers/plans/fixtures/calendar-sample.ics`

**Interfaces:**
- Produces: `IcsEvent { uid; summary; startDate; startMinutes; durationMinutes; location; rrule; exdates }`; `parseIcs(text: string): IcsEvent[]`.

- [ ] **Step 1: Create `src/logic/ics.ts`**

```ts
// ─── iCalendar, the part a student's week needs ───────────────────────────────
// RFC 5545 is a large specification; this reads a small, deliberate corner of it
// — enough to turn the file Google, Outlook, Apple or a university timetable
// hands you into a list of events with local dates.
//
// It imports nothing, on purpose: every other module in logic/ reaches for the
// store's types, and keeping this one sealed means it can be run and checked
// on its own.
//
// Two things bite everyone who writes one of these:
//   1. Folding. Lines over 75 octets are split and continued with a leading
//      space or tab. Lecture titles fold constantly. Unfold BEFORE splitting
//      into lines or every long SUMMARY arrives truncated.
//   2. Recurrence. A weekly lecture is ONE event with an RRULE, not thirteen
//      events. Ignoring it reads a full timetable as almost empty. See
//      expandInto() in the next task.

export interface IcsEvent {
  uid: string
  summary: string
  /** Local date of the first occurrence, ISO 'YYYY-MM-DD'. */
  startDate: string
  /** Minutes past local midnight, or null when all-day. */
  startMinutes: number | null
  /** Length in minutes, or null when all-day. */
  durationMinutes: number | null
  location: string
  /** Raw rule, e.g. 'FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261207T155959Z'. */
  rrule: string | null
  /** Local dates the series explicitly skips. */
  exdates: string[]
}

/** One `NAME;PARAM=VALUE:VALUE` line, taken apart. */
interface Prop {
  name: string
  params: Record<string, string>
  value: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`

/** Undo folding, then split. Must happen in this order. */
function unfoldLines(text: string): string[] {
  return text
    .replace(/\r\n[ \t]/g, '')
    .replace(/\n[ \t]/g, '')
    .split(/\r?\n/)
    .filter(l => l.trim() !== '')
}

/** TEXT values escape these four. Backslash last. */
function unescapeText(v: string): string {
  return v
    .replace(/\\[nN]/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

/** Value starts at the first colon outside a quoted parameter — a quoted TZID
 *  can itself contain one. */
function parseProp(line: string): Prop | null {
  let quoted = false
  let colon = -1
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') quoted = !quoted
    else if (ch === ':' && !quoted) { colon = i; break }
  }
  if (colon === -1) return null

  const head = line.slice(0, colon)
  const value = line.slice(colon + 1)

  const parts: string[] = []
  let buf = ''
  quoted = false
  for (const ch of head) {
    if (ch === '"') { quoted = !quoted; continue }
    if (ch === ';' && !quoted) { parts.push(buf); buf = '' } else buf += ch
  }
  parts.push(buf)

  const params: Record<string, string> = {}
  for (const p of parts.slice(1)) {
    const eq = p.indexOf('=')
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1)
  }

  return { name: parts[0].toUpperCase(), params, value }
}

interface Moment { date: string; minutes: number | null }

/**
 * One date-time in any of the three exported forms:
 *
 *   VALUE=DATE:20260911                     all-day
 *   20260908T110000Z                        an instant in UTC
 *   TZID=Asia/Kuala_Lumpur:20260910T140000  wall clock in a named zone
 *
 * UTC converts through the viewer's own zone; TZID is taken as written, which is
 * right whenever the viewer is in the calendar's zone — a student importing
 * their own timetable always is. A tzdata table would cost more than the week
 * view can show: nothing downstream does arithmetic on the time, it prints it.
 */
function readMoment(p: Prop): Moment | null {
  const v = p.value.trim()

  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(v)
  if (dateOnly) return { date: isoOf(+dateOnly[1], +dateOnly[2], +dateOnly[3]), minutes: null }

  const stamp = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(v)
  if (!stamp) return null

  const [, y, mo, d, h, mi, , z] = stamp

  if (z) {
    const at = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, 0))
    return {
      date: isoOf(at.getFullYear(), at.getMonth() + 1, at.getDate()),
      minutes: at.getHours() * 60 + at.getMinutes(),
    }
  }

  return { date: isoOf(+y, +mo, +d), minutes: +h * 60 + +mi }
}

/** 'PT1H30M' / 'P1D' → minutes. */
function readDuration(v: string): number | null {
  const m = /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v.trim())
  if (!m) return null
  const [, w, d, h, mi] = m
  return (+(w ?? 0) * 7 * 24 * 60) + (+(d ?? 0) * 24 * 60) + (+(h ?? 0) * 60) + +(mi ?? 0)
}

/** Whole days between two ISO dates. Both pinned to midday, clear of DST. */
function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`).getTime()
  const b = new Date(`${to}T12:00:00`).getTime()
  return Math.round((b - a) / 86400000)
}

/** Every VEVENT. Events without a usable DTSTART are dropped rather than
 *  guessed at — an entry with no start is not a thing in a week. */
export function parseIcs(text: string): IcsEvent[] {
  const out: IcsEvent[] = []
  let inEvent = false
  let props: Prop[] = []

  for (const line of unfoldLines(text)) {
    const upper = line.toUpperCase()
    if (upper === 'BEGIN:VEVENT') { inEvent = true; props = []; continue }
    if (upper === 'END:VEVENT') {
      inEvent = false
      const ev = buildEvent(props)
      if (ev) out.push(ev)
      continue
    }
    if (inEvent) {
      const p = parseProp(line)
      if (p) props.push(p)
    }
  }

  return out
}

function buildEvent(props: Prop[]): IcsEvent | null {
  const find = (name: string) => props.find(p => p.name === name)

  const dtstartProp = find('DTSTART')
  if (!dtstartProp) return null
  const start = readMoment(dtstartProp)
  if (!start) return null

  const allDay = start.minutes === null

  let durationMinutes: number | null = null
  if (!allDay) {
    const endProp = find('DTEND')
    const end = endProp ? readMoment(endProp) : null

    if (end && end.minutes !== null) {
      durationMinutes = daysBetween(start.date, end.date) * 24 * 60 + (end.minutes - start.minutes)
    } else {
      const durProp = find('DURATION')
      durationMinutes = durProp ? readDuration(durProp.value) : null
    }

    // A zero or negative span means the file disagrees with itself. An hour is
    // the honest default: long enough to notice, short enough not to distort.
    if (durationMinutes === null || durationMinutes <= 0) durationMinutes = 60
  }

  const exdates: string[] = []
  for (const p of props) {
    if (p.name !== 'EXDATE') continue
    // EXDATE may carry several comma-separated values on one line.
    for (const one of p.value.split(',')) {
      const m = readMoment({ ...p, value: one })
      if (m) exdates.push(m.date)
    }
  }

  return {
    uid: find('UID')?.value.trim() ?? `${start.date}-${find('SUMMARY')?.value ?? 'untitled'}`,
    summary: unescapeText(find('SUMMARY')?.value ?? '').trim() || 'Untitled event',
    startDate: start.date,
    startMinutes: start.minutes,
    durationMinutes,
    location: unescapeText(find('LOCATION')?.value ?? '').trim(),
    rrule: find('RRULE')?.value.trim() ?? null,
    exdates,
  }
}
```

- [ ] **Step 2: Write the fixture**

`docs/superpowers/plans/fixtures/calendar-sample.ics`, exactly this. Shaped like a real Google export and exercising every hazard at once: `TZID` form, weekly `RRULE` with multi-day `BYDAY` + `UNTIL`, a second rule with `EXDATE`, an all-day `VALUE=DATE`, the UTC `Z` form, **a folded SUMMARY**, an escaped comma in `LOCATION`, and one far-future event.

```
BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:maya@example.edu
X-WR-TIMEZONE:Asia/Kuala_Lumpur
BEGIN:VEVENT
DTSTART;TZID=Asia/Kuala_Lumpur:20260907T100000
DTEND;TZID=Asia/Kuala_Lumpur:20260907T120000
RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261207T155959Z
DTSTAMP:20260901T083000Z
UID:tt-ds-lecture@example.edu
LOCATION:Block C\, Lecture Hall 2
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:CS2040 Data Structures Lecture
TRANSP:OPAQUE
END:VEVENT
BEGIN:VEVENT
DTSTART;TZID=Asia/Kuala_Lumpur:20260910T140000
DTEND;TZID=Asia/Kuala_Lumpur:20260910T160000
RRULE:FREQ=WEEKLY;BYDAY=TH
EXDATE;TZID=Asia/Kuala_Lumpur:20260924T140000
DTSTAMP:20260901T083000Z
UID:tt-web-lab@example.edu
LOCATION:Lab 4
SUMMARY:Web Systems Lab
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260911
DTEND;VALUE=DATE:20260912
DTSTAMP:20260901T083000Z
UID:ddl-a2@example.edu
SUMMARY:CS2040 Assignment 2 submission due
END:VEVENT
BEGIN:VEVENT
DTSTART:20260908T110000Z
DTEND:20260908T123000Z
DTSTAMP:20260901T083000Z
UID:club-mtg@example.edu
SUMMARY:Photography club planning meeting for the semester exhibiti
 on
END:VEVENT
BEGIN:VEVENT
DTSTART;TZID=Asia/Kuala_Lumpur:20261102T090000
DTEND;TZID=Asia/Kuala_Lumpur:20261102T110000
DTSTAMP:20260901T083000Z
UID:far-future@example.edu
SUMMARY:Final exam
END:VEVENT
END:VCALENDAR
```

- [ ] **Step 3: Probe it in Node**

No test runner exists. Node 24 strips TypeScript types natively and `ics.ts` imports nothing, so it loads directly. Write the probe to the **scratchpad**, never under `src/` — a file there would be picked up by `tsc --noEmit` and its `.ts` import specifier would fail the typecheck.

`<scratchpad>/probe-ics.mjs`:

```js
process.env.TZ = 'Asia/Kuala_Lumpur'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const ROOT = 'C:/Users/Sky Lee/Desktop/My AI Creative Hub/Oasis'
const { parseIcs } = await import(pathToFileURL(`${ROOT}/src/logic/ics.ts`).href)

const text = readFileSync(`${ROOT}/docs/superpowers/plans/fixtures/calendar-sample.ics`, 'utf8')
for (const e of parseIcs(text)) {
  console.log(JSON.stringify({
    summary: e.summary, startDate: e.startDate, startMinutes: e.startMinutes,
    durationMinutes: e.durationMinutes, rrule: e.rrule, exdates: e.exdates, location: e.location,
  }))
}
```

Run: `node "<scratchpad>/probe-ics.mjs"`

Expected — exactly five lines, in this order:

```
{"summary":"CS2040 Data Structures Lecture","startDate":"2026-09-07","startMinutes":600,"durationMinutes":120,"rrule":"FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261207T155959Z","exdates":[],"location":"Block C, Lecture Hall 2"}
{"summary":"Web Systems Lab","startDate":"2026-09-10","startMinutes":840,"durationMinutes":120,"rrule":"FREQ=WEEKLY;BYDAY=TH","exdates":["2026-09-24"],"location":"Lab 4"}
{"summary":"CS2040 Assignment 2 submission due","startDate":"2026-09-11","startMinutes":null,"durationMinutes":null,"rrule":null,"exdates":[],"location":""}
{"summary":"Photography club planning meeting for the semester exhibition","startDate":"2026-09-08","startMinutes":1140,"durationMinutes":90,"rrule":null,"exdates":[],"location":""}
{"summary":"Final exam","startDate":"2026-11-02","startMinutes":540,"durationMinutes":120,"rrule":null,"exdates":[],"location":""}
```

The four checks that matter: line 4 ends `...exhibition` as one word (**unfolding**); line 4 reads `2026-09-08` / `1140` from `20260908T110000Z` (**UTC conversion** at UTC+8, pinned by the `TZ` line); line 1's location has a real comma (**unescaping**); line 3 has `startMinutes: null` (**all-day detection**). Any difference: fix `ics.ts` and re-run.

- [ ] **Step 4:** `npm run typecheck` → PASS.

- [ ] **Step 5:** Delete the probe from the scratchpad. Keep the fixture — Task 9 uses it. Commit:

```bash
git add src/logic/ics.ts docs/superpowers/plans/fixtures/calendar-sample.ics && git commit -m "feat(logic): parse iCalendar files"
```

---

### Task 6: Recurrence expansion into the shown week

**Files:**
- Modify: `src/logic/ics.ts` — append

**Interfaces:**
- Consumes: `IcsEvent` and the private `daysBetween`/`pad` from Task 5.
- Produces: `expandInto(ev: IcsEvent, fromIso: string, toIso: string): string[]` — occurrence dates inside the inclusive window, ascending.

- [ ] **Step 1: Append to `src/logic/ics.ts`**

```ts
// ─── Recurrence, bounded by the week ──────────────────────────────────────────
// A general RRULE engine is a genuinely large piece of software. This is not one
// and does not need to be: Oasis plans seven days, so the only question ever put
// to a rule is "which of these seven dates do you land on".
//
// WEEKLY and DAILY are handled properly, because between them they are what a
// class timetable is made of. MONTHLY and YEARLY contribute their first
// occurrence if it falls in the window and nothing further — a monthly seminar
// is not what makes a term heavy, and pretending to expand one would mean
// writing the engine this deliberately is not.

const DOW_CODE = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/** 0 = Sunday, matching Date#getDay. Midday-pinned, clear of DST. */
const dowOf = (isoDate: string) => new Date(`${isoDate}T12:00:00`).getDay()

function ruleParts(rrule: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of rrule.split(';')) {
    const eq = part.indexOf('=')
    if (eq > 0) out[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1)
  }
  return out
}

/** UNTIL is a date or date-time; only the date half bounds a day-grained series. */
const untilDate = (v: string | undefined) =>
  v && v.length >= 8 ? `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}` : null

/** Local-date arithmetic, midday-pinned. Same rule as logic/dates.ts addDays,
 *  duplicated so this module keeps importing nothing. */
function addLocalDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function expandInto(ev: IcsEvent, fromIso: string, toIso: string): string[] {
  const skip = new Set(ev.exdates)
  const inWindow = (d: string) => d >= fromIso && d <= toIso && !skip.has(d)

  if (!ev.rrule) return inWindow(ev.startDate) ? [ev.startDate] : []

  const r = ruleParts(ev.rrule)
  const freq = (r.FREQ ?? '').toUpperCase()
  const interval = Math.max(1, Number(r.INTERVAL ?? 1) || 1)
  const until = untilDate(r.UNTIL)
  const count = r.COUNT ? Number(r.COUNT) : null

  if (freq !== 'WEEKLY' && freq !== 'DAILY') {
    return inWindow(ev.startDate) ? [ev.startDate] : []
  }

  // No BYDAY means "the weekday the series started on" — what every timetable
  // export without one means.
  const byDay = freq === 'WEEKLY'
    ? new Set((r.BYDAY ?? DOW_CODE[dowOf(ev.startDate)]).split(',').map(d => d.trim().toUpperCase()))
    : null

  // COUNT limits the whole series, not the window, so occurrences before the
  // window still consume it — walk from the start to know how many have gone by.
  // Capped so a daily rule with COUNT=9999 cannot spin.
  const MAX_WALK = 4000
  const out: string[] = []
  let seen = 0

  const startOfWeek = (d: string) => addLocalDays(d, -((dowOf(d) + 6) % 7))
  const seriesWeek = startOfWeek(ev.startDate)

  const total = daysBetween(ev.startDate, toIso)
  if (total < 0) return []

  for (let i = 0; i <= Math.min(total, MAX_WALK); i++) {
    const day = addLocalDays(ev.startDate, i)
    if (until && day > until) break
    if (count !== null && seen >= count) break

    const fires = freq === 'DAILY'
      ? i % interval === 0
      : Math.floor(daysBetween(seriesWeek, startOfWeek(day)) / 7) % interval === 0
        && byDay!.has(DOW_CODE[dowOf(day)])

    if (!fires) continue
    seen++
    if (inWindow(day)) out.push(day)
  }

  return out
}
```

- [ ] **Step 2: Probe it**

`<scratchpad>/probe-expand.mjs`:

```js
process.env.TZ = 'Asia/Kuala_Lumpur'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const ROOT = 'C:/Users/Sky Lee/Desktop/My AI Creative Hub/Oasis'
const { parseIcs, expandInto } = await import(pathToFileURL(`${ROOT}/src/logic/ics.ts`).href)

const text = readFileSync(`${ROOT}/docs/superpowers/plans/fixtures/calendar-sample.ics`, 'utf8')
for (const e of parseIcs(text)) {
  console.log(e.summary, '->', JSON.stringify(expandInto(e, '2026-09-07', '2026-09-13')))
}
console.log('--- EXDATE week ---')
for (const e of parseIcs(text)) {
  if (e.summary === 'Web Systems Lab') {
    console.log('21-27 Sep ->', JSON.stringify(expandInto(e, '2026-09-21', '2026-09-27')))
  }
}
```

Run: `node "<scratchpad>/probe-expand.mjs"`

Expected, exactly:

```
CS2040 Data Structures Lecture -> ["2026-09-07","2026-09-09"]
Web Systems Lab -> ["2026-09-10"]
CS2040 Assignment 2 submission due -> ["2026-09-11"]
Photography club planning meeting for the semester exhibition -> ["2026-09-08"]
Final exam -> []
--- EXDATE week ---
21-27 Sep -> []
```

Line by line: `BYDAY=MO,WE` yields Monday **and** Wednesday; the Thursday lab yields one date; a non-recurring all-day deadline still resolves; the far-future exam is correctly out of window; and the last line proves `EXDATE` really removes 24 September — the check that catches an expander ignoring exclusions.

- [ ] **Step 3:** `npm run typecheck` → PASS.

- [ ] **Step 4:** Delete the probe. Commit:

```bash
git add src/logic/ics.ts && git commit -m "feat(logic): expand calendar recurrence into the shown week"
```

---

### Task 7: `calendarImport.ts` — events into commitment drafts

**Files:**
- Create: `src/logic/calendarImport.ts`

**Interfaces:**
- Consumes: `IcsEvent`, `parseIcs`, `expandInto` (Tasks 5-6); `CommitmentDraft`, `DEFAULT_HOURS`, `MAX_HOURS` (Task 3); `weekStart`; `addDays`.
- Produces: `IMPORT_WINDOW_DAYS` (7); `ImportCandidate { key; draft; duplicate }`; `candidatesFrom(text, s): ImportCandidate[]`.

- [ ] **Step 1: Create `src/logic/calendarImport.ts`**

```ts
import type { EventKind } from '../ds'
import type { OasisState } from '../state/types'
import { addDays } from './dates'
import type { CommitmentDraft } from './compose'
import { DEFAULT_HOURS, MAX_HOURS } from './compose'
import { expandInto, parseIcs } from './ics'
import type { IcsEvent } from './ics'
import { weekStart } from './week'

// ─── A calendar, read as a week ───────────────────────────────────────────────
// The bridge between somebody's real calendar and the seven days Oasis reasons
// about. Three judgements happen here, and all three are shown before anything
// is written, because an import that silently rewrites your energy score is a
// magic trick rather than a tool.
//
//   What kind of thing is this?  A lecture, a deadline and a coffee are not the
//                                same weight, and iCalendar has no field saying
//                                which one you are holding.
//   How much effort is it?       Wall-clock length is the only honest start,
//                                capped so one bad event cannot swamp the week.
//   Have I already got it?       Matches are offered pre-unticked rather than
//                                hidden, so a second import cannot double a week.

export const IMPORT_WINDOW_DAYS = 7

/** An obligation with a due date rather than a place to be. */
const DEADLINE_WORDS =
  /\b(due|deadline|submit|submission|assignment|coursework|report|essay|exam|quiz|test|viva|defen[cs]e)\b/i

/** Recovery. Matched only after the two structural tests. */
const REST_WORDS = /\b(gym|rest|nap|break|walk|run|jog|yoga|swim|sleep|recovery|downtime)\b/i

/** A class is a repeating appointment of ordinary length. Above this, a weekly
 *  four-hour block is a job or a retreat, not a lecture. */
const CLASS_MAX_MINUTES = 240

/** No imported event claims more of the week than this. A 26-hour entry is a
 *  mistake; an all-day conference should not read as a day lost. */
const IMPORT_MAX_HOURS = Math.min(8, MAX_HOURS)

function kindOf(ev: IcsEvent): EventKind {
  if (DEADLINE_WORDS.test(ev.summary)) return 'deadline'
  if (ev.rrule && ev.durationMinutes !== null && ev.durationMinutes <= CLASS_MAX_MINUTES) return 'class'
  if (REST_WORDS.test(ev.summary)) return 'rest'
  return 'commitment'
}

function hoursOf(ev: IcsEvent, kind: EventKind): number {
  if (kind === 'rest') return 0
  // An all-day event states no length, so the per-kind default is the only
  // honest reading. Counting 24 hours would black out the week on one entry.
  if (ev.durationMinutes === null) return DEFAULT_HOURS[kind]
  return Math.min(Math.round((ev.durationMinutes / 60) * 2) / 2, IMPORT_MAX_HOURS)
}

/** '9am', '2:30pm', 'all day'. The store prints this; it never parses it back. */
function timeOf(minutes: number | null): string {
  if (minutes === null) return 'all day'
  const h24 = Math.floor(minutes / 60)
  const mins = minutes % 60
  const suffix = h24 < 12 ? 'am' : 'pm'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return mins === 0 ? `${h12}${suffix}` : `${h12}:${String(mins).padStart(2, '0')}${suffix}`
}

const normalise = (title: string) => title.toLowerCase().replace(/\s+/g, ' ').trim()

/** One occurrence of one calendar event, ready to be ticked or left. */
export interface ImportCandidate {
  /** Unique within one import. Not the commitment id — that is minted on accept. */
  key: string
  draft: CommitmentDraft
  /** Same day, same title as something already on the week. */
  duplicate: boolean
}

/** The mapping half, shared by the file reader and (later) the Google fetcher. */
export function candidatesFromEvents(events: IcsEvent[], s: OasisState): ImportCandidate[] {
  const from = weekStart(s.today)
  const to = addDays(from, IMPORT_WINDOW_DAYS - 1)
  const existing = new Set(s.commitments.map(c => `${c.date}|${normalise(c.title)}`))

  const out: ImportCandidate[] = []

  for (const ev of events) {
    const kind = kindOf(ev)
    const hours = hoursOf(ev, kind)
    const time = timeOf(ev.startMinutes)

    // Events outside the window are dropped here rather than stored invisibly:
    // weekDays() renders one week, so a commitment in November would persist,
    // be counted by nothing and shown nowhere.
    for (const date of expandInto(ev, from, to)) {
      out.push({
        key: `${ev.uid}@${date}`,
        draft: { title: ev.summary, kind, date, time, hours, origin: 'timetable' },
        duplicate: existing.has(`${date}|${normalise(ev.summary)}`),
      })
    }
  }

  return out.sort((a, b) =>
    a.draft.date === b.draft.date
      ? a.draft.time.localeCompare(b.draft.time)
      : a.draft.date.localeCompare(b.draft.date))
}

/** Everything in the file that lands inside the week Oasis is showing. */
export function candidatesFrom(text: string, s: OasisState): ImportCandidate[] {
  return candidatesFromEvents(parseIcs(text), s)
}
```

`origin: 'timetable'` is not new — it has existed in `Commitment` from the start, written by nothing. This is what it was reserved for.

- [ ] **Step 2:** `npm run typecheck` → PASS.

- [ ] **Step 3: Verify by reading**

This module imports `week.ts` → `energy.ts` → app types, so unlike `ics.ts` it cannot be probed standalone; Task 9 verifies it through the UI. Confirm the fixture must produce five candidates:

| Title | Date | Kind | Why | Hours | Time |
|---|---|---|---|---|---|
| CS2040 Data Structures Lecture | 2026-09-07 | `class` | RRULE, 120 ≤ 240 min | 2 | 10am |
| Photography club planning meeting… | 2026-09-08 | `commitment` | no rule, no keyword | 1.5 | 7pm |
| CS2040 Data Structures Lecture | 2026-09-09 | `class` | second BYDAY occurrence | 2 | 10am |
| Web Systems Lab | 2026-09-10 | `class` | RRULE, 120 min | 2 | 2pm |
| CS2040 Assignment 2 submission due | 2026-09-11 | `deadline` | matches `due`/`submission` | 3 | all day |

Sorted by date first, so the two lecture occurrences are not adjacent.

- [ ] **Step 4: Commit**

```bash
git add src/logic/calendarImport.ts && git commit -m "feat(logic): map calendar events onto the week as commitment drafts"
```

---

### Task 8: The import sheet

**Files:**
- Create: `src/features/schedule/ImportCalendarSheet.tsx`

**Interfaces:**
- Consumes: `candidatesFrom`, `ImportCandidate`, `IMPORT_WINDOW_DAYS` (Task 7); `newCommitment` (Task 3); `projectEnergy` (already accepts an array); `useSheet`; `useOasis`/`useDispatch`/`useEnergy`.
- Produces: default export `ImportCalendarSheet({ onClose }: { onClose: () => void })`.

- [ ] **Step 1: Create `src/features/schedule/ImportCalendarSheet.tsx`**

```tsx
import { useRef, useState } from 'react'
import { CalendarPlus, Check, Upload, X } from 'lucide-react'

import { KIND_STYLE, SW, Tag } from '../../ds'
import { addDays, shortDate } from '../../logic/dates'
import { newCommitment } from '../../logic/compose'
import { projectEnergy } from '../../logic/energy'
import { candidatesFrom, IMPORT_WINDOW_DAYS } from '../../logic/calendarImport'
import type { ImportCandidate } from '../../logic/calendarImport'
import { weekStart } from '../../logic/week'
import { useDispatch, useEnergy, useOasis } from '../../state/store'
import { useSheet } from '../shell/useSheet'

// ─── Import a calendar ────────────────────────────────────────────────────────
// Every calendar worth importing already exports iCalendar: Google, Outlook,
// Apple, Notion, every university timetable. So the file IS the integration —
// no account to connect, no network on stage, nothing to sign into in front of
// a judge.
//
// The screen is a review, not a progress bar. It says what it found, what it is
// about to do to the energy score, and what it is leaving alone. An import that
// just happens is one nobody trusts twice.

type Phase =
  | { at: 'waiting' }
  | { at: 'read'; candidates: ImportCandidate[]; total: number }
  | { at: 'failed'; why: string }

export default function ImportCalendarSheet({ onClose }: { onClose: () => void }) {
  const state = useOasis()
  const dispatch = useDispatch()
  const { energy } = useEnergy()
  const ref = useSheet<HTMLDivElement>(onClose, { trap: true })
  const fileRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>({ at: 'waiting' })
  const [ticked, setTicked] = useState<Set<string>>(new Set())

  const from = weekStart(state.today)
  const to = addDays(from, IMPORT_WINDOW_DAYS - 1)
  const windowLabel = `${shortDate(from)} – ${shortDate(to)}`

  const read = async (file: File) => {
    try {
      const text = await file.text()
      const candidates = candidatesFrom(text, state)
      setPhase({ at: 'read', candidates, total: text.split('BEGIN:VEVENT').length - 1 })
      // Anything already on the week starts unticked, so importing the same
      // export twice is a no-op instead of a doubled week.
      setTicked(new Set(candidates.filter(c => !c.duplicate).map(c => c.key)))
    } catch {
      setPhase({ at: 'failed', why: 'That file could not be read. Export again as .ics and try once more.' })
    }
  }

  const toggle = (key: string) => {
    setTicked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const chosen = phase.at === 'read' ? phase.candidates.filter(c => ticked.has(c.key)) : []

  // Priced through the same function the dashboard gauge uses, so the figure
  // promised here and the figure shown after cannot disagree.
  const after = chosen.length > 0
    ? projectEnergy(state, chosen.map((c, i) => newCommitment(state, c.draft, i)))
    : energy

  const importAll = () => {
    if (chosen.length === 0) return
    dispatch({
      type: 'addCommitments',
      commitments: chosen.map((c, i) => newCommitment(state, c.draft, i)),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="import-cal-title" tabIndex={-1}
        className="card card-pop p-5 flex flex-col gap-4 w-full max-w-[560px] max-h-[86vh] overflow-y-auto">

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Tag>
              <CalendarPlus size={13} strokeWidth={SW} />
              IMPORT A CALENDAR
            </Tag>
            <h2 id="import-cal-title" className="t-sub text-ink">Bring in the week you already have</h2>
          </div>
          <button onClick={onClose} className="btn-icon focus-ring hit-44" aria-label="Close import">
            <X size={16} strokeWidth={SW} />
          </button>
        </div>

        {phase.at === 'waiting' && (
          <>
            <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
              In Google Calendar open <strong>Settings → Import &amp; export → Export</strong> and pick
              the .ics file it gives you. Outlook, Apple Calendar and most university timetables export
              the same format.
            </p>

            <label className="sr-only" htmlFor="import-cal-file">Calendar file</label>
            <input id="import-cal-file" ref={fileRef} type="file" accept=".ics,text/calendar"
              className="sr-only"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) void read(file)
              }} />
            <button onClick={() => fileRef.current?.click()}
              className="btn btn-primary focus-ring hit-44 flex items-center gap-2 self-start">
              <Upload size={15} strokeWidth={SW} />
              Choose a .ics file
            </button>

            <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.55 }}>
              The file is read on your phone and never uploaded. Oasis has no server to send it to.
            </p>
          </>
        )}

        {phase.at === 'failed' && (
          <p className="t-body" style={{ color: 'var(--ink)' }}>{phase.why}</p>
        )}

        {phase.at === 'read' && phase.candidates.length === 0 && (
          <>
            <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink)' }}>
              {phase.total === 0
                ? 'No events in that file. Check you exported the right calendar.'
                : `That file has ${phase.total} ${phase.total === 1 ? 'event' : 'events'}, but none of them fall in ${windowLabel}. Oasis plans one week at a time.`}
            </p>
            <button onClick={onClose} className="btn btn-secondary focus-ring hit-44 self-start">Close</button>
          </>
        )}

        {phase.at === 'read' && phase.candidates.length > 0 && (
          <>
            <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
              {phase.candidates.length} of the {phase.total} events in that file land in {windowLabel}.
              Untick anything you would rather Oasis did not count.
            </p>

            <div className="flex flex-col gap-2">
              {phase.candidates.map(c => {
                const on = ticked.has(c.key)
                return (
                  <div key={c.key} className="flex items-center gap-3 p-3" style={{
                    background: on ? 'var(--surface-2)' : 'var(--surface)',
                    border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)',
                    opacity: on ? 1 : 0.6,
                  }}>
                    <button onClick={() => toggle(c.key)} aria-pressed={on}
                      aria-label={`${on ? 'Skip' : 'Import'} ${c.draft.title}`}
                      className="focus-ring hit-44 shrink-0 flex items-center justify-center"
                      style={{
                        width: 24, height: 24, borderRadius: 'var(--r-sm)',
                        border: '2px solid var(--ink)',
                        background: on ? 'var(--mint-deep)' : 'var(--surface)', cursor: 'pointer',
                      }}>
                      {on && <Check size={14} strokeWidth={3} style={{ color: 'var(--ink)' }} />}
                    </button>

                    <span style={{
                      width: 10, height: 10, borderRadius: 999, flexShrink: 0,
                      background: KIND_STYLE[c.draft.kind].dot, border: '2px solid var(--ink)',
                    }} />

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="t-label text-ink">{c.draft.title}</span>
                      <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                        {shortDate(c.draft.date)} · {c.draft.time}
                        {c.draft.hours > 0 && ` · ${c.draft.hours}h`}
                        {c.duplicate && ' · already on your week'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap p-3.5" style={{
              background: 'var(--butter)', border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)',
            }}>
              <span className="t-micro" style={{ color: 'var(--ink)' }}>
                Energy after importing {chosen.length}
              </span>
              <span className="t-sub text-ink">{energy} → {after}</span>
            </div>

            <button onClick={importAll} disabled={chosen.length === 0}
              className="btn btn-primary focus-ring hit-44 self-start"
              style={{ opacity: chosen.length === 0 ? 0.5 : 1 }}>
              Import {chosen.length} {chosen.length === 1 ? 'event' : 'events'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2:** `npm run typecheck` → PASS. If `Tag` rejects children of that shape, check `src/ds/Tag.tsx` and match its existing call sites; nothing else depends on it.

- [ ] **Step 3: Commit**

```bash
git add src/features/schedule/ImportCalendarSheet.tsx && git commit -m "feat(schedule): review sheet for importing a calendar"
```

---

### Task 9: Wire it in and verify end to end

**Files:**
- Modify: `src/pages/LoadPage.tsx`

- [ ] **Step 1: Mount the sheet**

Add `import ImportCalendarSheet from '../features/schedule/ImportCalendarSheet'`, add `CalendarPlus` to the `lucide-react` import on line 2, and one piece of state near `:43`:

```tsx
  const [importing, setImporting] = useState(false)
```

Wrap the Task-4 form and a new trigger together on one row:

```tsx
            <div className="flex gap-2 flex-wrap items-start">
              <AddCommitmentForm onAdded={isoDay => setSelectedDate(dateOf(isoDay))} />
              <button onClick={() => setImporting(true)}
                className="btn btn-secondary focus-ring hit-44 flex items-center gap-2">
                <CalendarPlus size={15} strokeWidth={SW} />
                Import calendar
              </button>
            </div>
```

And before the component's outermost closing `</div>`:

```tsx
      {importing && <ImportCalendarSheet onClose={() => setImporting(false)} />}
```

- [ ] **Step 2:** `npm run typecheck` → PASS.

- [ ] **Step 3: End-to-end check with the fixture**

Clear storage, reload, Load page → "Weekly schedule".

1. Energy reads **62**.
2. **Import calendar** → sheet opens over a scrim, focus lands inside, copy names the Google export path.
3. **Escape** → closes, focus returns to the button. Reopen.
4. **Choose a .ics file** → `docs/superpowers/plans/fixtures/calendar-sample.ics`.
5. Expect **"5 of the 5 events in that file land in Mon 7 Sep – Sun 13 Sep"** and exactly these rows, in order, all ticked:
   - CS2040 Data Structures Lecture — Mon 7 Sep · 10am · 2h
   - Photography club planning meeting for the semester exhibition — Tue 8 Sep · 7pm · 1.5h
   - CS2040 Data Structures Lecture — Wed 9 Sep · 10am · 2h
   - Web Systems Lab — Thu 10 Sep · 2pm · 2h
   - CS2040 Assignment 2 submission due — Fri 11 Sep · all day · 3h

   The second row must end `...exhibition` as one word. `exhibiti on` means unfolding regressed.
6. Untick the photography meeting → row dims, button reads **Import 4 events**, the `62 → N` figure rises (less work coming in).
7. Re-tick, **Import 5 events** → sheet closes; the week shows events Mon–Fri; header energy matches the number the sheet promised.
8. Click **Thu 10** → day detail lists "Web Systems Lab / 2pm" with an energy cost.
9. **Smart deferral** → imported *lectures* are absent (a `class` is not `movable`); the photography meeting is present.
10. Reopen the sheet, choose the same file → all five say **"already on your week"**, all unticked, button reads **Import 0 events** and is disabled. This is the check that a second import cannot double the week.
11. Console: zero errors throughout. Reset storage.

- [ ] **Step 4: Check a real export**

Export your own Google Calendar, unzip, import one `.ics`. Expect either a populated list or — far more likely, since a real calendar rarely has events in the demo's fixed September week — *"That file has N events, but none of them fall in Mon 7 Sep – Sun 13 Sep."* Both are passes. A blank sheet, a crash, or a spinner that never resolves is a failure: fix before committing.

- [ ] **Step 5: Commit**

```bash
git add src/pages/LoadPage.tsx && git commit -m "feat(schedule): import a calendar into the week from the Load page"
```

---

### Task 10 (optional, after the demo): live Google Calendar over OAuth

**Do not start before Tasks 1-9 are merged and the demo is recorded.** File import is the demo path precisely because it needs no network, account or consent screen. This adds a live connection for real use.

**Files:**
- Create: `src/logic/googleCalendar.ts`
- Modify: `src/features/schedule/ImportCalendarSheet.tsx` — a second source button in the `waiting` phase
- Create: `.env.local` (git-ignored) with `VITE_GOOGLE_CLIENT_ID`

**Interfaces:**
- Produces: `requestGoogleToken(): Promise<string>`; `fetchGoogleEvents(token, fromIso, toIso): Promise<IcsEvent[]>` — the **same** `IcsEvent` shape as Task 5, so Task 7's `candidatesFromEvents` is reused unchanged.

**Why this is the smaller half:** `singleEvents=true` makes Google expand recurrence server-side, so this path needs **none** of Task 6's RRULE code.

- [ ] **Step 1: Credentials (console work, not code)**

In console.cloud.google.com: create a project → enable **Google Calendar API** → **OAuth consent screen**, External, add your own account under **Test users** → **Credentials → Create OAuth client ID → Web application**, with `http://localhost:5177` and the deployed origin under *Authorised JavaScript origins*. Put the id in `.env.local` as `VITE_GOOGLE_CLIENT_ID=...` and confirm `.env.local` is git-ignored.

The client ID ships in the bundle. That is normal and safe for a public OAuth client — it identifies the app, it authorises nothing on its own — but it makes the origins list the only thing stopping another site using it, so keep that list tight.

- [ ] **Step 2: Create `src/logic/googleCalendar.ts`**

```ts
import type { IcsEvent } from './ics'

// ─── Google Calendar, live ────────────────────────────────────────────────────
// The same events as the .ics path, fetched instead of read. Two things make
// this the smaller half: singleEvents=true has Google expand recurrence
// server-side, so no rule engine is needed, and the result is mapped onto the
// IcsEvent shape the file parser already produces, so everything downstream is
// untouched. It is also why this is not the demo path — it needs a network, a
// signed-in account, and a consent screen that warns about unverified apps.

const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'
const GSI = 'https://accounts.google.com/gsi/client'

function loadGsi(): Promise<void> {
  if (document.querySelector(`script[src="${GSI}"]`)) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = GSI
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => reject(new Error('Could not reach Google.'))
    document.head.appendChild(el)
  })
}

/** Pop the consent flow and hand back an access token. Never stored. */
export async function requestGoogleToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('No Google client ID configured.')

  await loadGsi()

  return new Promise((resolve, reject) => {
    // The GSI global is injected by the script above and has no bundled types.
    const gsi = (window as unknown as {
      google?: { accounts: { oauth2: { initTokenClient: (o: unknown) => { requestAccessToken: () => void } } } }
    }).google
    if (!gsi) { reject(new Error('Google sign-in did not load.')); return }

    gsi.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (res: { access_token?: string; error?: string }) => {
        if (res.access_token) resolve(res.access_token)
        else reject(new Error(res.error ?? 'Sign-in was cancelled.'))
      },
    }).requestAccessToken()
  })
}

interface GoogleEvent {
  id: string
  summary?: string
  location?: string
  start: { date?: string; dateTime?: string }
  end: { date?: string; dateTime?: string }
}

const pad = (n: number) => String(n).padStart(2, '0')

function readStamp(v: { date?: string; dateTime?: string }): { date: string; minutes: number | null } | null {
  if (v.date) return { date: v.date, minutes: null }
  if (!v.dateTime) return null
  const at = new Date(v.dateTime)
  return {
    date: `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`,
    minutes: at.getHours() * 60 + at.getMinutes(),
  }
}

/** Occurrences between two local dates, already expanded by Google. Returned in
 *  the file parser's shape with `rrule: null` — each entry IS one occurrence, so
 *  expandInto() passes it straight through. */
export async function fetchGoogleEvents(
  token: string, fromIso: string, toIso: string,
): Promise<IcsEvent[]> {
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '250')
  url.searchParams.set('timeMin', new Date(`${fromIso}T00:00:00`).toISOString())
  url.searchParams.set('timeMax', new Date(`${toIso}T23:59:59`).toISOString())

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Google refused the request (${res.status}).`)

  const body = (await res.json()) as { items?: GoogleEvent[] }

  const out: IcsEvent[] = []
  for (const item of body.items ?? []) {
    const start = readStamp(item.start)
    if (!start) continue
    const end = readStamp(item.end)

    let durationMinutes: number | null = null
    if (start.minutes !== null && end && end.minutes !== null) {
      const days = Math.round(
        (new Date(`${end.date}T12:00:00`).getTime() - new Date(`${start.date}T12:00:00`).getTime()) / 86400000,
      )
      durationMinutes = days * 24 * 60 + (end.minutes - start.minutes)
      if (durationMinutes <= 0) durationMinutes = 60
    }

    out.push({
      uid: item.id,
      summary: (item.summary ?? '').trim() || 'Untitled event',
      startDate: start.date,
      startMinutes: start.minutes,
      durationMinutes,
      location: item.location ?? '',
      rrule: null,
      exdates: [],
    })
  }

  return out
}
```

- [ ] **Step 3: Second source button**

In the `waiting` phase of `ImportCalendarSheet.tsx`, below **Choose a .ics file**:

```tsx
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <button
                onClick={async () => {
                  try {
                    const token = await requestGoogleToken()
                    const events = await fetchGoogleEvents(token, from, to)
                    const candidates = candidatesFromEvents(events, state)
                    setPhase({ at: 'read', candidates, total: events.length })
                    setTicked(new Set(candidates.filter(c => !c.duplicate).map(c => c.key)))
                  } catch (err) {
                    setPhase({ at: 'failed', why: err instanceof Error ? err.message : 'Google sign-in failed.' })
                  }
                }}
                className="btn btn-secondary focus-ring hit-44 flex items-center gap-2 self-start"
              >
                <CalendarPlus size={15} strokeWidth={SW} />
                Connect Google Calendar
              </button>
            )}
```

Add `import { fetchGoogleEvents, requestGoogleToken } from '../../logic/googleCalendar'` and `candidatesFromEvents` to the `calendarImport` import. The button is absent when no client ID is configured, so a checkout without `.env.local` renders the file-only sheet rather than a button that always errors.

- [ ] **Step 4:** `npm run typecheck` → PASS.

- [ ] **Step 5: Browser check** — restart the dev server (Vite reads env at startup).

1. Open the sheet → both buttons show.
2. **Connect Google Calendar** → Google popup; after granting read-only access the review list appears, or the same honest empty state.
3. Cancel the popup on a second attempt → the sheet says "Sign-in was cancelled." rather than hanging.
4. Console: zero errors, no unhandled rejections.

- [ ] **Step 6: Commit**

```bash
git add src/logic/googleCalendar.ts src/features/schedule/ImportCalendarSheet.tsx && git commit -m "feat(schedule): optional live Google Calendar import over OAuth"
```

---

## Self-review

**Coverage.** Add a group task (1-2), add a schedule item (3-4), calendar import (5-9), optional live Google (10).

**Type consistency, checked across tasks.** `CommitmentDraft` defined once in Task 3, consumed identically in 4, 7, 10. `IcsEvent` defined in Task 5, produced verbatim by Task 10 — which is what lets Task 10 reuse Task 7's mapping. `ImportCandidate` carries `draft`, not `commitment` (the commitment is minted at accept time), and Tasks 8 and 10 both use `.draft`. `candidatesFromEvents` is introduced in Task 7 rather than retrofitted in Task 10, so no task rewrites another's signature. `expandInto(ev, from, to)` is three arguments everywhere.

**Two behaviour changes needing sign-off.**
1. Task 3 flips `movable` for an assistant-added `class` from `true` to `false`, and changes assistant ids from `ai-3` to `chat-3-<slug>`.
2. Task 3 fixes a real id-collision bug: add → remove a *different* item → add produced two commitments sharing an id, which made `commitmentCost` price the wrong one and `removeCommitment` delete both.

**Deliberately not built.** `FREQ=MONTHLY`/`YEARLY` contribute only their first occurrence. A seven-day window makes a full recurrence engine unjustifiable, and the sheet shows exactly what was found before anything is written, so an under-read rule is visible rather than silent.

**Separately outstanding, not part of this plan.** `src/logic/assistantDecision.ts` previously had `const hasHeavyGroup = youShare ? true : false` — always true, because you are always a member of your own project, which made the `ACCEPT` branch of `evaluateAITaskQuery` unreachable. It now reads `sharesAcrossProjects(state).some(p => p.over)`. That changes what the assistant says on camera and still needs your sign-off.
