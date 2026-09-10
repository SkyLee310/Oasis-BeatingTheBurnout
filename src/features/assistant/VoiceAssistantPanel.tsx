import { useCallback, useEffect, useRef, useState } from 'react'
import { Brain, Check, Mic, MicOff, Send, Trash2, X } from 'lucide-react'

import { Initials, OasisBlob, SW } from '../../ds'
import { useDispatch, useEnergy, useOasis } from '../../state/store'
import type { Commitment, IncomingRequest } from '../../state/types'
import { evaluateAITaskQuery } from '../../logic/assistantDecision'
import type { AgentAction } from '../../logic/assistantAgent'
import { agentPreview, parseAgentIntent } from '../../logic/assistantAgent'
import { analyzeRequest, decisionHeadline, parseChat } from '../../logic/decision'
import { energyFor } from '../../logic/energy'
import { shortDate } from '../../logic/dates'

import CrisisSupportCard from './CrisisSupportCard'
import { detectCrisisIntent, getCrisisResponseText } from '../../logic/safetyIntervention'

// ─── Oasis AI ─────────────────────────────────────────────────────────────────
// One surface, three jobs, in the order a stressed student needs them:
//
//   1. Read an ask.  Paste the WhatsApp message and it gets priced against the
//      real week — the flow that used to sit in its own card on Home.
//   2. Answer a question.  "Can I accept 4h?" runs the same projection.
//   3. Change the week.  "Add 3h report on Friday", "drop the Ethics reading."
//   4. Crisis safety. Intercept self-harm/suicide ideation with emergency lifelines.
//
// The third is the one that needed care. An agent that edits your schedule the
// moment you ask is the opposite of this app's argument, so it does not: it
// answers with a proposal card carrying the energy cost, and nothing reaches
// the store until Confirm. The cost is shown *before* the commitment exists,
// which is the same promise the Decision Check makes about an incoming ask.

/** A proposal sitting in the transcript, waiting on the student. */
type Pending =
  | { kind: 'add' | 'remove'; commitment: Commitment; settled: 'open' | 'applied' | 'dismissed' }
  | { kind: 'decision'; req: IncomingRequest }
  | { kind: 'crisis' }

interface ChatMsg { role: 'user' | 'ai'; text: string; action?: Pending }

const VOICE_PROMPTS = [
  "Can I accept a 4h study task this week?",
  "Add 3h report write-up on Friday",
  "What are my upcoming assignment deadlines?",
]

const CHIPS = [
  'Can I accept a 4h task?',
  'Add 3h report on Friday',
  'Drop the Ethics reading',
  'What are my deadlines?',
]

const OPENING =
  "Hi Maya. Three things I can do:\n\n" +
  "• Paste a chat someone sent you — I will price it against your week and draft the reply.\n" +
  "• Ask me whether you have room for something.\n" +
  "• Tell me to add or drop a task. I will show you what it costs before anything moves."

/**
 * Second person is the tell. "Can I accept this?" is the student asking about
 * their own week; "can you cover Friday?" is somebody asking them for it — and
 * a pasted thread almost always carries a speaker name or a line break too.
 */
function looksLikeSharedChat(raw: string): boolean {
  const t = raw.trim()
  if (t.length < 25) return false
  const asked = /\b(?:can|could|would|are)\s+(?:you|u)\b|\bhelp me\b|\btake over\b|\bcover (?:for )?(?:me|the)\b|\bare you free\b/i.test(t)
  const threaded = /\n/.test(t) || /^[A-Z][a-z]+\s*:/m.test(t)
  return asked && (threaded || t.length > 60)
}

