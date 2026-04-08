import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { Target, TrendingUp, AlertCircle, RefreshCcw, Zap, CheckCircle2 } from 'lucide-react'
import { getBudget, updateBudget, buildBudgetWithAI } from '../api/budget.api'
import { getSummary } from '../api/expense.api'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBudgetData() }, [])

  const fetchBudgetData = async () => {
    try {
      const { data } = await getBudget()
      setBudget(data)
    } catch (err) { toast.error('Failed to load budget') }
    finally { setLoading(false) }
  }

  const handleAIRebuild = async () => {
    setLoading(true)
    try {
      const { data } = await buildBudgetWithAI()
      setBudget(data.budget)
      toast.success('AI Budget Optimized')
    } catch (err) { toast.error('AI Processing Failed') }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#050505]"><RefreshCcw className="animate-spin text-indigo-500" /></div>

  return (
    <PageWrapper title="Strategic Budgeting">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Financial Blueprint</h2>
          <p className="text-gray-500 text-sm">Elastic modeling based on current burn rate</p>
        </div>
        <button onClick={handleAIRebuild} className="btn-primary flex items-center gap-2 px-6 py-3">
          <Zap size={18} /> Rebuild with AI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budget?.allocations.map((item) => {
          const { category, allocated, spent, nature } = item
          
          // IIT Logic: Elastic Budgeting
          // If nature is FIXED, the 'Required' value should match spent if spent is higher
          const displayAllocated = nature === 'FIXED' ? Math.max(allocated, spent) : allocated
          const pct = Math.min((spent / (displayAllocated || 1)) * 100, 100)
          
          const isVariable = nature === 'VARIABLE'
          const isOver = isVariable && spent > displayAllocated
          
          // Labeling logic requested by user
          const statusLabel = nature === 'FIXED' ? 'Required' : nature === 'WEALTH' ? 'Growth Target' : 'Budgeted'

          return (
            <div key={category} className={`card border-gray-800 hover:border-indigo-500/30 transition-all ${isOver ? 'border-rose-500/40 bg-rose-500/5' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">{category}</h3>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                    nature === 'FIXED' ? 'bg-rose-500/20 text-rose-400' : 
                    nature === 'WEALTH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {nature}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">{statusLabel}</p>
                  <p className="text-lg font-mono font-bold text-white">₹{displayAllocated.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <span>Utilization</span>
                  <span>{pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      nature === 'FIXED' ? 'bg-rose-500' : 
                      nature === 'WEALTH' ? 'bg-emerald-500' : 
                      isOver ? 'bg-rose-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                <span className="text-xs text-gray-400">Actual Spend: <span className="text-white font-bold">₹{spent.toLocaleString()}</span></span>
                {nature === 'FIXED' ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase">
                    <CheckCircle2 size={12} /> Requirement Met
                  </div>
                ) : isOver ? (
                  <div className="flex items-center gap-1 text-rose-400 text-[10px] font-bold uppercase">
                    <AlertCircle size={12} /> Limit Exceeded
                  </div>
                ) : (
                  <div className="text-indigo-400 text-[10px] font-bold uppercase">Within Limit</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </PageWrapper>
  )
}