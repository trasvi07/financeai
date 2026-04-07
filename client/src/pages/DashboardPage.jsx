import PageWrapper from '../components/layout/PageWrapper'
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, Mic } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

const pieData = [
  { name: 'Food', value: 8500, color: '#6366f1' },
  { name: 'Transport', value: 3200, color: '#8b5cf6' },
  { name: 'Shopping', value: 5400, color: '#a78bfa' },
  { name: 'Health', value: 2100, color: '#c4b5fd' },
  { name: 'Other', value: 1800, color: '#4338ca' },
]

const lineData = [
  { month: 'Oct', spent: 18000, budget: 22000 },
  { month: 'Nov', spent: 24000, budget: 22000 },
  { month: 'Dec', spent: 19500, budget: 22000 },
  { month: 'Jan', spent: 21000, budget: 22000 },
  { month: 'Feb', spent: 17800, budget: 22000 },
  { month: 'Mar', spent: 20100, budget: 22000 },
]

const stats = [
  { label: 'Monthly Income',  value: '₹50,000', icon: DollarSign, color: 'text-green-400',  bg: 'bg-green-400/10',  change: null },
  { label: 'Spent This Month',value: '₹20,100', icon: TrendingDown,color: 'text-red-400',    bg: 'bg-red-400/10',    change: '-8% vs last month' },
  { label: 'Remaining Budget',value: '₹29,900', icon: TrendingUp,  color: 'text-indigo-400', bg: 'bg-indigo-400/10', change: 'On track ✓' },
  { label: 'Savings Goal',    value: '68%',      icon: Target,      color: 'text-amber-400',  bg: 'bg-amber-400/10',  change: '₹8,500 saved' },
]

export default function DashboardPage() {
  return (
    <PageWrapper title="Dashboard">
      {/* Quick actions */}
      <div className="flex gap-3 mb-6">
        <Link to="/expenses" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Expense
        </Link>
        <button className="btn-secondary flex items-center gap-2 text-sm">
          <Mic size={16} /> Voice Entry
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
            {change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line chart */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Spending vs Budget</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, color: '#f3f4f6' }}
                formatter={v => [`₹${v.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="spent" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Spent" />
              <Line type="monotone" dataKey="budget" stroke="#374151" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Budget" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Spending by Category</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 flex-1">
              {pieData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-sm text-gray-400">{name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-200">₹{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card border-indigo-500/20">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          AI Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: '⚠️', title: 'Food overspend risk', desc: 'You\'ve spent 78% of food budget with 12 days left.', color: 'border-amber-500/20 bg-amber-500/5' },
            { emoji: '✅', title: 'Transport on track', desc: 'You\'re 15% under transport budget this month.', color: 'border-green-500/20 bg-green-500/5' },
            { emoji: '🎯', title: 'Goal progress', desc: 'You\'re on track to hit savings goal by June.', color: 'border-indigo-500/20 bg-indigo-500/5' },
          ].map(({ emoji, title, desc, color }) => (
            <div key={title} className={`rounded-xl border p-4 ${color}`}>
              <p className="text-lg mb-1">{emoji}</p>
              <p className="text-sm font-medium text-gray-200 mb-1">{title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}