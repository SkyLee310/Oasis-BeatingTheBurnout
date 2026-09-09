import type { ZoneKey } from '../../ds'
import { CAPACITY_LABEL } from '../../logic/group'

// ─── Capacity chip ────────────────────────────────────────────────────────────
// Deliberately not <ZoneChip>. It renders the same pill in the same three
// colours, but it says a different thing: ZoneChip announces a *health zone*
// ("OVERLOADED") and only ever describes the person reading it. This one
// announces a *share of a project* ("At capacity") and is the only zone-coloured
// thing in the app allowed to appear next to somebody else's name.
//
// Keeping them as two components is the guardrail. A single chip with a `label`
// prop would make it one careless prop away to print a teammate's health zone on
// the Group page, which is the exact promise the product makes.

export default function CapacityChip({ zone, size = 'sm' }: {
  zone: ZoneKey
  size?: 'sm' | 'lg'
}) {
  return (
    <span className={`zone-chip zone-${zone}${size === 'lg' ? ' zone-chip-lg' : ''}`}>
      {CAPACITY_LABEL[zone]}
    </span>
  )
}
