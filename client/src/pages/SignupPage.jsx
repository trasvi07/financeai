import API from '../api/axios'
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  if (form.password.length < 6) {
    setError('Password must be at least 6 characters')
    return
  }
  setLoading(true)
  try {
    const { data } = await API.post('/api/auth/signup', {
      name: form.name,
      email: form.email,
      password: form.password
    })
    login(data.user, data.token)
    navigate('/onboarding')
  } catch (err) {
    setError(err.response?.data?.message || 'Signup failed. Please try again.')
  } finally {
    setLoading(false)
  }
}