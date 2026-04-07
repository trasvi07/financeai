import PageWrapper from '../components/layout/PageWrapper'
import { Plus, Search, Mic } from 'lucide-react'
import { useState } from 'react'

const MOCK_EXPENSES = [
  { id: 1, title: 'Swiggy Order',      category: 'Food',      amount: 450,  date: '2025-03-28', icon: '🍔' },
  { id: 2, title: 'Uber Ride',         category: 'Transport', amount: 180,  date: '2025-03-27', icon: '🚗' },
  { id: 3, title: 'Amazon Shopping',   category: 'Shopping',  amount: 1299, date: '2025-03-26', icon: '🛒' },
  { id: 4, title: 'Netflix',           category: 'Entertainment', amount: 649, date: '2025-03-25', icon: '🎬' },
  { id: 5, title: 'Apollo Pharmacy',   category: 'Health',    amount: 320,  date: '2025-03-24', icon: '💊' },
  { id: 6, title: 'Electricity Bill',  category: 'Utilities', amount: 890,  date: '2025-03-23', icon: '⚡' },
]

const CATEGORY_COLORS = {
  Food: 'bg-orange-500/10 text-orange-400',
  Transport: 'bg-blue-500/10 text-blue-400',
  Shopping: 'bg-purple-500/10 text-purple-400',
  Entertainment: 'bg-pink-500/10 text-pink-400',
  Health: 'bg-green-500/10 text-green-400',
  Utilities: 'bg-yellow-500/10 text-yellow-400',
}

export default function ExpensesPage() {
  const [search, setSearch] = useState('')
  const filtered = MOCK_EXPENSES.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageWrapper title="Expenses">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input-field pl-9" placeholder="Search expenses..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm"><Mic size={16} /> Voice</button>
        <button className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Expense</button>
      </div>

      <div className="card">
        <div className="space-y-1">
          {filtered.map(expense => (
            <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-gray-800/50 rounded-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-lg">
                  {expense.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-100">{expense.title}</p>
                  <p className="text-xs text-gray-500">{expense.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[expense.category] || 'bg-gray-700 text-gray-300'}`}>
                  {expense.category}
                </span>
                <span className="font-semibold text-gray-100">₹{expense.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No expenses found.</div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}