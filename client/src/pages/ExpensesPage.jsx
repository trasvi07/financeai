import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { Plus, Search, Trash2, Pencil, X, Loader2, Mic } from 'lucide-react'
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../api/expense.api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Food & Dining','Transport','Shopping','Entertainment',
  'Health','Utilities','Education','Travel','Investment','Other'
]

const PAYMENT_METHODS = ['cash','card','upi','netbanking','other']

const CATEGORY_COLORS = {
  'Food & Dining':  'bg-orange-500/10 text-orange-400',
  'Transport':      'bg-blue-500/10 text-blue-400',
  'Shopping':       'bg-purple-500/10 text-purple-400',
  'Entertainment':  'bg-pink-500/10 text-pink-400',
  'Health':         'bg-green-500/10 text-green-400',
  'Utilities':      'bg-yellow-500/10 text-yellow-400',
  'Education':      'bg-cyan-500/10 text-cyan-400',
  'Travel':         'bg-red-500/10 text-red-400',
  'Investment':     'bg-emerald-500/10 text-emerald-400',
  'Other':          'bg-gray-500/10 text-gray-400',
}

const CATEGORY_ICONS = {
  'Food & Dining':'🍔','Transport':'🚗','Shopping':'🛒',
  'Entertainment':'🎬','Health':'💊','Utilities':'⚡',
  'Education':'📚','Travel':'✈️','Investment':'📈','Other':'💰'
}

const EMPTY_FORM = {
  title: '', amount: '', category: 'Food & Dining',
  date: new Date().toISOString().split('T')[0],
  note: '', paymentMethod: 'upi', isRecurring: false
}

export default function ExpensesPage() {
  const [expenses, setExpenses]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [filterCat, setFilterCat]   = useState('')
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => { fetchExpenses() }, [filterCat])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const { data } = await getExpenses({
        month: now.getMonth() + 1,
        year:  now.getFullYear(),
        category: filterCat || undefined,
        limit: 100
      })
      setExpenses(data.expenses)
      setTotalSpent(data.expenses.reduce((a, e) => a + e.amount, 0))
    } catch (err) {
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditExpense(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (expense) => {
    setEditExpense(expense)
    setForm({
      title:         expense.title,
      amount:        expense.amount,
      category:      expense.category,
      date:          new Date(expense.date).toISOString().split('T')[0],
      note:          expense.note || '',
      paymentMethod: expense.paymentMethod || 'upi',
      isRecurring:   expense.isRecurring || false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.amount) {
      toast.error('Title and amount are required')
      return
    }
    setSubmitting(true)
    try {
      if (editExpense) {
        await updateExpense(editExpense._id, { ...form, amount: Number(form.amount) })
        toast.success('Expense updated!')
      } else {
        await addExpense({ ...form, amount: Number(form.amount) })
        toast.success('Expense added!')
      }
      setShowModal(false)
      fetchExpenses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try {
      await deleteExpense(id)
      toast.success('Expense deleted')
      fetchExpenses()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = expenses.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper title="Expenses">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-9" placeholder="Search expenses..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={filterCat}
          onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Total This Month</p>
          <p className="text-2xl font-bold text-white">₹{totalSpent.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-white">{expenses.length}</p>
        </div>
        <div className="card col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Daily Average</p>
          <p className="text-2xl font-bold text-white">
            ₹{expenses.length ? Math.round(totalSpent / new Date().getDate()).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Expense list */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-gray-400 font-medium">No expenses found</p>
            <p className="text-gray-600 text-sm mt-1">Click "Add Expense" to get started</p>
            <button onClick={openAdd} className="btn-primary mt-4 text-sm">
              <Plus size={16} className="inline mr-1" /> Add First Expense
            </button>
          </div>
        ) : (
          <div>
            {filtered.map((expense, i) => (
              <div key={expense._id}
                className={`flex items-center justify-between px-6 py-4 hover:bg-gray-800/50 transition-all group
                  ${i !== filtered.length - 1 ? 'border-b border-gray-800' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {CATEGORY_ICONS[expense.category] || '💰'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-100">{expense.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </p>
                      {expense.isRecurring && (
                        <span className="text-xs bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">recurring</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium hidden sm:block
                    ${CATEGORY_COLORS[expense.category] || 'bg-gray-700 text-gray-300'}`}>
                    {expense.category}
                  </span>
                  <span className="font-bold text-gray-100 min-w-[80px] text-right">
                    ₹{expense.amount.toLocaleString()}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEdit(expense)}
                      className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(expense._id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">
                {editExpense ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
                <input className="input-field" placeholder="e.g. Swiggy Order"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount (₹) *</label>
                  <input type="number" min="0.01" step="0.01" className="input-field"
                    placeholder="0.00" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
                  <input type="date" className="input-field" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                <select className="input-field" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Payment Method</label>
                <select className="input-field" value={form.paymentMethod}
                  onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Note (optional)</label>
                <textarea className="input-field resize-none" rows={2} placeholder="Any additional details..."
                  value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="recurring" checked={form.isRecurring}
                  onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-600" />
                <label htmlFor="recurring" className="text-sm text-gray-300">
                  This is a recurring expense
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : editExpense ? 'Update' : 'Add Expense'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}