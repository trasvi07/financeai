const Expense = require('../models/Expense.model');

// AI Helper: Automatically Classifies Nature
const classifyNature = (title, category) => {
  const needs = ['rent', 'bill', 'school', 'fees', 'loan', 'emi', 'medicine', 'grocery', 'petrol', 'transport'];
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

    current.forEach(e => {
      const nature = classifyNature(e.title || '', e.category || '');
      const cat = e.category || 'Other';
      if (!summaryMap[cat]) summaryMap[cat] = { category: cat, nature, spent: 0 };
      summaryMap[cat].spent += e.amount;
      totalSpent += e.amount;
      if (nature === 'FIXED') needsTotal += e.amount;
    });

    const needsRatio = needsTotal / income;
    const savingsHealth = needsRatio > 0.5 ? Math.max(0, 20 - ((needsRatio - 0.5) * 100)) : 20;

    const summary = Object.values(summaryMap).map(item => {
      const pastData = history.filter(h => h.category === item.category);
      const movingAvg = pastData.length > 0 
        ? pastData.reduce((a, b) => a + b.amount, 0) / (new Set(pastData.map(p => p.date.getMonth())).size || 1)
        : (item.nature === 'FIXED' ? income * 0.15 : income * 0.05);
      const limit = item.nature === 'FIXED' ? Math.max(movingAvg, item.spent) : movingAvg;
      return { 
        ...item, 
        allocated: Math.round(limit), 
        status: item.spent > limit ? "CRITICAL" : "OPTIMAL",
        score: Math.min(((item.spent / limit) * 100), 100).toFixed(0)
      };
    });

    res.json({
      success: true,
      kpis: {
        income, spent: totalSpent, saved: Math.max(0, income - totalSpent),
        savingsHealth: Math.round(savingsHealth * 5),
        needsSqueeze: needsTotal > (income * 0.5) ? (needsTotal - (income * 0.5)) : 0
      },
      summary,
      isNewUser: current.length === 0
    });
  } catch (err) { next(err); }
};

const getTrends = async (req, res, next) => {
  try {
    const trends = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { 
          _id: { month: { $month: "$date" }, year: { $year: "$date" } }, 
          total: { $sum: "$amount" } 
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ]);
    res.json({ success: true, trends });
  } catch (err) { next(err); }
};

module.exports = { 
  getSmartAnalysis, 
  getTrends,
  getExpenses: async (req, res) => {
    const e = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, expenses: e });
  },
  addExpense: async (req, res) => {
    const e = await Expense.create({ ...req.body, user: req.user._id });
    res.json({ success: true, expense: e });
  },
  updateExpense: async (req, res) => {
    const e = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, expense: e });
  },
  deleteExpense: async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }
};