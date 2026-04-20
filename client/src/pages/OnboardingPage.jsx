import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Check, Zap, Shield } from 'lucide-react'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Income & Work', 'Living Situation', 'Spending Style', 'Goals', 'Review']

const GOALS = [
  { id: 'Build Emergency Fund', label: 'Build Emergency Fund', icon: '🛡️' },
  { id: 'Save for Travel',      label: 'Save for Travel',      icon: '✈️' },
  { id: 'Pay Off Debt',         label: 'Pay Off Debt',         icon: '💳' },
  { id: 'Buy a Home',           label: 'Buy a Home',           icon: '🏠' },
  { id: 'Invest More',          label: 'Invest & Grow',        icon: '📈' },
  { id: 'Retire Early',         label: 'Retire Early',         icon: '🌴' },
  { id: 'Education Fund',       label: 'Education Fund',       icon: '🎓' },
  { id: 'Start a Business',     label: 'Start a Business',     icon: '🚀' },
]

const LIFESTYLE_OPTIONS = [
  { id: 'frugal',      label: 'Frugal',      desc: 'I save every rupee I can',         icon: '🌱' },
  { id: 'moderate',    label: 'Moderate',    desc: 'Balance between saving & spending', icon: '⚖️' },
  { id: 'comfortable', label: 'Comfortable', desc: 'I enjoy spending on quality',       icon: '✨' },
  { id: 'lavish',      label: 'Lavish',      desc: 'I live life to the fullest',        icon: '👑' },
]

const WORK_TYPES = [
  { id: 'salaried',  label: 'Salaried',  icon: '🏢' },
  { id: 'freelance', label: 'Freelance', icon: '💻' },
  { id: 'business',  label: 'Business',  icon: '🏪' },
  { id: 'student',   label: 'Student',   icon: '🎓' },
  { id: 'other',     label: 'Other',     icon: '🔧' },
]

const HOUSING_TYPES = [
  { id: 'rented', label: 'Rented',      icon: '🏠' },
  { id: 'owned',  label: 'Own Home',    icon: '🏡' },
  { id: 'family', label: 'With Family', icon: '👨‍👩‍👧' },
]

const BAR_COLORS = {
  'Food & Dining': 'bg-orange-500',
  'Transport':     'bg-blue-500',
  'Shopping':      'bg-purple-500',
  'Entertainment': 'bg-pink-500',
  'Health':        'bg-green-500',
  'Utilities':     'bg-yellow-500',
  'Education':     'bg-cyan-500',
  'Travel':        'bg-red-500',
  'Investment':    'bg-emerald-500',
  'Other':         'bg-gray-500',
}

function generateSmartBudget({ monthlyIncome=0, otherIncome=0, lifestyle='moderate', housingType='rented', dependents=0, goals=[] }) {
  const totalIncome = monthlyIncome + otherIncome
  const spendable   = totalIncome * 0.85

  const base = {
    frugal:      { 'Food & Dining':0.20,'Transport':0.08,'Shopping':0.05,'Entertainment':0.04,'Health':0.07,'Utilities':0.10,'Education':0.08,'Travel':0.03,'Investment':0.20,'Other':0.15 },
    moderate:    { 'Food & Dining':0.25,'Transport':0.10,'Shopping':0.08,'Entertainment':0.06,'Health':0.07,'Utilities':0.10,'Education':0.07,'Travel':0.04,'Investment':0.13,'Other':0.10 },
    comfortable: { 'Food & Dining':0.28,'Transport':0.12,'Shopping':0.12,'Entertainment':0.08,'Health':0.08,'Utilities':0.10,'Education':0.06,'Travel':0.06,'Investment':0.05,'Other':0.05 },
    lavish:      { 'Food & Dining':0.30,'Transport':0.15,'Shopping':0.18,'Entertainment':0.12,'Health':0.08,'Utilities':0.08,'Education':0.04,'Travel':0.08,'Investment':0.02,'Other':0.05 },
  }

  const ratios = { ...base[lifestyle] || base.moderate }

  if (housingType === 'rented') ratios['Utilities'] = (ratios['Utilities'] || 0) + 0.05
  ratios['Food & Dining'] = (ratios['Food & Dining'] || 0) + dependents * 0.02
  if (goals.includes('Invest More') || goals.includes('Retire Early')) ratios['Investment'] = (ratios['Investment'] || 0) + 0.05
  if (goals.includes('Build Emergency Fund')) ratios['Investment'] = (ratios['Investment'] || 0) + 0.03
  if (goals.includes('Pay Off Debt'))         ratios['Investment'] = (ratios['Investment'] || 0) + 0.04

  const total = Object.values(ratios).reduce((a, b) => a + b, 0)

  return Object.entries(ratios).map(([category, pct]) => ({
    category,
    allocated: Math.round(spendable * (pct / total)),
    pct:       Math.round((pct / total) * 100),
    color:     BAR_COLORS[category] || 'bg-indigo-500',
  }))
}

