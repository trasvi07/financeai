import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { getInsights } from '../api/insights.api'
import { AlertTriangle, CheckCircle, Lightbulb, TrendingUp, Loader2, Sparkles } from 'lucide-react'

export default function InsightsPage() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await getInsights()
        setInsights(data.insights)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInsights()
  }, [])

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return <AlertTriangle size={20} className="text-amber-400" />
      case 'danger':  return <TrendingUp size={20} className="text-red-400" />
      case 'success': return <CheckCircle size={20} className="text-green-400" />
      default:        return <Lightbulb size={20} className="text-indigo-400" />
    }
  }

  const getStyles = (type) => {
    switch(type) {
      case 'warning': return 'border-amber-500/20 bg-amber-500/5'
      case 'danger':  return 'border-red-500/20 bg-red-500/5'
      case 'success': return 'border-green-500/20 bg-green-500/5'
      default:        return 'border-indigo-500/20 bg-indigo-500/5'
    }
  }

  if (loading) return (
    <PageWrapper title="AI Insights">
      <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-indigo-500" /></div>
    </PageWrapper>
  )

  return (
    <PageWrapper title="AI Insights">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg"><Sparkles className="text-indigo-400" size={24} /></div>
        <div>
          <h2 className="text-xl font-bold text-white">Smart Analysis</h2>
          <p className="text-sm text-gray-400">AI patterns detected from your last 30 days of activity.</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.length > 0 ? insights.map((insight, index) => (
          <div key={index} className={`card border flex gap-4 p-5 animate-slide-up ${getStyles(insight.type)}`}>
            <div className="flex-shrink-0 mt-1">{getIcon(insight.type)}</div>
            <div>
              <h3 className="font-bold text-gray-100 mb-1">{insight.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        )) : (
          <div className="card text-center py-20 border-dashed border-gray-800">
            <p className="text-gray-500 italic">No patterns detected yet. Log more expenses to train the AI.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}