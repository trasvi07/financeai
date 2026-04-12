/**
 * SQUEEZE & LEAKAGE ENGINE
 * 
 * Multi-Stage Squeeze Order:
 *   Stage 1 → Savings (take from planned savings first)
 *   Stage 2 → Faltu Wants (impulse/junk spends)
 *   Stage 3 → Mandatory Wants (gym, hobbies — last resort)
 */

// Category classifications
const MANDATORY_NEEDS = [
  'Utilities', 'Health', 'Education'
]

const FALTU_WANTS = [
  'Entertainment', 'Shopping'
]

const MANDATORY_WANTS = [
  'Transport', 'Travel'
]

const SAVINGS_CATEGORIES = [
  'Investment'
]

/**
 * Classify a category
 */
function classifyCategory(category) {
  if (MANDATORY_NEEDS.includes(category))  return 'mandatory_need'
  if (FALTU_WANTS.includes(category))      return 'faltu_want'
  if (MANDATORY_WANTS.includes(category))  return 'mandatory_want'
  if (SAVINGS_CATEGORIES.includes(category)) return 'savings'
  if (category === 'Food & Dining')        return 'mandatory_need'
  return 'faltu_want'
}

/**
 * Run the multi-stage squeeze
 * @param {Array} allocations - budget allocations with spent amounts
 * @param {number} targetSavings - monthly savings target
 * @returns {Object} squeezed allocations + squeeze log
 */
function runSqueeze(allocations, targetSavings = 0) {
  const result     = allocations.map(a => ({ ...a, squeezed: 0, expanded: 0 }))
  const squeezeLog = []

  // Find mandatory needs that are OVER budget
  const overBudgetNeeds = result.filter(a =>
    classifyCategory(a.category) === 'mandatory_need' && a.spent > a.allocated
  )

  for (const need of overBudgetNeeds) {
    let deficit = need.spent - need.allocated
    need.expanded = deficit
    squeezeLog.push({
      stage: 0,
      action: 'expand',
      category: need.category,
      amount: deficit,
      reason: `Mandatory need exceeded budget by ₹${deficit.toLocaleString()}`
    })

    // STAGE 1: Squeeze from Savings
    if (deficit > 0) {
      const savingsAllocs = result.filter(a =>
        classifyCategory(a.category) === 'savings' && a.allocated > 0
      )
      for (const s of savingsAllocs) {
        if (deficit <= 0) break
        const canTake = Math.min(deficit, s.allocated * 0.5) // max 50% from savings
        s.allocated  -= canTake
        s.squeezed   += canTake
        deficit      -= canTake
        squeezeLog.push({
          stage: 1,
          action: 'squeeze',
          category: s.category,
          amount: canTake,
          reason: `Stage 1: Took ₹${canTake.toLocaleString()} from savings to cover ${need.category}`
        })
      }
    }

    // STAGE 2: Squeeze from Faltu Wants
    if (deficit > 0) {
      const faltuAllocs = result.filter(a =>
        classifyCategory(a.category) === 'faltu_want' && a.allocated > 0
      ).sort((a, b) => (b.allocated - b.spent) - (a.allocated - a.spent)) // most slack first

      for (const f of faltuAllocs) {
        if (deficit <= 0) break
        const slack   = Math.max(0, f.allocated - f.spent)
        const canTake = Math.min(deficit, slack, f.allocated * 0.7) // max 70% of faltu
        if (canTake <= 0) continue
        f.allocated -= canTake
        f.squeezed  += canTake
        deficit     -= canTake
        squeezeLog.push({
          stage: 2,
          action: 'squeeze',
          category: f.category,
          amount: canTake,
          reason: `Stage 2: Squeezed ₹${canTake.toLocaleString()} from ${f.category} (faltu want)`
        })
      }
    }

    // STAGE 3: Squeeze from Mandatory Wants (last resort)
    if (deficit > 0) {
      const wantAllocs = result.filter(a =>
        classifyCategory(a.category) === 'mandatory_want' && a.allocated > 0
      )
      for (const w of wantAllocs) {
        if (deficit <= 0) break
        const canTake = Math.min(deficit, w.allocated * 0.30) // max 30% from mandatory wants
        if (canTake <= 0) continue
        w.allocated -= canTake
        w.squeezed  += canTake
        deficit     -= canTake
        squeezeLog.push({
          stage: 3,
          action: 'squeeze',
          category: w.category,
          amount: canTake,
          reason: `Stage 3 (last resort): Reduced ${w.category} by ₹${canTake.toLocaleString()}`
        })
      }
    }

    // If still in deficit after all stages
    if (deficit > 0) {
      squeezeLog.push({
        stage: 99,
        action: 'warning',
        category: need.category,
        amount: deficit,
        reason: `⚠️ Could not fully cover ${need.category} deficit. ₹${deficit.toLocaleString()} still unresolved.`
      })
    }
  }

  return { allocations: result, squeezeLog }
}

