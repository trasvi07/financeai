import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, 
  Loader2, RefreshCw, Calendar, Wallet, CheckCircle 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSummary, getTrends, getRecurringSuggestions } from '../api/expense.api'
import { getInsights } from '../api/insights.api'
import { useAuth } from '../context/AuthContext'
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts'

const COLORS = { BILLS: '#22c55e', SAVINGS: '#6366f1', DAILY: '#3b82f6' }
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardPage() {
  const { user } = useAuth()
  
  // Simple State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [buckets, setBuckets] = useState({ BILLS: 0, SAVINGS: 0, DAILY: 0 })
  const [trends, setTrends] = useState([])
  const [insights, setInsights] = useState([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [sumRes, trendRes, insightRes] = await Promise.allSettled([
        getSummary({ month: selectedMonth, year: selectedYear }),
        getTrends(),
        getInsights({ month: selectedMonth, year: selectedYear }),
      ])

      if (sumRes.status === 'fulfilled') {
        const summaryData = sumRes.value.data.summary || []
        const newBuckets = { BILLS: 0, SAVINGS: 0, DAILY: 0 }
        
        summaryData.forEach(item => {
          const bills = ['Rent', 'Education', 'Utilities', 'Medical']
          const savings = ['Investment', 'Savings', 'Debt']
          if (bills.includes(item._id)) newBuckets.BILLS += item.total
          else if (savings.includes(item._id)) newBuckets.SAVINGS += item.total
          else newBuckets.DAILY += item.total
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
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboard() }, [selectedMonth, selectedYear])

  const income = user?.monthlyIncome || 0
  const currency = user?.currency === 'INR' ? '₹' : '$'
  
  // Prediction Logic
  const getChartData = () => {
    const now = new Date()
    const isCurrent = (now.getMonth() + 1 === selectedMonth)
    if (!isCurrent || totalSpent === 0) return trends

    const currentDay = now.getDate()
    const totalDays = new Date(selectedYear, selectedMonth, 0).getDate()
    const projection = (totalSpent / currentDay) * totalDays

    return [...trends, { name: 'Estimated End', spent: Math.round(projection), isForecast: true }]
  }

  const pieData = [
    { name: 'Bills', value: buckets.BILLS, fill: COLORS.BILLS },
    { name: 'Savings', value: buckets.SAVINGS, fill: COLORS.SAVINGS },
    { name: 'Daily', value: buckets.DAILY, fill: COLORS.DAILY },
  ].filter(d => d.value > 0)

  if (loading) return (
    <PageWrapper title="Dashboard">
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-gray-500 text-sm">Loading your data...</p>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="Dashboard">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field pl-10 py-2 w-36 text-sm"
            >
              {MONTH_NAMES.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
          <button onClick={loadDashboard} className="btn-secondary p-2.5">
            <RefreshCw size={16} />
          </button>
        </div>
        <Link to="/expenses" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Expense
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card border-l-4 border-indigo-500">
          <p className="text-xs text-gray-500 font-bold uppercase">Monthly Salary</p>
          <p className="text-2xl font-bold text-white mt-1">{currency}{income.toLocaleString()}</p>
        </div>
        <div className="card border-l-4 border-green-500">
          <p className="text-xs text-gray-500 font-bold uppercase">Saved This Month</p>
          <p className="text-2xl font-bold text-white mt-1">{currency}{buckets.SAVINGS.toLocaleString()}</p>
        </div>
        <div className="card border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 font-bold uppercase">Total Spent</p>
          <p className="text-2xl font-bold text-white mt-1">{currency}{totalSpent.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Simple Pie Chart */}
        <div className="card lg:col-span-1">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-6">Where it went</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={80} stroke="none">
                {pieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {Object.entries(COLORS).map(([key, color]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-500">{key === 'BILLS' ? 'Fixed Bills' : key === 'SAVINGS' ? 'Investments' : 'Daily Life'}</span>
                <span className="text-white font-bold">{currency}{buckets[key].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Line Chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-6">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
              <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '8px' }} />
              <Area 
                type="monotone" 
                dataKey="spent" 
                stroke="#6366f1" 
                fill="#6366f120" 
                strokeWidth={3} 
                strokeDasharray={(d) => d?.isForecast ? "5 5" : "0"} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Tips & Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-indigo-500/5">
          <h3 className="font-bold text-white flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-indigo-400"/> AI Spending Tips
          </h3>
          <div className="space-y-3">
            {insights.length > 0 ? insights.map((insight, i) => (
              <div key={i} className="p-3 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-xs font-bold text-indigo-300">{insight.title}</p>
                <p className="text-[11px] text-gray-500 mt-1">{insight.description}</p>
              </div>
            )) : <p className="text-xs text-gray-500 italic">Add more data to see AI tips!</p>}
          </div>
        </div>
        
        <div className="card flex flex-col justify-center items-center text-center">
          <Wallet className="text-gray-700 mb-2" size={40} />
          <h3 className="text-lg font-bold text-white">Emergency Buffer</h3>
          <p className="text-sm text-gray-500 mt-2">
            You can survive <span className="text-white font-bold">{buckets.SAVINGS > 0 ? (buckets.SAVINGS / (totalSpent || 1)).toFixed(1) : 0} months</span> without salary based on your current savings.
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}