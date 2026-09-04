import { zoneAccent, type ZoneKey } from './tokens'

export interface SleepDatum {
  /** Short day label shown under the bar. */
  day: string
  /** Hours slept. Zone thresholds: >=7 green, >=6 amber, else red. */
  hours: number
  /** Marks the current day — heavier stroke, hard shadow, bolder label. */
  isToday?: boolean
}

export interface SleepBarsProps {
  data: SleepDatum[]
  /** Overall height in px. */
  height?: number
}

/** A week of sleep, each night in its own stroked track. */
export function SleepBars({ data, height = 76 }: SleepBarsProps) {
  const maxH = 9

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, width: '100%', height }}>
      {data.map(d => {
        const zone: ZoneKey = d.hours >= 7 ? 'green' : d.hours >= 6 ? 'amber' : 'red'
        const fillPct = (d.hours / maxH) * 100
        return (
          <div key={d.day} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 5, height,
          }}>
            <div style={{
              flex: 1, width: '100%',
              borderRadius: 'var(--r-sm)',
              border: `${d.isToday ? 2 : 1.5}px solid var(--ink)`,
              background: 'var(--surface)',
              boxShadow: d.isToday ? '2px 2px 0 var(--ink)' : 'none',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              overflow: 'hidden', padding: 2,
            }}>
              <div style={{
                width: '100%', height: `${fillPct}%`,
                background: zoneAccent(zone),
                borderRadius: 6,
                transition: 'height 600ms var(--ease)',
              }} />
            </div>
            <span className="t-micro" style={{
              fontWeight: d.isToday ? 800 : 600,
              color: d.isToday ? 'var(--ink)' : 'var(--ink-muted)',
            }}>
              {d.day}
            </span>
          </div>
        )
      })}
    </div>
  )
}
