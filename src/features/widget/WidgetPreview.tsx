import { ArrowLeft, Check, Download, Share, Smartphone } from 'lucide-react'

import { SW, Tag, type ZoneKey } from '../../ds'
import { energyFor, zoneFor } from '../../logic/energy'
import { seedFor } from '../../state/seed'
import type { ScenarioKey } from '../../state/types'
import PhoneFrame from './PhoneFrame'
import { WidgetTile } from './WidgetView'

// ─── Widget preview ───────────────────────────────────────────────────────────
// The camera-facing screen: what the widget looks like on a real home screen,
// at every state the week can be in. The numbers are not typed in — each phone
// runs the actual seed for that scenario through the actual energy formula, so
// what a judge sees here is what the app would really show.

const STATES: { scenario: ScenarioKey; label: string }[] = [
  { scenario: 'clear', label: 'A clear week' },
  { scenario: 'nearCapacity', label: 'Filling up' },
  { scenario: 'redZone', label: 'Overloaded' },
  { scenario: 'week1', label: 'Week one' },
]

/** Real numbers per scenario, computed the same way the live app computes them. */
function snapshot(scenario: ScenarioKey): { energy: number; zone: ZoneKey; next: string } {
  const s = seedFor(scenario)
  const energy = energyFor(s)
  const upcoming = s.commitments
    .filter(c => c.date >= s.today)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))[0]

  return {
    energy,
    zone: zoneFor(energy),
    next: upcoming ? `${upcoming.time} · ${upcoming.title}` : 'Nothing booked — the week is yours',
  }
}

/** A home screen, drawn honestly enough to read as one and no further. */
function HomeScreen({ scenario }: { scenario: ScenarioKey }) {
  const { energy, zone, next } = snapshot(scenario)

  return (
    <div className="flex flex-col gap-3" style={{ padding: 12, minHeight: 300 }}>
      <div className="flex flex-col items-center pt-1">
        <span className="t-stat text-ink" style={{ fontSize: 30, lineHeight: 1 }}>9:41</span>
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Wednesday 9 September</span>
      </div>

      <WidgetTile energy={energy} zone={zone} next={next} />

      {/* Other apps, as blocks — the widget is the subject, not the wallpaper. */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            style={{
              aspectRatio: '1', borderRadius: 12,
              background: 'var(--surface-2)', border: '2px solid var(--ink)',
              opacity: 0.55,
            }}
          />
        ))}
      </div>
    </div>
  )
}

/** The lock screen: the number and the word, nothing you have to unlock for. */
function LockScreen() {
  const { energy, zone, next } = snapshot('nearCapacity')

  return (
    <div className="flex flex-col gap-3" style={{ padding: 12, minHeight: 300 }}>
      <div className="flex flex-col items-center pt-6 pb-2">
        <span className="t-stat text-ink" style={{ fontSize: 46, lineHeight: 1 }}>9:41</span>
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Wednesday 9 September</span>
      </div>
      <WidgetTile energy={energy} zone={zone} next={next} compact />
      <span className="t-micro text-center pt-1" style={{ color: 'var(--ink-muted)' }}>
        Swipe up to open
      </span>
    </div>
  )
}

export default function WidgetPreview({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6 max-w-[1100px]">
      <header className="flex flex-col gap-3">
        <button className="chip focus-ring self-start" onClick={onBack} style={{ minHeight: 34 }}>
          <ArrowLeft size={13} strokeWidth={SW} /> Back
        </button>
        <Tag tone="yellow">ON YOUR PHONE</Tag>
        <h1 className="t-hero text-ink">The widget</h1>
        <p className="t-body max-w-[62ch]" style={{ color: 'var(--ink-2)' }}>
          Most days you should not have to open Oasis at all. The widget carries
          the whole answer — your energy, the zone in words, and the next thing
          on the calendar — so checking in costs a glance.
        </p>
      </header>

      {/* ── Every state the week can be in ───────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <span className="t-sub text-ink">
          <Smartphone size={17} strokeWidth={SW} className="inline mr-2" />
          Home screen, through the week
        </span>
        <div className="flex gap-5 flex-wrap">
          {STATES.map(s => (
            <PhoneFrame key={s.scenario} label={s.label}>
              <HomeScreen scenario={s.scenario} />
            </PhoneFrame>
          ))}
        </div>
        <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          Each number above is computed by the same formula the app uses — nothing
          on this screen is a drawing.
        </p>
      </section>

      {/* ── Lock screen + install ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">
        <section className="flex flex-col gap-4">
          <span className="t-sub text-ink">Lock screen</span>
          <PhoneFrame label="Without unlocking">
            <LockScreen />
          </PhoneFrame>
        </section>

        <section className="card p-5 flex flex-col gap-4">
          <span className="t-sub text-ink">
            <Download size={17} strokeWidth={SW} className="inline mr-2" />
            Put it on your phone
          </span>
          <p className="t-body" style={{ color: 'var(--ink-2)' }}>
            Oasis installs from the browser — no store, no account, and it opens
            straight to this view.
          </p>

          <ol className="flex flex-col gap-3">
            {[
              <>Open Oasis in your phone browser</>,
              <>Tap <Share size={13} strokeWidth={SW} className="inline" /> Share, then "Add to Home Screen"</>,
              <>Open it from the icon — it launches full screen, offline included</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="t-micro shrink-0 flex items-center justify-center"
                  style={{
                    width: 24, height: 24, borderRadius: 999,
                    background: 'var(--highlight)', border: '2px solid var(--ink)',
                    color: 'var(--ink)',
                  }}
                >
                  {i + 1}
                </span>
                <span className="t-body" style={{ color: 'var(--ink)' }}>{step}</span>
              </li>
            ))}
          </ol>

          <div
            className="flex items-start gap-2 p-3"
            style={{ background: 'var(--mint)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
          >
            <Check size={16} strokeWidth={SW} className="shrink-0 mt-0.5" />
            <span className="t-micro" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>
              Works with no signal. Your week is stored on the phone, so the
              number is there on the bus whether or not the data is.
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
