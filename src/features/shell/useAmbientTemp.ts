import { useEffect, useLayoutEffect, useRef } from 'react'

// ─── Ambient temperature, driven frame by frame ───────────────────────────────
// The screen is meant to cross-fade warm as the load comes off, over 600ms.
// Two CSS-native ways to get that both fail in Chromium, and both fail the same
// way — by pinning the value and never advancing it:
//
//   transition: --temp 600ms          → --temp freezes at its first-paint value,
//                                       even on a plain DOM element with no
//                                       React anywhere near it.
//   transition: background-color      → frozen too, because the colour comes
//                                       out of a color-mix() held in a custom
//                                       property, which the engine will not
//                                       interpolate.
//
// Setting --temp with no transition at all resolves correctly every time. So the
// number is stepped here instead, one requestAnimationFrame at a time, and the
// mix re-resolves on each frame. Same 600ms fade, no CSS interpolation involved,
// and every colour stays in index.css where the design language keeps them.
//
// Written straight to the DOM node rather than through state: a re-render per
// frame would drag the whole page tree along for a colour change.

const DURATION = 600

/** Matches --ease closely enough that the fade and the page transitions agree. */
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

export function useAmbientTemp<T extends HTMLElement>(target: number) {
  const ref = useRef<T>(null)
  const current = useRef(target)
  const frame = useRef(0)

  // Before the first paint, so the app never flashes the wrong temperature.
  useLayoutEffect(() => {
    ref.current?.style.setProperty('--temp', String(current.current))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (el == null) return

    const from = current.current
    const distance = target - from
    if (Math.abs(distance) < 0.001) return

    // Snap rather than animate when there is nobody to watch it: under reduced
    // motion, and in a hidden tab, where requestAnimationFrame never fires and a
    // fade would leave the colour stale until the tab came back.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still || document.hidden) {
      current.current = target
      el.style.setProperty('--temp', String(target))
      return
    }

    const started = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / DURATION)
      current.current = from + distance * easeInOut(t)
      el.style.setProperty('--temp', current.current.toFixed(4))
      if (t < 1) frame.current = requestAnimationFrame(step)
    }

    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target])

  return ref
}
