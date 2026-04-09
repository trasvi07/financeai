import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { CheckCircle, AlertCircle, Zap, Loader2, Target } from 'lucide-react'
import { getBudget, buildBudgetWithAI } from '../api/budget.api'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)

  const loadData = async () => {
    try {
      const res = await getBudget()
      setBudget(res?.data?.budget || res?.data)
    } catch (err) { console.log("New user - no budget yet") }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleAI = async () => {
    setWorking(true)
    try {
      const res = await buildBudgetWithAI()
      setBudget(res?.data?.budget || res?.data)
      toast.success('Budget Updated!')
    } catch (err) { toast.error('Failed') }
    finally { setWorking(false) }
  }

  if (loading) return <PageWrapper title="Budget"><Loader2 className="animate-spin mx-auto mt-20" /></PageWrapper>

  const items = budget?.allocations || []

  return (
    <PageWrapper title="Budget Planning">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white">Monthly Plan</h2>
        <button onClick={handleAI} disabled={working} className="btn-primary flex items-center gap-2 px-4 py-2">
          {working ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
          Update Budget
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-10 border-dashed border-gray-800">
          <Target className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-400 mb-4">No budget found. Click Update to start.</p>
          <button onClick={handleAI} className="btn-secondary px-6">Create AI Budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const { category, nature, spent } = item;
            // ELASTIC LOGIC: Fixed items never go 'Over'
            const limit = nature === 'FIXED' ? Math.max(item.allocated || 0, spent) : (item.allocated || 0);
            const percent = Math.min((spent / (limit || 1)) * 100, 100);
            const isOver = nature === 'VARIABLE' && spent > limit;

            return (
              <div key={category} className={`card border-gray-800 ${isOver ? 'border-red-900 bg-red-900/10' : ''}`}>
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="font-bold text-white">{category}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{nature}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase">{nature === 'FIXED' ? 'Required' : 'Limit'}</p>
                    <p className="font-bold text-white">₹{limit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div className={`h-full ${nature === 'FIXED' ? 'bg-green-500' : isOver ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Spent: ₹{spent.toLocaleString()}</span>
                  {nature === 'FIXED' ? (
                    <span className="text-green-400 text-[10px] font-bold flex items-center gap-1"><CheckCircle size={12}/> REQUIREMENT MET</span>
                  ) : isOver ? (
                    <span className="text-red-400 text-[10px] font-bold flex items-center gap-1"><AlertCircle size={12}/> OVER LIMIT</span>
                  ) : <span className="text-blue-400 text-[10px] font-bold uppercase">Safe</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}