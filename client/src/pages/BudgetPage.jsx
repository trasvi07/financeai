import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { CheckCircle, AlertCircle, Zap, Loader2 } from 'lucide-react'
import { getBudget, buildBudgetWithAI } from '../api/budget.api'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)

  const loadData = async () => {
    try {
      const { data } = await getBudget()
      setBudget(data.budget || data)
    } catch (err) {
      console.log("No budget yet")
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleAI = async () => {
    setWorking(true)
    try {
      const { data } = await buildBudgetWithAI()
      setBudget(data.budget)
      toast.success('Budget Updated!')
    } catch (err) {
      toast.error('Failed to update')
    } finally { setWorking(false) }
  }

  if (loading) return (
    <PageWrapper title="Budget">
      <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
    </PageWrapper>
  )

  const items = budget?.allocations || [];

  return (
    <PageWrapper title="My Monthly Budget">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Smart Planning</h2>
          <p className="text-gray-500 text-sm">Bills are prioritized automatically</p>
        </div>
        <button onClick={handleAI} disabled={working} className="btn-primary flex items-center gap-2 px-5 py-2">
          {working ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
          Recalculate
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">Click the button to create your first budget</p>
          <button onClick={handleAI} className="btn-secondary">Start AI Budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const { category, type, spent } = item;
            
            // Logic: For Bills, the limit is always at least what you spent
            const limit = type === 'FIXED' ? Math.max(item.limit, spent) : item.limit;
            const percent = Math.min((spent / (limit || 1)) * 100, 100);
            const isOver = type === 'DAILY' && spent > limit;

            // Simple labels
            const label = type === 'FIXED' ? 'Required' : type === 'SAVINGS' ? 'Target' : 'Limit';

            return (
              <div key={category} className={`card border-gray-800 ${isOver ? 'border-red-900 bg-red-900/10' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{category}</h3>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase">{label}</p>
                    <p className="text-lg font-bold text-white">₹{limit.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      type === 'FIXED' ? 'bg-green-500' : 
                      type === 'SAVINGS' ? 'bg-indigo-500' : 
                      isOver ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">Spent: ₹{spent.toLocaleString()}</span>
                  {type === 'FIXED' ? (
                    <div className="text-green-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle size={12} /> Paid
                    </div>
                  ) : isOver ? (
                    <div className="text-red-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <AlertCircle size={12} /> Over Limit
                    </div>
                  ) : (
                    <div className="text-blue-400 text-[10px] font-bold uppercase">Safe</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}