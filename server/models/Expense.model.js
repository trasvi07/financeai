const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:  { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: [0.01, 'Amount must be positive'] },
  category: {
    type: String,
    required: true,
    enum: [
      'Rent', 'Medical', 'Education', 'Utilities', 
      'Investment', 'Savings', 'Debt', 
      'Food', 'Transport', 'Shopping', 'Travel', 'Entertainment', 'Other'
    ]
  },
  nature: {
    type: String,
    enum: ['FIXED', 'SAVINGS', 'DAILY'], 
    required: true,
    index: true
  },
  date: { type: Date, default: Date.now },
  note: { type: String, trim: true, maxlength: 500 },
  paymentMethod: { type: String, default: 'upi' }
}, { timestamps: true })

expenseSchema.index({ user: 1, date: -1 })
expenseSchema.index({ user: 1, nature: 1 })

module.exports = mongoose.model('Expense', expenseSchema)