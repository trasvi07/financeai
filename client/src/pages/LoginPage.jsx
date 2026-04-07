import API from '../api/axios'
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    const { data } = await API.post('/api/auth/login', {
      email: form.email,
      password: form.password
    })
    login(data.user, data.token)
    navigate(data.user.onboardingComplete ? '/dashboard' : '/onboarding')
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed. Please try again.')
  } finally {
    setLoading(false)
  }
}