const Expense = require('../models/Expense.model')

// @route GET /api/insights
const getInsights = async (req, res, next) => {
  try {
    const now   = new Date()
    const month = now.getMonth() + 1
    const year  = now.getFullYear()
    const start = new Date(year, month - 1, 1)
    const end   = new Date(year, month, 0, 23, 59, 59)

    // This month's expenses
    const expenses = await Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } })

    const insights = []

    // --- Weekend spike detection ---
    const weekendSpend  = expenses.filter(e => [0, 6].includes(new Date(e.date).getDay()))
      .reduce((a, e) => a + e.amount, 0)
    const weekdaySpend  = expenses.filter(e => ![0, 6].includes(new Date(e.date).getDay()))
      .reduce((a, e) => a + e.amount, 0)
    const weekdayDays   = 22, weekendDays = 8
    const avgWeekend    = weekendSpend / weekendDays
    const avgWeekday    = weekdaySpend / weekdayDays

    if (avgWeekend > avgWeekday * 1.5) {
      insights.push({
        type: 'warning',
        title: 'Weekend spending spike detected',
        description: `You spend ${((avgWeekend / avgWeekday)).toFixed(1)}x more on weekends. Consider setting a weekend budget limit.`,
        impact: 'high'
      })
    }

    // --- Category overspend ---
    const byCategory = {}
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    })

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
    if (topCategory) {
      const [cat, amt] = topCategory
      const income = req.user.monthlyIncome || 50000
      if (amt > income * 0.30) {
        insights.push({
          type: 'warning',
          title: `High ${cat} spending`,
          description: `You've spent ₹${amt.toLocaleString()} on ${cat} — ${((amt/income)*100).toFixed(0)}% of your income. Consider reducing by 15%.`,
          impact: 'high'
        })
      }
    }

    // --- Positive streak ---
    const totalSpent = expenses.reduce((a, e) => a + e.amount, 0)
    const income     = req.user.monthlyIncome || 50000
    const dayOfMonth = now.getDate()
    const expectedPace = (income * 0.85) * (dayOfMonth / 30)

    if (totalSpent < expectedPace * 0.85) {
      insights.push({
        type: 'success',
        title: 'Under budget — great pace!',
        description: `You're spending 15% less than expected this month. Keep it up and you'll save an extra ₹${Math.round(expectedPace - totalSpent).toLocaleString()}.`,
        impact: 'positive'
      })
    }

    // --- Prediction ---
    const projectedMonth = dayOfMonth > 0 ? Math.round((totalSpent / dayOfMonth) * 30) : 0
    if (projectedMonth > income * 0.85) {
      insights.push({
        type: 'danger',
        title: 'Budget overrun predicted',
        description: `At your current pace, you'll spend ₹${projectedMonth.toLocaleString()} this month — ₹${(projectedMonth - Math.round(income * 0.85)).toLocaleString()} over budget.`,
        impact: 'high'
      })
    } else {
      insights.push({
        type: 'info',
        title: 'On track for savings goal',
        description: `Projected month spend: ₹${projectedMonth.toLocaleString()}. You're on track to save ₹${(income - projectedMonth).toLocaleString()} this month.`,
        impact: 'positive'
      })
    }

    res.json({ success: true, insights })
  } catch (err) { next(err) }
}

module.exports = { getInsights }