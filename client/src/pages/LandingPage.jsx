import { Link } from 'react-router-dom'
import { Zap, TrendingUp, Brain, Shield, ChevronRight, BarChart3, Mic, Target } from 'lucide-react'

const features = [
  { icon: Brain,      title: 'AI Budget Engine',     desc: 'Personalized budgets based on your actual behavior — not rigid rules.' },
  { icon: Mic,        title: 'Voice Expense Entry',  desc: 'Say "spent 500 on food" and it\'s logged instantly.' },
  { icon: TrendingUp, title: 'Spending Predictions', desc: 'Know next month\'s spending before it happens.' },
  { icon: Target,     title: 'Goal Tracking',        desc: 'Set financial goals and watch AI reallocate budgets to hit them.' },
  { icon: BarChart3,  title: 'Deep Analytics',       desc: 'Understand your weekend spikes, daily patterns and more.' },
  { icon: Shield,     title: 'Bank-grade Security',  desc: 'JWT auth, encrypted data, protected routes.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">FinanceAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-400 hover:text-white px-4 py-2 text-sm transition-colors">
              Login
            </Link>
            <Link to="/signup" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-sm px-4 py-1.5 rounded-full mb-6">
            <Zap size={14} />
            AI-Powered Personal Finance
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Your money, understood by{' '}
            <span className="text-indigo-400">AI</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track expenses with your voice, get budgets that actually fit your life,
            and let AI predict your financial future before it happens.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-3">
              Start for Free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '60%', label: 'Behavior-driven budget' },
            { value: 'AI', label: 'Auto-categorization' },
            { value: '∞', label: 'Dynamic adjustments' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-indigo-400 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-gray-400 text-lg">Built for people who want to actually understand their money.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:border-indigo-500/30 transition-all duration-300 group">
                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 transition-all">
                  <Icon size={20} className="text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center card border-indigo-500/20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to take control?</h2>
          <p className="text-gray-400 mb-8">Join thousands getting smarter with their money every day.</p>
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-500 text-sm">
        © 2025 FinanceAI. Built with React + Node.js + MongoDB.
      </footer>
    </div>
  )
}