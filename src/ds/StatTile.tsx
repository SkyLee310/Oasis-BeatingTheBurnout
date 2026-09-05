import type { ReactNode } from 'react'
import type { ZoneKey } from './tokens'
import { ZoneChip } from './ZoneChip'

export interface StatTileProps {
  /** Pastel fill. Pick by meaning, not by rotation. */
  variant: 'mint' | 'sky' | 'blush' | 'butter' | 'lilac'
  /** A lucide icon at strokeWidth={SW}. */
  icon: ReactNode
  /** Eyebrow text beside the icon. */
  label: string
  /** The headline figure. */
  value: string
  /** Unit suffix rendered next to the figure. */
  unit?: string
  /** Short caption pinned to the top-right. */
  note?: string
  /** Anything that belongs under the figure — a Sparkline, a bar, prose. */
  children?: ReactNode
  /** When set, pins a ZoneChip to the bottom of the tile. */
  zone?: ZoneKey
}

/** The bento tile: one figure, one meaning, one optional sub-visual. */
export function StatTile({
  variant, icon, label, value, unit, note, children, zone,
}: StatTileProps) {
  return (
    <div className={`tile tile-${variant} card-pop`}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 t-eyebrow" style={{ color: 'var(--ink)' }}>
          {icon} {label}
        </span>
        {note && <span className="t-micro" style={{ color: 'var(--ink-2)' }}>{note}</span>}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="t-stat text-ink" style={{ fontSize: 46 }}>{value}</span>
        {unit && <span className="t-label" style={{ color: 'var(--ink-2)' }}>{unit}</span>}
      </div>

      {children}
      {zone && <div className="mt-auto pt-1"><ZoneChip zone={zone} /></div>}
    </div>
  )
}
