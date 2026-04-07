import PageWrapper from '../components/layout/PageWrapper'
import { Brain } from 'lucide-react'

const budgets = [
  { category: 'Food & Dining',  allocated: 9000,  spent: 7020, icon: '🍔', color: 'bg-orange-500' },
  { category: 'Transport',      allocated: 4000,  spent: 2400, icon: '🚗', color: 'bg-blue-500'   },
  { category: 'Shopping',       allocated: 6000,  spent: 5400, icon: '🛒', color: 'bg-purple-500' },
  { category: 'Entertainment',  allocated: 2000,  spent: 649,  icon: '🎬', color: 'bg-pink-500'   },
  { category: 'Health',         allocated: 3000,  spent: 320,  icon: '💊', color: 'bg-green-500'  },
  { category: 'Utilities',      allocated: 2500,  spent: 890,  icon: '⚡', color: 'bg-yellow-500' },
]

export default function BudgetPage() {
  return (
    <PageWrapper title="AI Budget">
      <div className="card border-indigo-500/20 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Your AI-Generated Budget</h3>
            <p className="text-sm text-gray-400">Based on your behavior (60%), goals (25%), and savings safety (15%). Adjusts monthly.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {budgets.map(({ category, allocated, spent, icon, color }) => {
          const pct = Math.min((spent / allocated) * 100, 100)
          const over = spent > allocated
          return (
            <div key={category} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium text-gray-200 text-sm">{category}</span>
                </div>
                <span className={`text-sm font-semibold ${over ? 'text-red-400' : 'text-gray-300'}`}>
                  ₹{spent.toLocaleString()} / ₹{allocated.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${over ? 'bg-red-500' : color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">{pct.toFixed(0)}% used</span>
                <span className={`text-xs ${over ? 'text-red-400' : 'text-green-400'}`}>
                  {over ? `₹${(spent - allocated).toLocaleString()} over` : `₹${(allocated - spent).toLocaleString()} left`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </PageWrapper>
  )
}