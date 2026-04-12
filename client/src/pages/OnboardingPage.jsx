import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign, Target, TrendingUp, ChevronRight,
  Check, Home, Briefcase, Users, Zap, Heart
} from 'lucide-react'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  'Income & Work',
  'Living Situation',
  'Spending Style',
  'Goals',
  'Review'
]

const GOALS = [
  { id: 'emergency', label: 'Build Emergency Fund', icon: '🛡️' },
  { id: 'travel',    label: 'Save for Travel',       icon: '✈️' },
  { id: 'debt',      label: 'Pay Off Debt',           icon: '💳' },
  { id: 'home',      label: 'Buy a Home',             icon: '🏠' },
  { id: 'invest',    label: 'Invest & Grow',          icon: '📈' },
  { id: 'retire',    label: 'Retire Early',           icon: '🌴' },
  { id: 'education', label: 'Education Fund',         icon: '🎓' },
  { id: 'business',  label: 'Start a Business',       icon: '🚀' },
]

const LIFESTYLE_OPTIONS = [
  { id: 'frugal',      label: 'Frugal',      desc: 'I save every rupee I can',         icon: '🌱' },
  { id: 'moderate',    label: 'Moderate',    desc: 'Balance between saving & spending', icon: '⚖️' },
  { id: 'comfortable', label: 'Comfortable', desc: 'I enjoy spending on quality',       icon: '✨' },
  { id: 'lavish',      label: 'Lavish',      desc: 'I live life to the fullest',        icon: '👑' },
]

const WORK_TYPES = [
  { id: 'salaried',   label: 'Salaried',    icon: '🏢' },
  { id: 'freelance',  label: 'Freelance',   icon: '💻' },
  { id: 'business',   label: 'Business',    icon: '🏪' },
  { id: 'student',    label: 'Student',     icon: '🎓' },
  { id: 'other',      label: 'Other',       icon: '🔧' },
]

const HOUSING_TYPES = [
  { id: 'rented', label: 'Rented',      icon: '🏠' },
  { id: 'owned',  label: 'Own Home',    icon: '🏡' },
  { id: 'family', label: 'With Family', icon: '👨‍👩‍👧' },
]

