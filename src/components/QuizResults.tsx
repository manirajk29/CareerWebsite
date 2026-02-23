import React from 'react'
import { CheckCircle, XCircle, Award, TrendingUp, ArrowRight } from 'lucide-react'

interface QuizResultsProps {
  score: number
  totalQuestions: number
  quizTitle: string
  onBackToGallery: () => void
  onRetakeQuiz: () => void
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  quizTitle,
  onBackToGallery,
  onRetakeQuiz
}) => {
  const percentage = Math.round((score / totalQuestions) * 100)
  const xpGained = score * 10

  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: 'Excellent', color: 'from-green-400 to-emerald-500', icon: CheckCircle }
    if (percentage >= 70) return { level: 'Good', color: 'from-blue-400 to-cyan-500', icon: CheckCircle }
    if (percentage >= 50) return { level: 'Average', color: 'from-yellow-400 to-orange-500', icon: CheckCircle }
    return { level: 'Needs Improvement', color: 'from-red-400 to-pink-500', icon: XCircle }
  }

  const performance = getPerformanceLevel()
  const Icon = performance.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`w-20 h-20 bg-gradient-to-br ${performance.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
        <p className="text-slate-400">You've finished the {quizTitle} assessment</p>
      </div>

      {/* Results Card */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-8">
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-white mb-2">{percentage}%</div>
          <div className={`text-xl font-semibold bg-gradient-to-r ${performance.color} bg-clip-text text-transparent`}>
            {performance.level}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className="text-slate-400 text-sm">Correct Answers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalQuestions}</div>
            <div className="text-slate-400 text-sm">Total Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">+{xpGained}</div>
            <div className="text-slate-400 text-sm">XP Gained</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Your Score</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div 
              className={`bg-gradient-to-r ${performance.color} h-3 rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-slate-700/30 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Performance Feedback</h3>
          <div className="space-y-2 text-slate-300">
            {percentage >= 90 && (
              <>
                <p>🎉 Outstanding performance! You have excellent knowledge in this area.</p>
                <p>💡 Consider exploring advanced topics or mentoring others in this field.</p>
              </>
            )}
            {percentage >= 70 && percentage < 90 && (
              <>
                <p>👍 Good job! You have a solid understanding of the fundamentals.</p>
                <p>💡 Focus on the areas you missed to reach expert level.</p>
              </>
            )}
            {percentage >= 50 && percentage < 70 && (
              <>
                <p>📚 You're on the right track but there's room for improvement.</p>
                <p>💡 Review the concepts and practice more to strengthen your knowledge.</p>
              </>
            )}
            {percentage < 50 && (
              <>
                <p>📖 This assessment shows areas where you can grow significantly.</p>
                <p>💡 Consider taking a course or finding learning resources in this field.</p>
              </>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-white font-medium">XP Earned</div>
                <div className="text-yellow-400 text-sm">+{xpGained} Experience Points</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              <div>
                <div className="text-white font-medium">Progress Made</div>
                <div className="text-indigo-400 text-sm">Assessment Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRetakeQuiz}
          className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Retake Quiz
        </button>
        <button
          onClick={onBackToGallery}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Back to Assessments</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default QuizResults