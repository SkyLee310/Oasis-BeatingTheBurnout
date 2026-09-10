/**
 * The Oasis blob, in the eight states this app actually puts a student in.
 *
 * src/ds/OasisBlob.tsx is the canonical mascot and stays exactly as it is: it
 * answers one question (which zone are you in) with three faces, and it is part
 * of the published package. This is the app-level extension — same silhouette,
 * same stroke weights, same eye and cheek geometry, so it reads as the same
 * character rather than a second mascot.
 *
 * Expression is composed, not drawn. A face is four independent choices —
 * eyes, brows, mouth, and one optional prop — so adding a ninth emotion is a
 * row in EMOTIONS, not another SVG. That is also why the parts share
 * coordinates with OasisBlob: a brow drawn here sits correctly on that body.
 *
 * Colour is never the only signal. Every blob carries an aria-label naming the
 * emotion, and the face reads the same in greyscale — DESIGN.md's rule.
 */

export type EmotionKey =
  | 'calm'
  | 'proud'
  | 'confident'
  | 'anxious'
  | 'overwhelmed'
  | 'drained'
  | 'guilty'
  | 'frustrated'

type Eyes = 'open' | 'wide' | 'closed' | 'heavy' | 'narrow' | 'sparkle' | 'away'
type Brows = 'none' | 'worried' | 'angry' | 'raised'
type Mouth = 'smile' | 'grin' | 'flat' | 'frown' | 'wobble' | 'grit' | 'small'
type Prop = 'none' | 'sweat' | 'storm' | 'sparks' | 'steam' | 'zzz'

interface Face {
  /** Pastel -deep token. These are illustration accents, not surfaces, so they
   *  stay saturated in dark mode while --ink flips to cream around them. */
  fill: string
  eyes: Eyes
  brows: Brows
  mouth: Mouth
  prop: Prop
  /** Shown under the blob wherever the set is listed, and read by the label. */
  label: string
  /** When a student is in this state, in their words rather than ours. */
  blurb: string
}

export const EMOTIONS: Record<EmotionKey, Face> = {
  calm: {
    fill: 'var(--mint-deep)',
    eyes: 'closed', brows: 'none', mouth: 'smile', prop: 'none',
    label: 'Calm',
    blurb: 'The week has room in it. Nothing is chasing you.',
  },
  proud: {
    fill: 'var(--mint-deep)',
    eyes: 'sparkle', brows: 'raised', mouth: 'grin', prop: 'sparks',
    label: 'Proud',
    blurb: 'You finished the thing, or you turned it down and the week held.',
  },
  confident: {
    fill: 'var(--butter-deep)',
    eyes: 'open', brows: 'raised', mouth: 'smile', prop: 'sparks',
    label: 'Confident',
    blurb: 'You know what this costs, so you know what to answer.',
  },
  anxious: {
    fill: 'var(--sky-deep)',
    eyes: 'wide', brows: 'worried', mouth: 'wobble', prop: 'sweat',
    label: 'Anxious',
    blurb: 'Someone just asked for something and you have not answered yet.',
  },
  overwhelmed: {
    fill: 'var(--blush-deep)',
    eyes: 'wide', brows: 'worried', mouth: 'grit', prop: 'storm',
    label: 'Overwhelmed',
    blurb: 'Past what fits. The week is asking for more than it gives back.',
  },
  drained: {
    fill: 'var(--lilac-deep)',
    eyes: 'heavy', brows: 'none', mouth: 'flat', prop: 'zzz',
    label: 'Drained',
    blurb: 'Nothing went wrong. There was just too much road and too little sleep.',
  },
  guilty: {
    fill: 'var(--butter-deep)',
    eyes: 'away', brows: 'worried', mouth: 'small', prop: 'none',
    label: 'Guilty',
    blurb: 'You said no and it was right, and it still does not feel good.',
  },
  frustrated: {
    fill: 'var(--blush-deep)',
    eyes: 'narrow', brows: 'angry', mouth: 'grit', prop: 'steam',
    label: 'Frustrated',
    blurb: 'You are carrying more of this project than anyone agreed you would.',
  },
}

/* A specular highlight, not a themed surface: a catchlight is white on a dark
   blob and on a light one alike, so it is the one literal in this file. */
const CATCHLIGHT = '#ffffff'

