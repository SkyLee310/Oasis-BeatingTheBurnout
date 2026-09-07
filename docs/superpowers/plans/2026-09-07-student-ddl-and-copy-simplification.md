# Student DDL Radar & Copy Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an immediate "Upcoming DDLs" countdown banner for university students on the schedule page, allow tracking/completing assignment deadlines, and simplify all wordy text across the app to make it short and sweet.

**Architecture:** Add `done?: boolean` and `toggleCommitmentDone` to the state store. Build a dedicated `AcademicDDLRadar` component placed above `WeekCalendar` in `LoadPage`. Condense verbose text across `LoadPage`, `GroupPage`, `WhatsAppMessageSheet`, and `DashboardPage`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide icons (`Clock`, `Check`, `CheckCircle2`, `AlertCircle`, `Calendar`).

## Global Constraints
- Preserve neo-brutalist styling (`card`, `card-pop`, `chip`, `Tag`, `focus-ring`).
- Keep microcopy punchy, concise, and high-signal ("short and sweet").
- Zero TypeScript errors on `npm run typecheck`.
- Clean production build on `npm run build`.

---

### Task 1: State Store Updates for Commitment Completion

**Files:**
- Modify: `src/state/types.ts:20-35`
- Modify: `src/state/store.tsx:30-65`

**Interfaces:**
- `Commitment`: add `done?: boolean`
- `Action`: add `| { type: 'toggleCommitmentDone'; id: string }`
- Reducer handles `toggleCommitmentDone` by flipping `c.done`

- [x] **Step 1: Add `done?: boolean` to `Commitment` in `src/state/types.ts`**
- [x] **Step 2: Add `toggleCommitmentDone` action and reducer logic in `src/state/store.tsx`**
- [x] **Step 3: Run typecheck to verify state changes compile cleanly**
  Run: `npm run typecheck`
  Expected: PASS
- [x] **Step 4: Commit state updates**
  Run: `git add src/state/types.ts src/state/store.tsx; git commit -m "feat(state): add toggleCommitmentDone support for assignments"`

---

### Task 2: Create AcademicDDLRadar Component

**Files:**
- Create: `src/features/schedule/AcademicDDLRadar.tsx`

**Interfaces:**
- Props: `{ onSelectDate?: (date: string) => void }`
- Reads: `useOasis()` for `state.commitments` and `state.today`
- Computes:
  - Upcoming deadlines (`c.kind === 'deadline'`)
  - Relative due label: "Due today · {time}", "Due tomorrow · {time}", "In {days} days · {weekday} {time}"
  - Urgency tone: red for today/overdue, amber for tomorrow, yellow for later this week
  - Course extraction (e.g. `LinAlg`, `Web Systems`, `Data Structures`)
- UI:
  - Header with `DEADLINES` tag, title `Upcoming DDLs`, count chip
  - List of clean deadline items with checkbox, course badge, title, countdown badge, effort hours
  - Clicking card triggers `onSelectDate(date)`

- [x] **Step 1: Implement `AcademicDDLRadar.tsx`**
- [x] **Step 2: Verify compilation with `npm run typecheck`**
- [x] **Step 3: Commit component**
  Run: `git add src/features/schedule/AcademicDDLRadar.tsx; git commit -m "feat(schedule): add AcademicDDLRadar component"`

---

### Task 3: Integrate DDL Radar & Simplify Copy in LoadPage

**Files:**
- Modify: `src/pages/LoadPage.tsx`

**Changes:**
- Mount `<AcademicDDLRadar onSelectDate={(date) => setSelectedDate(date)} />` inside the `'schedule'` tab right above `<WeekCalendar />`
- Simplify hero copy, tab subtitles, legend labels, and simulator tips into short & sweet phrases

- [x] **Step 1: Update `src/pages/LoadPage.tsx` with DDL Radar and simplified copy**
- [x] **Step 2: Verify compilation with `npm run typecheck`**
- [x] **Step 3: Commit LoadPage changes**
  Run: `git add src/pages/LoadPage.tsx; git commit -m "feat(load): integrate AcademicDDLRadar and simplify copy"`

---

### Task 4: Simplify Wordy Copy Across Group, WhatsApp, & Dashboard

**Files:**
- Modify: `src/pages/GroupPage.tsx`
- Modify: `src/features/group/WhatsAppMessageSheet.tsx`
- Modify: `src/pages/DashboardPage.tsx`

**Changes:**
- Trim long paragraphs and essays into short, friendly, high-signal sentences.
- Ensure all disclaimers, warnings, and subtitles are punchy.

- [x] **Step 1: Simplify copy in `GroupPage.tsx` and `WhatsAppMessageSheet.tsx`**
- [x] **Step 2: Simplify copy in `DashboardPage.tsx`**
- [x] **Step 3: Verify compilation with `npm run typecheck`**
- [x] **Step 4: Commit copy simplification**
  Run: `git add src/pages/GroupPage.tsx src/features/group/WhatsAppMessageSheet.tsx src/pages/DashboardPage.tsx; git commit -m "refactor: simplify wordy copy across group, whatsapp, and dashboard"`

---

### Task 5: Verification & Production Build

**Files:**
- Run: `npm run typecheck`
- Run: `npm run build`

- [x] **Step 1: Run typecheck and production build**
- [x] **Step 2: Verify in browser at `http://localhost:5173`**
