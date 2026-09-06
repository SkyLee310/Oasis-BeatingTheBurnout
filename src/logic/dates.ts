// ─── Dates ────────────────────────────────────────────────────────────────────
// ISO 'YYYY-MM-DD' strings throughout the store, so dates sort and compare as
// strings and nothing depends on a Date object's timezone. These helpers only
// exist to render them; every parse pins midday to stay clear of DST edges.

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const at = (iso: string) => new Date(`${iso}T12:00:00`)

/** 'Wed' */
export const dayOf = (iso: string) => DAY_SHORT[at(iso).getDay()]

/** 10 */
export const dateOf = (iso: string) => Number(iso.slice(8, 10))

/** 'Sep' */
export const monthOf = (iso: string) => MONTH_SHORT[Number(iso.slice(5, 7)) - 1]

/** 'September' — spelled out, for the one heading that names a whole week. */
export const monthLongOf = (iso: string) =>
  at(iso).toLocaleDateString('en-GB', { month: 'long' })

/** 'Wed 10 Sep' */
export const shortDate = (iso: string) =>
  `${dayOf(iso)} ${dateOf(iso)} ${monthOf(iso)}`

/** 'Wednesday · 10 Sep 2026' — the dashboard header line. */
export function longDate(iso: string) {
  const full = at(iso).toLocaleDateString('en-GB', { weekday: 'long' })
  return `${full} · ${dateOf(iso)} ${monthOf(iso)} ${iso.slice(0, 4)}`
}

/** Days from `iso` forward, e.g. '2026-09-10' + 3. */
export function addDays(iso: string, days: number) {
  const d = at(iso)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 'Thursday 11 Sep' — a plan heading, where the year is noise. */
export const planDate = (iso: string) =>
  `${at(iso).toLocaleDateString('en-GB', { weekday: 'long' })} ${dateOf(iso)} ${monthOf(iso)}`

/**
 * The next `dow` (0 = Sunday) on or after `iso`. 'Friday' asked on a Wednesday
 * is two days out; asked on a Saturday it is six days out, not yesterday —
 * nobody means last Friday when they ask you to cover a shift.
 */
export function nextDow(iso: string, dow: number) {
  return addDays(iso, (dow - at(iso).getDay() + 7) % 7)
}
