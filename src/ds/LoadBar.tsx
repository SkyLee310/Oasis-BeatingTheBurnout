import { zoneAccent, type ZoneKey } from './tokens'
import { ZoneChip } from './ZoneChip'

export interface LoadBarProps {
  /** What is being measured. */
  label: string
  /** Fill percentage, 0-100. */
  pct: number
  /** Drives the fill colour and the trailing chip. */
  zone: ZoneKey
}

/** A labelled capacity bar with its percentage and zone called out above it. */
export function LoadBar({ label, pct, zone }: LoadBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="t-label text-ink">{label}</span>
        <div className="flex items-center gap-2">
          <span className="t-stat" style={{ fontSize: 16, color: 'var(--ink)' }}>{pct}%</span>
          <ZoneChip zone={zone} />
        </div>
      </div>
      <div className="track" style={{ height: 14 }}>
        <div className="bar-fill" style={{ height: '100%', width: `${pct}%`, background: zoneAccent(zone) }} />
      </div>
    </div>
  )
}
