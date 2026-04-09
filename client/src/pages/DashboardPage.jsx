import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, Loader2, RefreshCw, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSummary, getTrends } from '../api/expense.api'
import { getCurrentBudget } from '../api/budget.api'
import { getInsights } from '../api/insights.api'
import { useAuth } from '../context/AuthContext'
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts'

const COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#4338ca','#3730a3','#818cf8']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardPage() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [summary, setSummary]   = useState([])
  const [trends, setTrends]     = useState([])
  const [insights, setInsights] = useState([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading]   = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const [sumRes, trendRes, insightRes] = await Promise.allSettled([
        getSummary({ month: selectedMonth, year: now.getFullYear() }),
        getTrends(),
        getInsights({ month: selectedMonth, year: now.getFullYear() }),
      ])

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value.data.summary || [])
        setTotalSpent(sumRes.value.data.totalSpent || 0)
      }
      if (trendRes.status === 'fulfilled') {
        setTrends(trendRes.value.data.trends.map(t => ({
          month: MONTH_NAMES[t._id.month - 1],
          spent: t.total
        })))
      }
      if (insightRes.status === 'fulfilled') setInsights(insightRes.value.data.insights || [])
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [selectedMonth])

  const income    = user?.monthlyIncome || 0
  const remaining = income - totalSpent
  const currency  = user?.currency === 'INR' ? '₹' : '$'

  const pieData = summary.map((s, i) => ({
    name: s._id, value: s.total, color: COLORS[i % COLORS.length]
  }))

  if (loading) return (
    <PageWrapper title="Dashboard">
      <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-indigo-400" /></div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="Dashboard">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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
            <button onClick={fetchAll} className="btn-secondary p-2.5"><RefreshCw size={16} /></button>
        </div>
        <Link to="/expenses" className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Expense</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-400 font-medium">Monthly Income</p>
          <p className="text-2xl font-bold text-white mt-1">{currency}{income.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 font-medium">Spent This Month</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{currency}{totalSpent.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 font-medium">Remaining Budget</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{currency}{Math.max(0, remaining).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: 12 }} />
              <Area type="monotone" dataKey="spent" stroke="#6366f1" fill="#6366f120" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-white mb-4">Spending by Category</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-40">
              {pieData.map((item) => (
                <div key={item.name} className="flex justify-between text-xs">
                  <span className="text-gray-400">{item.name}</span>
                  <span className="text-white font-bold">{currency}{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-indigo-500/20">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          AI Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {insights.map((insight, i) => (
            <div key={i} className="rounded-xl border border-gray-800 p-4 bg-gray-900/50">
              <p className="text-sm font-bold text-gray-200 mb-1">{insight.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}