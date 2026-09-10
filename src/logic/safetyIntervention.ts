// ─── Crisis Intervention & Self-Harm Prevention Engine ────────────────────────
// Provides multi-lingual detection of self-harm, suicidal ideation, and acute distress,
// along with official Malaysian crisis lifelines and trusted emergency contact actions.

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  tel: string
  whatsappUrl: string
}

export interface CrisisLifeline {
  id: string
  name: string
  shortName: string
  phone: string
  tel: string
  desc: string
  whatsappUrl?: string
  hours: string
  free: boolean
}

export const DEFAULT_EMERGENCY_CONTACT: EmergencyContact = {
  name: 'Sarah Chen',
  relationship: 'Mom',
  phone: '+60 12-345 6789',
  tel: 'tel:+60123456789',
  whatsappUrl: `https://wa.me/60123456789?text=${encodeURIComponent(
    "Hi Mom, I'm feeling really overwhelmed right now with university. Can we please talk?",
  )}`,
}

export const MALAYSIAN_CRISIS_LIFELINES: CrisisLifeline[] = [
  {
    id: 'befrienders',
    name: 'Befrienders KL',
    shortName: 'Befrienders',
    phone: '03-7627 2929',
    tel: 'tel:0376272929',
    desc: '24/7 Free & confidential emotional support & suicide prevention',
    hours: '24/7',
    free: true,
  },
  {
    id: 'talian-heal',
    name: 'Talian HEAL (MOH / KKM)',
    shortName: 'HEAL 15555',
    phone: '15555',
    tel: 'tel:15555',
    desc: 'Ministry of Health Malaysia Mental Health Crisis Helpline',
    hours: '8:00 AM – 12:00 AM Daily',
    free: true,
  },
  {
    id: 'talian-kasih',
    name: 'Talian Kasih (KPWKM)',
    shortName: 'Talian Kasih',
    phone: '15999',
    tel: 'tel:15999',
    desc: 'National 24/7 psychological assistance & social welfare helpline',
    whatsappUrl: 'https://wa.me/60192615999',
    hours: '24/7',
    free: true,
  },
  {
    id: 'emergency-999',
    name: 'National Emergency Services',
    shortName: '999',
    phone: '999',
    tel: 'tel:999',
    desc: 'Immediate emergency response (Ambulance / Police)',
    hours: '24/7',
    free: true,
  },
]

// ─── Detection Rules ──────────────────────────────────────────────────────────

/** False-positive expressions in casual conversation (colloquialisms / slang). */
const FALSE_POSITIVES = [
  /\b(?:dying of (?:laughter|laughing|embarrassment|thirst|boredom))\b/i,
  /\b(?:dying to (?:know|see|meet|hear|go))\b/i,
  /\b(?:that (?:test|assignment|exam|workout|run|joke) killed me)\b/i,
  /\b(?:you're killing me|it's killing me)\b/i,
  /\b(?:to die for)\b/i,
  /(?:笑死|气死|累死我了|撑死|热死|冻死|忙死|社死|急死)/,
]

/** Direct suicidal ideation or intent in English. */
const ENGLISH_CRISIS_PATTERNS = [
  /\b(?:want|wanna|wish|planning|going|thinking of|feel like)\s+(?:to\s+)?(?:die|kill myself|end my life|hurt myself|cut myself|hang myself)\b/i,
  /\b(?:kill(?:ing)?|end(?:ing)?|take|taking|hurt(?:ing)?)\s+(?:my\s+)?(?:own\s+)?(?:life|myself)\b/i,
  /\b(?:suicide|suicidal|self[- ]?harm|self[- ]?injury|slit my wrists?|overdose)\b/i,
  /\b(?:no reason to live|better off dead|don'?t want to (?:live|be here|wake up) anymore)\b/i,
  /\b(?:can'?t (?:take it|go on|keep going|live like this) anymore)\b/i,
  /\b(?:tired of living|feel like ending it all|want to disappear forever|wish I was dead|wish I were dead)\b/i,
  /\b(?:jump off a (?:building|bridge|roof))\b/i,
]

/** Direct suicidal ideation or self-harm in Chinese. */
const CHINESE_CRISIS_PATTERNS = [
  /(?:想死|好想死|真的想死|不想活了|活着没意思|活着好累想自杀|结束生命|结束自己生命|了结自己)/,
  /(?:自杀|自残|割腕|跳楼|吃安眠药自尽|吞药自杀|绝望想死|想离开这个世界)/,
  /(?:不想在这个世界了|没有活下去的理由|觉得活着没有任何意义|死了算了)/,
]

/**
 * High-sensitivity detection for self-harm or suicidal sentiments.
 * Returns true if crisis signals are detected and not negated by casual slang.
 */
export function detectCrisisIntent(input: string): boolean {
  if (!input || typeof input !== 'string') return false
  const trimmed = input.trim()
  if (trimmed.length < 2) return false

  // 1. Check for casual false-positive idioms first
  for (const fp of FALSE_POSITIVES) {
    if (fp.test(trimmed)) {
      // If message is just a slang (e.g. "hahaha that test killed me"), skip
      // but only if it does not explicitly contain "want to die" or "kill myself"
      const hasDirectCrisis = /\b(?:kill myself|want to die|suicide)\b/i.test(trimmed) || /(?:自杀|割腕|想死)/.test(trimmed)
      if (!hasDirectCrisis) return false
    }
  }

  // 2. Check English crisis patterns
  for (const pattern of ENGLISH_CRISIS_PATTERNS) {
    if (pattern.test(trimmed)) return true
  }

  // 3. Check Chinese crisis patterns
  for (const pattern of CHINESE_CRISIS_PATTERNS) {
    if (pattern.test(trimmed)) return true
  }

  return false
}

/**
 * Returns compassionate AI response text depending on language detection.
 */
export function getCrisisResponseText(input: string): string {
  const isChinese = /[\u4e00-\u9fa5]/.test(input)

  if (isChinese) {
    return (
      "Maya，我听到了你内心的极度疲惫与痛苦。请相信，你现在的感受和承受的重压是真实的，但你绝不是一个人在面对。" +
      "\n\n你的生命非常宝贵，没有任何一项学业、DDL 或压力值得你伤害自己。请不要独自硬撑，现在就联络身边关心你的人，或者拨打下方的 24 小时免费保密心理援助热线，他们会随时陪伴你。"
    )
  }

  return (
    "Maya, I can hear how deeply exhausted, overwhelmed, and in pain you feel right now. What you are going through is real and heavy, but please remember: you do not have to carry this alone." +
    "\n\nYour life and your well-being matter infinitely more than any assignment, deadline, or expectation. Please don't suffer in silence. Reach out to someone who loves you right now, or speak to someone at the confidential 24/7 helplines below. They are here to help you through this."
  )
}
