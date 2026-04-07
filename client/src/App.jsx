import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import BudgetPage from './pages/BudgetPage'
import InsightsPage from './pages/InsightsPage'
import SettingsPage from './pages/SettingsPage'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingPage /></ProtectedRoute>
          }/>
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          }/>
          <Route path="/expenses" element={
            <ProtectedRoute><ExpensesPage /></ProtectedRoute>
          }/>
          <Route path="/budget" element={
            <ProtectedRoute><BudgetPage /></ProtectedRoute>
          }/>
          <Route path="/insights" element={
            <ProtectedRoute><InsightsPage /></ProtectedRoute>
          }/>
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}