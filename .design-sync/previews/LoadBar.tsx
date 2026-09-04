import { LoadBar } from 'figma-make-app'

/** A single category at a glance. */
export function Single() {
  return (
    <div style={{ maxWidth: 420 }}>
      <LoadBar label="Cognitive & Academics" pct={91} zone="red" />
    </div>
  )
}

/** The three zones, so the fill colour reads against its label. */
export function AllZones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 420 }}>
      <LoadBar label="Calendar Density" pct={87} zone="red" />
      <LoadBar label="Physical Recovery" pct={54} zone="amber" />
      <LoadBar label="Social Engagements" pct={38} zone="green" />
    </div>
  )
}

/** In context: the load breakdown, each bar under its own explanatory line. */
export function Breakdown() {
  const categories = [
    { label: 'Cognitive & Academics', pct: 91, zone: 'red' as const, detail: 'DS Assignment 2 + LinAlg exam prep overlapping' },
    { label: 'Calendar Density', pct: 87, zone: 'red' as const, detail: '89% occupied slots — less than 30 mins contiguous break' },
    { label: 'Physical Recovery', pct: 54, zone: 'amber' as const, detail: 'Sleep averaging 5.4h — below optimal recovery baseline' },
    { label: 'Life Administration', pct: 42, zone: 'amber' as const, detail: 'Admin commitments accumulating from last week' },
    { label: 'Social Engagements', pct: 38, zone: 'green' as const, detail: 'Restored to calm, sustainable frequency' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 460 }}>
      {categories.map(c => (
        <div key={c.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <LoadBar label={c.label} pct={c.pct} zone={c.zone} />
          <p className="t-micro" style={{ color: 'var(--ink-muted)' }}>{c.detail}</p>
        </div>
      ))}
    </div>
  )
}
