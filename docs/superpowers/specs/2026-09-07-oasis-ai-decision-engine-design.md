# Design Spec: Dynamic Decision Engine for Oasis AI

## Context & Objectives
Students using the Voice/Text Assistant in Oasis need real, personalized decision guidance when asking whether they can accept or take on tasks (e.g. *"Can I accept this task?"*, *"Should I accept the weekend shift?"*, *"Can I take on a 4-hour project?"*).
Currently, the assistant uses static strings and generic fallbacks that ignore whether the user is asking a decision question.

The objective is to equip Oasis AI with a **Dynamic Decision Engine**:
1. It analyzes the user's inquiry for acceptance / commitment keywords and hours.
2. It evaluates live application state (energy score, upcoming deadlines, sleep debt, group project load).
3. It outputs a structured response containing:
   - **Verdict**: `DECISION: DECLINE`, `DECISION: NEGOTIATE`, or `DECISION: ACCEPT`.
   - **Energy Impact**: Current score vs projected score and zone change.
   - **Specific Student Reasons**: Deadlines colliding, sleep deficit, or group imbalance.
   - **Recommended Script**: Diplomatic phrase to decline or negotiate gracefully.
4. Quick-tap suggestion chips above the input box for fast testing.

---

## Technical Architecture

### 1. State Integration
In [`src/features/assistant/VoiceAssistantPanel.tsx`](file:///C:/Users/Sky%20Lee/Desktop/My%20AI%20Creative%20Hub/Oasis/src/features/assistant/VoiceAssistantPanel.tsx):
- Use `useOasis()` to read:
  - `state.commitments`
  - `state.today`
  - `state.recovery`
  - `state.project`
- Use `useEnergy()` to read current `energy` and `zone`.
- Import `projectEnergy`, `zoneFor` from `../../logic/energy`.

### 2. Inquiry Recognition (`parseAcceptQuery`)
Detects variations of:
- `can I accept / should I accept / can I take on / should I take on / should I do / can I join`
- Regex to extract hours if present: `/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/i` (defaults to 4 hours if not specified).
- Category detection:
  - Shift / retail / work
  - Group work / assignment / project
  - General task / request

### 3. Decision Evaluation
- Computes `projected = projectEnergy(state, candidate)`.
- Calculates pending deadlines in the next 3 days (`kind === 'deadline' && !c.done`).
- Evaluates sleep average against 7.5h baseline.
- **Verdict Rule**:
  - `DECLINE`: If projected energy < 35, or if 2+ urgent deadlines collide, or if sleep < 5.5h and shift is requested.
  - `NEGOTIATE`: If projected energy 35–59, or if group project tasks already assign > 50% to user.
  - `ACCEPT`: If projected energy >= 60 with no immediate deadline collision.

### 4. Interactive Quick Chips
Add chips above the input bar:
- `Can I accept a 4h task?`
- `Should I accept the weekend shift?`
- `Can I take on extra group work?`

---

## Verification Plan
- Type or tap *"Can I accept a 4h task?"* and verify dynamic output with Verdict, energy change, reasons, and script.
- Type *"Should I accept the shift?"* and verify shift-specific decline rationale.
- Verify that `npm run typecheck` and `npm run build` pass cleanly with 0 errors.
