const router = require('express').Router()
const {
  getExpenses, addExpense, updateExpense,
  deleteExpense, getSummary, getTrends
} = require('../controllers/expense.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)   // all expense routes require auth

router.get('/',         getExpenses)
router.post('/',        addExpense)
router.put('/:id',      updateExpense)
router.delete('/:id',   deleteExpense)
router.get('/summary',  getSummary)
router.get('/trends',   getTrends)

module.exports = router