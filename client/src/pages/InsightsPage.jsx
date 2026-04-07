import PageWrapper from '../components/layout/PageWrapper'
import { TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react'

const insights = [
  { type: 'warning', icon: AlertTriangle, title: 'Weekend spending spike detected',
    desc: 'You spend 3.2x more on weekends. Saturday is your highest spend day averaging ₹1,800.', color: 'text-amber-400 bg-amber-400/10 border-amber-500/20' },
  { type: 'success', icon: CheckCircle, title: 'Transport spending improving',
    desc: 'You reduced transport costs by 18% this month. Keep it up!', color: 'text-green-400 bg-green-400/10 border-green-500/20' },
  { type: 'info', icon: Lightbulb, title: 'Reduce food spending by 15%',
    desc: 'Cooking at home 3 extra times a week could save you ₹1,350/month.', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20' },
  { type: 'warning', icon: TrendingUp, title: 'Predicted overspend next month',
    desc: 'Based on your pattern, you may exceed budget by ₹2,200 in March. Consider reducing discretionary spending.', color: 'text-red-400 bg-red-400/10 border-red-500/20' },
]

export default function InsightsPage() {
  return (
    <PageWrapper title="AI Insights">
      <div className="space-y-4">
        {insights.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className={`card border flex gap-4 ${color}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.split(' ')[1]}`}>
              <Icon size={18} className={color.split(' ')[0]} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}