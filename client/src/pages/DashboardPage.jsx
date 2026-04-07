import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSummary, getTrends } from '../api/expense.api'
import { getCurrentBudget } from '../api/budget.api'
import { getInsights } from '../api/insights.api'
import { useAuth } from '../context/AuthContext'
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

const COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#4338ca','#3730a3','#818cf8']

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary]   = useState([])
  const [trends, setTrends]     = useState([])
  const [budget, setBudget]     = useState(null)
  const [insights, setInsights] = useState([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const now = new Date()
        const [sumRes, trendRes, budgetRes, insightRes] = await Promise.allSettled([
          getSummary({ month: now.getMonth() + 1, year: now.getFullYear() }),
          getTrends(),
          getCurrentBudget(),
          getInsights(),
        ])

        if (sumRes.status === 'fulfilled') {
          setSummary(sumRes.value.data.summary)
          setTotalSpent(sumRes.value.data.totalSpent)
        }
        if (trendRes.status === 'fulfilled') {
          setTrends(trendRes.value.data.trends.map(t => ({
            month: MONTH_NAMES[t._id.month - 1],
            spent: t.total,
            budget: budgetRes.value?.data?.budget?.totalBudgeted || 0
          })))
        }
        if (budgetRes.status === 'fulfilled') setBudget(budgetRes.value.data.budget)
        if (insightRes.status === 'fulfilled') setInsights(insightRes.value.data.insights.slice(0, 3))
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const income    = user?.monthlyIncome || 0
  const remaining = income - totalSpent
  const currency  = user?.currency === 'INR' ? '₹' : '$'

  const pieData = summary.map((s, i) => ({
    name: s._id, value: s.total, color: COLORS[i % COLORS.length]
  }))

  if (loading) return (
    <PageWrapper title="Dashboard">
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="Dashboard">
      {/* Quick actions */}
      <div className="flex gap-3 mb-6">
        <Link to="/expenses" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Expense
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Monthly Income',   value: `${currency}${income.toLocaleString()}`,     icon: DollarSign, color: 'text-green-400',  bg: 'bg-green-400/10'  },
          { label: 'Spent This Month', value: `${currency}${totalSpent.toLocaleString()}`,  icon: TrendingDown,color: 'text-red-400',    bg: 'bg-red-400/10'    },
          { label: 'Remaining',        value: `${currency}${Math.max(0,remaining).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          { label: 'Budget Categories',value: budget?.allocations?.length || 0,             icon: Target,      color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line chart */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Spending Trend</h3>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${currency}${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, color: '#f3f4f6' }}
                  formatter={v => [`${currency}${v.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 4 }} name="Spent" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm">Add expenses to see trends</p>
              </div>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Spending by Category</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-48">
                {pieData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-xs text-gray-400 truncate">{name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-200 ml-2">
                      {currency}{value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-3xl mb-2">🥧</p>
                <p className="text-sm">No spending data yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="card border-indigo-500/20">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            AI Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {insights.map(({ type, title, description }) => {
              const styles = {
                warning: 'border-amber-500/20 bg-amber-500/5',
                success: 'border-green-500/20 bg-green-500/5',
                danger:  'border-red-500/20 bg-red-500/5',
                info:    'border-indigo-500/20 bg-indigo-500/5',
              }
              const emojis = { warning:'⚠️', success:'✅', danger:'🚨', info:'💡' }
              return (
                <div key={title} className={`rounded-xl border p-4 ${styles[type] || styles.info}`}>
                  <p className="text-lg mb-1">{emojis[type] || '💡'}</p>
                  <p className="text-sm font-medium text-gray-200 mb-1">{title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalSpent === 0 && (
        <div className="card text-center border-dashed border-gray-700 mt-4">
          <p className="text-4xl mb-3">🚀</p>
          <h3 className="font-semibold text-white mb-2">Start tracking your expenses</h3>
          <p className="text-gray-400 text-sm mb-4">Add your first expense to see AI insights and analytics</p>
          <Link to="/expenses" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus size={16} /> Add First Expense
          </Link>
        </div>
      )}
    </PageWrapper>
  )
}