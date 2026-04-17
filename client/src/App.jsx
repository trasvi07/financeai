import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import SignupPage     from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage  from './pages/DashboardPage'
import ExpensesPage   from './pages/ExpensesPage'
import BudgetPage     from './pages/BudgetPage'
import InsightsPage   from './pages/InsightsPage'
import SettingsPage   from './pages/SettingsPage'
import { AuthProvider, useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function OnboardingGuard({ children }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.onboardingComplete) return <Navigate to="/onboarding" replace />

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"           element={<LandingPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/signup"     element={<SignupPage />} />

          {/* Onboarding — needs login but not completed onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingPage /></ProtectedRoute>
          } />

          {/* App — needs login AND completed onboarding */}
          <Route path="/dashboard"  element={
            <OnboardingGuard><DashboardPage /></OnboardingGuard>
          } />
          <Route path="/expenses"   element={
            <OnboardingGuard><ExpensesPage /></OnboardingGuard>
          } />
          <Route path="/budget"     element={
            <OnboardingGuard><BudgetPage /></OnboardingGuard>
          } />
          <Route path="/insights"   element={
            <OnboardingGuard><InsightsPage /></OnboardingGuard>
          } />
          <Route path="/settings"   element={
            <OnboardingGuard><SettingsPage /></OnboardingGuard>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}