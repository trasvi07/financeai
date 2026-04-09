const Expense = require('../models/Expense.model');

// 1. Get all expenses
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, expenses });
  } catch (err) { next(err); }
};

// 2. Add new expense
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, nature, date } = req.body;
    const expense = await Expense.create({
      user: req.user._id, title, amount, category, nature, date: date || Date.now()
    });
    res.status(201).json({ success: true, expense });
  } catch (err) { next(err); }
};

// 3. Update expense (FIXED: Now properly defined)
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json({ success: true, expense });
  } catch (err) { next(err); }
};

// 4. Delete expense
const deleteExpense = async (req, res, next) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Removed' });
  } catch (err) { next(err); }
};

// 5. Smart Summary (Elastic Needs & Behavioral Logic)
const getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const expenses = await Expense.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    
    const threeMonthsAgo = new Date(y, m - 4, 1);
    const history = await Expense.find({ user: req.user._id, date: { $gte: threeMonthsAgo, $lt: start } }) || [];

    const summaryMap = {};
    expenses.forEach(e => {
      if (!summaryMap[e.category]) {
        summaryMap[e.category] = { category: e.category, nature: e.nature || 'DAILY', spent: 0 };
      }
      summaryMap[e.category].spent += e.amount;
    });

    const allocations = Object.values(summaryMap).map(item => {
      const catHistory = history.filter(h => h.category === item.category);
      const avgSpent = catHistory.length > 0 
        ? (catHistory.reduce((acc, curr) => acc + curr.amount, 0) / 3) 
        : (item.spent * 0.9);

      let limit = avgSpent > 0 ? avgSpent : item.spent;
      let status = "SAFE";

      if (item.nature === 'FIXED') {
        limit = Math.max(limit, item.spent);
        status = "REQUIREMENT MET";
      } else if (item.spent > limit * 1.2 && item.spent > 0) {
        status = "OVERDOING";
      }

      return { ...item, allocated: limit, status };
    });

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.total || acc + curr.amount, 0);
    res.json({ success: true, summary: allocations, totalSpent });
  } catch (err) { next(err); }
};

// 6. Trends
const getTrends = async (req, res, next) => {
  try {
    const trends = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 6 }
    ]);
    res.json({ success: true, trends });
  } catch (err) { next(err); }
};

// 7. Recurring
const getRecurringSuggestions = async (req, res, next) => {
  try { res.json({ success: true, suggestions: [] }); } catch (err) { next(err); }
};

module.exports = { 
  getExpenses, addExpense, updateExpense, 
  deleteExpense, getSummary, getTrends, 
  getRecurringSuggestions 
};