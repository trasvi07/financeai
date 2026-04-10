import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getSmartAnalysis, getTrends } from '../api/expense.api';
import { Activity, Zap, TrendingUp, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [date, setDate] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);
      const [res, t] = await Promise.all([getSmartAnalysis(date), getTrends()]);
      setData(res.data);
      setTrends(t.data.trends || []);
    } catch (err) {
      console.error("AI Sync Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [date]);

  if (loading) return <PageWrapper><div className="flex items-center justify-center h-[60vh] text-indigo-500 font-black animate-pulse">SYNCING AI...</div></PageWrapper>;

  if (error) return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-400">
        <AlertCircle size={48} className="mb-4" />
        <h2 className="text-xl font-bold">Connection Failed</h2>
        <p className="text-sm opacity-60">Check if your Backend is running on Render.</p>
        <button onClick={loadData} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Try Again</button>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper title="Intelligence Command">
      {/* Date Navigator */}
      <div className="flex items-center justify-between mb-8 bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
        <button onClick={() => setDate(d => ({ ...d, month: d.month === 1 ? 12 : d.month - 1 }))} className="p-2 hover:bg-gray-800 rounded-lg text-white"><ChevronLeft/></button>
        <div className="text-center">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">
            {new Date(date.year, date.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Live Performance</span>
        </div>
        <button onClick={() => setDate(d => ({ ...d, month: d.month === 12 ? 1 : d.month + 1 }))} className="p-2 hover:bg-gray-800 rounded-lg text-white"><ChevronRight/></button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-emerald-500/5 border-emerald-500/20 p-6">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Total Income</p>
          <h3 className="text-2xl font-black text-white">₹{data?.kpis?.income?.toLocaleString() || 0}</h3>
        </div>
        <div className="card bg-indigo-500/5 border-indigo-500/20 p-6">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Total Saved</p>
          <h3 className="text-2xl font-black text-white">₹{data?.kpis?.saved?.toLocaleString() || 0}</h3>
        </div>
        <div className={`card p-6 ${data?.kpis?.savingsHealth < 15 ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-900/20 border-gray-800'}`}>
          <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Savings Health</p>
          <h3 className={`text-2xl font-black ${data?.kpis?.savingsHealth < 15 ? 'text-red-500' : 'text-emerald-500'}`}>{data?.kpis?.savingsHealth || 0}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Velocity */}
        <div className="lg:col-span-2 card p-6 border-gray-800 bg-[#0a0a0c]">
          <h4 className="text-white font-bold mb-8 flex items-center gap-2 text-sm"><TrendingUp size={16} className="text-indigo-400"/> Spending Velocity</h4>
          <div className="flex items-end justify-between h-44 gap-4 px-2">
            {trends.length > 0 ? trends.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-indigo-500/20 border-t-2 border-indigo-500/60 rounded-t-sm" style={{ height: `${(t.total / 60000) * 100}%` }} />
                <span className="text-[9px] text-gray-500 mt-2 font-bold">{t._id.month}/{t._id.year.toString().slice(-2)}</span>
              </div>
            )) : <p className="text-gray-600 text-xs w-full text-center pb-20 italic">Awaiting more months of data...</p>}
          </div>
        </div>

        {/* AI Analysis List */}
        <div className="card p-6 border-indigo-500/20 bg-indigo-500/5">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm"><Zap size={16} className="text-indigo-400"/> AI Behavior</h3>
          <div className="space-y-4">
             {data?.summary?.length > 0 ? data.summary.slice(0, 5).map(item => (
               <div key={item.category} className="space-y-1">
                 <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-gray-400">{item.category}</span>
                    <span className={item.status === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}>{item.status}</span>
                 </div>
                 <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                    <div className={`h-full ${item.nature === 'FIXED' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${item.score}%` }} />
                 </div>
               </div>
             )) : <p className="text-gray-600 text-xs text-center py-10">Add expenses to see AI insights.</p>}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}