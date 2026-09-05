import { OasisBlob } from 'figma-make-app'

/**
 * The mascot's three faces. The mouth is the whole signal: a smile at optimal,
 * a flat line near capacity, a frown when overloaded.
 */
export function AllZones() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <OasisBlob zone="green" size={104} float={false} />
      <OasisBlob zone="amber" size={104} float={false} />
      <OasisBlob zone="red" size={104} float={false} />
    </div>
  )
}

/** The sizes in use: 64 inline, 104 on a panel, 124 in the dashboard header. */
export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <OasisBlob zone="amber" size={64} float={false} />
      <OasisBlob zone="amber" size={104} float={false} />
      <OasisBlob zone="amber" size={124} float={false} />
    </div>
  )
}

/** In context: the inline form labelling a simulated commitment. */
export function InlineWithLabel() {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', maxWidth: 400 }}>
      <OasisBlob zone="red" size={64} float={false} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span className="t-sub text-ink">Simulate new commitment</span>
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
          Test the consequence before you say yes.
        </span>
      </div>
    </div>
  )
}
