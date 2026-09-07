import { useMemo } from 'react'
import { AlertCircle, Calendar, Check, Clock } from 'lucide-react'

import { SW, Tag } from '../../ds'
import { addDays, dayOf } from '../../logic/dates'
import { useDispatch, useOasis } from '../../state/store'
import type { Commitment } from '../../state/types'

// ─── Academic DDL Radar ────────────────────────────────────────────────────────
// High-signal assignment & deadline radar built specifically for university
// students. Shows imminent deadlines at a glance with countdown badges, course
// tags, effort estimates, and one-tap completion.

interface AcademicDDLRadarProps {
  onSelectDate?: (date: string) => void
  selectedDate?: string | null
}

function parseCourseAndTitle(rawTitle: string): { course: string; title: string } {
  if (rawTitle.toLowerCase().startsWith('ds ')) {
    return { course: 'Data Structures', title: rawTitle.replace(/^ds\s+/i, '') }
  }
  if (rawTitle.toLowerCase().startsWith('linalg ')) {
    return { course: 'Linear Algebra', title: rawTitle.replace(/^linalg\s+/i, '') }
  }
  if (rawTitle.toLowerCase().startsWith('web systems ')) {
    return { course: 'Web Systems', title: rawTitle.replace(/^web systems\s+/i, '') }
  }
  if (rawTitle.toLowerCase().startsWith('ethics ')) {
    return { course: 'Ethics', title: rawTitle.replace(/^ethics\s+/i, '') }
  }
  return { course: 'Coursework', title: rawTitle }
}

function getCountdown(date: string, time: string, today: string): {
  badge: string
  tone: 'red' | 'amber' | 'yellow'
} {
  const tomorrow = addDays(today, 1)

  if (date === today) {
    return { badge: `Today · ${time}`, tone: 'red' }
  }
  if (date === tomorrow) {
    return { badge: `Tomorrow · ${time}`, tone: 'amber' }
  }
  if (date < today) {
    return { badge: `Overdue · ${time}`, tone: 'red' }
  }

  // Future day
  const dayName = dayOf(date)
  return { badge: `${dayName} · ${time}`, tone: 'yellow' }
}

export default function AcademicDDLRadar({
  onSelectDate,
  selectedDate,
}: AcademicDDLRadarProps) {
  const state = useOasis()
  const dispatch = useDispatch()

  const deadlines = useMemo(() => {
    return state.commitments
      .filter(c => c.kind === 'deadline')
      .sort((a, b) => {
        // Incomplete items first, then sort by date
        if (Boolean(a.done) !== Boolean(b.done)) {
          return a.done ? 1 : -1
        }
        return a.date.localeCompare(b.date)
      })
  }, [state.commitments])

  const pendingCount = deadlines.filter(d => !d.done).length

  if (deadlines.length === 0) return null

  return (
    <section
      className="card card-pop p-4 sm:p-5 flex flex-col gap-3.5"
      aria-label="Upcoming Deadlines"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Tag tone={pendingCount > 0 ? 'red' : 'green'}>
            <Clock size={12} strokeWidth={SW} /> DDL RADAR
          </Tag>
          <span className="t-sub text-ink">Upcoming Deadlines</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
            {pendingCount === 0 ? 'All caught up 🎉' : `${pendingCount} due soon`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {deadlines.map(c => {
          const { course, title } = parseCourseAndTitle(c.title)
          const countdown = getCountdown(c.date, c.time, state.today)
          const isSelected = selectedDate === c.date

          return (
            <div
              key={c.id}
              onClick={() => onSelectDate?.(c.date)}
              className="group flex flex-col justify-between p-3 transition-all focus-ring"
              tabIndex={0}
              role="button"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDate?.(c.date)
                }
              }}
              style={{
                background: c.done
                  ? 'var(--surface-2)'
                  : isSelected
                    ? 'var(--butter)'
                    : 'var(--surface)',
                border: isSelected ? '2px solid var(--bold-orange)' : '2px solid var(--ink)',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                opacity: c.done ? 0.65 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="chip text-[11px] font-bold py-0.5 px-1.5 shrink-0"
                  style={{ minHeight: 'unset', height: 'auto' }}
                >
                  {course}
                </span>

                <span
                  className={`chip text-[11px] font-semibold py-0.5 px-2 shrink-0 ${
                    countdown.tone === 'red' && !c.done
                      ? 'bg-[var(--blush)] text-[var(--bold-orange)] border-[var(--ink)]'
                      : countdown.tone === 'amber' && !c.done
                        ? 'bg-[var(--butter)] text-[var(--ink)]'
                        : 'bg-[var(--surface-2)] text-[var(--ink-2)]'
                  }`}
                  style={{ minHeight: 'unset', height: 'auto' }}
                >
                  {countdown.badge}
                </span>
              </div>

              <div className="flex items-center gap-2.5 my-2">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    dispatch({ type: 'toggleCommitmentDone', id: c.id })
                  }}
                  aria-pressed={c.done}
                  aria-label={`Mark ${c.title} ${c.done ? 'pending' : 'completed'}`}
                  className="focus-ring shrink-0 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 'var(--r-sm)',
                    border: '2px solid var(--ink)',
                    background: c.done ? 'var(--mint-deep)' : 'var(--surface)',
                  }}
                >
                  {c.done && <Check size={13} strokeWidth={3} style={{ color: 'var(--ink)' }} />}
                </button>

                <div className="flex flex-col min-w-0">
                  <span
                    className="t-label text-ink truncate"
                    style={{
                      textDecoration: c.done ? 'line-through' : 'none',
                      color: c.done ? 'var(--ink-muted)' : 'var(--ink)',
                    }}
                  >
                    {title}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--line)]">
                <span style={{ color: 'var(--ink-muted)' }}>
                  {c.hours > 0 ? `${c.hours}h estimated effort` : 'Deadline'}
                </span>
                <span
                  className="text-xs font-bold text-ink opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--ink)' }}
                >
                  View day →
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
