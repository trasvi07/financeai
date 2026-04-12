import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage     from './pages/LandingPage'
import LoginPage       from './pages/LoginPage'
import SignupPage      from './pages/SignupPage'
import OnboardingPage  from './pages/OnboardingPage'
import DashboardPage   from './pages/DashboardPage'
import ExpensesPage    from './pages/ExpensesPage'
import BudgetPage      from './pages/BudgetPage'
import InsightsPage    from './pages/InsightsPage'
import SettingsPage    from './pages/SettingsPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute  from './components/common/ProtectedRoute'

function OnboardingGuard({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (isAuthenticated && !user?.onboardingComplete)
    return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"            element={<LandingPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/signup"      element={<SignupPage />} />
          <Route path="/onboarding"  element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/dashboard"   element={<OnboardingGuard><DashboardPage /></OnboardingGuard>} />
          <Route path="/expenses"    element={<OnboardingGuard><ExpensesPage /></OnboardingGuard>} />
          <Route path="/budget"      element={<OnboardingGuard><BudgetPage /></OnboardingGuard>} />
          <Route path="/insights"    element={<OnboardingGuard><InsightsPage /></OnboardingGuard>} />
          <Route path="/settings"    element={<OnboardingGuard><SettingsPage /></OnboardingGuard>} />
          <Route path="*"            element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}