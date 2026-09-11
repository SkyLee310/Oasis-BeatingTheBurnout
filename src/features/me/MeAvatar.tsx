import { Initials } from '../../ds'
import { useOasis } from '../../state/store'
import EmotionBlob from '../avatars/EmotionBlob'

// --- Your face, wherever it appears -----------------------------------------
// One component for four places -- the side rail, the Home hero, the Me header
// and your row on the split -- so picking a blob changes all of them and none
// of them holds its own idea of what you look like.

export default function MeAvatar({ size = 40 }: { size?: number }) {
  const { profile } = useOasis()

  if (!profile.avatar) return <Initials size={size} />

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--surface-2)',
        border: '2px solid var(--ink)',
        overflow: 'hidden',
      }}
    >
      {/* Held still and hidden from screen readers: beside a name, a floating
          blob is decoration, and the name is already the accessible label. */}
      <EmotionBlob emotion={profile.avatar} size={size} float={false} hideFromScreenReaders />
    </span>
  )
}
