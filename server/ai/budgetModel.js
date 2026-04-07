/**
 * AI Budget Model
 * Weights: Behavior 60% | Goals 25% | Safety 15%
 */

const CATEGORY_BASE_RATIOS = {
  'Food & Dining':   0.25,
  'Transport':       0.10,
  'Shopping':        0.12,
  'Entertainment':   0.07,
  'Health':          0.08,
  'Utilities':       0.10,
  'Education':       0.08,
  'Travel':          0.05,
  'Investment':      0.10,
  'Other':           0.05,
}

const GOAL_CATEGORY_BOOST = {
  'Build Emergency Fund': { Investment: 0.08, Other: -0.03 },
  'Save for Travel':      { Travel: 0.07, Shopping: -0.04 },
  'Pay Off Debt':         { Investment: 0.10, Entertainment: -0.05 },
  'Buy a Home':           { Investment: 0.10, Shopping: -0.05 },
  'Invest More':          { Investment: 0.12, Entertainment: -0.05 },
  'Retire Early':         { Investment: 0.15, Shopping: -0.07 },
}

/**
 * Generate personalized budget
 * @param {number} income - Monthly income
 * @param {Array}  historicalExpenses - Last 3 months of expenses [{category, amount}]
 * @param {Array}  goals - User's financial goals
 * @param {Array}  topCategories - Self-reported top spend categories
 * @returns {Array} allocations per category
 */
function generateBudget(income, historicalExpenses = [], goals = [], topCategories = []) {
  const spendableincome = income * 0.85   // 15% safety savings first
  const categories = Object.keys(CATEGORY_BASE_RATIOS)

  // --- BEHAVIOR SCORE (60%) ---
  // Calculate average spending per category from history
  const historicalTotals = {}
  const historicalCount  = historicalExpenses.length > 0 ? 3 : 1

  historicalExpenses.forEach(({ category, amount }) => {
    historicalTotals[category] = (historicalTotals[category] || 0) + amount
  })

  const behaviorRatios = {}
  const histTotal = Object.values(historicalTotals).reduce((a, b) => a + b, 0)

  categories.forEach(cat => {
    if (histTotal > 0 && historicalTotals[cat]) {
      behaviorRatios[cat] = (historicalTotals[cat] / historicalCount) / spendableincome
    } else {
      // Boost self-reported top categories slightly
      const boost = topCategories.includes(cat) ? 1.3 : 1.0
      behaviorRatios[cat] = CATEGORY_BASE_RATIOS[cat] * boost
    }
  })

  // Normalize behavior ratios
  const behaviorTotal = Object.values(behaviorRatios).reduce((a, b) => a + b, 0)
  categories.forEach(cat => { behaviorRatios[cat] /= behaviorTotal })

  // --- GOAL ADJUSTMENTS (25%) ---
  const goalAdjustments = {}
  categories.forEach(cat => { goalAdjustments[cat] = 0 })

  goals.forEach(goal => {
    const boosts = GOAL_CATEGORY_BOOST[goal]
    if (boosts) {
      Object.entries(boosts).forEach(([cat, delta]) => {
        if (goalAdjustments[cat] !== undefined) goalAdjustments[cat] += delta
      })
    }
  })

  // --- FINAL WEIGHTED ALLOCATION ---
  const BEHAVIOR_WEIGHT = 0.60
  const GOAL_WEIGHT     = 0.25
  const BASE_WEIGHT     = 0.15

  const allocations = categories.map(category => {
    const behaviorShare = behaviorRatios[category]      * BEHAVIOR_WEIGHT
    const baseShare     = CATEGORY_BASE_RATIOS[category]* BASE_WEIGHT
    const goalBoost     = (goalAdjustments[category] || 0) * GOAL_WEIGHT

    let ratio = behaviorShare + baseShare + goalBoost
    ratio = Math.max(0.02, Math.min(ratio, 0.40))  // clamp: min 2%, max 40%

    return {
      category,
      allocated: Math.round(spendableincome * ratio),
      spent:     0,
    }
  })

  // Normalize so total doesn't exceed spendable income
  const allocTotal = allocations.reduce((a, b) => a + b.allocated, 0)
  if (allocTotal > spendableincome) {
    const scale = spendableincome / allocTotal
    allocations.forEach(a => { a.allocated = Math.round(a.allocated * scale) })
  }

  return allocations
}

module.exports = { generateBudget }