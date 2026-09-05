import { ZONE_LABEL, type ZoneKey } from './tokens'

export interface ZoneChipProps {
  /** Which health zone to announce. */
  zone: ZoneKey
  /** `lg` is for hero surfaces; `sm` is the default inline size. */
  size?: 'sm' | 'lg'
}

/** The canonical status pill. Never write a zone label by hand — use this. */
export function ZoneChip({ zone, size = 'sm' }: ZoneChipProps) {
  return (
    <span className={`zone-chip zone-${zone} ${size === 'lg' ? 'zone-chip-lg' : ''}`}>
      {ZONE_LABEL[zone]}
    </span>
  )
}
