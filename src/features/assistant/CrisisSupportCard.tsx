import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  MessageSquare,
  Phone,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react'

import { SW } from '../../ds'
import {
  DEFAULT_EMERGENCY_CONTACT,
  MALAYSIAN_CRISIS_LIFELINES,
} from '../../logic/safetyIntervention'

export default function CrisisSupportCard() {
  const [showMore, setShowMore] = useState(false)
  const contact = DEFAULT_EMERGENCY_CONTACT
  const primaryLines = MALAYSIAN_CRISIS_LIFELINES.slice(0, 2)
  const secondaryLines = MALAYSIAN_CRISIS_LIFELINES.slice(2)

  return (
    <div
      className="mt-3 p-4 rounded-2xl flex flex-col gap-4 text-ink"
      style={{
        background: 'linear-gradient(180deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
        border: '2px solid rgba(239, 68, 68, 0.5)',
        boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.15)',
      }}
    >
      {/* ── Badge & Title ── */}
      <div className="flex items-start gap-2.5">
        <div
          className="p-2 rounded-xl shrink-0 flex items-center justify-center text-white"
          style={{ background: '#ef4444' }}
        >
          <ShieldAlert size={20} strokeWidth={SW} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#b91c1c' }}>
              Crisis Support & Prevention
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> 24/7 Available
            </span>
          </div>
          <h3 className="text-sm font-bold text-ink leading-tight mt-0.5">
            You don&apos;t have to go through this alone
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Please reach out right now — people who care are ready to listen and help.
          </p>
        </div>
      </div>

      {/* ── Priority 1: Trusted Emergency Contact ── */}
      <div
        className="p-3 rounded-xl flex flex-col gap-2.5"
        style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#fee2e2', color: '#b91c1c' }}
            >
              ❤️
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-ink">
                {contact.name} ({contact.relationship})
              </span>
              <span className="text-[11px] text-ink-muted">Your Trusted Emergency Contact</span>
            </div>
          </div>
          <span className="text-xs font-mono text-ink-muted">{contact.phone}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-0.5">
          <a
            href={contact.tel}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-white transition-transform active:scale-95 shadow-sm"
            style={{ background: '#ef4444' }}
          >
            <PhoneCall size={14} strokeWidth={SW} />
            Call {contact.relationship}
          </a>
          <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-white transition-transform active:scale-95 shadow-sm"
            style={{ background: '#25D366' }}
          >
            <MessageSquare size={14} strokeWidth={SW} />
            WhatsApp
          </a>
        </div>
      </div>

      {/* ── Priority 2: 24/7 Verified Malaysian Crisis Lifelines ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wide uppercase text-ink-muted flex items-center gap-1">
            <HeartHandshake size={13} strokeWidth={SW} /> Verified 24/7 Lifelines (Malaysia)
          </span>
          <span className="text-[10px] text-ink-muted">Free &amp; Confidential</span>
        </div>

        <div className="flex flex-col gap-2">
          {primaryLines.map(line => (
            <div
              key={line.id}
              className="p-2.5 rounded-xl bg-white flex items-center justify-between gap-3 shadow-xs"
              style={{ border: '1px solid rgba(226, 232, 240, 0.9)' }}
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-ink truncate">{line.name}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 font-medium shrink-0">
                    {line.hours}
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted truncate">{line.desc}</span>
              </div>

              <a
                href={line.tel}
                className="shrink-0 flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-ink text-white hover:bg-ink/90 active:scale-95 transition-transform"
              >
                <Phone size={13} strokeWidth={SW} />
                {line.phone}
              </a>
            </div>
          ))}

          {/* More Hotlines Toggle (Talian Kasih & 999) */}
          {showMore && (
            <div className="flex flex-col gap-2 pt-1">
              {secondaryLines.map(line => (
                <div
                  key={line.id}
                  className="p-2.5 rounded-xl bg-white flex items-center justify-between gap-3 shadow-xs"
                  style={{ border: '1px solid rgba(226, 232, 240, 0.9)' }}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-ink truncate">{line.name}</span>
                    <span className="text-[11px] text-ink-muted truncate">{line.desc}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {line.whatsappUrl && (
                      <a
                        href={line.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800"
                        title="WhatsApp Talian Kasih"
                      >
                        <MessageSquare size={13} strokeWidth={SW} />
                      </a>
                    )}
                    <a
                      href={line.tel}
                      className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-bold bg-ink text-white active:scale-95 transition-transform"
                    >
                      <Phone size={13} strokeWidth={SW} />
                      {line.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMore(v => !v)}
            className="flex items-center justify-center gap-1 py-1 text-xs text-ink-muted hover:text-ink font-medium mt-0.5"
          >
            {showMore ? (
              <>
                Show less hotlines <ChevronUp size={13} strokeWidth={SW} />
              </>
            ) : (
              <>
                More emergency numbers (Talian Kasih, 999) <ChevronDown size={13} strokeWidth={SW} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
