import { Initials } from 'figma-make-app'

/** The default avatar, at the sizes the app actually uses. */
export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <Initials size={28} />
      <Initials size={40} />
      <Initials size={56} />
    </div>
  )
}

/** Different people. Two letters is the intended content. */
export function People() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <Initials initials="MC" />
      <Initials initials="SL" />
      <Initials initials="AR" />
      <Initials initials="JT" />
    </div>
  )
}

/** In context: the avatar in a study-group row. */
export function InRow() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 340 }}>
      <Initials size={40} initials="MC" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span className="t-sub text-ink">Study group — LinAlg</span>
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
          Wednesday, 3pm · 4 attending
        </span>
      </div>
    </div>
  )
}
