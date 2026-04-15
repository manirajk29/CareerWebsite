import React, { useEffect, useState } from 'react'
import { TrendingUp, Target, Award, BookOpen, Users, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface UserStats {
  xp_points: number
  assessments_completed: number
  current_streak: number
  skill_level: string
}

interface RecentResult {
  id: string
  quiz_title: string
  score: number
  total_questions: number
  completed_at: string
}

interface RoadmapProgress {
  id: string
  title: string
  color: string
  progress: number
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<UserStats>({
    xp_points: 0,
    assessments_completed: 0,
    current_streak: 0,
    skill_level: 'Beginner'
  })
  const [recentResults, setRecentResults] = useState<RecentResult[]>([])
  const [roadmapProgressList, setRoadmapProgressList] = useState<RoadmapProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp_points')
          .eq('id', user.id)
          .single()

        // Fetch user responses count
        const { data: responses } = await supabase
          .from('user_responses')
          .select('id, quiz_id, score, total_questions, completed_at, quizzes(title)')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(5)

        const xpPoints = profile?.xp_points || 0
        const assessmentsCompleted = responses?.length || 0
        
        // Calculate skill level based on XP
        let skillLevel = 'Beginner'
        if (xpPoints >= 500) skillLevel = 'Expert'
        else if (xpPoints >= 200) skillLevel = 'Advanced'
        else if (xpPoints >= 100) skillLevel = 'Intermediate'

        setUserStats({
          xp_points: xpPoints,
          assessments_completed: assessmentsCompleted,
          current_streak: Math.floor(Math.random() * 15) + 1, // Mock streak for now
          skill_level: skillLevel
        })

        // Format recent results
        const formattedResults = responses?.map(response => ({
          id: response.id,
          quiz_title: (response.quizzes as any)?.title || 'Unknown Quiz',
          score: response.score,
          total_questions: response.total_questions,
          completed_at: response.completed_at
        })) || []

        setRecentResults(formattedResults)
        // Fetch dynamic roadmap progress
        const [
          { data: roadmaps },
          { data: allSteps },
          { data: userProgress }
        ] = await Promise.all([
          supabase.from('roadmaps').select('id, title, color_gradient'),
          supabase.from('roadmap_steps').select('id, roadmap_id'),
          supabase.from('user_roadmap_progress').select('step_id').eq('user_id', user.id).eq('status', 'completed')
        ])

        const roadmapStatsMap = new Map<string, { title: string; color: string; total: number; completed: number }>()
        
        if (roadmaps && allSteps) {
          // Initialize map with roadmaps
          roadmaps.forEach(rm => {
            roadmapStatsMap.set(rm.id, { title: rm.title, color: rm.color_gradient || 'from-indigo-500 to-purple-500', total: 0, completed: 0 })
          })

          // Setup completed set for fast lookup
          const completedStepIds = new Set(userProgress?.map(p => p.step_id) || [])

          allSteps.forEach(step => {
            const stat = roadmapStatsMap.get(step.roadmap_id)
            if (stat) {
              stat.total += 1
              if (completedStepIds.has(step.id)) {
                stat.completed += 1
              }
            }
          })
        }

        const formattedProgressList = Array.from(roadmapStatsMap.entries())
          .map(([id, stat]) => ({
            id,
            title: stat.title,
            color: stat.color,
            progress: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
          }))
          .filter(rm => rm.progress > 0) // Only show roadmaps they have started
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 3)

        setRoadmapProgressList(formattedProgressList)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const stats = [
    { label: 'XP Points', value: userStats.xp_points.toLocaleString(), icon: Award, color: 'from-yellow-400 to-orange-500' },
    { label: 'Assessments Completed', value: userStats.assessments_completed.toString(), icon: BookOpen, color: 'from-blue-400 to-cyan-500' },
    { label: 'Current Streak', value: `${userStats.current_streak} days`, icon: TrendingUp, color: 'from-green-400 to-emerald-500' },
    { label: 'Skill Level', value: userStats.skill_level, icon: Target, color: 'from-purple-400 to-pink-500' },
  ]

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your career progress overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-8 bg-slate-700 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6 hover:border-indigo-500/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
          })
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Results */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Assessment Results</h2>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 rounded-lg animate-pulse">
                    <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-700 rounded mb-1"></div>
                      <div className="h-3 bg-slate-700 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-slate-700 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : recentResults.length > 0 ? (
              <div className="space-y-4">
                {recentResults.map((result) => {
                  const percentage = Math.round((result.score / result.total_questions) * 100)
                  const getScoreColor = () => {
                    if (percentage >= 80) return 'text-green-400'
                    if (percentage >= 60) return 'text-yellow-400'
                    return 'text-red-400'
                  }
                  
                  return (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          percentage >= 80 ? 'bg-green-400' :
                          percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{result.quiz_title}</p>
                          <p className="text-slate-400 text-sm">{formatTimeAgo(result.completed_at)}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${getScoreColor()}`}>
                        {percentage}%
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No assessments completed yet</p>
                <p className="text-slate-500 text-sm">Take your first assessment to see results here</p>
              </div>
            )}
          </div>
        </div>

        {/* My Stats */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Learning Progress</h3>
            {roadmapProgressList.length > 0 ? (
              <div className="space-y-4">
                {roadmapProgressList.map(rm => (
                  <div key={rm.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">{rm.title}</span>
                      <span className="text-indigo-400">{rm.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className={`bg-gradient-to-r ${rm.color} h-2 rounded-full`} style={{ width: `${rm.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No progress yet.</p>
                <p className="text-slate-500 text-xs mt-1">Start a roadmap to track your learning!</p>
              </div>
            )}
          </div>

          {/* Community Stats */}
          <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Community</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Following</span>
                </div>
                <span className="text-white font-medium">24</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Followers</span>
                </div>
                <span className="text-white font-medium">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">Badges</span>
                </div>
                <span className="text-white font-medium">7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard