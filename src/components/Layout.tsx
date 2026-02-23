import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import QuizGallery from './QuizGallery'
import CommunityFeed from './CommunityFeed'
import Roadmaps from './Roadmaps'

const Layout: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState('dashboard')

  const renderContent = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <Dashboard />
      case 'assessments':
        return <QuizGallery />
      case 'roadmaps':
        return <Roadmaps />
      case 'community':
        return <CommunityFeed />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      <Sidebar activeRoute={activeRoute} onRouteChange={setActiveRoute} />
      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}

export default Layout