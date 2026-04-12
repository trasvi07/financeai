const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6, select: false },
  googleId: String,
  avatar:   String,

  // Financial profile
  monthlyIncome:  { type: Number, default: 0 },
  otherIncome:    { type: Number, default: 0 },
  currency:       { type: String, default: 'INR' },
  topCategories:  [String],
  goals:          [String],
  dependents:     { type: Number, default: 0 },
  housingType:    { type: String, enum: ['owned','rented','family'], default: 'rented' },
  workType:       { type: String, enum: ['salaried','freelance','business','student','other'], default: 'salaried' },
  lifestyle:      { type: String, enum: ['frugal','moderate','comfortable','lavish'], default: 'moderate' },

  onboardingComplete: { type: Boolean, default: false },

  preferences: {
    notifications:  { type: Boolean, default: true },
    weeklyEmail:    { type: Boolean, default: false },
    aiInsights:     { type: Boolean, default: true },
    theme:          { type: String,  default: 'dark' },
  }
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password)
}

module.exports = mongoose.model('User', userSchema)