const INK = 'var(--ink)'

/** Shared with OasisBlob so both mascots are cut from the same silhouette. */
const BODY =
  'M 100 14 C 143 12 174 44 179 86 C 185 130 156 174 111 183 ' +
  'C 66 192 25 163 17 120 C 9 76 41 22 100 14 Z'

/** Four-point star, used for sparkle eyes and for the sparks prop. */
const star = (x: number, y: number, r: number) =>
  `M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} ` +
  `Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`

function EyePair({ kind }: { kind: Eyes }) {
  switch (kind) {
    case 'open':
      return (
        <>
          <ellipse cx="74" cy="88" rx="9" ry="12" fill={INK} />
          <ellipse cx="126" cy="88" rx="9" ry="12" fill={INK} />
          <circle cx="77" cy="83" r="3.2" fill={CATCHLIGHT} />
          <circle cx="129" cy="83" r="3.2" fill={CATCHLIGHT} />
        </>
      )
    case 'wide':
      // Sclera showing all the way round is the whole tell for alarm.
      return (
        <>
          <circle cx="74" cy="88" r="14" fill={CATCHLIGHT} stroke={INK} strokeWidth="3" />
          <circle cx="126" cy="88" r="14" fill={CATCHLIGHT} stroke={INK} strokeWidth="3" />
          <circle cx="74" cy="90" r="5.5" fill={INK} />
          <circle cx="126" cy="90" r="5.5" fill={INK} />
        </>
      )
    case 'closed':
      return (
        <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round">
          <path d="M 63 91 Q 74 80 85 91" />
          <path d="M 115 91 Q 126 80 137 91" />
        </g>
      )
    case 'heavy':
      // Lid pulled down over the pupil: tired, not asleep.
      return (
        <>
          <ellipse cx="74" cy="92" rx="8.5" ry="6" fill={INK} />
          <ellipse cx="126" cy="92" rx="8.5" ry="6" fill={INK} />
          <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round">
            <path d="M 63 82 L 85 82" />
            <path d="M 115 82 L 137 82" />
          </g>
        </>
      )
    case 'narrow':
      return (
        <>
          <ellipse cx="74" cy="89" rx="9" ry="5" fill={INK} />
          <ellipse cx="126" cy="89" rx="9" ry="5" fill={INK} />
        </>
      )
    case 'sparkle':
      return (
        <g fill={INK}>
          <path d={star(74, 88, 13)} />
          <path d={star(126, 88, 13)} />
        </g>
      )
    case 'away':
      // Pupils cut to the side — the look of not meeting someone's eye.
      return (
        <>
          <ellipse cx="74" cy="89" rx="9" ry="10" fill={CATCHLIGHT} stroke={INK} strokeWidth="3" />
          <ellipse cx="126" cy="89" rx="9" ry="10" fill={CATCHLIGHT} stroke={INK} strokeWidth="3" />
          <circle cx="79" cy="90" r="4.5" fill={INK} />
          <circle cx="131" cy="90" r="4.5" fill={INK} />
        </>
      )
  }
}

function BrowPair({ kind }: { kind: Brows }) {
  if (kind === 'none') return null
  const [left, right] =
    kind === 'worried'
      ? ['M 61 73 L 85 66', 'M 139 73 L 115 66']
      : kind === 'angry'
        ? ['M 61 65 L 85 75', 'M 139 65 L 115 75']
        : ['M 62 68 Q 74 60 86 68', 'M 138 68 Q 126 60 114 68']
  return (
    <g fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round">
      <path d={left} />
      <path d={right} />
    </g>
  )
}

