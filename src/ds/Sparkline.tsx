import { zoneAccent, type ZoneKey } from './tokens'

export interface SparklineProps {
  /** Series to plot. Rendered left to right; the last bar reads as "now". */
  values: number[]
  /** Bar colour. */
  zone?: ZoneKey
  /** Overall height in px. */
  height?: number
}

/**
 * A compact trend strip. Thin bars are stroked by their container rather than
 * individually — at this width per-bar strokes collapse into noise.
 */
export function Sparkline({ values, zone = 'amber', height = 54 }: SparklineProps) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-end', gap: 3,
        height, width: '100%', padding: '4px 5px',
        border: '1.5px solid var(--ink)', borderRadius: 'var(--r-sm)',
        background: 'var(--surface)',
      }}
    >
      {values.map((v, i) => {
        const pct = ((v - min) / range) * 72 + 28
        const isLast = i === values.length - 1
        return (
          <div key={i} style={{
            flex: 1, borderRadius: 3, height: `${pct}%`,
            background: zoneAccent(zone),
            opacity: isLast ? 1 : 0.4 + (i / values.length) * 0.45,
            transition: 'height 500ms var(--ease)',
          }} />
        )
      })}
    </div>
  )
}
