import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface Question {
  id: number
  question_text: string
  options: Record<string, string>
  correct_answer: string
}

interface Quiz {
  id: number
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface QuizInterfaceProps {
  quizId: number
  onBack: () => void
  onComplete: (score: number, totalQuestions: number) => void
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quizId, onBack, onComplete }) => {
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        // Fetch quiz details
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()

        if (quizError) throw quizError

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('id')

        if (questionsError) throw questionsError

        setQuiz(quizData)
        setQuestions(questionsData || [])
        setUserAnswers(new Array(questionsData?.length || 0).fill(''))
      } catch (error) {
        console.error('Error fetching quiz data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizData()
  }, [quizId])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || '')
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || '')
    }
  }

  const getOptionsArray = (options: Record<string, string>) => {
    return Object.entries(options).map(([key, value]) => ({ key, value }))
  }

  const handleSubmit = async () => {
    if (!user || !quiz) return

    setSubmitting(true)
    try {
      // Calculate score
      let score = 0
      questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct_answer) {
          score++
        }
      })

      // Save user response
      const { error: responseError } = await supabase
        .from('user_responses')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score,
          total_questions: questions.length
        })

      if (responseError) throw responseError

      // Update user XP
      const xpGained = score * 10 // 10 XP per correct answer
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          xp_points: supabase.sql`xp_points + ${xpGained}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Create activity
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          activity_type: 'quiz_completed',
          activity_data: {
            quiz_title: quiz.title,
            score,
            total_questions: questions.length,
            xp_gained: xpGained
          }
        })

      if (activityError) throw activityError

      onComplete(score, questions.length)
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-6 bg-slate-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-8">
          <div className="space-y-4">
            <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-slate-700 rounded animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Quiz Not Found</h2>
        <p className="text-slate-400 mb-6">The quiz you're looking for doesn't exist or has no questions.</p>
        <button
          onClick={onBack}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Assessments
        </button>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Assessments</span>
        </button>
        <div className="flex items-center space-x-4 text-slate-400">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <span>{currentQuestionIndex + 1} of {questions.length}</span>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
        <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
        <p className="text-slate-400">{quiz.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-4">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-8">
        <h2 className="text-xl font-semibold text-white mb-6">
          {currentQuestion.question_text}
        </h2>

        <div className="space-y-3">
          {getOptionsArray(currentQuestion.options).map(({ key, value }) => (
            <button
              key={key}
              onClick={() => handleAnswerSelect(key)}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                selectedAnswer === key
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                  : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedAnswer === key
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-slate-500'
                }`}>
                  {selectedAnswer === key && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-medium text-slate-400 mr-2">{key}.</span>
                <span>{value}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!selectedAnswer || submitting}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>
            {submitting 
              ? 'Submitting...' 
              : currentQuestionIndex === questions.length - 1 
                ? 'Submit Quiz' 
                : 'Next'
            }
          </span>
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export default QuizInterface