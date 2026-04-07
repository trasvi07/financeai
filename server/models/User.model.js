const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false   // never returned in queries by default
  },
  googleId: { type: String },
  avatar:   { type: String },

  // Onboarding data
  monthlyIncome: { type: Number, default: 0 },
  currency:      { type: String, default: 'INR' },
  topCategories: [String],
  goals:         [String],
  onboardingComplete: { type: Boolean, default: false },

  // Preferences
  preferences: {
    notifications:    { type: Boolean, default: true },
    weeklyEmail:      { type: Boolean, default: false },
    aiInsights:       { type: Boolean, default: true },
    theme:            { type: String,  default: 'dark' },
  }
}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)