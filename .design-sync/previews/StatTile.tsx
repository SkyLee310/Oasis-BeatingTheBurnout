import { SW, SleepBars, Sparkline, StatTile } from 'figma-make-app'
import { Activity, Brain, Heart, Moon, Zap } from 'lucide-react'

const hrValues = [74, 76, 79, 82, 78, 80, 77, 78, 81, 78, 76, 79]

const sleepWeek = [
  { day: 'Mon', hours: 5.1 },
  { day: 'Tue', hours: 5.8 },
  { day: 'Wed', hours: 4.9, isToday: true },
  { day: 'Thu', hours: 5.4 },
  { day: 'Fri', hours: 6.2 },
  { day: 'Sat', hours: 5.0 },
  { day: 'Sun', hours: 5.4 },
]

/** The plain tile: icon, label, a big value and its unit. */
export function Basic() {
  return (
    <div style={{ maxWidth: 260 }}>
      <StatTile
        variant="butter"
        zone="amber"
        icon={<Zap size={14} strokeWidth={SW} />}
        label="Energy index"
        value="38"
        unit="/ 100"
      />
    </div>
  )
}

/** With a `note` — the secondary reading under the value. */
export function WithNote() {
  return (
    <div style={{ maxWidth: 260 }}>
      <StatTile
        variant="blush"
        zone="amber"
        icon={<Heart size={14} strokeWidth={SW} />}
        label="Heart rate"
        value="78"
        unit="bpm"
        note="+6 bpm"
      />
    </div>
  )
}

/** `children` nests a chart inside the tile — the dashboard's richest form. */
export function WithChart() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ maxWidth: 260, flex: '1 1 240px' }}>
        <StatTile
          variant="blush"
          zone="amber"
          icon={<Heart size={14} strokeWidth={SW} />}
          label="Heart rate"
          value="78"
          unit="bpm"
          note="+6 bpm"
        >
          <Sparkline values={hrValues} zone="amber" height={44} />
        </StatTile>
      </div>
      <div style={{ maxWidth: 260, flex: '1 1 240px' }}>
        <StatTile
          variant="sky"
          zone="red"
          icon={<Moon size={14} strokeWidth={SW} />}
          label="Sleep · 7-day"
          value="5.4"
          unit="hrs avg"
          note="Goal 7.5h"
        >
          <SleepBars data={sleepWeek} height={54} />
        </StatTile>
      </div>
    </div>
  )
}

/** Every pastel `variant`. This is the tile's main axis. */
export function AllVariants() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
      <StatTile variant="mint" zone="green" icon={<Activity size={14} strokeWidth={SW} />} label="Recovery" value="82" unit="/ 100" />
      <StatTile variant="sky" zone="red" icon={<Moon size={14} strokeWidth={SW} />} label="Sleep" value="5.4" unit="hrs" />
      <StatTile variant="blush" zone="amber" icon={<Heart size={14} strokeWidth={SW} />} label="Heart rate" value="78" unit="bpm" />
      <StatTile variant="butter" zone="amber" icon={<Zap size={14} strokeWidth={SW} />} label="Energy" value="38" unit="/ 100" />
      <StatTile variant="lilac" zone="red" icon={<Brain size={14} strokeWidth={SW} />} label="Cognitive load" value="91" unit="%" />
    </div>
  )
}