export default function OnboardingPage() {
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const { updateUser }        = useAuth()
  const navigate              = useNavigate()

  const [formData, setFormData] = useState({
    monthlyIncome: '',
    otherIncome:   '',
    currency:      'INR',
    workType:      'salaried',
    housingType:   'rented',
    dependents:    '0',
    lifestyle:     'moderate',
    goals:         [],
  })

  const set = (field, val) => setFormData(prev => ({ ...prev, [field]: val }))

  const toggleGoal = (id) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter(g => g !== id)
        : [...prev.goals, id]
    }))
  }

  const totalIncome = (Number(formData.monthlyIncome) || 0) + (Number(formData.otherIncome) || 0)
  const currSymbol  = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[formData.currency] || '₹'

  const budget = generateSmartBudget({
    monthlyIncome: Number(formData.monthlyIncome) || 0,
    otherIncome:   Number(formData.otherIncome)   || 0,
    lifestyle:     formData.lifestyle,
    housingType:   formData.housingType,
    dependents:    Number(formData.dependents)    || 0,
    goals:         formData.goals,
  })

  const handleFinish = async () => {
    setLoading(true)
    try {
      await API.put('/api/auth/onboarding', {
        monthlyIncome: Number(formData.monthlyIncome),
        otherIncome:   Number(formData.otherIncome) || 0,
        currency:      formData.currency,
        topCategories: budget.slice(0, 4).map(b => b.category),
        goals:         formData.goals,
        lifestyle:     formData.lifestyle,
        dependents:    Number(formData.dependents) || 0,
        housingType:   formData.housingType,
        workType:      formData.workType,
      })
      await API.post('/api/budget/generate', {
        month: new Date().getMonth() + 1,
        year:  new Date().getFullYear(),
      })
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      updateUser({ onboardingComplete: true })
      navigate('/dashboard')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">FinanceAI</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Set up your financial profile</h1>
          <p className="text-gray-400 text-sm mt-1">Takes 2 minutes · Personalizes your entire experience</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-1 mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                  ${i < step    ? 'bg-indigo-600 text-white'
                  : i === step  ? 'bg-indigo-600/30 border-2 border-indigo-500 text-indigo-400'
                  :               'bg-gray-800 text-gray-600'}`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-6 sm:w-10 transition-all ${i < step ? 'bg-indigo-600' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500">
            Step {step + 1} of {STEPS.length} —{' '}
            <span className="text-indigo-400">{STEPS[step]}</span>
          </p>
        </div>

        {/* Card */}
        <div className="card">

          {/* ── STEP 0: Income & Work ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Income & Work</h2>
                <p className="text-sm text-gray-400">Foundation of your entire budget model</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label>
                  <select className="input-field" value={formData.currency}
                    onChange={e => set('currency', e.target.value)}>
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Dependents</label>
                  <select className="input-field" value={formData.dependents}
                    onChange={e => set('dependents', e.target.value)}>
                    {[0,1,2,3,4,5].map(n => (
                      <option key={n} value={n}>
                        {n === 0 ? 'None' : `${n} ${n === 1 ? 'person' : 'people'}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Monthly Income <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{currSymbol}</span>
                  <input type="number" min="1" className="input-field pl-8"
                    placeholder="e.g. 50000"
                    value={formData.monthlyIncome}
                    onChange={e => set('monthlyIncome', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Other Income
                  <span className="text-gray-500 text-xs font-normal ml-1">(freelance, rent — optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{currSymbol}</span>
                  <input type="number" min="0" className="input-field pl-8"
                    placeholder="0"
                    value={formData.otherIncome}
                    onChange={e => set('otherIncome', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Work Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {WORK_TYPES.map(w => (
                    <button key={w.id} type="button" onClick={() => set('workType', w.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all
                        ${formData.workType === w.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                      <span className="text-lg">{w.icon}</span>
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={() => setStep(1)}
                disabled={!formData.monthlyIncome || Number(formData.monthlyIncome) <= 0}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                Continue <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── STEP 1: Living Situation ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Living Situation</h2>
                <p className="text-sm text-gray-400">Helps AI understand your fixed costs</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Housing</label>
                <div className="grid grid-cols-3 gap-3">
                  {HOUSING_TYPES.map(h => (
                    <button key={h.id} type="button" onClick={() => set('housingType', h.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all
                        ${formData.housingType === h.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                      <span className="text-2xl">{h.icon}</span>
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.housingType === 'rented' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-sm text-amber-400">⚠️ Rent will be treated as a mandatory fixed cost</p>
                </div>
              )}

              <div className="bg-gray-800/60 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Your Profile</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Income</span>
                  <span className="font-bold text-white">{currSymbol}{totalIncome.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Work</span>
                  <span className="text-indigo-400 capitalize">{formData.workType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Dependents</span>
                  <span className="text-indigo-400">{formData.dependents === '0' ? 'None' : formData.dependents}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
                <button type="button" onClick={() => setStep(2)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Lifestyle ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Your Spending Style</h2>
                <p className="text-sm text-gray-400">AI uses this to set realistic limits per category</p>
              </div>

              <div className="space-y-3">
                {LIFESTYLE_OPTIONS.map(l => (
                  <button key={l.id} type="button" onClick={() => set('lifestyle', l.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all
                      ${formData.lifestyle === l.id
                        ? 'bg-indigo-600/20 border-indigo-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                    <span className="text-3xl">{l.icon}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${formData.lifestyle === l.id ? 'text-indigo-300' : 'text-gray-200'}`}>
                        {l.label}
                      </p>
                      <p className="text-sm text-gray-400">{l.desc}</p>
                    </div>
                    {formData.lifestyle === l.id && <Check size={18} className="text-indigo-400" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                <button type="button" onClick={() => setStep(3)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Goals ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Financial Goals</h2>
                <p className="text-sm text-gray-400">
                  Select all that apply — AI adjusts your budget to help reach them
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                      ${formData.goals.includes(g.id)
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'}`}
                  >
                    <span className="text-2xl flex-shrink-0">{g.icon}</span>
                    <span className="text-sm font-medium leading-tight">{g.label}</span>
                    {formData.goals.includes(g.id) && (
                      <Check size={14} className="text-indigo-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {formData.goals.length === 0 && (
                <p className="text-center text-xs text-gray-500">Select at least one goal to continue</p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                <button type="button" onClick={() => setStep(4)}
                  disabled={formData.goals.length === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  Preview Budget <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Budget Preview ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Your AI Budget Preview</h2>
                <p className="text-sm text-gray-400">
                  {currSymbol}{totalIncome.toLocaleString()}/mo ·{' '}
                  <span className="capitalize">{formData.lifestyle}</span> lifestyle
                </p>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  `💼 ${formData.workType}`,
                  `🏠 ${formData.housingType}`,
                  `👨‍👩‍👧 ${formData.dependents === '0' ? 'No dependents' : `${formData.dependents} dependents`}`,
                  `✨ ${formData.lifestyle}`,
                ].map(chip => (
                  <span key={chip}
                    className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full">
                    {chip}
                  </span>
                ))}
              </div>

              {/* Selected goals */}
              <div className="flex flex-wrap gap-2">
                {formData.goals.map(g => (
                  <span key={g}
                    className="text-xs bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full">
                    {GOALS.find(x => x.id === g)?.icon} {g}
                  </span>
                ))}
              </div>

              {/* Budget bars */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {budget.map(({ category, allocated, pct, color }) => (
                  <div key={category} className="bg-gray-800/60 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-300">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{pct}%</span>
                        <span className="text-sm font-bold text-white">
                          {currSymbol}{allocated.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Savings highlight */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-400">Monthly Savings Protected</p>
                    <p className="text-xs text-gray-400">Always reserved — never touched for wants</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-400">
                  {currSymbol}{Math.round(totalIncome * 0.15).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1 py-3">Back</button>
                <button type="button" onClick={handleFinish} disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting up...</>
                    : '🚀 Launch My Budget'
                  }
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}