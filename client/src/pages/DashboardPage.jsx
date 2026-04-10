import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { ChevronLeft, ChevronRight, BarChart3, Activity, Zap } from 'lucide-react';
import { getSummary, getTrends } from '../api/expense.api';

export default function Dashboard() {
  const [date, setDate] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sRes, tRes] = await Promise.all([getSummary(date), getTrends()]);
      setData(sRes.data);
      setTrends(tRes.data.trends || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData() }, [date]);

  const changeMonth = (offset) => {
    let m = date.month + offset; let y = date.year;
    if (m > 12) { m = 1; y++; } else if (m < 1) { m = 12; y--; }
    setDate({ month: m, year: y });
  };

  if (loading) return <PageWrapper><div className="mt-20 text-center animate-pulse text-indigo-400">Analyzing Your Patterns...</div></PageWrapper>;

  return (
    <PageWrapper title="AI Command Center">
      {/* Historical Navigator */}
      <div className="flex items-center justify-between mb-8 bg-gray-900/60 p-4 rounded-2xl border border-gray-800">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-800 rounded-lg text-white"><ChevronLeft /></button>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter">
          {new Date(date.year, date.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-800 rounded-lg text-white"><ChevronRight /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Visualization */}
        <div className="lg:col-span-2 card p-6 border-gray-800 bg-gray-900/30">
          <h3 className="text-white font-bold mb-8 flex items-center gap-2 text-sm"><BarChart3 size={16} className="text-indigo-400"/> Spending Velocity</h3>
          <div className="flex items-end justify-between h-48 gap-4 px-2">
            {trends.slice().reverse().map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-indigo-500/10 border-t-2 border-indigo-500/40 rounded-t-lg hover:bg-indigo-500/30 transition-all" style={{ height: `${(t.total / 50000) * 100}%`, minHeight: '8%' }} />
                <span className="text-[9px] text-gray-500 mt-2 font-bold">{t._id.month}/{t._id.year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Status */}
        <div className="card p-6 border-indigo-500/20 bg-indigo-500/5">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm"><Activity size={16} className="text-indigo-400"/> Behavioral Logic</h3>
          <div className="space-y-5">
            {data?.summary?.slice(0, 4).map(item => (
              <div key={item.category}>
                <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                  <span className="text-gray-400">{item.category}</span>
                  <span className={item.status === 'OVERDOING' ? 'text-red-500' : 'text-emerald-500'}>{item.status}</span>
                </div>
                <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${item.nature === 'FIXED' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${(item.spent / item.allocated) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}