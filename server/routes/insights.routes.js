const router = require('express').Router()
const { getInsights } = require('../controllers/insights.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect)
router.get('/', getInsights)

module.exports = router