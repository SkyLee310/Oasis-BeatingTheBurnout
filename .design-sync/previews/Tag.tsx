import { SW, Tag } from 'figma-make-app'
import { Zap } from 'lucide-react'

/** Every tone. Tone is the variant axis; the shape stays fixed. */
export function Tones() {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <Tag>4 PENDING</Tag>
      <Tag tone="yellow">TODAY</Tag>
      <Tag tone="green">RECOVERED</Tag>
      <Tag tone="amber">NEAR CAPACITY</Tag>
      <Tag tone="red">OVERLOADED</Tag>
    </div>
  )
}

/** With a leading icon — the eyebrow form that opens the dashboard. */
export function WithIcon() {
  return (
    <Tag tone="amber">
      <Zap size={13} strokeWidth={SW} /> TODAY&apos;S READING
    </Tag>
  )
}

/** In context: the tag as an eyebrow above a hero headline. */
export function AsEyebrow() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
      <Tag tone="amber">
        <Zap size={13} strokeWidth={SW} /> TODAY&apos;S READING
      </Tag>
      <h1 className="t-hero text-ink">
        You&apos;re running<br />near capacity.
      </h1>
    </div>
  )
}
