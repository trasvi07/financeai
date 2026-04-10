import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Zap, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';
import { getSummary } from '../api/expense.api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await getSummary();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      toast.error("AI Brain is offline. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
          <p className="text-gray-500 font-medium animate-pulse">Syncing with Aladdin Model...</p>
        </div>
      </PageWrapper>
    );
  }

  const hasData = data?.summary && data.summary.length > 0;
  const dailyBurn = hasData ? (data.totalSpent / new Date().getDate()).toFixed(0) : 0;
  const redFlags = data?.summary?.filter(item => item.status === 'OVERDOING') || [];

  return (
    <PageWrapper title="Intelligence Dashboard">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-indigo-600/5 border-indigo-500/20 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <DollarSign size={24} />
            </div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Monthly Spend</span>
          </div>
          <h2 className="text-3xl font-black text-white">₹{data?.totalSpent?.toLocaleString() || 0}</h2>
          <p className="text-gray-500 text-xs mt-2">Current month total</p>
        </div>

        <div className="card bg-emerald-600/5 border-emerald-500/20 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <TrendingDown size={24} />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Daily Burn</span>
          </div>
          <h2 className="text-3xl font-black text-white">₹{dailyBurn}</h2>
          <p className="text-gray-500 text-xs mt-2">Avg. spend per day</p>
        </div>

        <div className="card bg-amber-600/5 border-amber-500/20 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <AlertTriangle size={24} />
            </div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Active Flags</span>
          </div>
          <h2 className="text-3xl font-black text-white">{redFlags.length}</h2>
          <p className="text-gray-500 text-xs mt-2">Categories overdoing it</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Behavioral Highlights */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap size={20} className="text-indigo-400" /> AI Behavioral Insights
            </h3>
            <Link to="/budget" className="text-indigo-400 text-xs font-bold flex items-center gap-1 hover:underline">
              Full Analysis <ArrowRight size={14} />
            </Link>
          </div>

          {!hasData ? (
            <div className="card border-dashed border-gray-800 py-20 text-center">
              <p className="text-gray-500 text-sm mb-4">No data to analyze yet.</p>
              <Link to="/expenses" className="btn-primary px-6 py-2">Add First Expense</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.summary.slice(0, 4).map((item) => (
                <div key={item.category} className="card border-gray-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${item.nature === 'FIXED' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-white font-bold text-sm">{item.category}</p>
                      <p className="text-gray-500 text-[10px] uppercase font-bold">{item.nature}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">₹{item.spent.toLocaleString()}</p>
                    <p className={`text-[10px] font-black uppercase ${item.status === 'OVERDOING' ? 'text-red-500' : 'text-gray-500'}`}>
                      {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* The "Aladdin" Message Box */}
        <div className="flex flex-col h-full">
            <div className="card bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl flex-grow relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white mb-4">Hello, {localStorage.getItem('user_name') || 'Chief'}</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed mb-6 opacity-90">
                        {redFlags.length > 0 
                          ? `The AI has detected ${redFlags.length} areas where you are over-spending. Your ${redFlags[0].category} habit is the biggest leak this month.`
                          : "Your financial health looks stable. The Aladdin Model shows your 'Fixed' requirements are well-funded."}
                    </p>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                            <p className="text-[9px] uppercase font-black text-white/60">Burn Rate Status</p>
                            <p className="text-white font-bold">{dailyBurn < 500 ? 'Optimal' : 'Elevated'}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            </div>
        </div>
      </div>
    </PageWrapper>
  );
}