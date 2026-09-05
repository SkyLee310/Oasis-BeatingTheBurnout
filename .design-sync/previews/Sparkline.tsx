import { Sparkline } from 'figma-make-app'

const hrValues = [74, 76, 79, 82, 78, 80, 77, 78, 81, 78, 76, 79]

/** Twelve hours of heart-rate samples — the reading the dashboard tile carries. */
export function HeartRate() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Sparkline values={hrValues} zone="amber" height={60} />
    </div>
  )
}

/** `zone` tints the bars. Same series, three readings of it. */
export function AllZones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 320 }}>
      <Sparkline values={hrValues} zone="green" height={44} />
      <Sparkline values={hrValues} zone="amber" height={44} />
      <Sparkline values={hrValues} zone="red" height={44} />
    </div>
  )
}

/** In context: the sparkline under its label and a plain-language reading. */
export function WithCaption() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Heart rate · 12h</span>
      <Sparkline values={hrValues} zone="amber" height={60} />
      <span className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
        Elevated 6 bpm over your 72 bpm resting baseline.
      </span>
    </div>
  )
}
