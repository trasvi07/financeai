const express = require('express');
const router = express.Router();
const { 
    getExpenses, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    getSummary, 
    getTrends,
    getRecurringSuggestions // <--- MAKE SURE THIS IS HERE
} = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // Protect all routes below

router.get('/', getExpenses);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/detect-recurring', getRecurringSuggestions);

module.exports = router;