const Expense = require('../models/Expense.model');

// AI Helper: Automatically Classifies Nature based on Title/Category
const classifyNature = (title, category) => {
  const needs = ['rent', 'bill', 'school', 'fees', 'loan', 'emi', 'medicine', 'grocery'];
  const searchStr = (title + ' ' + category).toLowerCase();
  return needs.some(word => searchStr.includes(word)) ? 'FIXED' : 'DAILY';
};

const getSmartAnalysis = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const tMonth = parseInt(month) || new Date().getMonth() + 1;
    const tYear = parseInt(year) || new Date().getFullYear();
    
    const start = new Date(tYear, tMonth - 1, 1);
    const end = new Date(tYear, tMonth, 0, 23, 59, 59);

    const [current, history] = await Promise.all([
      Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } }),
      Expense.find({ user: req.user._id, date: { $lt: start } }).sort({ date: -1 }).limit(100)
    ]);

    const income = 50000; 
    let totalSpent = 0;
    let needsTotal = 0;
    const summaryMap = {};

    // 1. Intelligent Grouping & Nature Auto-Correction
    current.forEach(e => {
      const nature = classifyNature(e.title, e.category);
      if (!summaryMap[e.category]) {
        summaryMap[e.category] = { category: e.category, nature, spent: 0, count: 0 };
      }
      summaryMap[e.category].spent += e.amount;
      summaryMap[e.category].count += 1;
      totalSpent += e.amount;
      if (nature === 'FIXED') needsTotal += e.amount;
    });

    // 2. The "Elastic Squeeze" AI Math
    const needsRatio = needsTotal / income;
    const savingsTarget = needsRatio > 0.5 ? Math.max(0.05, 0.20 - (needsRatio - 0.5)) : 0.20;

    const summary = Object.values(summaryMap).map(item => {
      // SMART LIMIT: If no history, use 50/30/20. If history exists, use Moving Average.
      const pastData = history.filter(h => h.category === item.category);
      const movingAvg = pastData.length > 0 
        ? pastData.reduce((a, b) => a + b.amount, 0) / (new Set(pastData.map(p => p.date.getMonth())).size || 1)
        : (item.nature === 'FIXED' ? income * 0.15 : income * 0.05);

      // Elasticity: Needs grow, Wants are pressured by the "Savings Target"
      const limit = item.nature === 'FIXED' ? Math.max(movingAvg, item.spent) : movingAvg;
      
      return { 
        ...item, 
        allocated: Math.round(limit), 
        status: item.spent > limit ? "CRITICAL" : "OPTIMAL",
        score: ((item.spent / limit) * 100).toFixed(0)
      };
    });

    res.json({
      success: true,
      kpis: {
        income, spent: totalSpent, saved: income - totalSpent,
        savingsHealth: (savingsTarget * 100).toFixed(0),
        burnRate: (totalSpent / new Date().getDate()).toFixed(0)
      },
      summary,
      isNewUser: current.length === 0 && history.length === 0
    });
  } catch (err) { next(err); }
};

// ... keep your getTrends, addExpense, etc.
module.exports = { getSmartAnalysis, ... };