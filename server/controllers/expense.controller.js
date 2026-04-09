const Expense = require('../models/Expense.model')
const Budget  = require('../models/Budget.model')

// @route  GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const { month, year, category, limit = 50, page = 1 } = req.query

    const filter = { user: req.user._id }

    if (month && year) {
      const start = new Date(year, month - 1, 1)
      const end   = new Date(year, month, 0, 23, 59, 59)
      filter.date = { $gte: start, $lte: end }
    }
    if (category) filter.category = category

    const skip  = (page - 1) * limit
    const total = await Expense.countDocuments(filter)
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.json({ success: true, expenses, total, page: Number(page),
      pages: Math.ceil(total / limit) })
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

    // Update budget spent amount for this month
    const d = new Date(expense.date)
    await Budget.findOneAndUpdate(
      {
        user:  req.user._id,
        month: d.getMonth() + 1,
        year:  d.getFullYear(),
        'allocations.category': category
      },
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

    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.json({ success: true, expense: updated })
  } catch (err) { next(err) }
}

// @route  DELETE /api/expenses/:id
const { detectRecurring } = require('../services/recurring.service');

// @route GET /api/expenses/detect-recurring
const getRecurringSuggestions = async (req, res, next) => {
  try {
    const suggestions = await detectRecurring(req.user._id);
    res.json({ success: true, suggestions });
  } catch (err) {
    next(err);
  }
};

// Don't forget to export it!
module.exports = { 
  // ... other methods,
  getRecurringSuggestions 
};

// @route  GET /api/expenses/summary
const getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query
    const m = parseInt(month) || new Date().getMonth() + 1
    const y = parseInt(year)  || new Date().getFullYear()

    const start = new Date(y, m - 1, 1)
    const end   = new Date(y, m, 0, 23, 59, 59)

    const summary = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: {
        _id:   '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { total: -1 } }
    ])

    const totalSpent = summary.reduce((acc, s) => acc + s.total, 0)

    res.json({ success: true, summary, totalSpent, month: m, year: y })
  } catch (err) { next(err) }
}

// @route  GET /api/expenses/trends
const getTrends = async (req, res, next) => {
  try {
    // Last 6 months of data
    const trends = await Expense.aggregate([
      { $match: {
        user: req.user._id,
        date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
      }},
      { $group: {
        _id: { month: { $month: '$date' }, year: { $year: '$date' } },
        total: { $sum: '$amount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
    res.json({ success: true, trends })
  } catch (err) { next(err) }
}

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense, getSummary, getTrends }