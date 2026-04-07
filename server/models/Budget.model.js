const mongoose = require('mongoose')

const budgetSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true },  // 1-12
  year:  { type: Number, required: true },

  // AI-generated allocations
  allocations: [{
    category:  { type: String, required: true },
    allocated: { type: Number, required: true },
    spent:     { type: Number, default: 0 },
  }],

  totalIncome:   { type: Number, required: true },
  totalBudgeted: { type: Number, required: true },
  targetSavings: { type: Number, default: 0 },

  // AI model weights used
  modelWeights: {
    behavior: { type: Number, default: 0.60 },
    goals:    { type: Number, default: 0.25 },
    safety:   { type: Number, default: 0.15 },
  },

  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true })

budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true })

module.exports = mongoose.model('Budget', budgetSchema)