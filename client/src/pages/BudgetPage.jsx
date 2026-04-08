import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { Target, Zap, RefreshCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { getBudget, buildBudgetWithAI } from '../api/budget.api'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchBudgetData = async () => {
    try {
      const { data } = await getBudget()
      setBudget(data.budget || data) // Support both response structures
    } catch (err) {
      console.error("Budget Fetch Error:", err)
      // We don't toast here because 404 is expected for brand new users
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBudgetData() }, [])

  const handleAIRebuild = async () => {
    setIsProcessing(true)
    try {
      const { data } = await buildBudgetWithAI()
      setBudget(data.budget)
      toast.success('AI Model Re-Calculated')
    } catch (err) {
      toast.error('AI Processing Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return (
    <PageWrapper title="Budget">
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="Strategic Budgeting">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Financial Blueprint</h2>
          <p className="text-gray-500 text-sm italic">Engineered with Elastic Priority Modeling</p>
        </div>
        <button 
          onClick={handleAIRebuild} 
          disabled={isProcessing}
          className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
          Rebuild with AI
        </button>
      </div>

      {/* Safety Check: If no allocations exist, show Empty State instead of crashing */}
      {!budget?.allocations || budget.allocations.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-gray-800">
          <Target className="mx-auto text-gray-700 mb-4" size={48} />
          <h3 className="text-white font-bold text-lg">No Active Blueprint</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2 mb-6">
            Our AI needs to initialize your allocation strategy based on your income.
          </p>
          <button onClick={handleAIRebuild} className="btn-secondary px-8">Initialize AI Engine</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budget.allocations.map((item) => {
            const category = item?.category || 'Other'
            const allocated = item?.allocated || 0
            const spent = item?.spent || 0
            const nature = item?.nature || 'VARIABLE'
            
            // Elastic Logic
            const displayAllocated = nature === 'FIXED' ? Math.max(allocated, spent) : allocated
            const pct = Math.min((spent / (displayAllocated || 1)) * 100, 100)
            const isOver = nature === 'VARIABLE' && spent > displayAllocated
            const statusLabel = nature === 'FIXED' ? 'Required' : nature === 'WEALTH' ? 'Growth Target' : 'Budgeted'

            return (
              <div key={category} className={`card border-gray-800 transition-all ${isOver ? 'border-rose-500/40 bg-rose-500/5' : ''}`}>
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
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{statusLabel}</p>
                    <p className="text-lg font-mono font-bold text-white">₹{displayAllocated.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      nature === 'FIXED' ? 'bg-emerald-500' : 
                      nature === 'WEALTH' ? 'bg-indigo-500' : 
                      isOver ? 'bg-rose-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Spent: ₹{spent.toLocaleString()}</span>
                  {nature === 'FIXED' ? (
                    <div className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} /> Requirement Met
                    </div>
                  ) : isOver ? (
                    <div className="text-rose-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <AlertCircle size={12} /> Limit Warning
                    </div>
                  ) : (
                    <div className="text-indigo-400 text-[10px] font-bold uppercase">Optimal</div>
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