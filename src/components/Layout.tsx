import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import QuizGallery from './QuizGallery'
import CommunityFeed from './CommunityFeed'
import Roadmaps from './Roadmaps'
import Onboarding from './Onboarding'
import SkillTracker from './SkillTracker'

const Layout: React.FC = () => {
  const { user } = useAuth()
  const [activeRoute, setActiveRoute] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    if (!user) return

    const checkOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from('user_responses')
          .select('id')
          .eq('user_id', user.id)
          .eq('quiz_id', 0)
          .limit(1)

        if (error) throw error
        setNeedsOnboarding(data.length === 0)
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [user])

  const renderContent = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <Dashboard />
      case 'assessments':
        return <QuizGallery />
      case 'roadmaps':
        return <Roadmaps />
      case 'skill-tracker':
        return <SkillTracker />
      case 'community':
        return <CommunityFeed />
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={() => setNeedsOnboarding(false)} />
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar activeRoute={activeRoute} onRouteChange={setActiveRoute} />
      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}

export default Layout