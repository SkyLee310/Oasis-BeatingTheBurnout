# Design Spec: Student DDL Radar & App-Wide Copy Simplification

## Context & Objectives
1. **Student DDL Urgency**: University students need to see upcoming assignments and deadlines ("DDLs") immediately in the schedule section without having to click through individual calendar days.
2. **Concise Copy ("Short & Sweet")**: The app is currently too wordy with long paragraphs, disclaimers, and verbose descriptions. Students want skimmable, high-signal, punchy microcopy and direct action items.

---

## 1. Academic DDL Radar Component

### Placement
- Positioned inside the **Weekly schedule** tab on [`LoadPage.tsx`](file:///C:/Users/Sky%20Lee/Desktop/My%20AI%20Creative%20Hub/Oasis/src/pages/LoadPage.tsx), directly above the interactive `WeekCalendar`.

### Structure & Content
- **Header**:
  - Tag: `DEADLINES` (tone: `red` / `yellow`).
  - Title: `Upcoming DDLs` (punchy, clean).
  - Micro-stat: `X due this week`.
- **Deadline Cards**:
  - Filtered to upcoming academic deadlines/assignments (`kind === 'deadline'`).
  - **Countdown Badge**:
    - 🔴 `Today · 9:00 AM`
    - 🟠 `Tomorrow · 11:59 PM`
    - 🟡 `Fri · 11:59 PM`
  - **Course Tag & Title**:
    - e.g. `[LinAlg] Quiz`, `[Web Systems] Lab due`, `[Data Structures] A2 due`.
  - **Effort Indicator**: `5h effort`, `2.5h`, `6h`.
  - **Interactive Checkbox**: Allows student to check off completed DDLs (persisted in state with strikethrough styling).
  - **Click to Focus Day**: Clicking a DDL card highlights that day on the calendar grid below.

---

## 2. Copy Simplification ("Short & Sweet")

Streamline copy across key student surfaces to remove wordy fluff:

### `LoadPage.tsx`
- **Hero subtitle**:
  - *Old*: `"Your week timeline, where the pressure is concentrated, and what you can safely move."*
  - *New*: `"Track deadlines, weekly pressure, and flexible tasks."*
- **DDL & Calendar labels**:
  - Shorten legends and category headers to clean single-phrase labels.
- **Simulator & Deferral tabs**:
  - Replace long explanatory paragraphs with direct, scannable tips (e.g., *"Shift flexible tasks to protect deadline days."*).

### `GroupPage.tsx`
- **Warning banner**:
  - *Old*: Long explanation on fair share arithmetic and slide decks.
  - *New*: `"You hold X% of this project (fair share is Y%)."`
- **Privacy notice**:
  - *Old*: Two-sentence paragraph about phone storage and declined tasks.
  - *New*: `"🔒 Teammates only see project tasks. Personal energy & sleep remain private."*

### `WhatsAppMessageSheet.tsx`
- **Subtitle**:
  - *Old*: *"A diplomatic breakdown of who is carrying what, so you can raise imbalances or share progress without sounding confrontational. You can edit the text below before copying or sending."*
  - *New*: *"Ready-to-send group update. Edit anytime before sending."*

### `DashboardPage.tsx`
- Condense long narrative subtitles and cards into crisp, skimmable tags and numbers.

---

## 3. State & Logic
- Add `done?: boolean` to `Commitment` interface in `src/state/types.ts`.
- Add action `{ type: 'toggleCommitmentDone'; id: string }` to `src/state/store.tsx`.

---

## Verification
- Verify that DDL Radar immediately shows imminent assignments with correct countdowns and course tags.
- Verify checking a deadline marks it done.
- Verify clicking a DDL selects that day on the week calendar.
- Verify all modified pages have short, punchy, scannable copy.
- Run `npm run typecheck` and `npm run build` (zero errors).
