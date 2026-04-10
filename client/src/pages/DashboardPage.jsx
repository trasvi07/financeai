import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getSmartAnalysis, getTrends } from '../api/expense.api';
import { Activity, Zap, TrendingUp, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

export default function Dashboard() {
  const [date, setDate] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res, t] = await Promise.all([getSmartAnalysis(date), getTrends()]);
      setData(res.data);
      setTrends(t.data.trends || []);
      setLoading(false);
    };
    load();
  }, [date]);

  if (loading) return <PageWrapper><div className="mt-20 text-center animate-pulse font-black text-indigo-500">SYNCING AI...</div></PageWrapper>;

  return (
    <PageWrapper title="Intelligence Command">
      {/* 1. Navigator */}
      <div className="flex items-center justify-between mb-8 bg-gray-900/40 p-4 rounded-2xl border border-gray-800">
        <button onClick={() => setDate(d => ({ ...d, month: d.month === 1 ? 12 : d.month - 1 }))} className="p-2 hover:bg-gray-800 rounded-lg text-white"><ChevronLeft/></button>
        <h2 className="text-lg font-black text-white uppercase tracking-widest">{new Date(date.year, date.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setDate(d => ({ ...d, month: d.month === 12 ? 1 : d.month + 1 }))} className="p-2 hover:bg-gray-800 rounded-lg text-white"><ChevronRight/></button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-emerald-500/5 border-emerald-500/20 p-6">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Total Income</p>
          <h3 className="text-3xl font-black text-white">₹{data?.kpis.income.toLocaleString()}</h3>
        </div>
        <div className="card bg-indigo-500/5 border-indigo-500/20 p-6">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Total Saved</p>
          <h3 className="text-3xl font-black text-white">₹{data?.kpis.saved.toLocaleString()}</h3>
        </div>
        <div className={`card p-6 ${data?.kpis.savingsHealth < 15 ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-900/20 border-gray-800'}`}>
          <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Savings Health Index</p>
          <h3 className={`text-3xl font-black ${data?.kpis.savingsHealth < 15 ? 'text-red-500' : 'text-emerald-500'}`}>{data?.kpis.savingsHealth}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Trends Line Chart (Restored Velocity) */}
        <div className="lg:col-span-2 card p-6 border-gray-800 bg-[#0a0a0c]">
          <h4 className="text-white font-bold mb-8 flex items-center gap-2 text-sm"><TrendingUp size={16} className="text-indigo-400"/> Spending Velocity</h4>
          <div className="flex items-end justify-between h-44 gap-4 px-2">
            {trends.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-indigo-500/20 border-t-2 border-indigo-500/60 rounded-t-sm" style={{ height: `${(t.total / 60000) * 100}%` }} />
                <span className="text-[9px] text-gray-500 mt-2 font-bold">{t._id.month}/{t._id.year.toString().slice(-2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AI Pattern Status */}
        <div className="card p-6 border-indigo-500/20 bg-indigo-500/5">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm"><Zap size={16} className="text-indigo-400"/> AI Analysis</h3>
          <div className="space-y-4">
             {data?.summary.slice(0, 5).map(item => (
               <div key={item.category} className="space-y-1">
                 <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-gray-400">{item.category}</span>
                    <span className={item.status === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}>{item.status}</span>
                 </div>
                 <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                    <div className={`h-full ${item.nature === 'FIXED' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${item.score}%` }} />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}