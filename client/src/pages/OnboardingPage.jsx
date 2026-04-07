import API from '../api/axios'

const handleFinish = async () => {
  try {
    await API.put('/api/auth/onboarding', {
      monthlyIncome: Number(data.monthlyIncome),
      currency: data.currency,
      topCategories: data.topCategories,
      goals: data.goals,
    })
    navigate('/dashboard')
  } catch (err) {
    console.error('Onboarding error:', err)
    navigate('/dashboard') // continue anyway
  }
}