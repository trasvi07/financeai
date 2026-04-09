const Expense = require('../models/Expense.model');

/**
 * IIT-Level Logic: Temporal Periodicity Detection
 * Scans last 90 days for clusters of similar transactions.
 */
const detectRecurring = async (userId) => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Fetch candidate expenses (excluding things already marked recurring)
  const expenses = await Expense.find({
    user: userId,
    date: { $gte: ninetyDaysAgo },
    isRecurring: false
  }).sort({ date: 1 });

  const clusters = {};

  // 1. Clustering by Title (Fuzzy) and Amount (Exact-ish)
  expenses.forEach(exp => {
    const key = `${exp.title.toLowerCase().trim()}_${Math.floor(exp.amount)}`;
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(exp);
  });

  const suggestions = [];

  // 2. Interval Analysis (The "IIT Edge")
  Object.keys(clusters).forEach(key => {
    const items = clusters[key];
    if (items.length >= 2) {
      const intervals = [];
      for (let i = 1; i < items.length; i++) {
        const diff = (items[i].date - items[i-1].date) / (1000 * 60 * 60 * 24);
        intervals.push(Math.round(diff));
      }

      // Check for Monthly Periodicity (Approx 28-32 days)
      const isMonthly = intervals.every(gap => gap >= 25 && gap <= 35);
      
      if (isMonthly) {
        suggestions.push({
          title: items[0].title,
          amount: items[0].amount,
          category: items[0].category,
          frequency: 'monthly',
          confidence: items.length >= 3 ? 'high' : 'medium'
        });
      }
    }
  });

  return suggestions;
};

module.exports = { detectRecurring };