require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const rateLimit    = require('express-rate-limit')
const connectDB    = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// Connect DB
connectDB()

// Security
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200,
  message: { success: false, message: 'Too many requests. Please slow down.' }
}))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Routes
app.use('/api/auth',     require('./routes/auth.routes'))
app.use('/api/expenses', require('./routes/expense.routes'))
app.use('/api/budget',   require('./routes/budget.routes'))
app.use('/api/insights', require('./routes/insights.routes'))

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }))

// Error handler (must be last)
app.use(errorHandler)

module.exports = app