import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Plus, 
  Loader2, RefreshCw, Calendar, ShieldCheck, Zap, AlertCircle 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSummary, getTrends, getRecurringSuggestions } from '../api/expense.api'
import { getCurrentBudget } from '../api/budget.api'
import { getInsights } from '../api/insights.api'
import { useAuth } from '../context/AuthContext'
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts'

const BUCKET_COLORS = { FIXED: '#f43f5e', WEALTH: '#10b981', VARIABLE: '#6366f1' }
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardPage() {
  const { user } = useAuth()
  
  // Temporal State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Data State
  const [buckets, setBuckets] = useState({ FIXED: 0, WEALTH: 0, VARIABLE: 0 })
  const [trends, setTrends] = useState([])
  const [insights, setInsights] = useState([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [recurringNote, setRecurringNote] = useState(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [sumRes, trendRes, insightRes, recurringRes] = await Promise.allSettled([
        getSummary({ month: selectedMonth, year: selectedYear }),
        getTrends(),
        getInsights({ month: selectedMonth, year: selectedYear }),
        getRecurringSuggestions()
      ])

      if (sumRes.status === 'fulfilled') {
        const summaryData = sumRes.value.data.summary || []
        const newBuckets = { FIXED: 0, WEALTH: 0, VARIABLE: 0 }
        
        // Manual Mapping Logic for UI visualization
        summaryData.forEach(item => {
          const fixed = ['Rent', 'Education', 'Utilities', 'Medical']
          const wealth = ['Investment', 'Savings', 'Debt Repayment']
          if (fixed.includes(item._id)) newBuckets.FIXED += item.total
          else if (wealth.includes(item._id)) newBuckets.WEALTH += item.total
          else newBuckets.VARIABLE += item.total
        })
        setBuckets(newBuckets)
        setTotalSpent(sumRes.value.data.totalSpent || 0)
      }

      if (trendRes.status === 'fulfilled') {
        setTrends(trendRes.value.data.trends.map(t => ({
          name: MONTH_NAMES[t._id.month - 1],
          spent: t.total,
        })))
      }

      if (insightRes.status === 'fulfilled') setInsights(insightRes.value.data.insights || [])
      if (recurringRes.status === 'fulfilled' && recurringRes.value.data.suggestions?.length > 0) {
        setRecurringNote(recurringRes.value.data.suggestions[0])
      }
    } catch (err) {
      console.error('Data acquisition failure:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedMonth, selectedYear])

  // --- IIT Engineering: Linear Extrapolation Algorithm ---
  const getProjectedData = () => {
    const now = new Date()
    const isCurrent = (now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear)
    if (!isCurrent || totalSpent === 0) return trends

    const currentDay = now.getDate()
    const totalDays = new Date(selectedYear, selectedMonth, 0).getDate()
    const dailyAvg = totalSpent / currentDay
    const projectionEOM = dailyAvg * totalDays

    const combined = [...trends]
    combined.push({ name: 'EOM (Proj)', spent: Math.round(projectionEOM), isProjection: true })
    return combined
  }

  const income = user?.monthlyIncome || 0
  const currency = user?.currency === 'INR' ? '₹' : '$'
  const savingsRate = income > 0 ? ((buckets.WEALTH / income) * 100).toFixed(1) : 0
  const chartData = getProjectedData()

  const pieData = [
    { name: 'Fixed', value: buckets.FIXED, fill: BUCKET_COLORS.FIXED },
    { name: 'Wealth', value: buckets.WEALTH, fill: BUCKET_COLORS.WEALTH },
    { name: 'Variable', value: buckets.VARIABLE, fill: BUCKET_COLORS.VARIABLE },
  ].filter(d => d.value > 0)

  if (loading) return (
    <PageWrapper title="Intelligence Dashboard">
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
        <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Computing Algorithms...</p>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="Intelligence Dashboard">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field pl-10 py-2 w-32 text-sm bg-gray-900 border-gray-800"
            >
              {MONTH_NAMES.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
          <button onClick={fetchDashboardData} className="btn-secondary p-2.5 rounded-xl border-gray-800">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
        </div>
        <Link to="/expenses" className="btn-primary flex items-center gap-2 text-sm px-6">
          <Plus size={16} /> Add Entry
        </Link>
      </div>

      {/* Recurring Detection Banner */}
      {recurringNote && (
        <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <Zap className="text-indigo-400" size={20} />
            <div>
              <p className="text-sm font-bold text-white">Pattern Recognition: Recurring Bill</p>
              <p className="text-xs text-gray-400">
                AI detected that <span className="text-indigo-300 font-bold">{recurringNote.title}</span> (₹{recurringNote.amount}) is a subscription.
              </p>
            </div>
          </div>
          <button className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/30 px-3 py-1 rounded-lg">Mark as Fixed</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card border-l-4 border-indigo-500">
          <p className="text-xs text-gray-500 uppercase font-bold">Total Liquidity</p>
          <p className="text-3xl font-bold text-white mt-1">{currency}{income.toLocaleString()}</p>
        </div>
        <div className="card border-l-4 border-emerald-500">
          <p className="text-xs text-gray-500 uppercase font-bold">Wealth (Savings Rate)</p>
          <p className="text-3xl font-bold text-white mt-1">{currency}{buckets.WEALTH.toLocaleString()}</p>
          <p className="text-xs text-emerald-500 font-bold mt-1">{savingsRate}% Rate</p>
        </div>
        <div className="card border-l-4 border-rose-500">
          <p className="text-xs text-gray-500 uppercase font-bold">Projected Burn</p>
          <p className="text-3xl font-bold text-white mt-1">
            {currency}{(chartData[chartData.length-1]?.spent || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bucket Pie */}
        <div className="card lg:col-span-1">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-6">Utility Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={8} stroke="none">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {Object.entries(BUCKET_COLORS).map(([key, color]) => (
              <div key={key} className="flex justify-between text-[11px]">
                <span className="text-gray-500">{key}</span>
                <span className="text-white font-bold">{currency}{buckets[key].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Area Chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-6">Linear Burn Projection (EOM)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 10}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                formatter={(v, name, props) => [v, props.payload.isProjection ? 'Projected Total' : 'Spent']}
              />
              <Area 
                type="monotone" 
                dataKey="spent" 
                stroke="#6366f1" 
                fill="url(#colorSpent)" 
                strokeWidth={3} 
                strokeDasharray={(d) => d?.isProjection ? "5 5" : "0"} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card border-indigo-500/20 bg-indigo-500/5">
          <h3 className="font-bold text-white flex items-center gap-2 mb-4">
            <Zap size={18} className="text-indigo-400"/> AI Analysis
          </h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="p-3 bg-gray-900/80 rounded-xl border border-gray-800">
                <p className="text-xs font-bold text-indigo-300">{insight.title}</p>
                <p className="text-[11px] text-gray-500 mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card flex flex-col justify-center items-center text-center">
          <ShieldCheck className="text-emerald-500 mb-2" size={32} />
          <h3 className="text-lg font-bold text-white">Financial Solvency</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-[200px]">
            Runway: <span className="text-white font-bold">{buckets.WEALTH > 0 ? (buckets.WEALTH / (totalSpent || 1)).toFixed(1) : 0} Months</span>
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}