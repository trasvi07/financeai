
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Receipt, PieChart, Lightbulb,
  Settings, LogOut, Zap, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses',  icon: Receipt,         label: 'Expenses'  },
  { to: '/budget',    icon: PieChart,        label: 'Budget'    },
  { to: '/insights',  icon: Lightbulb,       label: 'Insights'  },
  { to: '/settings',  icon: Settings,        label: 'Settings'  },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800
        z-30 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">FinanceAI</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
                ${isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  )
}