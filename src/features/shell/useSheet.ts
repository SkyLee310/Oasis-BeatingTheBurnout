import { useEffect, useRef } from 'react'

// ─── Sheet behaviour ──────────────────────────────────────────────────────────
// Everything a dismissable surface owes a keyboard: focus lands inside when it
// opens, Escape closes it, and focus goes back to whatever opened it — otherwise
// closing a panel drops you at the top of the document with no idea where you were.
//
// The trap is opt-in on purpose. Trapping focus inside an inline panel that the
// rest of the page is still visible around is worse than not trapping it: a
// keyboard user can see the content they are being kept out of. Only the mobile
// voice sheet, which genuinely covers the screen behind a backdrop, passes trap.

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useSheet<T extends HTMLElement>(
  onClose: () => void,
  { trap = false }: { trap?: boolean } = {},
) {
  const ref = useRef<T>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Remembered before we move focus, restored on the way out.
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const el = ref.current
    if (el && !el.contains(document.activeElement)) {
      const first = el.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? el).focus({ preventScroll: true })
    }

    return () => opener.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }

      if (!trap || e.key !== 'Tab') return

      const el = ref.current
      if (!el) return
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(n => n.offsetParent !== null)
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (e.shiftKey && (active === first || !el.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, trap])

  return ref
}
