import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { Target, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { getBudget, buildBudgetWithAI } from '../api/budget.api'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchBudgetData = async () => {
    try {
      const res = await getBudget()
      // Safety: Handle different API response structures
      const budgetData = res?.data?.budget || res?.data || null
      setBudget(budgetData)
    } catch (err) {
      console.error("Budget Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBudgetData() }, [])

  const handleAIRebuild = async () => {
    setIsProcessing(true)
    try {
      const res = await buildBudgetWithAI()
      setBudget(res?.data?.budget || res?.data)
      toast.success('AI Budget Created!')
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

  // SAFETY: If allocations doesn't exist, make it an empty array so .map() doesn't crash
  const allocations = budget?.allocations || []

  return (
    <PageWrapper title="Budget Planning">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Monthly Plan</h2>
          <p className="text-gray-500 text-sm">Needs are prioritized over wants</p>
        </div>
        <button 
          onClick={handleAIRebuild} 
          disabled={isProcessing}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
          Recalculate with AI
        </button>
      </div>

      {allocations.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-gray-800">
          <Target className="mx-auto text-gray-700 mb-4" size={48} />
          <h3 className="text-white font-bold text-lg">No Budget Found</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2 mb-6">
            Click the button above to let AI analyze your income and set your limits.
          </p>
          <button onClick={handleAIRebuild} className="btn-secondary px-8">Create AI Budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allocations.map((item, index) => {
            // Safety fallback for each individual item
            const category = item?.category || 'Uncategorized'
            const nature = item?.nature || 'VARIABLE'
            const spent = item?.spent || 0
            const rawAllocated = item?.allocated || 0
            
            // Logic: For FIXED (Bills), if you spent more, we show that as the "Required" amount
            const allocated = nature === 'FIXED' ? Math.max(rawAllocated, spent) : rawAllocated
            const pct = Math.min((spent / (allocated || 1)) * 100, 100)
            const isOver = nature === 'VARIABLE' && spent > allocated

            return (
              <div key={category || index} className={`card border-gray-800 ${isOver ? 'border-red-500/40 bg-red-500/5' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white">{category}</h3>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{nature}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      {nature === 'FIXED' ? 'Required' : 'Limit'}
                    </p>
                    <p className="text-lg font-bold text-white">₹{allocated.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      nature === 'FIXED' ? 'bg-green-500' : 
                      nature === 'WEALTH' ? 'bg-indigo-500' : 
                      isOver ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Spent: ₹{spent.toLocaleString()}</span>
                  {nature === 'FIXED' ? (
                    <div className="text-green-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} /> Requirement Met
                    </div>
                  ) : isOver ? (
                    <div className="text-red-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <AlertCircle size={12} /> Over Limit
                    </div>
                  ) : (
                    <div className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Safe</div>
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