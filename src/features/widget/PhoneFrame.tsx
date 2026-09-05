import type { ReactNode } from 'react'

// ─── Phone frame ──────────────────────────────────────────────────────────────
// A device outline drawn in the app's own language — 2px ink border, hard
// offset shadow — rather than a photorealistic mockup, because a realistic
// phone next to a neo-brutalist UI reads as two different products. Used by the
// widget preview and available to any other screen that needs to say "this is
// what it looks like on a phone".

export default function PhoneFrame({
  children, width = 240, label,
}: {
  children: ReactNode
  width?: number
  /** Caption under the device, e.g. "Home screen". */
  label?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        className="flex flex-col"
        style={{
          width,
          padding: 10,
          background: 'var(--ink)',
          border: '2px solid var(--ink)',
          borderRadius: 30,
          boxShadow: '4px 4px 0 var(--ink)',
        }}
      >
        {/* The notch, at the size a real one occupies relative to the screen. */}
        <div className="flex justify-center pb-2">
          <span style={{ width: 52, height: 5, borderRadius: 999, background: 'var(--ink-muted)' }} />
        </div>

        <div
          className="flex flex-col overflow-hidden"
          style={{ borderRadius: 20, background: 'var(--canvas)' }}
        >
          {children}
        </div>
      </div>

      {label && (
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>{label}</span>
      )}
    </div>
  )
}
