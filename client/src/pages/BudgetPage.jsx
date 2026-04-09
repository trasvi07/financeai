import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { CheckCircle2, AlertCircle, Zap, Loader2 } from 'lucide-react'
import { getSummary } from '../api/expense.api'

export default function BudgetPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getSummary();
      setItems(res?.data?.summary || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load() }, []);

  if (loading) return <PageWrapper title="Budget"><Loader2 className="animate-spin mx-auto mt-10" /></PageWrapper>

  return (
    <PageWrapper title="Smart Budget">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-bold text-xl">AI Analysis</h2>
        <button onClick={load} className="btn-primary flex items-center gap-2 px-4 py-2"><Zap size={16}/> Sync</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length > 0 ? items.map(item => (
          <div key={item.category} className={`card border-gray-800 ${item.status === 'OVERDOING' ? 'border-red-500/50 bg-red-500/5' : ''}`}>
             <div className="flex justify-between mb-2">
                <span className="text-white font-bold">{item.category}</span>
                <span className="text-gray-400 font-mono text-sm">₹{item.spent}</span>
             </div>
             <div className="text-[10px] font-bold uppercase tracking-widest mb-3">
                {item.nature === 'FIXED' ? (
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12}/> {item.status}</span>
                ) : item.status === 'OVERDOING' ? (
                  <span className="text-red-500 flex items-center gap-1"><AlertCircle size={12}/> OVERDOING</span>
                ) : <span className="text-blue-400">NORMAL LIFESTYLE</span>}
             </div>
             <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                <div className={`h-full ${item.nature === 'FIXED' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: '70%'}} />
             </div>
          </div>
        )) : <div className="col-span-full text-center py-10 text-gray-500 card border-dashed border-gray-800">No data found. Add expenses to begin.</div>}
      </div>
    </PageWrapper>
  )
}