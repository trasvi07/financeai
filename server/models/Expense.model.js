const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title:    { type: String, required: true, trim: true },
  amount:   { type: Number, required: true, min: [0.01, 'Amount must be positive'] },
  category: {
    type: String,
    required: true,
    enum: ['Food & Dining', 'Transport', 'Shopping', 'Entertainment',
           'Health', 'Utilities', 'Education', 'Travel', 'Investment', 'Other']
  },
  date:        { type: Date, default: Date.now },
  note:        { type: String, trim: true, maxlength: 500 },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'netbanking', 'other'],
    default: 'other'
  },
  source: {
    type: String,
    enum: ['manual', 'voice', 'sms', 'receipt'],
    default: 'manual'
  },
  aiCategorized: { type: Boolean, default: false },
}, { timestamps: true })

// Index for fast queries
expenseSchema.index({ user: 1, date: -1 })
expenseSchema.index({ user: 1, category: 1 })

module.exports = mongoose.model('Expense', expenseSchema)