export default function VoiceAssistantPanel({
  showHeader = true, onOpenDecision,
}: {
  showHeader?: boolean
  onOpenDecision?: (req: IncomingRequest) => void
}) {
  const state = useOasis()
  const dispatch = useDispatch()
  const { energy } = useEnergy()

  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'ai', text: OPENING }])
  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const [hasCrisisTriggered, setHasCrisisTriggered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const reply = useCallback((text: string, action?: Pending) => {
    setMessages(prev => [...prev, { role: 'ai', text, action }])
  }, [])

  const send = useCallback((textToSend?: string) => {
    const raw = typeof textToSend === 'string' ? textToSend : input
    if (!raw.trim()) return
    const userMsg = raw.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])

    setTimeout(() => {
      // 0. PRIORITY 0 SAFETY: Detect self-harm, suicidal ideation or acute crisis
      if (detectCrisisIntent(userMsg)) {
        setHasCrisisTriggered(true)
        reply(getCrisisResponseText(userMsg), { kind: 'crisis' })
        return
      }

      // Order is the routing. An imperative is anchored at the start of the
      // message, so a pasted "Farah: can you add the slides?" never trips it —
      // the speaker name is in the way, which is exactly what we want.
      const intent = parseAgentIntent(userMsg, state)
      if (intent) {
        reply(agentPreview(intent, state, energy), { ...intent, settled: 'open' })
        return
      }

      if (looksLikeSharedChat(userMsg)) {
        const req: IncomingRequest = {
          // Derived, not random: same rule the Decision Check follows.
          id: `ai-shared-${state.requests.length}`,
          raw: userMsg,
          parsed: parseChat(userMsg, state.today),
          receivedAt: state.today,
          status: 'pending',
        }
        const v = analyzeRequest(req, state)
        const lands = req.parsed.deadline ? ` It would land ${shortDate(req.parsed.deadline)}.` : ''
        reply(
          `That reads as ${req.parsed.asker} asking for "${req.parsed.title}" — about ` +
          `${req.parsed.hoursPerWeek}h a week.${lands}\n\n` +
          `${decisionHeadline(v.decision).join(' ')} Your energy would go ` +
          `${v.before} → ${v.after} (${v.zone} zone).\n\n` +
          "Open it and I will write the message you send back.",
          { kind: 'decision', req },
        )
        return
      }

      reply(evaluateAITaskQuery(userMsg, state, energy))
    }, 450)
  }, [input, state, energy, reply])

  /** Confirm is the only path to the store. Cancel leaves the week untouched. */
  const settle = (idx: number, action: AgentAction, apply: boolean) => {
    setMessages(prev => prev.map((m, i) =>
      i === idx && m.action && m.action.kind !== 'decision'
        ? { ...m, action: { ...m.action, settled: apply ? 'applied' : 'dismissed' } }
        : m))

    if (!apply) {
      reply("Left as it was. Nothing changed.")
      return
    }

    const c = action.commitment
    if (action.kind === 'add') {
      dispatch({ type: 'addCommitments', commitments: [c] })
      // The projection, run again on the state the store is about to hold —
      // so the number the student is told is the number they will see on Home.
      const after = energyFor({ ...state, commitments: [...state.commitments, c] })
      reply(`Added. "${c.title}" is on ${shortDate(c.date)} and your energy now reads ${after}.`)
    } else {
      dispatch({ type: 'removeCommitment', id: c.id })
      const after = energyFor({ ...state, commitments: state.commitments.filter(x => x.id !== c.id) })
      reply(`Cleared. "${c.title}" is off your schedule and your energy now reads ${after}.`)
    }
  }

  const startVoice = () => {
    if (recording) {
      setRecording(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }
    setRecording(true)
    const prompt = VOICE_PROMPTS[promptIdx % VOICE_PROMPTS.length]
    let i = 0
    setInput('')
    const tick = () => {
      i++
      setInput(prompt.slice(0, i))
      if (i < prompt.length) {
        timerRef.current = setTimeout(tick, 35)
      } else {
        setRecording(false)
        setPromptIdx(p => p + 1)
      }
    }
    timerRef.current = setTimeout(tick, 250)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>
      {showHeader && (
        <div className="flex items-center gap-2.5 px-5 py-4 rule-b">
          <span
            className="flex items-center justify-center shrink-0"
            style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--highlight)', border: '2px solid var(--ink)' }}
          >
            <Brain size={18} strokeWidth={SW} style={{ color: 'var(--ink)' }} />
          </span>
          <span className="t-sub text-ink">Oasis AI</span>
        </div>
      )}

      {hasCrisisTriggered && (
        <aside
          aria-label="24/7 Crisis helpline quick access"
          className="flex items-center justify-between px-4 py-2 text-xs shrink-0"
          style={{
            background: 'linear-gradient(90deg, #fee2e2 0%, #fef2f2 100%)',
            borderBottom: '2px solid #f87171',
            color: '#991b1b',
          }}
        >
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            24/7 Crisis Support
          </span>
          <div className="flex items-center gap-2">
            <a
              href="tel:0376272929"
              className="font-bold underline text-red-800 hover:text-red-950"
            >
              Befrienders 03-7627 2929
            </a>
            <span className="text-red-300">|</span>
            <a
              href="tel:+60123456789"
              className="font-bold underline text-red-800 hover:text-red-950"
            >
              Call Mom
            </a>
          </div>
        </aside>
      )}

      {/* role=log rather than a bare div: replies arrive on their own after a
          pause, and without this a screen-reader user has no way to know the
          answer landed short of hunting for it. polite, so it waits its turn. */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with Oasis AI"
        className="flex-1 overflow-y-auto flex flex-col gap-3 px-5 py-5"
        style={{ background: 'var(--canvas)' }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-end gap-2 w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && <OasisBlob zone="amber" size={34} float={false} />}
              <div
                className="t-label"
                style={{
                  maxWidth: '80%', padding: '11px 15px',
                  background: m.role === 'user' ? 'var(--ink)' : 'var(--surface)',
                  color: m.role === 'user' ? 'var(--on-ink)' : 'var(--ink)',
                  border: '2px solid var(--ink)',
                  borderRadius: m.role === 'user'
                    ? 'var(--r-md) var(--r-md) 6px var(--r-md)'
                    : 'var(--r-md) var(--r-md) var(--r-md) 6px',
                  boxShadow: 'var(--shadow-hard-sm)',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
              {m.role === 'user' && <Initials size={28} />}
            </div>

            {m.action && (
              <ActionCard
                action={m.action}
                onSettle={apply => {
                  const a = m.action
                  if (a && a.kind !== 'decision' && a.kind !== 'crisis') {
                    settle(i, { kind: a.kind, commitment: a.commitment } as AgentAction, apply)
                  }
                }}
                onOpenDecision={onOpenDecision}
              />
            )}
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="flex flex-col gap-2.5 px-4 py-4 rule-t" style={{ background: 'var(--surface)' }}>
        {/* One chip per thing the assistant can do, in the same order the
            opening message lists them — the chips are the demo script. */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CHIPS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => send(p)}
              className="chip focus-ring hit-44 shrink-0 text-xs py-1 px-2.5 cursor-pointer hover:bg-[var(--butter)]"
              style={{ minHeight: 'unset', height: 'auto' }}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="Ask, or paste a chat…"
            aria-label="Message Oasis AI, or paste a chat to have it priced"
            className="focus-ring t-label flex-1 min-w-0"
            style={{
              background: 'var(--surface-2)', color: 'var(--ink)',
              border: '2px solid var(--ink)', borderRadius: 'var(--r-pill)',
              padding: '10px 16px', outline: 'none', fontFamily: 'inherit',
              // An input is a replaced element: .hit-44 cannot reach it with a
              // pseudo-element, so this one carries the target height itself.
              minHeight: 44,
            }}
          />
          <button
            className="btn-icon focus-ring hit-44"
            onClick={() => send()}
            aria-label="Send message"
            style={{ background: 'var(--ink)', color: 'var(--on-ink)' }}
          >
            <Send size={16} strokeWidth={SW} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
            {recording ? 'Listening…' : 'Tap the mic for voice input'}
          </span>
          <button
            onClick={startVoice}
            aria-label={recording ? 'Stop voice input' : 'Start voice input'}
            className="focus-ring hit-44 flex items-center justify-center"
            style={{
              width: 42, height: 42, borderRadius: 999,
              background: recording ? 'var(--bold-orange)' : 'var(--highlight)',
              border: '2px solid var(--ink)',
              boxShadow: 'var(--shadow-hard-sm)',
              color: 'var(--ink)', cursor: 'pointer',
              transition: 'background-color 0.2s var(--ease)',
            }}
          >
            {recording ? <Mic size={19} strokeWidth={SW} /> : <MicOff size={19} strokeWidth={SW} />}
            {recording && (
              <span
                className="absolute inset-0 rounded-full animate-ping pointer-events-none"
                style={{ background: 'var(--bold-orange)', opacity: 0.35 }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * The proposal, under the sentence that explains it. Two buttons, and each one
 * names the task in its accessible label — "Confirm" on its own is meaningless
 * to anyone arriving at it out of context, and there can be several of these
 * in a transcript at once.
 */
function ActionCard({ action, onSettle, onOpenDecision }: {
  action: Pending
  onSettle: (apply: boolean) => void
  onOpenDecision?: (req: IncomingRequest) => void
}) {
  if (action.kind === 'crisis') {
    return (
      <div className="w-full" style={{ paddingLeft: 42 }}>
        <CrisisSupportCard />
      </div>
    )
  }

  if (action.kind === 'decision') {
    return (
      <div className="flex" style={{ paddingLeft: 42 }}>
        <button
          className="btn btn-primary focus-ring"
          onClick={() => onOpenDecision?.(action.req)}
          aria-haspopup="dialog"
        >
          Open the decision <Check size={15} strokeWidth={SW} />
        </button>
      </div>
    )
  }

  const { commitment: c, settled, kind } = action
  const verb = kind === 'add' ? 'Add' : 'Remove'

  if (settled !== 'open') {
    return (
      <span className="t-micro" style={{ paddingLeft: 42, color: 'var(--ink-muted)' }}>
        {settled === 'applied'
          ? `${kind === 'add' ? 'Added' : 'Removed'} · ${c.title}`
          : `Cancelled · ${c.title}`}
      </span>
    )
  }

  return (
    // Stacked, not a single row: the panel is 360px on desktop and narrower
    // once the blob's 42px indent is taken off, and side-by-side the two
    // buttons squeezed the task down to one word per line.
    <div
      className="flex flex-col gap-2.5 p-3"
      style={{
        marginLeft: 42,
        background: kind === 'add' ? 'var(--butter)' : 'var(--blush)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--r-sm)',
      }}
    >
      <span className="t-micro text-ink" style={{ lineHeight: 1.45 }}>
        {c.title} · {shortDate(c.date)}{c.hours > 0 ? ` · ${c.hours}h` : ''}
      </span>
      <div className="flex gap-2">
        <button
          className="btn btn-primary focus-ring"
          style={{ minHeight: 38, padding: '0 14px' }}
          onClick={() => onSettle(true)}
          aria-label={`Confirm: ${verb.toLowerCase()} ${c.title}`}
        >
          {kind === 'add'
            ? <Check size={14} strokeWidth={SW} />
            : <Trash2 size={14} strokeWidth={SW} />}
          Confirm
        </button>
        <button
          className="btn btn-secondary focus-ring"
          style={{ minHeight: 38, padding: '0 14px' }}
          onClick={() => onSettle(false)}
          aria-label={`Cancel: do not ${verb.toLowerCase()} ${c.title}`}
        >
          <X size={14} strokeWidth={SW} />
          Cancel
        </button>
      </div>
    </div>
  )
}
