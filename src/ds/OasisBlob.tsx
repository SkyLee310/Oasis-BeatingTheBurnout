import type { ZoneKey } from './tokens'

export interface OasisBlobProps {
  /** Drives fill colour and expression. */
  zone: ZoneKey
  /** Square size in px. */
  size?: number
  /** Set false to hold the blob still (in dense rows, or beside motion). */
  float?: boolean
  /** Override the body fill. Leave unset almost everywhere: the zone owns this
   *  colour, and reporting the zone is the mascot's entire job. Pass one only
   *  where the blob is a logo mark rather than a readout. */
  fillColor?: string
  /** Override every outline — body, cheeks, mouth. Defaults to the ink token. */
  strokeColor?: string
  /** Catchlight in each eye. */
  eyeHighlightFill?: string
  /** Fill enclosed by the mouth curve. `none` keeps the mouth a bare line. */
  mouthFill?: string
  /** Mouth stroke. Defaults to the body outline colour. */
  mouthStroke?: string
  /** End shape of the mouth stroke. */
  mouthLinecap?: 'round' | 'butt' | 'square'
  /** End shape of the body outline. */
  strokeLinecap?: 'round' | 'butt' | 'square'
  /** Lift the blob off its surface with the house offset shadow. */
  shadow?: boolean
}

/**
 * The Oasis mascot. A single blob whose expression is bound to the current
 * zone. Purely decorative — it reports state, it does not collect it.
 */
export function OasisBlob({
  zone, size = 120, float = true,
  fillColor, strokeColor,
  eyeHighlightFill = '#ffffff',
  mouthFill = 'none', mouthStroke,
  mouthLinecap = 'round', strokeLinecap = 'round',
  shadow = false,
}: OasisBlobProps) {
  const fill = fillColor ?? (
    zone === 'green' ? 'var(--mint-deep)' :
    zone === 'amber' ? 'var(--butter-deep)' : 'var(--blush-deep)'
  )
  const stroke = strokeColor ?? 'var(--ink)'

  const mouth =
    zone === 'green' ? 'M 76 116 Q 100 140 124 116' :
    zone === 'amber' ? 'M 78 126 L 122 126' : 'M 76 134 Q 100 112 124 134'

  const label =
    zone === 'green' ? 'Mascot looking rested' :
    zone === 'amber' ? 'Mascot looking strained' : 'Mascot looking overloaded'

  return (
    <svg
      className={float ? 'blob-float' : undefined}
      width={size} height={size} viewBox="0 0 200 200"
      role="img" aria-label={label}
      style={{
        overflow: 'visible', flexShrink: 0,
        display: 'inline-block',
        willChange: 'transform',
        // The house offset shadow, not a soft blur: the mascot lifts off the
        // surface the same way every card does.
        ...(shadow ? { filter: 'drop-shadow(var(--shadow-hard))' } : {}),
      }}
    >
      <path
        d="M 100 14 C 143 12 174 44 179 86 C 185 130 156 174 111 183 C 66 192 25 163 17 120 C 9 76 41 22 100 14 Z"
        fill={fill} stroke={stroke} strokeWidth="4"
        strokeLinejoin="round" strokeLinecap={strokeLinecap}
      />
      {/* cheeks */}
      <ellipse cx="60" cy="118" rx="11" ry="7" fill="var(--blush)" stroke={stroke} strokeWidth="2.5" />
      <ellipse cx="140" cy="118" rx="11" ry="7" fill="var(--blush)" stroke={stroke} strokeWidth="2.5" />
      {/* eyes */}
      <ellipse cx="74" cy="88" rx="9" ry="12" fill="var(--ink)" />
      <ellipse cx="126" cy="88" rx="9" ry="12" fill="var(--ink)" />
      <circle cx="77" cy="83" r="3.2" fill={eyeHighlightFill} />
      <circle cx="129" cy="83" r="3.2" fill={eyeHighlightFill} />
      <path
        d={mouth} fill={mouthFill} stroke={mouthStroke ?? stroke}
        strokeWidth="4.5" strokeLinecap={mouthLinecap}
      />
    </svg>
  )
}
