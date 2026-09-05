import { CircularGauge } from 'figma-make-app'

/** The canonical use: today's energy index out of 100, in the dashboard header. */
export function EnergyIndex() {
  return <CircularGauge value={38} zone="amber" label="38" sublabel="/ 100 ENERGY" size={168} />
}

/** The three zones. `zone` drives the ring colour and the chip beneath it. */
export function AllZones() {
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <CircularGauge value={82} zone="green" label="82" sublabel="/ 100" size={132} />
      <CircularGauge value={38} zone="amber" label="38" sublabel="/ 100" size={132} />
      <CircularGauge value={16} zone="red" label="16" sublabel="/ 100" size={132} />
    </div>
  )
}

/** A non-percentage scale: hours slept against a 9-hour `max`. */
export function CustomMax() {
  return <CircularGauge value={5.4} max={9} zone="red" label="5.4" sublabel="HRS" size={152} />
}
