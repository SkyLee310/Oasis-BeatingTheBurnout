# WhatsApp Group Message Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the confusing "Propose a rebalance" button in the Group section with a "WhatsApp group message" button that opens a dedicated sheet with message preview, editable text area, "Copy message", and "Send on WhatsApp" actions.

**Architecture:** Create a new dialog component `WhatsAppMessageSheet` matching the existing design system and `useSheet` conventions. Connect it to `GroupPage` so users can inspect, tweak, and copy/send the generated message from `proposeRebalance(project)`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide icons (`MessageCircle`, `Copy`, `Check`, `X`).

## Global Constraints

- Follow established design system tokens (`card`, `card-pop`, `Tag`, `btn`, `btn-primary`, `btn-secondary`, `btn-icon`, `focus-ring`).
- Maintain accessibility with `useSheet`, `role="dialog"`, `aria-labelledby`, and focus handling.
- Preserve pure helper logic in `src/logic/group.ts` (`proposeRebalance`, `waLink`).
- Zero type errors on `npm run typecheck`.

---

### Task 1: Create WhatsAppMessageSheet Component

**Files:**
- Create: `src/features/group/WhatsAppMessageSheet.tsx`

**Interfaces:**
- Consumes:
  - `GroupProject` from `src/state/types`
  - `useSheet` from `src/features/shell/useSheet`
  - `proposeRebalance`, `waLink` from `src/logic/group`
  - `SW`, `Tag` from `src/ds`
- Produces:
  - Default export `WhatsAppMessageSheet({ project, onClose }: { project: GroupProject; onClose: () => void })`

- [x] **Step 1: Create `src/features/group/WhatsAppMessageSheet.tsx` with dialog structure, editable message text, copy state, and WhatsApp link**
- [x] **Step 2: Run typecheck to verify component compiles**
  Run: `npm run typecheck`
  Expected: PASS
- [x] **Step 3: Commit component**
  Run: `git add src/features/group/WhatsAppMessageSheet.tsx; git commit -m "feat(group): add WhatsAppMessageSheet component"`

---

### Task 2: Integrate WhatsAppMessageSheet into GroupPage

**Files:**
- Modify: `src/pages/GroupPage.tsx`

**Interfaces:**
- Consumes:
  - `WhatsAppMessageSheet` from `src/features/group/WhatsAppMessageSheet`
- Replaces:
  - Replaces `copyProposal` / "Propose a rebalance" button with `showWhatsApp` state toggle and `<button className="btn btn-primary focus-ring" onClick={() => setShowWhatsApp(true)}><MessageCircle ... /> WhatsApp group message</button>`
  - Mounts `<WhatsAppMessageSheet project={project} onClose={() => setShowWhatsApp(false)} />` when open

- [x] **Step 1: Update `src/pages/GroupPage.tsx` with new button and sheet state**
- [x] **Step 2: Run typecheck to verify clean compilation**
  Run: `npm run typecheck`
  Expected: PASS
- [x] **Step 3: Commit changes**
  Run: `git add src/pages/GroupPage.tsx; git commit -m "feat(group): replace propose rebalance with WhatsApp group message sheet"`

---

### Task 3: Verification & Polish

**Files:**
- Build check: `npm run build`
- Type check: `npm run typecheck`

- [x] **Step 1: Run build and typecheck**
  Run: `npm run build; npm run typecheck`
  Expected: PASS with 0 errors
- [x] **Step 2: Verify in browser**
  Check the Group page in the running app, click "WhatsApp group message", verify modal opens, message is readable/editable, "Copy message" updates to "Copied", and "Send on WhatsApp" href matches wa.me schema.
