import type { ReactNode } from 'react'

export interface TagProps {
  children: ReactNode
  /** Fill colour. `neutral` is the plain surface pill. */
  tone?: 'neutral' | 'yellow' | 'green' | 'amber' | 'red'
  /** Softer fill than the tone's default, for a pill that should sit back
   *  rather than shout. Text colour still follows `tone`, so the pair stays
   *  legible — pass a token, never a literal. */
  bg?: string
}

/** A small stroked pill for metadata — dates, counts, short labels. */
export function Tag({ children, tone = 'neutral', bg: bgOverride }: TagProps) {
  const bg = bgOverride ??
    (tone === 'yellow' ? 'var(--highlight)' :
    tone === 'green' ? 'var(--zone-green-bg)' :
    tone === 'amber' ? 'var(--zone-amber-bg)' :
    tone === 'red' ? 'var(--zone-red-bg)' : 'var(--surface)')
  const fg =
    tone === 'green' ? 'var(--zone-green-text)' :
    tone === 'amber' ? 'var(--zone-amber-text)' :
    tone === 'red' ? 'var(--zone-red-text)' : 'var(--ink)'
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 t-micro"
      style={{
        background: bg, color: fg,
        border: '1.5px solid var(--ink)', borderRadius: 'var(--r-pill)',
        padding: '4px 11px', fontWeight: 800, whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
