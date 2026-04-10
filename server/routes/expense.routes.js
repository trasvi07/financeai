const express = require('express');
const router = express.Router();
const { 
  getSmartAnalysis, // Make sure this is imported correctly
  getTrends, 
  getExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense 
} = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// THIS MUST MATCH: Your frontend calls /api/expenses/summary
router.get('/summary', getSmartAnalysis); 
router.get('/trends', getTrends);
router.get('/', getExpenses);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;