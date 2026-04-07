const Budget  = require('../models/Budget.model')
const Expense = require('../models/Expense.model')
const { generateBudget } = require('../ai/budgetModel')

// @route  GET /api/budget/current
const getCurrentBudget = async (req, res, next) => {
  try {
    const now   = new Date()
    const month = now.getMonth() + 1
    const year  = now.getFullYear()

    let budget = await Budget.findOne({ user: req.user._id, month, year })

    // Auto-generate if none exists
    if (!budget) {
      budget = await autoGenerateBudget(req.user, month, year)
    }

    res.json({ success: true, budget })
  } catch (err) { next(err) }
}

// @route  POST /api/budget/generate
const generateNewBudget = async (req, res, next) => {
  try {
    const { month, year } = req.body
    const m = month || new Date().getMonth() + 1
    const y = year  || new Date().getFullYear()

    const budget = await autoGenerateBudget(req.user, m, y)
    res.json({ success: true, budget })
  } catch (err) { next(err) }
}

// Internal helper
async function autoGenerateBudget(user, month, year) {
  // Fetch last 3 months of expenses for behavior analysis
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const historicalExpenses = await Expense.find({
    user: user._id,
    date: { $gte: threeMonthsAgo }
  }).select('category amount -_id')

  const allocations = generateBudget(
    user.monthlyIncome || 50000,
    historicalExpenses,
    user.goals || [],
    user.topCategories || []
  )

  // Update spent amounts from this month's expenses
  const start = new Date(year, month - 1, 1)
  const end   = new Date(year, month, 0, 23, 59, 59)

  const thisMonthSpend = await Expense.aggregate([
    { $match: { user: user._id, date: { $gte: start, $lte: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } }
  ])

  thisMonthSpend.forEach(({ _id: cat, total }) => {
    const alloc = allocations.find(a => a.category === cat)
    if (alloc) alloc.spent = total
  })

  const totalBudgeted = allocations.reduce((a, b) => a + b.allocated, 0)

  const budget = await Budget.findOneAndUpdate(
    { user: user._id, month, year },
    {
      user: user._id, month, year, allocations,
      totalIncome:   user.monthlyIncome || 50000,
      totalBudgeted,
      targetSavings: Math.round((user.monthlyIncome || 50000) * 0.15),
    },
    { upsert: true, new: true }
  )

  return budget
}

module.exports = { getCurrentBudget, generateNewBudget }