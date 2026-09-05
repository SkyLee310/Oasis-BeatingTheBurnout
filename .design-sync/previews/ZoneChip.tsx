import { ZoneChip } from 'figma-make-app'

/** The three capacity zones. This is the component's whole variant axis. */
export function AllZones() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <ZoneChip zone="green" />
      <ZoneChip zone="amber" />
      <ZoneChip zone="red" />
    </div>
  )
}

/** The large form, used directly under a gauge where the chip carries the readout. */
export function Large() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <ZoneChip zone="green" size="lg" />
      <ZoneChip zone="red" size="lg" />
    </div>
  )
}

/** In context: a ruled section heading with its zone chip right-aligned. */
export function BesideHeading() {
  return (
    <div className="flex items-baseline justify-between gap-3 rule-b pb-3" style={{ maxWidth: 380 }}>
      <h2 className="t-title text-ink">Sleep architecture</h2>
      <ZoneChip zone="red" />
    </div>
  )
}
