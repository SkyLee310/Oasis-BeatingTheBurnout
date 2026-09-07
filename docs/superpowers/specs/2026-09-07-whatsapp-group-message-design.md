# Design Spec: WhatsApp Group Message Sheet

## Context & Problem
In the Group section (`GroupPage.tsx`), there was a button labeled **"Propose a rebalance"**.
- The label was ambiguous and felt like an automated system rebalancing algorithm rather than drafting a message for teammates.
- Clicking the button directly and silently copied a plain text message to the clipboard, providing no visual preview, no ability to review or tweak the draft before copying, and no direct WhatsApp deep link.

## Objective
Replace "Propose a rebalance" with an explicit **"WhatsApp group message"** trigger that opens a dedicated sheet/modal preview. This allows the user to inspect the diplomatic split summary, optionally adjust the wording, and either copy it to clipboard or launch it directly in WhatsApp.

## Design Details

### 1. GroupPage Trigger
- Change button in `src/pages/GroupPage.tsx`:
  - Label: `WhatsApp group message` (with `MessageCircle` icon).
  - On click: Opens `WhatsAppMessageSheet`.
  - Maintain clean secondary button for `Invite`.

### 2. WhatsAppMessageSheet Component (`src/features/group/WhatsAppMessageSheet.tsx`)
- **Structure**:
  - Modal/sheet using `useSheet<HTMLDivElement>(onClose)` for consistent dismiss behavior (Escape key, backdrop click).
  - Header:
    - Tag: `WHATSAPP DRAFT` (tone: `green` or `yellow`).
    - Title: `Group update message`.
    - Close button with `X` icon.
  - Subtitle:
    - Contextual explanation: *"A diplomatic breakdown of who is carrying what, so you can raise imbalances or share progress without sounding confrontational."*
  - Draft Preview / Editor:
    - Pre-populated with `proposeRebalance(project)`.
    - A styled text area or editable container so students can review or tweak details before sending.
  - Action Bar:
    - **Primary Button**: `Send on WhatsApp` (opens `waLink(message)` in a new tab).
    - **Secondary Button**: `Copy message` (copies to clipboard, switches state to `Copied` with `Check` icon for 2 seconds).
  - Privacy Reminder:
    - Micro note reminding students that this only summarizes group tasks and points — individual stress/burnout scores and sleep data remain strictly private on the user's phone.

### 3. Logic & State
- Utilize existing helper `proposeRebalance(project)` and `waLink(message)` from `src/logic/group.ts`.
- Pure client-side UI, no global state mutations required.

## Testing & Verification
- Verify that clicking "WhatsApp group message" opens the sheet.
- Verify that the generated message matches the project split state (both balanced and unbalanced scenarios).
- Verify copy-to-clipboard functionality and "Copied" temporary feedback.
- Verify "Send on WhatsApp" link encoding and target opening.
- Verify modal dismissal on close button and Escape key press.
