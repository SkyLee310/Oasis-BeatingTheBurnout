import { useState } from 'react'
import EmotionBlob, { EMOTIONS, type EmotionKey } from './EmotionBlob'

/**
 * Every emotion face on one screen, at the three sizes the app uses them at.
 * Reached at ?view=avatars — the same query-string switch as ?join=<code>, so
 * it costs no router and never appears in the nav. It is a reference sheet for
 * the team (and for Figma), not a product screen.
 */

const KEYS = Object.keys(EMOTIONS) as EmotionKey[]

/** The three sizes the app uses these at. 128 is the hero, 64 the card, 40 the
 *  inline/list size — which is also below the threshold where EmotionBlob drops
 *  the props, so this row is the check that the face still carries the mood on
 *  its own. */
const SIZES = [128, 64, 40] as const

export default function AvatarGallery() {
  const [size, setSize] = useState<(typeof SIZES)[number]>(128)
  const [still, setStill] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-7 px-5 py-9 sm:px-8">
      <header className="flex flex-col gap-2">
        <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>
          REFERENCE SHEET
        </span>
        <h1 className="t-display text-ink">THE BLOB,<br />IN EIGHT MOODS.</h1>
        <p className="t-body" style={{ color: 'var(--ink-muted)', maxWidth: '52ch' }}>
          One character, one silhouette. Expression is composed from four parts — eyes,
          brows, mouth, and an optional prop — so these stay consistent and a ninth mood
          is a row of data, not a new drawing.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Preview size">
        {SIZES.map(s => (
          <button
            key={s}
            className={`btn focus-ring ${size === s ? 'btn-primary' : 'btn-secondary'}`}
            aria-pressed={size === s}
            onClick={() => setSize(s)}
          >
            {s}px
          </button>
        ))}
        <button
          className={`btn focus-ring ${still ? 'btn-primary' : 'btn-secondary'}`}
          aria-pressed={still}
          onClick={() => setStill(v => !v)}
        >
          {still ? 'Floating off' : 'Floating on'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KEYS.map(key => {
          const face = EMOTIONS[key]
          return (
            <div
              key={key}
              className="card card-pop flex flex-col items-center gap-3 p-5 text-center"
            >
              <div
                className="flex w-full items-center justify-center"
                style={{ minHeight: 148 }}
              >
                <EmotionBlob emotion={key} size={size} float={!still} hideFromScreenReaders />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="t-title text-ink">{face.label}</span>
                <span className="t-micro" style={{ color: 'var(--ink-faint)' }}>
                  {key}
                </span>
                <p className="t-body" style={{ color: 'var(--ink-muted)' }}>
                  {face.blurb}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <p className="t-micro" style={{ color: 'var(--ink-faint)' }}>
        The zone mascot in src/ds/OasisBlob.tsx is unchanged and still owns green, amber
        and red. These are the moods around it.
      </p>
    </div>
  )
}
