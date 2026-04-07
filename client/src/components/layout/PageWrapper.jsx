import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function PageWrapper({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}