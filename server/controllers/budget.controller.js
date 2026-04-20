const Budget  = require('../models/Budget.model')
const Expense = require('../models/Expense.model')
const { generateBudget, getCategoryType } = require('../ai/budgetModel')

const getCurrentBudget = async (req, res, next) => {
  try {
    const now   = new Date()
    const month = now.getMonth() + 1
    const year  = now.getFullYear()

    let budget = await Budget.findOne({ user: req.user._id, month, year })
    if (!budget) budget = await buildBudget(req.user, month, year)

    // Always refresh spent amounts from actual expenses
    budget = await refreshSpent(req.user._id, budget, month, year)

    res.json({ success: true, budget })
  } catch (err) { next(err) }
}

const generateNewBudget = async (req, res, next) => {
  try {
    const { month, year } = req.body
    const m = month || new Date().getMonth() + 1
    const y = year  || new Date().getFullYear()
    const budget = await buildBudget(req.user, m, y)
    res.json({ success: true, budget })
  } catch (err) { next(err) }
}

// Build budget from user profile
async function buildBudget(user, month, year) {
  const income = (user.monthlyIncome || 0) + (user.otherIncome || 0)

  const { allocations, summary } = generateBudget(income, {
    lifestyle:   user.lifestyle   || 'moderate',
    goals:       user.goals       || [],
    dependents:  user.dependents  || 0,
    housingType: user.housingType || 'rented',
  })

  const budget = await Budget.findOneAndUpdate(
    { user: user._id, month, year },
    {
      user:          user._id,
      month,
      year,
      allocations,
      totalIncome:   income,
      totalBudgeted: summary.needBudget + summary.wantBudget + summary.savingBudget,
      targetSavings: summary.savingBudget,
      modelWeights:  { behavior: 0.60, goals: 0.25, safety: 0.15 },
    },
    { upsert: true, new: true }
  )

  return budget
}

// Refresh spent amounts from real expenses
async function refreshSpent(userId, budget, month, year) {
  const start = new Date(year, month - 1, 1)
  const end   = new Date(year, month, 0, 23, 59, 59)

  const spent = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } }
  ])

  const spentMap = {}
  spent.forEach(s => { spentMap[s._id] = s.total })

  // Update each allocation's spent amount
  budget.allocations = budget.allocations.map(a => ({
    ...a.toObject ? a.toObject() : a,
    spent: spentMap[a.category] || 0,
  }))

  await Budget.findByIdAndUpdate(budget._id, {
    allocations: budget.allocations
  })

  return budget
}

module.exports = { getCurrentBudget, generateNewBudget }