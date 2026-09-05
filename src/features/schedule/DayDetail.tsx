import { X, Calendar } from 'lucide-react'

import { KIND_STYLE, SW, Tag } from '../../ds'
import type { CalDay } from '../../ds'

// ─── Day detail ───────────────────────────────────────────────────────────────
export default function DayDetail({ day, onClose }: { day: CalDay; onClose: () => void }) {
  return (
    <div className="card card-pop p-5 flex flex-col gap-4 mt-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Calendar size={18} strokeWidth={SW} />
          <span className="t-sub text-ink">{day.day}, {day.date} {day.month}</span>
          {day.isToday && <Tag tone="yellow">TODAY</Tag>}
        </div>
        <button className="btn-icon focus-ring" onClick={onClose} aria-label="Close day detail">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {day.events.map((ev, i) => {
          const s = KIND_STYLE[ev.kind]
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5"
              style={{ background: s.bg, border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: 999, background: s.dot,
                border: '2px solid var(--ink)', flexShrink: 0, marginTop: 5,
              }} />
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="t-label text-ink" style={{ fontSize: 14.5, fontWeight: 700 }}>{ev.title}</span>
                <span className="t-micro" style={{ color: 'var(--ink-2)' }}>{ev.time}</span>
                {ev.energy !== undefined && (
                  <span className="t-micro mt-1" style={{ color: 'var(--ink)', fontWeight: 800 }}>
                    Energy cost: {ev.energy} pts
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
