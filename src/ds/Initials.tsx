export interface InitialsProps {
  /** Diameter in px. Type scales with it. */
  size?: number
  /** One or two letters. */
  initials?: string
}

/** The avatar stand-in: a yellow disc with the user's initials. */
export function Initials({ size = 40, initials = 'MC' }: InitialsProps) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--highlight)', border: '2px solid var(--ink)',
        color: 'var(--ink)', fontFamily: 'Archivo, sans-serif',
        fontWeight: 800, fontSize: size * 0.36, letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </span>
  )
}
