/**
 * SIMPLE SMART BUDGET
 * Needs = flexible (life happens)
 * Wants = capped (shows over)  
 * Savings = always protected (15% minimum)
 */

const CATEGORY_TYPES = {
  'Food & Dining':  'need',
  'Health':         'need',
  'Utilities':      'need',
  'Education':      'need',
  'Transport':      'need',
  'Investment':     'savings',
  'Shopping':       'want',
  'Entertainment':  'want',
  'Travel':         'want',
  'Other':          'want',
}

// Base allocation % by lifestyle
const LIFESTYLE_BASE = {
  frugal: {
    need:    0.50,
    want:    0.15,
    savings: 0.20,
    other:   0.15,
  },
  moderate: {
    need:    0.55,
    want:    0.20,
    savings: 0.15,
    other:   0.10,
  },
  comfortable: {
    need:    0.55,
    want:    0.28,
    savings: 0.10,
    other:   0.07,
  },
  lavish: {
    need:    0.50,
    want:    0.35,
    savings: 0.08,
    other:   0.07,
  },
}

// Per-category split within each type
const NEED_SPLIT = {
  'Food & Dining': 0.35,
  'Health':        0.15,
  'Utilities':     0.20,
  'Education':     0.15,
  'Transport':     0.15,
}

const WANT_SPLIT = {
  'Shopping':     0.40,
  'Entertainment':0.35,
  'Travel':       0.25,
}

function generateBudget(income, { lifestyle='moderate', goals=[], dependents=0, housingType='rented' } = {}) {
  const base    = LIFESTYLE_BASE[lifestyle] || LIFESTYLE_BASE.moderate
  const savings = Math.round(income * base.savings)

  // Boost needs for dependents
  let needPct = base.need + (dependents * 0.02)
  let wantPct = base.want - (dependents * 0.01)

  // Goal adjustments
  let savingBoost = 0
  if (goals.includes('Build Emergency Fund')) savingBoost += 0.03
  if (goals.includes('Invest More'))          savingBoost += 0.04
  if (goals.includes('Retire Early'))         savingBoost += 0.05
  if (goals.includes('Pay Off Debt'))         savingBoost += 0.04
  if (goals.includes('Buy a Home'))           savingBoost += 0.03

  // Saving boost comes from wants
  wantPct = Math.max(0.05, wantPct - savingBoost)
  const savingsPct = Math.min(base.savings + savingBoost, 0.35)

  // Housing adjustment
  if (housingType === 'rented') needPct += 0.05

  // Clamp
  needPct = Math.min(needPct, 0.70)

  const spendable    = income
  const needBudget   = Math.round(spendable * needPct)
  const wantBudget   = Math.round(spendable * wantPct)
  const savingBudget = Math.round(spendable * savingsPct)

  // Build category allocations
  const allocations = []

  // Needs
  Object.entries(NEED_SPLIT).forEach(([cat, split]) => {
    allocations.push({
      category:  cat,
      allocated: Math.round(needBudget * split),
      spent:     0,
      type:      'need',
    })
  })

  // Wants
  Object.entries(WANT_SPLIT).forEach(([cat, split]) => {
    allocations.push({
      category:  cat,
      allocated: Math.round(wantBudget * split),
      spent:     0,
      type:      'want',
    })
  })

  // Savings/Investment
  allocations.push({
    category:  'Investment',
    allocated: savingBudget,
    spent:     0,
    type:      'savings',
  })

  // Other
  const otherBudget = income - needBudget - wantBudget - savingBudget
  allocations.push({
    category:  'Other',
    allocated: Math.max(0, otherBudget),
    spent:     0,
    type:      'other',
  })

  return {
    allocations,
    summary: {
      totalIncome:   income,
      needBudget,
      wantBudget,
      savingBudget,
      otherBudget:   Math.max(0, otherBudget),
    }
  }
}

function getCategoryType(category) {
  return CATEGORY_TYPES[category] || 'want'
}

module.exports = { generateBudget, getCategoryType }