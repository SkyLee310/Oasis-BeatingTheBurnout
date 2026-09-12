# Oasis

**Every wellbeing app can tell a student they are overloaded. Oasis tells them what to say no to.**

Built for **CodeNection 2026 — Lifestyle Track, "Beating the Burnout."**

---

## The problem we actually went after

Burnout apps measure. They show you a ring, a streak, a sleep score, and then leave the
hard part — the decision — entirely to you. Measurement without a decision is a diary.

Meanwhile the thing that actually breaks a university student is rarely a mystery:

- a group assignment where two people out of five do the work
- a WhatsApp message at 11pm asking you to take one more thing
- and no way to answer it that is not either "sure" or a conversation you would rather avoid

So we built the other half.

> **Oasis measures a student's whole load — academic, sleep, density, physiological,
> commute — and spends that measurement on the one thing that breaks them: the group
> assignment they end up carrying alone.**

---

## The number

One score, 0–100, computed as `100 − Σ(weight × how far you are into that factor)`.

| Factor | Weight | Fully loaded at |
|---|---:|---|
| Academic load | 30 | 40 h/week — the only factor allowed past its ceiling, up to 1.5× |
| Sleep debt | 25 | scored between a 7.5 h target and a 4 h floor |
| Calendar density | 20 | 18 blocks/week, about 2.5 a day, every day |
| Physiological strain | 15 | 20 bpm over your own resting baseline |
| Commute | 10 | 10 h/week, door to door |

**≥ 60 OPTIMAL · 30–59 NEAR CAPACITY · below 30 OVERLOADED**

Two choices here are the whole pitch:

**It is a transparent weighted sum, not a model.** Every input is a number a student can
check against their own week. There is a screen — *Where the numbers come from* — that
renders these exact factors back to them with their own values plugged in. An opaque
wellbeing score is something you either believe or ignore. A visible one is something you
can argue with, which is the only way a student will trust it enough to act on it.

**One function answers "what is the number."** [`src/logic/energy.ts`](src/logic/energy.ts)
is the single source. The gauge, the verdict card, the request inbox and the colour
temperature of the canvas all read the same result — so a request declined on one screen
moves every other screen at once. The cost of one commitment is the week with it minus the
week without it, recomputed rather than stored, so the same 2h reading genuinely costs more
on a full week than an empty one.

---

## What it looks like in use

Seven screens. Four sit in the nav bar; the rest are reached from where they are relevant.

**Dashboard** — the score, the mascot reporting your zone, a ten-second daily check-in
that visibly moves the number, and anything a teammate has asked you for.

**Schedule & load** — the week as blocks, deadlines on a radar, and a per-task cost so you
can see what one specific commitment is charging you before it is on the calendar. You can
import a real calendar: drop in an `.ics` and Oasis reads the next seven days, guesses what
each event *is* (a lecture, a deadline, rest), estimates the effort, and shows you the
whole proposal before a single event is written. Anything resembling something already on
your week arrives pre-unticked, so a second import cannot silently double it.

**Group project** — a list of the assignments you are actually carrying, because being in
several at once is the whole reason the term feels the way it does. Open one and the split
is shown as percentages weighted by effort rather than task count, since a five-point build
is not one slide deck. When someone is carrying the project, the app says so out loud and
hands you a WhatsApp message that raises it for you. New projects mint an invite code;
teammates join from a link.

**Recovery** — actions costed in energy points, projected rather than banked. Ticking
"sleep 7 hours tonight" shows what the week *would* read; the real figure does not move
until the sleep and heart-rate data actually do.

**Smart band** — resting heart rate and sleep architecture. The band streams, but the live
drift is deliberately cosmetic: a number that changed every two seconds could not be
reasoned about, so the score reads the stored resting figure.

**Me** — a private mirror, not a profile card. Who you are, the pattern you recognise in
yourself, what you have finished, and the projects behind it. Every pattern is two halves
that meet on one card: *you* name it, and Oasis measures it — and each percentage ships
with the one sentence that produced it. A pattern Oasis cannot see yet says so rather than
reading zero. There is deliberately no decision log here: a list of everything you turned
down, kept on the page about yourself, is a ledger of guilt.

**Where the numbers come from** — the formula above, rendered with your own values in it.

---

## Oasis AI

One assistant, three jobs, all spending the same energy model.

- **Consultant** — "Can I accept a 4h study task this week?" · "What are my deadlines?"
- **Agent** — "Add 3h report write-up on Friday" · "Drop the Ethics reading."
- **Negotiator** — paste the chat someone actually sent you. Oasis prices it against your
  week, gives a verdict, and drafts the reply.

The agent never touches your week directly. It returns a *proposal* — the task, the date,
the hours, and the projected score — and nothing reaches the store until you press
**Confirm**.

