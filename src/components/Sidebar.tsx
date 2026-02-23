import React from 'react'
import { Home, Map as MapIcon, Brain, Users, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface SidebarProps {
  activeRoute: string
  onRouteChange: (route: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeRoute, onRouteChange }) => {
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'roadmaps', label: 'Career Roadmaps', icon: MapIcon },
    { id: 'assessments', label: 'Skill Assessments', icon: Brain },
    { id: 'community', label: 'Community', icon: Users },
  ]

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border-r border-slate-800 w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CareerAI</h1>
            <p className="text-sm text-slate-400">Guidance Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeRoute === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onRouteChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-slate-400 text-xs">Member</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar