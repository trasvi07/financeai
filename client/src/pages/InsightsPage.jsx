import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { getSmartAnalysis } from '../api/expense.api'
import { TrendingUp, AlertTriangle, CheckCircle,
         Lightbulb, Zap, Loader2, Droplets } from 'lucide-react'

export default function InsightsPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const now = new Date()
        const res = await getSmartAnalysis({
          month: now.getMonth() + 1,
          year:  now.getFullYear()
        })
        setData(res.data)
      } catch (err) {
        setError('Failed to load insights. Add some expenses first.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <PageWrapper title="AI Insights">
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    </PageWrapper>
  )

  if (error) return (
    <PageWrapper title="AI Insights">
      <div className="card text-center py-16">
        <p className="text-4xl mb-3">💡</p>
        <p className="text-gray-400">{error}</p>
      </div>
    </PageWrapper>
  )

  const { summary, analytics, squeeze, leakage } = data || {}

  return (
    <PageWrapper title="AI Insights">

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Spent',      value: `₹${analytics.totalTransactions ? data.totalSpent?.toLocaleString() : 0}`, color: 'text-white' },
            { label: 'Avg Transaction',  value: `₹${analytics.avgTransactionSize?.toLocaleString()}`, color: 'text-indigo-400' },
            { label: 'Mandatory Spend',  value: `₹${analytics.mandatorySpend?.toLocaleString()}`, color: 'text-green-400' },
            { label: 'Faltu Spend',      value: `₹${analytics.faltuSpend?.toLocaleString()}`, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* LEAKAGE DETECTION */}
      {leakage && leakage.length > 0 && (
        <div className="card border-red-500/20 mb-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-red-400" />
            Leakage Detected
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
              {leakage.length} sources
            </span>
          </h3>
          <div className="space-y-3">
            {leakage.map((leak, i) => (
              <div key={i} className={`rounded-xl border p-4
                ${leak.severity === 'high'   ? 'border-red-500/30 bg-red-500/5'
                : leak.severity === 'medium' ? 'border-amber-500/30 bg-amber-500/5'
                :                              'border-yellow-500/30 bg-yellow-500/5'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${leak.severity === 'high'   ? 'bg-red-500/20 text-red-400'
                        : leak.severity === 'medium' ? 'bg-amber-500/20 text-amber-400'
                        :                              'bg-yellow-500/20 text-yellow-400'}`}>
                        {leak.severity} leakage
                      </span>
                      <span className="text-sm font-medium text-gray-200">{leak.category}</span>
                    </div>
                    <p className="text-sm text-gray-400">{leak.message}</p>
                    <p className="text-xs text-indigo-400 mt-1">💡 {leak.suggestion}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-red-400">
                      ₹{leak.totalLeakage?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{leak.frequency} txns</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SQUEEZE LOG */}
      {squeeze?.squeezeLog && squeeze.squeezeLog.length > 0 && (
        <div className="card border-amber-500/20 mb-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            Auto-Squeeze Activated
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              {squeeze.squeezeLog.filter(s => s.action === 'squeeze').length} adjustments
            </span>
          </h3>
          <div className="space-y-2">
            {squeeze.squeezeLog.map((log, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl
                ${log.action === 'expand'  ? 'bg-red-500/5 border border-red-500/10'
                : log.action === 'squeeze' ? 'bg-amber-500/5 border border-amber-500/10'
                :                            'bg-gray-800/50'}`}>
                <span className="text-base flex-shrink-0">
                  {log.action === 'expand'  ? '🔴'
                  : log.stage === 1         ? '💰'
                  : log.stage === 2         ? '✂️'
                  : log.stage === 3         ? '⚠️'
                  :                           '🚨'}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{log.reason}</p>
                  {log.stage > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">Stage {log.stage} squeeze</p>
                  )}
                </div>
                <span className={`text-sm font-semibold flex-shrink-0
                  ${log.action === 'expand' ? 'text-red-400' : 'text-amber-400'}`}>
                  ₹{log.amount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {summary && summary.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            Spending Breakdown
          </h3>
          <div className="space-y-3">
            {summary.map(({ _id: cat, total, count, type }) => {
              const typeColors = {
                mandatory_need: 'text-green-400 bg-green-500/10',
                faltu_want:     'text-red-400 bg-red-500/10',
                mandatory_want: 'text-amber-400 bg-amber-500/10',
                savings:        'text-blue-400 bg-blue-500/10',
              }
              const typeLabels = {
                mandatory_need: 'Need',
                faltu_want:     'Faltu',
                mandatory_want: 'Want',
                savings:        'Savings',
              }
              return (
                <div key={cat} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[type]}`}>
                      {typeLabels[type]}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-200">{cat}</p>
                      <p className="text-xs text-gray-500">{count} transactions</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-100">₹{total.toLocaleString()}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!summary || summary.length === 0) && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🧠</p>
          <h3 className="font-semibold text-white mb-2">No data to analyze yet</h3>
          <p className="text-gray-400 text-sm">Add expenses to see AI squeeze and leakage analysis</p>
        </div>
      )}

    </PageWrapper>
  )
}