/**
 * Detect leakage — high frequency, low amount faltu spends
 * @param {Array} expenses - raw expense documents
 * @returns {Array} leakage items
 */
function detectLeakage(expenses) {
  const leakage = []

  // Group by category
  const byCategory = {}
  expenses.forEach(e => {
    if (!byCategory[e.category]) byCategory[e.category] = []
    byCategory[e.category].push(e)
  })

  // Check faltu want categories for leakage patterns
  const faltuCategories = [...FALTU_WANTS, 'Other', 'Food & Dining']

  faltuCategories.forEach(cat => {
    const catExpenses = byCategory[cat] || []
    if (catExpenses.length < 3) return // need at least 3 transactions

    const smallSpends = catExpenses.filter(e => e.amount <= 200) // ₹200 threshold
    if (smallSpends.length < 3) return

    const totalLeakage  = smallSpends.reduce((a, e) => a + e.amount, 0)
    const avgAmount     = totalLeakage / smallSpends.length
    const frequency     = smallSpends.length

    if (totalLeakage > 500) { // only flag if total leakage > ₹500
      leakage.push({
        category:     cat,
        frequency,
        avgAmount:    Math.round(avgAmount),
        totalLeakage: Math.round(totalLeakage),
        message:      `${frequency} small ${cat} spends averaging ₹${Math.round(avgAmount)} = ₹${Math.round(totalLeakage)} leaked this month`,
        severity:     totalLeakage > 2000 ? 'high' : totalLeakage > 1000 ? 'medium' : 'low',
        suggestion:   `Cutting these by 50% saves ₹${Math.round(totalLeakage * 0.5).toLocaleString()}/month`
      })
    }
  })

  // Also detect daily small spends across ALL categories
  const dailyGroups = {}
  expenses.forEach(e => {
    const day = new Date(e.date).toDateString()
    if (!dailyGroups[day]) dailyGroups[day] = []
    dailyGroups[day].push(e)
  })

  const highFrequencyDays = Object.entries(dailyGroups)
    .filter(([, exps]) => exps.length >= 4) // 4+ transactions in one day
    .map(([day, exps]) => ({
      day,
      count:  exps.length,
      total:  exps.reduce((a, e) => a + e.amount, 0)
    }))

  if (highFrequencyDays.length >= 3) {
    leakage.push({
      category:     'Daily Habits',
      frequency:    highFrequencyDays.length,
      avgAmount:    Math.round(highFrequencyDays.reduce((a, d) => a + d.total, 0) / highFrequencyDays.length),
      totalLeakage: highFrequencyDays.reduce((a, d) => a + d.total, 0),
      message:      `You had ${highFrequencyDays.length} high-spend days (4+ transactions). These impulse days cost you most.`,
      severity:     'high',
      suggestion:   'Set a daily transaction limit of 3 to control impulse buying'
    })
  }

  return leakage.sort((a, b) => b.totalLeakage - a.totalLeakage)
}

module.exports = { runSqueeze, detectLeakage, classifyCategory }