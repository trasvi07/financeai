const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title:  { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: [0.01, 'Amount must be positive'] },
  category: {
    type: String,
    required: true,
    // Expanded categories for high-level financial tracking
    enum: [
      'Rent', 'Education', 'Utilities', 'Medical', // FIXED
      'Investment', 'Savings', 'Debt Repayment',   // WEALTH
      'Food & Dining', 'Transport', 'Shopping', 'Travel', 'Entertainment', 'Other' // VARIABLE
    ]
  },
  // NEW FIELD: Used for IIT-level bucket logic
  nature: {
    type: String,
    enum: ['FIXED', 'WEALTH', 'VARIABLE'],
    required: true,
    index: true
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

expenseSchema.index({ user: 1, date: -1 })
expenseSchema.index({ user: 1, nature: 1 }) // Index nature for bucket speed

module.exports = mongoose.model('Expense', expenseSchema)