// AI Budget Generator based on user profile
function generateSmartBudget(profile) {
  const {
    monthlyIncome, otherIncome = 0, lifestyle,
    housingType, workType, dependents = 0, goals = []
  } = profile

  const totalIncome   = monthlyIncome + otherIncome
  const spendable     = totalIncome * 0.85  // 15% safety savings

  // Base ratios by lifestyle
  const lifestyleRatios = {
    frugal:      { food: 0.20, transport: 0.08, shopping: 0.05, entertainment: 0.04, health: 0.07, utilities: 0.10, education: 0.08, travel: 0.03, investment: 0.20, other: 0.15 },
    moderate:    { food: 0.25, transport: 0.10, shopping: 0.08, entertainment: 0.06, health: 0.07, utilities: 0.10, education: 0.07, travel: 0.04, investment: 0.13, other: 0.10 },
    comfortable: { food: 0.28, transport: 0.12, shopping: 0.12, entertainment: 0.08, health: 0.08, utilities: 0.10, education: 0.06, travel: 0.06, investment: 0.05, other: 0.05 },
    lavish:      { food: 0.30, transport: 0.15, shopping: 0.18, entertainment: 0.12, health: 0.08, utilities: 0.08, education: 0.04, travel: 0.08, investment: 0.02, other: 0.05 },
  }

  const ratios = lifestyleRatios[lifestyle] || lifestyleRatios.moderate

  // Adjust for housing
  let rentAdjust = housingType === 'rented' ? 0.10 : 0
  let investAdjust = 0

  // Adjust for dependents
  const dependentBoost = dependents * 0.03

  // Adjust for goals
  if (goals.includes('invest') || goals.includes('retire')) investAdjust += 0.05
  if (goals.includes('emergency')) investAdjust += 0.03
  if (goals.includes('debt')) investAdjust += 0.04

  // Build final allocations
  const allocations = [
    { category: 'Food & Dining',  pct: ratios.food        + dependentBoost * 0.5 },
    { category: 'Transport',      pct: ratios.transport   },
    { category: 'Shopping',       pct: ratios.shopping    },
    { category: 'Entertainment',  pct: ratios.entertainment },
    { category: 'Health',         pct: ratios.health      + dependentBoost * 0.3 },
    { category: 'Utilities',      pct: ratios.utilities   + rentAdjust },
    { category: 'Education',      pct: ratios.education   },
    { category: 'Travel',         pct: ratios.travel      },
    { category: 'Investment',     pct: ratios.investment  + investAdjust },
    { category: 'Other',          pct: ratios.other       },
  ]

  // Normalize
  const total = allocations.reduce((a, b) => a + b.pct, 0)
  return allocations.map(a => ({
    category:  a.category,
    allocated: Math.round(spendable * (a.pct / total)),
    spent:     0,
    pct:       Math.round((a.pct / total) * 100)
  }))
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState({
    monthlyIncome: '',
    otherIncome:   '',
    currency:      'INR',
    workType:      'salaried',
    housingType:   'rented',
    dependents:    '0',
    lifestyle:     'moderate',
    goals:         [],
  })

  const set = (field, val) => setData(d => ({ ...d, [field]: val }))

  const toggleGoal = (id) => {
    setData(d => ({
      ...d,
      goals: d.goals.includes(id)
        ? d.goals.filter(g => g !== id)
        : [...d.goals, id]
    }))
  }

  const budget = generateSmartBudget({
    ...data,
    monthlyIncome: Number(data.monthlyIncome) || 0,
    otherIncome:   Number(data.otherIncome)   || 0,
    dependents:    Number(data.dependents)    || 0,
  })

  const totalIncome  = (Number(data.monthlyIncome) || 0) + (Number(data.otherIncome) || 0)
  const currSymbol   = data.currency === 'INR' ? '₹' : '$'

  const handleFinish = async () => {
    setLoading(true)
    try {
      await API.put('/api/auth/onboarding', {
        monthlyIncome: Number(data.monthlyIncome),
        otherIncome:   Number(data.otherIncome) || 0,
        currency:      data.currency,
        topCategories: budget.slice(0, 4).map(b => b.category),
        goals:         data.goals,
        lifestyle:     data.lifestyle,
        dependents:    Number(data.dependents) || 0,
        housingType:   data.housingType,
        workType:      data.workType,
      })

      // Auto-generate budget
      await API.post('/api/budget/generate', {
        month: new Date().getMonth() + 1,
        year:  new Date().getFullYear(),
      })

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const canNext = [
    data.monthlyIncome && Number(data.monthlyIncome) > 0,
    data.housingType && data.workType,
    data.lifestyle,
    data.goals.length > 0,
    true,
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">FinanceAI</span>
          </div>
          <p className="text-gray-400 text-sm">Let's personalize your financial plan</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                  ${i < step  ? 'bg-indigo-600 text-white'
                  : i === step ? 'bg-indigo-600/30 border-2 border-indigo-500 text-indigo-400'
                  :              'bg-gray-800 text-gray-600'}`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 w-8 sm:w-14 mx-1 transition-all
                    ${i < step ? 'bg-indigo-600' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs ${i === step ? 'text-indigo-400' : 'text-gray-600'}`}
                style={{ width: '20%', textAlign: i === 0 ? 'left' : i === STEPS.length - 1 ? 'right' : 'center' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="card">

          {/* ── STEP 0: Income & Work ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Income & Work</h2>
                <p className="text-gray-400 text-sm">This shapes your entire budget model</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Currency</label>
                  <select className="input-field" value={data.currency}
                    onChange={e => set('currency', e.target.value)}>
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Dependents</label>
                  <select className="input-field" value={data.dependents}
                    onChange={e => set('dependents', e.target.value)}>
                    {[0,1,2,3,4,5].map(n => (
                      <option key={n} value={n}>{n === 0 ? 'None' : `${n} ${n === 1 ? 'person' : 'people'}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Monthly Income <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {currSymbol}
                  </span>
                  <input type="number" className="input-field pl-8" placeholder="e.g. 50000"
                    value={data.monthlyIncome}
                    onChange={e => set('monthlyIncome', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Other Monthly Income
                  <span className="text-gray-500 font-normal ml-2">(freelance, rent, etc.)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {currSymbol}
                  </span>
                  <input type="number" className="input-field pl-8" placeholder="0"
                    value={data.otherIncome}
                    onChange={e => set('otherIncome', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Work Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {WORK_TYPES.map(w => (
                    <button key={w.id} onClick={() => set('workType', w.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all
                        ${data.workType === w.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                      <span className="text-lg">{w.icon}</span>
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(1)}
                disabled={!canNext[0]}
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
                <p className="text-gray-400 text-sm">Helps AI understand your fixed costs</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Housing</label>
                <div className="grid grid-cols-3 gap-3">
                  {HOUSING_TYPES.map(h => (
                    <button key={h.id} onClick={() => set('housingType', h.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all
                        ${data.housingType === h.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                      <span className="text-2xl">{h.icon}</span>
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {data.housingType === 'rented' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-sm text-amber-400 flex items-center gap-2">
                    <span>⚠️</span>
                    Rent will be auto-added as a mandatory fixed cost in your budget
                  </p>
                </div>
              )}

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Your Profile So Far</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Income</span>
                  <span className="text-sm font-bold text-white">
                    {currSymbol}{totalIncome.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Work Type</span>
                  <span className="text-sm text-indigo-400 capitalize">{data.workType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Dependents</span>
                  <span className="text-sm text-indigo-400">{data.dependents}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={() => setStep(2)}
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
                <p className="text-gray-400 text-sm">AI uses this to set realistic category limits</p>
              </div>

              <div className="space-y-3">
                {LIFESTYLE_OPTIONS.map(l => (
                  <button key={l.id} onClick={() => set('lifestyle', l.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all
                      ${data.lifestyle === l.id
                        ? 'bg-indigo-600/20 border-indigo-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                    <span className="text-3xl">{l.icon}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${data.lifestyle === l.id ? 'text-indigo-300' : 'text-gray-200'}`}>
                        {l.label}
                      </p>
                      <p className="text-sm text-gray-400">{l.desc}</p>
                    </div>
                    {data.lifestyle === l.id && (
                      <Check size={18} className="text-indigo-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={() => setStep(3)}
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
                <p className="text-gray-400 text-sm">Select all that apply — AI adjusts your budget accordingly</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                      ${data.goals.includes(g.id)
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'}`}>
                    <span className="text-xl flex-shrink-0">{g.icon}</span>
                    <span className="text-sm font-medium">{g.label}</span>
                    {data.goals.includes(g.id) && (
                      <Check size={14} className="text-indigo-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={() => setStep(4)} disabled={data.goals.length === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  Preview Budget <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review & AI Budget Preview ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Your AI Budget Preview</h2>
                <p className="text-gray-400 text-sm">
                  Based on your {data.lifestyle} lifestyle · {currSymbol}{totalIncome.toLocaleString()}/mo income
                </p>
              </div>

              {/* Summary chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: '💼', label: data.workType },
                  { icon: '🏠', label: data.housingType },
                  { icon: '👨‍👩‍👧', label: `${data.dependents} dependents` },
                  { icon: '✨', label: data.lifestyle },
                ].map(chip => (
                  <span key={chip.label}
                    className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full">
                    {chip.icon} {chip.label}
                  </span>
                ))}
              </div>

              {/* Budget allocations */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {budget.map(({ category, allocated, pct }) => {
                  const barColors = {
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
                  return (
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
                        <div className={`h-full rounded-full ${barColors[category] || 'bg-indigo-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Savings highlight */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-400">Monthly Savings Target</p>
                  <p className="text-xs text-gray-400 mt-0.5">15% safety buffer locked in</p>
                </div>
                <p className="text-xl font-bold text-green-400">
                  {currSymbol}{Math.round(totalIncome * 0.15).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={handleFinish} disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Setting up...</>
                    : '🚀 Launch My Budget'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Step indicator text */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </p>
      </div>
    </div>
  )
}