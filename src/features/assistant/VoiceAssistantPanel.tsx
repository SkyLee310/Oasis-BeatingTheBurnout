import { useCallback, useEffect, useRef, useState } from 'react'
import { Brain, Mic, MicOff, Send } from 'lucide-react'

import { Initials, OasisBlob, SW } from '../../ds'
import { useEnergy, useOasis } from '../../state/store'
import { evaluateAITaskQuery } from '../../logic/assistantDecision'

interface ChatMsg { role: 'user' | 'ai'; text: string }

// ─── Voice assistant ──────────────────────────────────────────────────────────
const VOICE_PROMPTS = [
  "Can I accept a 4h study task this week?",
  "Should I accept the part-time shift offer this weekend?",
  "What are my upcoming assignment deadlines?",
]

export default function VoiceAssistantPanel({ showHeader = true }: { showHeader?: boolean }) {
  const state = useOasis()
  const { energy } = useEnergy()

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'ai',
      text: "Hi Maya. I'm monitoring your load trends and deadlines. Ask me 'Can I accept [task / X hours]?' and I'll calculate whether you have the capacity to take it on.",
    },
  ])
  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = useCallback((textToSend?: string) => {
    const raw = typeof textToSend === 'string' ? textToSend : input
    if (!raw.trim()) return
    const userMsg = raw.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setTimeout(() => {
      const reply = evaluateAITaskQuery(userMsg, state, energy)
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 450)
  }, [input, state, energy])

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

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 px-5 py-5" style={{ background: 'var(--canvas)' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
        ))}
      </div>

      {/* Composer */}
      <div className="flex flex-col gap-2.5 px-4 py-4 rule-t" style={{ background: 'var(--surface)' }}>
        {/* Quick prompt chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            'Can I accept a 4h task?',
            'Should I accept the weekend shift?',
            'Can I take on extra group work?',
            'What are my deadlines?',
          ].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => send(p)}
              className="chip focus-ring shrink-0 text-xs py-1 px-2.5 cursor-pointer hover:bg-[var(--butter)]"
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
            placeholder="Ask Oasis AI…"
            aria-label="Message Oasis AI"
            className="focus-ring t-label flex-1 min-w-0"
            style={{
              background: 'var(--surface-2)', color: 'var(--ink)',
              border: '2px solid var(--ink)', borderRadius: 'var(--r-pill)',
              padding: '10px 16px', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            className="btn-icon focus-ring"
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
            className="focus-ring relative flex items-center justify-center"
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
