// ─── Text ─────────────────────────────────────────────────────────────────────
// Copy in this app splices authored sentences into other sentences, so the odd
// helper is needed to keep the seams invisible.

/**
 * Drop a leading capital so a sentence can be spliced mid-clause — "Cover
 * Friday evening shift" becomes "cover Friday evening shift". Only the first
 * character moves, so proper nouns and acronyms further in survive; a title
 * that already starts with one (an "LRT pass") is left exactly as it is.
 */
export const lowerFirst = (s: string) =>
  /^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s
