const jwt  = require('jsonwebtoken')
const User = require('../models/User.model')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide name, email and password.' })

    const exists = await User.findOne({ email })
    if (exists)
      return res.status(400).json({ success: false, message: 'Email already registered.' })

    const user  = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      success: true, token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        onboardingComplete: false,
        currency: 'INR',
        monthlyIncome: 0,
      }
    })
  } catch (err) { next(err) }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password.' })

    const user = await User.findOne({ email }).select('+password')
    if (!user || !user.password)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })

    const token = generateToken(user._id)
    res.json({
      success: true, token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
        currency:      user.currency,
        monthlyIncome: user.monthlyIncome,
        topCategories: user.topCategories,
        goals:         user.goals,
        preferences:   user.preferences,
        lifestyle:     user.lifestyle,
      }
    })
  } catch (err) { next(err) }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user })
}

// PUT /api/auth/onboarding
const completeOnboarding = async (req, res, next) => {
  try {
    const {
      monthlyIncome, currency, topCategories,
      goals, lifestyle, otherIncome, dependents,
      housingType, workType, preferences
    } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        monthlyIncome,
        currency,
        topCategories,
        goals,
        lifestyle,
        otherIncome:  otherIncome  || 0,
        dependents:   dependents   || 0,
        housingType:  housingType  || 'rented',
        workType:     workType     || 'salaried',
        preferences:  preferences  || {},
        onboardingComplete: true,
      },
      { new: true, runValidators: true }
    )

    res.json({ success: true, user })
  } catch (err) { next(err) }
}

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, preferences, monthlyIncome, currency } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, preferences, monthlyIncome, currency },
      { new: true }
    )
    res.json({ success: true, user })
  } catch (err) { next(err) }
}

module.exports = { signup, login, getMe, completeOnboarding, updateProfile }