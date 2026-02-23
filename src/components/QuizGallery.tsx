import React, { useEffect, useState } from 'react'
import { Brain, Clock, Users, Star, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import QuizInterface from './QuizInterface'
import QuizResults from './QuizResults'

interface Quiz {
  id: number
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

type ViewState = 'gallery' | 'quiz' | 'results'
const QuizGallery: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewState>('gallery')
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null)
  const [selectedQuizTitle, setSelectedQuizTitle] = useState<string>('')
  const [quizResults, setQuizResults] = useState<{ score: number; totalQuestions: number } | null>(null)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setQuizzes(data || [])
      } catch (error) {
        console.error('Error fetching quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuizId(quiz.id)
    setSelectedQuizTitle(quiz.title)
    setCurrentView('quiz')
  }

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    setQuizResults({ score, totalQuestions })
    setCurrentView('results')
  }

  const handleBackToGallery = () => {
    setCurrentView('gallery')
    setSelectedQuizId(null)
    setSelectedQuizTitle('')
    setQuizResults(null)
  }

  const handleRetakeQuiz = () => {
    setCurrentView('quiz')
    setQuizResults(null)
  }

  if (currentView === 'quiz' && selectedQuizId) {
    return (
      <QuizInterface
        quizId={selectedQuizId}
        onBack={handleBackToGallery}
        onComplete={handleQuizComplete}
      />
    )
  }

  if (currentView === 'results' && quizResults) {
    return (
      <QuizResults
        score={quizResults.score}
        totalQuestions={quizResults.totalQuestions}
        quizTitle={selectedQuizTitle}
        onBackToGallery={handleBackToGallery}
        onRetakeQuiz={handleRetakeQuiz}
      />
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'from-green-400 to-emerald-500'
      case 'intermediate':
        return 'from-yellow-400 to-orange-500'
      case 'advanced':
        return 'from-red-400 to-pink-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend development':
        return '🎨'
      case 'backend development':
        return '⚙️'
      case 'data analytics':
        return '📊'
      case 'design':
        return '🎨'
      case 'marketing':
        return '📈'
      case 'product management':
        return '📋'
      default:
        return '💼'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Skill Assessments</h1>
          <p className="text-slate-400">Loading career assessments...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 animate-pulse">
              <div className="h-4 bg-slate-700 rounded mb-4"></div>
              <div className="h-3 bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-700 rounded mb-4"></div>
              <div className="h-8 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Skill Assessments</h1>
        <p className="text-slate-400">Discover your strengths and identify growth opportunities with AI-powered career assessments.</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {['All', 'Beginner', 'Intermediate', 'Advanced'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'All'
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600/50 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-200 hover:transform hover:scale-105 cursor-pointer overflow-hidden group"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/30">
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">
                  {getCategoryIcon(quiz.category)}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(quiz.difficulty)} text-white`}>
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {quiz.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {quiz.description}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>15 min</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Brain className="w-4 h-4" />
                    <span>20 questions</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-slate-400 text-sm">
                  <Users className="w-4 h-4" />
                  <span>2.4k taken</span>
                </div>
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group-hover:shadow-lg">
                  <span onClick={() => handleStartQuiz(quiz)}>Start Assessment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Cards */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Machine Learning Engineer', category: 'AI/ML', icon: '🤖' },
            { title: 'DevOps Specialist', category: 'DevOps', icon: '🔧' },
            { title: 'Cybersecurity Analyst', category: 'Security', icon: '🔒' },
          ].map((quiz, index) => (
            <div
              key={index}
              className="bg-slate-800/20 backdrop-blur-md rounded-xl border border-slate-700/30 p-6 opacity-60"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{quiz.icon}</div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-slate-600 text-slate-300">
                  Coming Soon
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {quiz.title} Assessment
              </h3>
              <p className="text-slate-400 text-sm">
                Test your knowledge in {quiz.category.toLowerCase()} and unlock new career opportunities.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuizGallery