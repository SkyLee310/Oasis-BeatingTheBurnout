import { Image } from 'lucide-react'

import { SW } from '../../ds'
import { useDispatch, useOasis } from '../../state/store'
import type { AvatarKey } from '../../state/types'
import EmotionBlob, { EMOTIONS } from '../avatars/EmotionBlob'

// --- Pick a face ------------------------------------------------------------
// Eight faces the app already draws, plus the photo. No uploads and no new art:
// the blobs are the mascot this student has been reading all week, so choosing
// one of them says something the eight-hundredth stock illustration would not.

const AVATARS: AvatarKey[] = [
  'calm', 'proud', 'confident', 'anxious',
  'overwhelmed', 'drained', 'guilty', 'frustrated',
]

export default function AvatarPicker() {
  const { profile } = useOasis()
  const dispatch = useDispatch()

  return (
    <div className="flex flex-col gap-2">
      <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Your face</span>
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Pick an avatar">
        <button
          onClick={() => dispatch({ type: 'setProfile', patch: { avatar: null } })}
          aria-pressed={profile.avatar === null}
          aria-label="Use the photo"
          className={`chip focus-ring hit-44 ${profile.avatar === null ? 'chip-selected' : ''}`}
        >
          <Image size={14} strokeWidth={SW} />
        </button>

        {AVATARS.map(key => (
          <button
            key={key}
            onClick={() => dispatch({ type: 'setProfile', patch: { avatar: key } })}
            aria-pressed={profile.avatar === key}
            aria-label={EMOTIONS[key].label}
            className={`chip focus-ring hit-44 ${profile.avatar === key ? 'chip-selected' : ''}`}
            style={{ padding: 4 }}
          >
            <EmotionBlob emotion={key} size={28} float={false} hideFromScreenReaders />
          </button>
        ))}
      </div>
    </div>
  )
}
