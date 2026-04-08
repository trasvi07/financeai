import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Target, TrendingUp, ChevronRight, Check } from 'lucide-react'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext' // Added this import

const STEPS      = ['Income', 'Spending Profile', 'Financial Goals']
const CATEGORIES = ['Food & Dining','Transport','Shopping','Entertainment','Health','Utilities','Education','Other']
const GOALS      = ['Build Emergency Fund','Save for Travel','Pay Off Debt','Buy a Home','Invest More','Retire Early']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    monthlyIncome: '', currency: 'INR',
    topCategories: [], goals: [],
  })
  
  const navigate = useNavigate()
  const { login } = useAuth() // Access the login function to refresh user state

  const toggleItem = (field, val) => {
    setData(d => ({
      ...d,
      [field]: d[field].includes(val)
        ? d[field].filter(x => x !== val)
        : [...d[field], val]
    }))
  }

  const handleFinish = async () => {
    try {
      const response = await API.put('/api/auth/onboarding', {
        monthlyIncome: Number(data.monthlyIncome),
        currency:      data.currency,
        topCategories: data.topCategories,
        goals:         data.goals,
      })

      if (response.data.success) {
        // CRITICAL FIX: Update the global AuthContext with the updated user data
        // This ensures Dashboard immediately sees the new income/salary
        const token = localStorage.getItem('token')
        login(response.data.user, token)
        
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Onboarding error:', err)
      // Fallback if update fails but we want to let them in
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${i < step  ? 'bg-indigo-600 text-white'
                  : i === step ? 'bg-indigo-600/20 border-2 border-indigo-500 text-indigo-400'
                  :              'bg-gray-800 text-gray-500'}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-16 sm:w-24 ${i < step ? 'bg-indigo-600' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-3">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>

        <div className="card">
          {/* Step 0: Income */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign size={28} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">What's your monthly income?</h2>
                <p className="text-gray-400 mt-2 text-sm">This helps AI set realistic budgets for you</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label>
                <select className="input-field" value={data.currency}
                  onChange={e => setData(d => ({ ...d, currency: e.target.value }))}>
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Monthly Income</label>
                <input type="number" className="input-field" placeholder="e.g. 50000"
                  value={data.monthlyIncome}
                  onChange={e => setData(d => ({ ...d, monthlyIncome: e.target.value }))} />
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                disabled={!data.monthlyIncome} onClick={() => setStep(1)}>
                Continue <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 1: Spending Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={28} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Where do you spend most?</h2>
                <p className="text-gray-400 mt-2 text-sm">Select your top spending categories</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => toggleItem('topCategories', cat)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left
                      ${data.topCategories.includes(cat)
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'}`}>
                    {data.topCategories.includes(cat) && <Check size={12} className="inline mr-1.5" />}
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={() => setStep(2)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
                  disabled={data.topCategories.length === 0}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Financial Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target size={28} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">What are your goals?</h2>
                <p className="text-gray-400 mt-2 text-sm">AI will reallocate budgets to help you reach them</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {GOALS.map(goal => (
                  <button key={goal} onClick={() => toggleItem('goals', goal)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left
                      ${data.goals.includes(goal)
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'}`}>
                    {data.goals.includes(goal) && <Check size={12} className="inline mr-1.5" />}
                    {goal}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={handleFinish}
                  className="btn-primary flex-1 py-3"
                  disabled={data.goals.length === 0}>
                  Generate My Budget 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}