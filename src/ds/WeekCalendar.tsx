import { CALENDAR_WEEK, KIND_STYLE, type CalDay } from './calendar'

export interface WeekCalendarProps {
  /** The date currently selected, or null for none. */
  selectedDate: number | null
  /** Fired with the whole day object when a cell is pressed. */
  onDayClick: (day: CalDay) => void
  /** The week to render. Defaults to the sample week in `calendar.ts`. */
  days?: CalDay[]
}

/** A seven-cell week scrubber. Selection floods yellow; today reads sky blue. */
export function WeekCalendar({
  selectedDate, onDayClick, days = CALENDAR_WEEK,
}: WeekCalendarProps) {
  return (
    <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
      {days.map(day => {
        const isSelected = selectedDate === day.date
        return (
          <button
            key={day.date}
            onClick={() => onDayClick(day)}
            className="focus-ring press flex flex-col items-center justify-between p-2"
            style={{
              background: isSelected ? 'var(--highlight)' : day.isToday ? 'var(--sky)' : 'var(--surface)',
              border: '2px solid var(--ink)',
              borderRadius: 'var(--r-md)',
              boxShadow: isSelected ? 'var(--shadow-hard)' : 'none',
              minHeight: 92, cursor: 'pointer',
            }}
          >
            <span className="t-eyebrow" style={{ color: 'var(--ink)', fontSize: 10 }}>{day.day}</span>
            <span className="t-stat text-ink" style={{ fontSize: 26 }}>{day.date}</span>
            <div className="flex items-center gap-1">
              {day.events.slice(0, 3).map((ev, i) => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: 999,
                  background: KIND_STYLE[ev.kind].dot,
                  border: '1.5px solid var(--ink)',
                }} />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