That is not politeness. An app whose entire argument is *see what this costs before you
say yes* cannot be the thing that quietly adds four hours to your Thursday. The confirm
step is where the cost gets shown, which makes the confirm step the product.

### When it is not a scheduling problem

Some of what a student types into a burnout app is not a workload question, and answering
it with an energy score would be the worst possible reply. So the assistant checks for
acute distress and self-harm intent before it does anything else, and when it finds it,
the energy model gets out of the way entirely.

What comes back instead is a support card: Malaysian crisis lifelines — **Befrienders KL**
(03-7627 2929, 24/7), **Talian HEAL 15555** (Ministry of Health), **Talian Kasih 15999**,
and **999** — plus a one-tap way to reach a trusted contact the student has already
nominated, with the message pre-written, because composing that text is the part nobody
can do at the moment they need to.

No score. No advice. No suggestion to drop a commitment. Just the number of someone who
can help.

> Detection is keyword-based and runs locally. It is a prototype safeguard rather than a
> clinical tool, and it is built to err towards showing the card.

---

## What Oasis refuses to do

The group features are the reason to install it, and they are also the fastest way to
build something nobody would let their friends see. So the boundaries are explicit:

- **No teammate ever sees anyone's energy score**, sleep, heart rate, or what they turned
  down. The page says this out loud, under the list, where it can be checked.
- **Capacity is shared as a word, never a number** — "Has room", "Loaded", "At capacity" —
  and it is derived from the shared project split, not from anyone's private health data.
- **Your track record opens from your own row only.** There is no equivalent control on a
  teammate's row, and that absence is the feature: a history you can open about somebody
  else is a rating system. The one switch that changes what a teammate can see is off by
  default and says in words what turning it on does.
- **Nothing about you is comparative.** No percentile, no rank, no league. The only thing
  a figure is measured against is the same student's own history.
- **No account, no server.** State lives in `localStorage`. Nothing leaves the device.
- **No streaks, no nagging, no guilt.** Everything is skippable, and every achievement is
  a count of something that happened — a count cannot break the way a streak breaks, so
  stopping for a semester costs a student nothing. An app about not overcommitting cannot
  itself become a daily obligation.

---

## Running it

```bash
pnpm install
pnpm dev
```

`pnpm build` for a production bundle, `pnpm typecheck` for types, `pnpm format` to run
oxfmt. Node 22 and pnpm 10.34.3 are pinned in `.mise.toml`; npm works too.

### Demo entry points

Append `?demo=1` — or press **Shift+D** on any screen — for a scenario bar that swaps the
whole week in one click:

| Scenario | What it shows |
|---|---|
| Week one | Empty week, nothing logged yet |
| All clear | Room to say yes |
| Near capacity | The week is filling |
| Red zone | Past what fits |

The demo that lands: set **All clear**, paste a teammate's request, watch Oasis say yes.
Switch to **Red zone**, paste the same request, watch it say no — same formula, same
screen, on camera. Everything downstream of the store is derived, so restaging the entire
app is one dispatch and no screen is hand-faked.

Also `?join=<code>` to join a project from an invite link, and `?view=avatars` for the
mascot reference sheet.

---

## Built with

React 19 · Vite 8 · TypeScript 5.7 · Tailwind v4 · lucide-react

No router, no state library, no backend — React context and a pure reducer over
`localStorage`. Only `ThemeProvider` is used from `@figma/astraui`; navigation, avatars,
badges, tabs and chat are hand-built so nothing renders in someone else's idiom. Installs
as a PWA.

```
src/ds/          design-system primitives, published as a package
src/pages/       the seven screens
src/features/    assistant, avatars, check-in, decision, demo, group, me, requests,
                 schedule, shell
src/logic/       energy model, decision engine, agent, group maths, calendar import,
                 patterns, track record, crisis detection
src/state/       context + reducer + persistence
src/index.css    every colour token in the product
```

Everything in `src/logic/` is pure and derived from state. That is why a scenario switch
restages every screen at once, and why the same figure cannot differ between two views of
it.

### Docs

| | |
|---|---|
| [DESIGN.md](DESIGN.md) | The visual language — cream canvas, 2px ink strokes, hard offset shadows, and why the primary button is black |
| [BUILD-PLAN.md](BUILD-PLAN.md) | What is built, what is next, and what was cut |
| [AGENTS.md](AGENTS.md) | Project structure and conventions for agents working in the repo |
| [docs/superpowers/](docs/superpowers/) | Per-feature design specs and implementation plans |

---

## Team

Four people, CodeNection 2026 Lifestyle Track.

| | |
|---|---|
| **Sky** | Engineering — backend and logic |
| **Tracia** | Engineering — frontend and interface |
| **Huixuan** | UI/UX |
| **Jacqueline** | Product |

**Status:** Prototype Phase (7–13 Sep 2026). Building Phase 21 Sep – 11 Oct, Deployment
Phase 12–31 Oct, Grand Finals 15 Nov.
