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

// 3. Update expense
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

// 5. Summary for Dashboard
const getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const summary = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    const totalSpent = summary.reduce((acc, curr) => acc + curr.total, 0);
    res.json({ success: true, summary, totalSpent });
  } catch (err) { next(err); }
};

// 6. Trends for Chart
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

// 7. Missing Function: Recurring Suggestions (FIXES THE CRASH)
const getRecurringSuggestions = async (req, res, next) => {
  try {
    res.json({ success: true, suggestions: [] });
  } catch (err) { next(err); }
};

module.exports = { 
  getExpenses, addExpense, updateExpense, 
  deleteExpense, getSummary, getTrends, 
  getRecurringSuggestions 
};