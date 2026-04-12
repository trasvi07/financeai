const Expense = require('../models/Expense.model')
const Budget  = require('../models/Budget.model')
const { runSqueeze, detectLeakage, classifyCategory } = require('../ai/squeezeEngine')

// @route  GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const { month, year, category, limit = 100, page = 1 } = req.query
    const filter = { user: req.user._id }

    if (month && year) {
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      }
    }
    if (category) filter.category = category

    const skip     = (page - 1) * limit
    const total    = await Expense.countDocuments(filter)
    const expenses = await Expense.find(filter)
      .sort({ date: -1 }).skip(skip).limit(Number(limit))

    res.json({ success: true, expenses, total,
      page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

// @route  POST /api/expenses
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, note, paymentMethod, source, isRecurring } = req.body
    const expense = await Expense.create({
      user: req.user._id, title, amount, category,
      date: date || new Date(), note, paymentMethod, source, isRecurring
    })

    // Update budget spent
    const d = new Date(expense.date)
    await Budget.findOneAndUpdate(
      { user: req.user._id, month: d.getMonth() + 1, year: d.getFullYear(),
        'allocations.category': category },
      { $inc: { 'allocations.$.spent': amount } }
    )

    res.status(201).json({ success: true, expense })
  } catch (err) { next(err) }
}

// @route  PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id })
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' })
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body,
      { new: true, runValidators: true })
    res.json({ success: true, expense: updated })
  } catch (err) { next(err) }
}

// @route  DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id })
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' })
    await expense.deleteOne()
    res.json({ success: true, message: 'Expense deleted.' })
  } catch (err) { next(err) }
}

// @route  GET /api/expenses/summary  AND  /api/expenses/smart-analysis
// Exported as BOTH names to fix the API naming war
const getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query
    const m = parseInt(month) || new Date().getMonth() + 1
    const y = parseInt(year)  || new Date().getFullYear()

    const start = new Date(y, m - 1, 1)
    const end   = new Date(y, m, 0, 23, 59, 59)

    // Get all expenses for the month
    const expenses = await Expense.find({
      user: req.user._id, date: { $gte: start, $lte: end }
    })

    // Category summary
    const categoryMap = {}
    expenses.forEach(e => {
      if (!categoryMap[e.category]) {
        categoryMap[e.category] = { total: 0, count: 0, type: classifyCategory(e.category) }
      }
      categoryMap[e.category].total += e.amount
      categoryMap[e.category].count += 1
    })

    const summary = Object.entries(categoryMap).map(([cat, data]) => ({
      _id:   cat,
      total: data.total,
      count: data.count,
      type:  data.type
    })).sort((a, b) => b.total - a.total)

    const totalSpent = summary.reduce((a, s) => a + s.total, 0)

    // Get budget for squeeze analysis
    const budget = await Budget.findOne({
      user: req.user._id, month: m, year: y
    })

    let squeezeResult = null
    let leakage       = []

    if (budget && budget.allocations.length > 0) {
      // Run squeeze engine
      squeezeResult = runSqueeze(budget.allocations, budget.targetSavings)
    }

    // Detect leakage
    leakage = detectLeakage(expenses)

    res.json({
      success: true,
      summary,
      totalSpent,
      month: m,
      year:  y,
      squeeze: squeezeResult,
      leakage,
      // Extra analytics
      analytics: {
        totalTransactions: expenses.length,
        avgTransactionSize: expenses.length
          ? Math.round(totalSpent / expenses.length) : 0,
        mandatorySpend: summary
          .filter(s => s.type === 'mandatory_need')
          .reduce((a, s) => a + s.total, 0),
        faltuSpend: summary
          .filter(s => s.type === 'faltu_want')
          .reduce((a, s) => a + s.total, 0),
        savingsSpend: summary
          .filter(s => s.type === 'savings')
          .reduce((a, s) => a + s.total, 0),
      }
    })
  } catch (err) { next(err) }
}

// Alias for getSmartAnalysis — same function, different name
const getSmartAnalysis = getSummary

// @route  GET /api/expenses/trends
const getTrends = async (req, res, next) => {
  try {
    const trends = await Expense.aggregate([
      { $match: {
        user: req.user._id,
        date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
      }},
      { $group: {
        _id:   { month: { $month: '$date' }, year: { $year: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
    res.json({ success: true, trends })
  } catch (err) { next(err) }
}

module.exports = {
  getExpenses, addExpense, updateExpense,
  deleteExpense, getSummary, getSmartAnalysis, getTrends
}