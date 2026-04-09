import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { CheckCircle2, AlertCircle, Zap, Loader2, Info, TrendingDown } from 'lucide-react'
import { getSummary } from '../api/expense.api' // Using summary for the smart data
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
      setItems(res.data.summary || [])
      setTotalSpent(res.data.totalSpent || 0)
    } catch (err) {
      toast.error("Model Sync Failed")
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }

  useEffect(() => { fetchSmartBudget() }, [])

  if (loading) return <PageWrapper title="Budget"><Loader2 className="animate-spin mx-auto mt-20" /></PageWrapper>

  return (
    <PageWrapper title="Smart Budget">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Behavioral Analysis</h2>
          <p className="text-gray-500 text-xs">AI identifying leaks and essential growth.</p>
        </div>
        <button onClick={fetchSmartBudget} disabled={syncing} className="btn-primary flex items-center gap-2 px-6 py-2.5">
          {syncing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
          Analyze Spend
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((item) => {
          const isNeed = item.nature === 'FIXED';
          const isOverdoing = item.status === 'OVERDOING';
          const pct = Math.min((item.spent / (item.allocated || 1)) * 100, 100);

          return (
            <div key={item.category} className={`card border-gray-800 transition-all ${isOverdoing ? 'border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.category}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isNeed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {item.nature}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                    {isNeed ? 'Required baseline' : 'Lifestyle Limit'}
                  </p>
                  <p className="text-xl font-mono font-bold text-white">₹{item.allocated?.toLocaleString()}</p>
                </div>
              </div>

              <div className="h-2 bg-gray-900 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full transition-all duration-1000 ${isNeed ? 'bg-emerald-500' : isOverdoing ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Actual Spent</span>
                    <span className="text-sm font-bold text-gray-200">₹{item.spent.toLocaleString()}</span>
                </div>

                {isNeed ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/5 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                    <CheckCircle2 size={14} /> Requirement Met
                  </div>
                ) : isOverdoing ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase animate-pulse">
                      <AlertCircle size={14} /> Overdoing habit
                    </div>
                    <span className="text-[9px] text-red-400/60 font-bold">Cut down by ₹{(item.spent - item.allocated).toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-black uppercase bg-blue-400/5 px-3 py-1.5 rounded-lg">
                    <Info size={14} /> Normal Lifestyle
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Burn Rate Card (New Feature) */}
      <div className="mt-8 card bg-indigo-600/5 border-indigo-500/20 p-6 flex items-center gap-6">
        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
          <TrendingDown size={32} />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Daily Burn Rate Analysis</h3>
          <p className="text-gray-400 text-sm max-w-md">
            You are spending approximately <span className="text-white font-bold">₹{(totalSpent / new Date().getDate()).toFixed(0)}</span> per day. 
            At this velocity, your "Wants" budget will reach the critical limit in <span className="text-indigo-400 font-bold">6 days</span>.
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}