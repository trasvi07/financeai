const Expense = require('../models/Expense.model')

const getInsights = async (req, res, next) => {
  try {
    // Enable historical tracking via query params
    const month = parseInt(req.query.month) || new Date().getMonth() + 1
    const year  = parseInt(req.query.year) || new Date().getFullYear()
    
    const start = new Date(year, month - 1, 1)
    const end   = new Date(year, month, 0, 23, 59, 59)

    const expenses = await Expense.find({ 
      user: req.user._id, 
      date: { $gte: start, $lte: end } 
    })

    const insights = []
    const income = req.user.monthlyIncome || 0

    // 1. Bucket Aggregation (IIT Logic)
    const buckets = { FIXED: 0, WEALTH: 0, VARIABLE: 0 }
    expenses.forEach(e => {
      buckets[e.nature] += e.amount
    })

    const totalSpent = buckets.FIXED + buckets.WEALTH + buckets.VARIABLE

    // 2. Savings Rate Insight (Wealth tracking)
    const savingsRate = income > 0 ? (buckets.WEALTH / income) * 100 : 0
    if (savingsRate < 20 && income > 0) {
      insights.push({
        type: 'warning',
        title: 'Wealth Accumulation Alert',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Engineering standard recommends 20%. Consider optimizing Variable spend (₹${buckets.VARIABLE}).`,
        impact: 'high'
      })
    }

    // 3. Burn-Rate Prediction (IIT Predictive Analysis)
    const now = new Date()
    const isCurrentMonth = (now.getMonth() + 1 === month && now.getFullYear() === year)
    
    if (isCurrentMonth) {
      const dayOfMonth = now.getDate()
      const daysInMonth = new Date(year, month, 0).getDate()
      const projectedSpend = dayOfMonth > 0 ? (totalSpent / dayOfMonth) * daysInMonth : 0

      if (projectedSpend > income && income > 0) {
        insights.push({
          type: 'danger',
          title: 'Projected Insolvency',
          description: `Current burn-rate projects ₹${projectedSpend.toLocaleString()} spend by EOM. This exceeds income by ₹${(projectedSpend - income).toLocaleString()}.`,
          impact: 'critical'
        })
      }
    }

    // 4. Necessity Protection Check
    if (buckets.FIXED > income * 0.6) {
      insights.push({
        type: 'warning',
        title: 'High Fixed Obligations',
        description: 'Your non-reducible costs (Rent, Education, Medical) exceed 60% of income. Financial flexibility is low.',
        impact: 'medium'
      })
    }

    res.json({ 
      success: true, 
      insights, 
      buckets,
      summary: {
        totalSpent,
        savingsRate: `${savingsRate.toFixed(1)}%`,
        isHistorical: !isCurrentMonth
      }
    })
  } catch (err) { next(err) }
}

module.exports = { getInsights }