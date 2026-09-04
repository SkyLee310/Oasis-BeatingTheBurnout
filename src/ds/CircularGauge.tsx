import { zoneAccent, type ZoneKey } from './tokens'
import { ZoneChip } from './ZoneChip'

export interface CircularGaugeProps {
  /** Current reading. */
  value: number
  /** Full-sweep value. Defaults to 100. */
  max?: number
  /** Drives the sweep colour and the chip underneath. */
  zone: ZoneKey
  /** The big number in the middle. */
  label: string
  /** The small caption under it. */
  sublabel: string
  /** Outer diameter in px. Inner disc and type scale with it. */
  size?: number
}

/** The hero ring gauge: a conic sweep, an ink-stroked disc, and a zone chip. */
export function CircularGauge({
  value, max = 100, zone, label, sublabel, size = 136,
}: CircularGaugeProps) {
  const pct = Math.max(0, Math.min(1, value / max))
  const deg = pct * 360
  const innerSize = Math.round(size * 0.7)

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: `conic-gradient(${zoneAccent(zone)} ${deg}deg, var(--surface) ${deg}deg 360deg)`,
        border: '2px solid var(--ink)',
        boxShadow: 'var(--shadow-hard)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 700ms var(--ease)',
      }}>
        <div style={{
          width: innerSize, height: innerSize, borderRadius: '50%',
          background: 'var(--surface)', border: '2px solid var(--ink)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="t-stat text-ink" style={{ fontSize: size * 0.26 }}>{label}</span>
          <span className="t-micro text-ink-muted" style={{ marginTop: 4 }}>{sublabel}</span>
        </div>
      </div>
      <ZoneChip zone={zone} size="sm" />
    </div>
  )
}
