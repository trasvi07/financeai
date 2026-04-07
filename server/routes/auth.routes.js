const router = require('express').Router()
const { signup, login, getMe, completeOnboarding, updateProfile } = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')

router.post('/signup',      signup)
router.post('/login',       login)
router.get('/me',           protect, getMe)
router.put('/onboarding',   protect, completeOnboarding)
router.put('/profile',      protect, updateProfile)

module.exports = router