function MouthShape({ kind }: { kind: Mouth }) {
  if (kind === 'grin') {
    return <path d="M 74 116 Q 100 150 126 116 Z" fill={INK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
  }
  if (kind === 'grit') {
    // Clenched teeth. The heaviest mouth in the set, and the one that survives
    // smallest — the rest go soft below about 56px.
    return (
      <>
        <rect x="74" y="117" width="52" height="19" rx="6" fill={CATCHLIGHT} stroke={INK} strokeWidth="3" />
        <path
          d="M 87 117 L 87 136 M 100 117 L 100 136 M 113 117 L 113 136"
          stroke={INK} strokeWidth="2.5"
        />
      </>
    )
  }
  const d =
    kind === 'smile' ? 'M 76 116 Q 100 140 124 116' :
    kind === 'flat' ? 'M 78 126 L 122 126' :
    kind === 'frown' ? 'M 76 134 Q 100 112 124 134' :
    kind === 'small' ? 'M 92 128 L 108 128' :
    'M 74 128 q 8.7 -9 17.3 0 q 8.7 9 17.3 0 q 8.7 -9 17.3 0'
  return <path d={d} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
}

function PropShape({ kind }: { kind: Prop }) {
  switch (kind) {
    case 'none':
      return null
    case 'sweat':
      // Two drops flung off the top-right, clear of the silhouette.
      return (
        <g fill="var(--sky)" stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M 176 16 c 5 8 8 11 8 15 a 8 8 0 0 1 -16 0 c 0 -4 3 -7 8 -15 Z" />
          <path d="M 199 44 c 4 6 6 8 6 11 a 6 6 0 0 1 -12 0 c 0 -3 2 -5 6 -11 Z" />
        </g>
      )
    case 'storm':
      return (
        <g strokeLinejoin="round" strokeLinecap="round">
          <path
            d="M -2 44 A 11 11 0 0 1 12 28 A 15 15 0 0 1 40 24 A 11 11 0 0 1 52 44 Z"
            fill="var(--lilac)" stroke={INK} strokeWidth="3"
          />
          <g stroke={INK} strokeWidth="3.5" strokeLinecap="round">
            <path d="M 10 52 L 6 62" />
            <path d="M 26 52 L 22 62" />
            <path d="M 42 52 L 38 62" />
          </g>
        </g>
      )
    case 'sparks':
      return (
        <g fill="var(--butter)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <path d={star(6, 52, 13)} />
          <path d={star(190, 34, 15)} />
          <path d={star(198, 104, 10)} />
        </g>
      )
    case 'steam':
      // Two curls off the head, the visual shorthand for having had enough.
      return (
        <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
          <path d="M 52 22 q -12 -8 -4 -18 q 8 -8 -2 -14" />
          <path d="M 148 22 q 12 -8 4 -18 q -8 -8 2 -14" />
        </g>
      )
    case 'zzz':
      return (
        <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 170 6 L 186 6 L 170 22 L 186 22" />
          <path d="M 190 30 L 202 30 L 190 42 L 202 42" />
          <path d="M 194 54 L 203 54 L 194 63 L 203 63" />
        </g>
      )
  }
}

export interface EmotionBlobProps {
  emotion: EmotionKey
  /** Square size in px. */
  size?: number
  /** Set false to hold the blob still — in dense grids, or beside motion. */
  float?: boolean
  /** Decorative use, next to text that already names the emotion. */
  hideFromScreenReaders?: boolean
}

export default function EmotionBlob({
  emotion,
  size = 120,
  float = true,
  hideFromScreenReaders = false,
}: EmotionBlobProps) {
  const face = EMOTIONS[emotion]
  // Props are drawn at the edge of the box, so they shrink faster than the
  // face does. Below this they stop being a storm cloud or a bead of sweat and
  // become three grey specks beside the head, which reads as dirt rather than
  // as meaning. The face alone carries the emotion at small sizes.
  const showProp = size >= 72
  return (
    <svg
      className={float ? 'blob-float' : undefined}
      width={size}
      height={size}
      /* Wider than OasisBlob's 200 box on purpose: the props need somewhere to
         live that is not on top of the face or over a neighbouring tile. */
      viewBox="-16 -16 232 232"
      {...(hideFromScreenReaders
        ? { 'aria-hidden': true as const }
        : { role: 'img', 'aria-label': `Mascot looking ${face.label.toLowerCase()}` })}
      style={{ overflow: 'visible', flexShrink: 0, display: 'inline-block', willChange: 'transform' }}
    >
      {showProp && <PropShape kind={face.prop} />}
      <path d={BODY} fill={face.fill} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="60" cy="118" rx="11" ry="7" fill="var(--blush)" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="140" cy="118" rx="11" ry="7" fill="var(--blush)" stroke={INK} strokeWidth="2.5" />
      <BrowPair kind={face.brows} />
      <EyePair kind={face.eyes} />
      <MouthShape kind={face.mouth} />
    </svg>
  )
}
