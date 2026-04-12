require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const rateLimit    = require('express-rate-limit')
const connectDB    = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

const app = express()

connectDB()

// Fix CORS — allow all Vercel deployments + localhost
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean)

    // Allow Vercel preview URLs dynamically
    if (!origin || allowed.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { success: false, message: 'Too many requests.' }
}))

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
)

app.use('/api/auth',     require('./routes/auth.routes'))
app.use('/api/expenses', require('./routes/expense.routes'))
app.use('/api/budget',   require('./routes/budget.routes'))
app.use('/api/insights', require('./routes/insights.routes'))

app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found.' })
)
app.use(errorHandler)

module.exports = app