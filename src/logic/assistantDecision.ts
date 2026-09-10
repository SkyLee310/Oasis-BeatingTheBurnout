import { addDays, shortDate } from './dates'
import { projectEnergy, zoneFor, avgSleep } from './energy'
import { sharesAcrossProjects } from './group'
import type { Commitment, OasisState } from '../state/types'

// ─── Oasis AI Assistant Decision Engine ───────────────────────────────────────
// Provides real, deterministic decision-making when students ask whether they
// can take on or accept tasks. Evaluates live energy, deadline collisions,
// sleep debt, and group project balance.

export function evaluateAITaskQuery(
  rawQuery: string,
  state: OasisState,
  currentEnergy: number,
): string {
  const q = rawQuery.toLowerCase().trim()

  // 1. Is the user asking about accepting or taking on a task / commitment?
  const isAcceptQuery =
    /(\b(?:can|should|could|able to|free to|is it safe to)\s+(?:i|we)?\s*(?:accept|take|do|commit|handle|join|pick up|cover)\b)|(\b(?:should|can)\s+i\b)/i.test(q) ||
    /(\b(?:accept|take on)\s+(?:a|this|another|some|any)?\s*(?:task|shift|project|job|work|role)\b)/i.test(q)

  // 2. Specific domain: Shift / Part-time
  const isShift = /shift|part-time|retail|work hours|store|cafe|closing/i.test(q)

  // 3. Specific domain: Assignment / Group Project
  const isGroupTask = /group|teammate|assignment|ds|slides|report/i.test(q)

  // 4. Deadlines check
  const isDeadlinesQuery = /deadline|ddl|due|what.*due|when.*due/i.test(q)

  if (isDeadlinesQuery && !isAcceptQuery) {
    const upcoming = state.commitments.filter(c => c.kind === 'deadline' && !c.done)
    if (upcoming.length === 0) {
      return "You're all caught up! No pending deadlines due this week. Great time to rest."
    }
    const list = upcoming.map(d => `• ${d.title} (${shortDate(d.date)} · ${d.time})`).join('\n')
    return `You have ${upcoming.length} upcoming deadline${upcoming.length > 1 ? 's' : ''} this week:\n${list}`
  }

  // Sleep inquiry
  if (/sleep|tired|exhausted|burnout|rest/i.test(q) && !isAcceptQuery) {
    const sleep = avgSleep(state).toFixed(1)
    return `Your 7-day average sleep is ${sleep}h (target is 7.5h). Resting heart rate is ${state.recovery.restingHr} bpm. I recommend protecting a 90-minute restorative window tonight.`
  }

  // Handle task decision
  if (isAcceptQuery || isShift) {
    // Extract hours if mentioned (e.g. "4h", "3 hours", "5 hrs")
    const hourMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i)
    const hours = hourMatch ? parseFloat(hourMatch[1]) : (isShift ? 6 : 4)

    // Simulate candidate commitment
    const candidate: Commitment = {
      id: 'ai-query-candidate',
      title: `Potential task (+${hours}h)`,
      kind: 'commitment',
      date: state.today,
      time: 'all day',
      hours,
      movable: false,
      origin: 'chat',
    }

    const projected = projectEnergy(state, candidate)
    const currentZone = zoneFor(currentEnergy)
    const projectedZone = zoneFor(projected)

    // Check upcoming deadlines in the next 3 days
    const next3Days = addDays(state.today, 3)
    const pendingDeadlines = state.commitments.filter(
      c => c.kind === 'deadline' && !c.done && c.date >= state.today && c.date <= next3Days,
    )

    // Sleep deficit check
    const sleep = avgSleep(state)
    const isSleepLow = sleep < 6.0

    // Group imbalance check, across every project — three groups can each hand
    // out a perfectly even share and still leave one person underwater, and no
    // single project sheet can see it.
    const hasHeavyGroup = sharesAcrossProjects(state).some(p => p.over)

    // Decision Logic
    let decision: 'DECLINE' | 'NEGOTIATE' | 'ACCEPT'
    let decisionEmoji = '🔴'
    let reasons: string[] = []
    let script = ''

    if (isShift) {
      decision = 'DECLINE'
      decisionEmoji = '🔴'
      reasons = [
        `Energy drops: ${currentEnergy} → ${projected} (${projectedZone.toUpperCase()} zone)`,
        `Elevated heart rate (${state.recovery.restingHr} bpm) with ${sleep.toFixed(1)}h sleep average`,
        pendingDeadlines.length > 0
          ? `Collides with ${pendingDeadlines[0].title} due soon`
          : 'Zero buffer for unexpected study overruns',
      ]
      script = `"Thanks for asking, Farah, but with my assignment deadlines this week I can't take on an extra shift without falling behind."`
    } else if (projected < 35 || pendingDeadlines.length >= 2 || (isSleepLow && projected < 50)) {
      decision = 'DECLINE'
      decisionEmoji = '🔴'
      reasons = [
        `Energy drops: ${currentEnergy} → ${projected} (${projectedZone.toUpperCase()} zone)`,
        pendingDeadlines.length > 0
          ? `${pendingDeadlines.map(d => d.title).join(' & ')} due this week`
          : 'Pushes schedule into unsustainable overload',
        isSleepLow ? `Sleep deficit (${sleep.toFixed(1)}h avg) leaves no recovery margin` : 'No spare slack in calendar',
      ]
      script = `"I'd love to help, but I'm at full capacity with major assignment deadlines this week. I have to pass on this one."`
    } else if (projected < 60 || hasHeavyGroup) {
      decision = 'NEGOTIATE'
      decisionEmoji = '🟠'
      reasons = [
        `Energy impact: ${currentEnergy} → ${projected} (Amber zone)`,
        `Can work if you negotiate scope down to half or defer non-essential tasks`,
        pendingDeadlines.length > 0 ? `Must protect time for ${pendingDeadlines[0].title}` : 'Tight margins this week',
      ]
      script = `"I can contribute, but only for about ${Math.max(1, Math.round(hours / 2))} hours due to my deadline schedule. Would that work?"`
    } else {
      decision = 'ACCEPT'
      decisionEmoji = '🟢'
      reasons = [
        `Energy remains healthy: ${currentEnergy} → ${projected} (Green zone)`,
        `No immediate deadline collision in the next 48 hours`,
        `Comfortable buffer for normal coursework`,
      ]
      script = `"Yes, I can take this on! I have space in my schedule this week."`
    }

    const lines: string[] = [
      `${decisionEmoji} **DECISION: ${decision}**`,
      '',
      `• **Impact**: Energy drops from **${currentEnergy}** to **${projected}** (${projectedZone} zone).`,
      ...reasons.map(r => `• ${r}`),
      '',
      `💬 **What to reply**:`,
      script,
    ]

    return lines.join('\n')
  }

  // Default smart assistant response
  return "I've reviewed your week. You have upcoming coursework deadlines and limited recovery slack. Ask me 'Can I accept [task / X hours]?' to run a live decision impact check!"
}
