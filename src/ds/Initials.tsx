import defaultAvatar from '../assets/avatar.png'

export interface InitialsProps {
  /** Diameter in px. Type scales with it. */
  size?: number
  /** One or two letters. When omitted or set to 'MC', renders the default avatar picture. */
  initials?: string
  /** Explicit avatar image URL. Set to null to force text initials. */
  src?: string | null
  /** Alt text for image */
  alt?: string
  /** Disc colour behind the initials, and the backdrop while a photo loads.
   *  A token, never a literal — this sits under text at small sizes. */
  bg?: string
}

/**
 * Avatar component: renders the user's avatar image by default,
 * or a colored disc with initials when specific initials are provided.
 */
export function Initials({ size = 40, initials, src, alt, bg = 'var(--highlight)' }: InitialsProps) {
  // If specific image src is passed, or if initials is not specified / is the default 'MC' user:
  const isDefaultUser = !initials || initials === 'MC'
  const imageSrc = src !== undefined ? src : (isDefaultUser ? defaultAvatar : null)

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={alt || (initials ? `Avatar for ${initials}` : 'User avatar')}
        className="inline-block shrink-0 object-cover"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid var(--ink)',
          background: bg,
        }}
      />
    )
  }

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        border: '2px solid var(--ink)',
        color: 'var(--ink)',
        fontFamily: 'Archivo, sans-serif',
        fontWeight: 800,
        fontSize: size * 0.36,
        letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </span>
  )
}
