# Crisis Intervention & Self-Harm Prevention Safety System

**Date**: 2026-09-10  
**Status**: Approved (Option A: Embedded Crisis Card + Emergency Contact + Malaysia Lifelines)

## Overview
Implement an empathetic, immediate safety intervention system within the Oasis AI Voice/Chat Assistant (`VoiceAssistantPanel`). When a student communicates sentiments indicating self-harm, suicidal ideation, or acute despair, the assistant immediately intercepts the flow (prior to any schedule evaluation or task parsing) with a compassionate supportive message and an interactive Emergency Crisis Card.

## 1. Intent Detection (`src/logic/safetyIntervention.ts`)
Create a high-sensitivity, multi-language detection engine for self-harm and crisis ideation:
- **English Triggers**: "want to die", "kill myself", "end my life", "suicide", "self harm", "hurt myself", "cut myself", "can't take it anymore", "no reason to live", "better off dead", "end it all", "hang myself", "overdose", "jump off", etc.
- **Chinese Triggers**: "想死", "自杀", "自残", "割腕", "不想活了", "活着没意思", "没有任何意义了", "跳楼", "吃安眠药", "结束生命", "不想坚持了", "好想消失", etc.
- **Punctuation & Slang tolerance**: Regex-based with boundary and negation handling (e.g. avoiding false positives like "I'm dying of laughter" or "that test killed me").

## 2. Emergency Contact & Malaysian Crisis Lifelines
### Contact Profile
- **Default Contact**: `Mom (Sarah Chen)`
- **Phone**: `+60 12-345 6789`
- **Actions**:
  - `Call Mom`: `tel:+60123456789`
  - `WhatsApp Mom`: Direct WhatsApp link with prefilled message ("Hi Mom, I'm feeling really overwhelmed right now. Can we talk?")

### Verified Malaysian Crisis Lifelines
1. **Befrienders KL (24/7 Emotional Support & Suicide Prevention)**
   - Number: `03-7627 2929`
   - Direct Call: `tel:0376272929`
2. **Talian HEAL 15555 (MOH Mental Health Crisis Line)**
   - Number: `15555`
   - Direct Call: `tel:15555`
3. **Talian Kasih (24/7 Hotline & WhatsApp Support)**
   - Number: `15999`
   - WhatsApp: `+60 19-261 5999` (`https://wa.me/60192615999`)
4. **Emergency Services (Ambulance / Police)**
   - Number: `999`

## 3. UI & Chat Flow (`VoiceAssistantPanel.tsx`)
1. **Chat Message Integration**:
   - Distinctive safety card with soft warm rose/amber warning border (`border-rose-300`, `bg-rose-50/50` or dark mode tone).
   - Prominent heartbeat/shield icon (`ShieldAlert` / `HeartHandshake` / `PhoneCall`).
   - Quick-action buttons with native `tel:` and WhatsApp links.
2. **Persistent Ambient Safety Banner**:
   - If a crisis was triggered during the session, a subtle banner remains at the top of the chat panel with "24/7 Help: Befrienders 03-7627 2929" so support is always within reach.
3. **Compassionate AI Copy**:
   - "Maya, I hear how deeply exhausted and overwhelmed you feel right now. Your life and your well-being matter so much, and you don't have to carry this immense weight alone. Please reach out to someone who cares about you right now."

## 4. Verification Plan
- Unit tests for keyword matching in English and Chinese.
- Verify that false positives ("that deadline killed me", "dying to know") do NOT trigger crisis flow.
- Verify click-to-call and WhatsApp links open correctly.
- Test in UI using browser / automated build.
