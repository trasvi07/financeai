import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { CheckCircle2, AlertCircle, Zap, Loader2, TrendingDown } from 'lucide-react'
import { getSummary } from '../api/expense.api'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const [items, setItems] = useState([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchSmartBudget = async () => {
    setSyncing(true)
    try {
      const now = new Date()
      const res = await getSummary({ month: now.getMonth() + 1, year: now.getFullYear() })
      if (res?.data?.success) {
        setItems(res.data.summary || [])
        setTotalSpent(res.data.totalSpent || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }

  useEffect(() => { fetchSmartBudget() }, [])

  if (loading) return <PageWrapper title="Budget"><div className="flex justify-center mt-20"><Loader2 className="animate-spin text-indigo-500" /></div></PageWrapper>

  return (
    <PageWrapper title="Smart Budget">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Behavioral Analysis</h2>
          <p className="text-gray-500 text-xs">AI identifying lifestyle leaks.</p>
        </div>
        <button onClick={fetchSmartBudget} className="btn-primary flex items-center gap-2 px-4 py-2">
          {syncing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
          Sync Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items?.length > 0 ? items.map((item) => {
          const isNeed = item?.nature === 'FIXED';
          const isOverdoing = item?.status === 'OVERDOING';
          const spent = item?.spent || 0;
          const limit = item?.allocated || 1;
          const pct = Math.min((spent / limit) * 100, 100);

          return (
            <div key={item.category} className={`card border-gray-800 ${isOverdoing ? 'border-red-500/30 bg-red-500/5' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white">{item.category}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isNeed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {item.nature}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-500 uppercase font-bold">{isNeed ? 'Required' : 'Limit'}</p>
                  <p className="font-bold text-white">₹{limit.toLocaleString()}</p>
                </div>
              </div>

              <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full transition-all duration-700 ${isNeed ? 'bg-emerald-500' : isOverdoing ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 uppercase tracking-tighter">Spent: ₹{spent.toLocaleString()}</span>
                {isNeed ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12}/> REQUIREMENT MET</span>
                ) : isOverdoing ? (
                  <span className="text-red-500 flex items-center gap-1 animate-pulse"><AlertCircle size={12}/> OVERDOING</span>
                ) : <span className="text-blue-400 uppercase tracking-widest text-[9px]">Normal</span>}
              </div>
            </div>
          )
        }) : (
          <div className="col-span-full py-20 text-center card border-dashed border-gray-800">
             <p className="text-gray-500">Add some expenses first to see the AI analysis.</p>
          </div>
        )}
      </div>

      <div className="mt-6 card border-indigo-500/20 bg-indigo-500/5 flex items-center gap-4">
        <TrendingDown className="text-indigo-400" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-white font-bold">Burn Rate:</span> You are spending ₹{(totalSpent / (new Date().getDate() || 1)).toFixed(0)} daily.
        </p>
      </div>
    </PageWrapper>
  )
}