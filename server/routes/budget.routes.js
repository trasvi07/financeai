const router = require('express').Router()
const { getCurrentBudget, generateNewBudget } = require('../controllers/budget.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)
router.get('/current',  getCurrentBudget)
router.post('/generate', generateNewBudget)

module.exports = router