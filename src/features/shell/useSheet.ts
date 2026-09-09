import { useEffect, useRef } from 'react'

// ─── Sheet behaviour ──────────────────────────────────────────────────────────
// Everything a dismissable surface owes a keyboard: focus lands inside when it
// opens, Escape closes it, and focus goes back to whatever opened it — otherwise
// closing a panel drops you at the top of the document with no idea where you were.
//
// The trap is opt-in on purpose, and the test is the scrim. Trapping focus
// inside a panel the rest of the page is still visible around is worse than not
// trapping it: a keyboard user can see the content they are being kept out of.
// Every caller that covers the page behind a backdrop passes trap; the surfaces
// that expand in place — RequestInbox, DayDetail — do not use this hook at all.

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

      // Both directions check containment, not just Shift. A phase change inside
      // a sheet — answering a request, moving to the reply composer — unmounts
      // the button that had focus and leaves it on <body>, and a forward Tab from
      // there used to walk straight out of a modal that was still open.
      if (e.shiftKey && (active === first || !el.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !el.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, trap])

  return ref
}
