// ─── Shared design tokens ─────────────────────────────────────────────────────
// The CSS custom properties these names resolve to are defined in src/index.css.

/** The three health zones every status surface in Oasis is keyed to. */
export type ZoneKey = 'green' | 'amber' | 'red'

/**
 * Icon stroke width. Icons carry the same weight as the strokes around them —
 * 1.5px reads as a hairline next to a 2px card border and breaks the language.
 */
export const SW = 2.25

export const ZONE_LABEL: Record<ZoneKey, string> = {
  green: 'OPTIMAL',
  amber: 'NEAR CAPACITY',
  red: 'OVERLOADED',
}

/** The saturated accent for a zone — for fills, bars and gauge sweeps. */
export const zoneAccent = (zone: ZoneKey) => `var(--zone-${zone}-accent)`

/** The pastel tile class for a zone — for bento surfaces. */
export const zoneTile = (zone: ZoneKey) =>
  zone === 'green' ? 'tile-mint' : zone === 'amber' ? 'tile-butter' : 'tile-blush'
