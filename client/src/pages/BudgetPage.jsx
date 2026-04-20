import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { getCurrentBudget, generateBudget } from '../api/budget.api'
import { useAuth } from '../context/AuthContext'
import { Brain, RefreshCw, Loader2, TrendingUp, Shield, ShoppingBag, Heart } from 'lucide-react'

const TYPE_CONFIG = {
  need: {
    label:  'Need',
    color:  'bg-blue-500',
    badge:  'bg-blue-500/10 text-blue-400',
    icon:   Heart,
    desc:   'Flexible — expands when necessary',
    border: 'border-blue-500/20',
  },
  want: {
    label:  'Want',
    color:  'bg-purple-500',
    badge:  'bg-purple-500/10 text-purple-400',
    icon:   ShoppingBag,
    desc:   'Capped — shows alert when over',
    border: 'border-purple-500/20',
  },
  savings: {
    label:  'Savings',
    color:  'bg-green-500',
    badge:  'bg-green-500/10 text-green-400',
    icon:   Shield,
    desc:   'Always protected first',
    border: 'border-green-500/20',
  },
  other: {
    label:  'Other',
    color:  'bg-gray-500',
    badge:  'bg-gray-500/10 text-gray-400',
    icon:   TrendingUp,
    desc:   'Miscellaneous spending',
    border: 'border-gray-500/20',
  },
}

const CATEGORY_ICONS = {
  'Food & Dining': '🍔',
  'Transport':     '🚗',
  'Shopping':      '🛒',
  'Entertainment': '🎬',
  'Health':        '💊',
  'Utilities':     '⚡',
  'Education':     '📚',
  'Travel':        '✈️',
  'Investment':    '📈',
  'Other':         '💰',
}

export default function BudgetPage() {
  const [budget, setBudget]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [regen, setRegen]     = useState(false)
  const { user }              = useAuth()

  const currSymbol = user?.currency === 'INR' ? '₹' : '$'

  useEffect(() => { fetchBudget() }, [])

  const fetchBudget = async () => {
    setLoading(true)
    try {
      const { data } = await getCurrentBudget()
      setBudget(data.budget)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setRegen(true)
    try {
      const { data } = await generateBudget({
        month: new Date().getMonth() + 1,
        year:  new Date().getFullYear(),
      })
      setBudget(data.budget)
    } catch (err) {
      console.error(err)
    } finally {
      setRegen(false)
    }
  }

  if (loading) return (
    <PageWrapper title="AI Budget">
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    </PageWrapper>
  )

  if (!budget) return (
    <PageWrapper title="AI Budget">
      <div className="card text-center py-16">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-gray-400 mb-4">No budget found</p>
        <button onClick={handleRegenerate} className="btn-primary">Generate Budget</button>
      </div>
    </PageWrapper>
  )

  const allocations = budget.allocations || []

  // Group by type
  const grouped = { need: [], want: [], savings: [], other: [] }
  allocations.forEach(a => {
    const type = a.type || 'other'
    if (grouped[type]) grouped[type].push(a)
    else grouped.other.push(a)
  })

  // Totals by type
  const typeTotals = {}
  Object.entries(grouped).forEach(([type, items]) => {
    typeTotals[type] = {
      allocated: items.reduce((s, a) => s + a.allocated, 0),
      spent:     items.reduce((s, a) => s + a.spent, 0),
    }
  })

  const totalSpent     = allocations.reduce((s, a) => s + a.spent, 0)
  const totalAllocated = budget.totalBudgeted || allocations.reduce((s, a) => s + a.allocated, 0)
  const totalIncome    = budget.totalIncome || 0

  return (
    <PageWrapper title="AI Budget">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="card border-indigo-500/20 flex-1 mr-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain size={20} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">AI-Generated Budget</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Based on your {user?.lifestyle || 'moderate'} lifestyle ·
                Needs flex automatically · Wants are capped
              </p>
            </div>
          </div>
        </div>
        <button onClick={handleRegenerate} disabled={regen}
          className="btn-secondary flex items-center gap-2 text-sm whitespace-nowrap">
          {regen
            ? <Loader2 size={16} className="animate-spin" />
            : <RefreshCw size={16} />}
          Regenerate
        </button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Income',  value: `${currSymbol}${totalIncome.toLocaleString()}`,    color: 'text-white'        },
          { label: 'Budgeted',      value: `${currSymbol}${totalAllocated.toLocaleString()}`, color: 'text-indigo-400'   },
          { label: 'Spent',         value: `${currSymbol}${totalSpent.toLocaleString()}`,     color: 'text-amber-400'    },
          { label: 'Remaining',     value: `${currSymbol}${Math.max(0, totalAllocated - totalSpent).toLocaleString()}`,
            color: totalSpent > totalAllocated ? 'text-red-400' : 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Type summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(TYPE_CONFIG).map(([type, config]) => {
          const { allocated, spent } = typeTotals[type] || { allocated: 0, spent: 0 }
          const Icon = config.icon
          const over = type !== 'need' && spent > allocated
          return (
            <div key={type} className={`card border ${config.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={config.badge.split(' ')[1]} />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-lg font-bold text-white">{currSymbol}{allocated.toLocaleString()}</p>
              <p className={`text-xs mt-0.5 ${over ? 'text-red-400' : 'text-gray-500'}`}>
                {over ? `⚠️ ${currSymbol}${(spent - allocated).toLocaleString()} over` : `spent ${currSymbol}${spent.toLocaleString()}`}
              </p>
            </div>
          )
        })}
      </div>

      {/* Category cards by group */}
      {Object.entries(grouped).map(([type, items]) => {
        if (items.length === 0) return null
        const config = TYPE_CONFIG[type]
        const Icon   = config.icon
        return (
          <div key={type} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className={config.badge.split(' ')[1]} />
              <h3 className="font-semibold text-gray-300 text-sm uppercase tracking-wide">
                {config.label}s
              </h3>
              <span className="text-xs text-gray-600">— {config.desc}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map(({ category, allocated, spent }) => {
                const pct  = allocated > 0 ? Math.min((spent / allocated) * 100, 150) : 0
                const over = spent > allocated
                // Needs never show as "over" — they flex
                const showOver = over && type !== 'need'
                const barW = Math.min(pct, 100)

                return (
                  <div key={category} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[category] || '💰'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{category}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${config.badge}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${showOver ? 'text-red-400' : 'text-gray-100'}`}>
                          {currSymbol}{spent.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          of {currSymbol}{allocated.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500
                          ${showOver         ? 'bg-red-500'
                          : type === 'need'  ? 'bg-blue-500'
                          : type === 'savings'? 'bg-green-500'
                          :                    config.color}`}
                        style={{ width: `${barW}%` }}
                      />
                    </div>

                    {/* Status */}
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-600">{Math.round(pct)}% used</span>
                      {type === 'need' && over ? (
                        <span className="text-xs text-blue-400">
                          ✓ Flexed +{currSymbol}{(spent - allocated).toLocaleString()}
                        </span>
                      ) : showOver ? (
                        <span className="text-xs text-red-400">
                          ⚠️ {currSymbol}{(spent - allocated).toLocaleString()} over
                        </span>
                      ) : (
                        <span className="text-xs text-green-400">
                          {currSymbol}{Math.max(0, allocated - spent).toLocaleString()} left
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

    </PageWrapper>
  )
}