import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import AuthForm from './components/AuthForm'
import Layout from './components/Layout'
import Landing from './components/Landing'

function App() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && !showAuth) {
    return <Landing onGetStarted={() => setShowAuth(true)} />
  }

  if (!user && showAuth) {
    return <AuthForm onBack={() => setShowAuth(false)} />
  }

  return <Layout />
}

export default App