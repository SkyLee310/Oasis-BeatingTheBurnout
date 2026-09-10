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
  sublabel?: string
  /** Outer diameter in px. Inner disc and type scale with it. */
  size?: number
  /** Whether to render the ZoneChip beneath the gauge. Defaults to true. */
  showChip?: boolean
}

/** The hero ring gauge: a conic sweep, an ink-stroked disc, and a zone chip. */
export function CircularGauge({
  value, max = 100, zone, label, sublabel, size = 136, showChip = true,
}: CircularGaugeProps) {
  const pct = Math.max(0, Math.min(1, value / max))
  const deg = pct * 360
  const innerSize = Math.round(size * 0.7)
  const isCompact = size < 90

  return (
    <div className={`flex flex-col items-center ${showChip ? 'gap-3' : 'gap-0'}`}>
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: `conic-gradient(${zoneAccent(zone)} ${deg}deg, var(--surface) ${deg}deg 360deg)`,
        border: '2px solid var(--ink)',
        boxShadow: isCompact ? 'var(--shadow-hard-sm)' : 'var(--shadow-hard)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 700ms var(--ease)',
      }}>
        <div style={{
          width: innerSize, height: innerSize, borderRadius: '50%',
          background: 'var(--surface)', border: '2px solid var(--ink)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}>
          <span
            className="t-stat text-ink"
            style={{
              fontSize: isCompact ? Math.round(size * 0.28) : size * 0.26,
              lineHeight: 1,
            }}
          >
            {label}
          </span>
          {sublabel && (
            <span
              className="t-micro text-ink-muted uppercase font-bold"
              style={{
                marginTop: isCompact ? 2 : 4,
                fontSize: isCompact ? Math.max(7, Math.round(size * 0.12)) : undefined,
                lineHeight: 1,
                letterSpacing: isCompact ? '0.02em' : undefined,
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>
      {showChip && <ZoneChip zone={zone} size="sm" />}
    </div>
  )
}
