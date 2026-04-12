const router = require('express').Router()
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getSmartAnalysis,
  getTrends
} = require('../controllers/expense.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)

// Both names point to same controller function
router.get('/summary',        getSummary)
router.get('/smart-analysis', getSmartAnalysis)
router.get('/trends',         getTrends)
router.get('/',               getExpenses)
router.post('/',              addExpense)
router.put('/:id',            updateExpense)
router.delete('/:id',         deleteExpense)

module.exports = router