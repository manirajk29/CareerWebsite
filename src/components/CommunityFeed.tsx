import React, { useEffect, useState } from 'react'
import { Users, Activity, Award, Brain, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ActivityItem {
  id: string
  user_name: string
  activity_type: string
  activity_data: {
    quiz_title?: string
    score?: number
    total_questions?: number
    xp_gained?: number
  }
  created_at: string
}

const CommunityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select(`
            id,
            activity_type,
            activity_data,
            created_at,
            profiles!activities_user_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        const formattedActivities = data?.map(activity => ({
          id: activity.id,
          user_name: (activity.profiles as any)?.full_name || 'Anonymous User',
          activity_type: activity.activity_type,
          activity_data: activity.activity_data,
          created_at: activity.created_at
        })) || []

        setActivities(formattedActivities)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    // Set up real-time subscription
    const subscription = supabase
      .channel('activities')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'activities' },
        (payload) => {
          // Fetch the new activity with profile data
          fetchActivities()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'quiz_completed':
        return Brain
      case 'achievement_earned':
        return Award
      case 'level_up':
        return TrendingUp
      default:
        return Activity
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'quiz_completed':
        return 'from-blue-400 to-cyan-500'
      case 'achievement_earned':
        return 'from-yellow-400 to-orange-500'
      case 'level_up':
        return 'from-green-400 to-emerald-500'
      default:
        return 'from-slate-400 to-slate-500'
    }
  }

  const formatActivityMessage = (activity: ActivityItem) => {
    const { activity_type, activity_data, user_name } = activity
    
    switch (activity_type) {
      case 'quiz_completed':
        const percentage = activity_data.score && activity_data.total_questions 
          ? Math.round((activity_data.score / activity_data.total_questions) * 100)
          : 0
        return {
          message: `completed the ${activity_data.quiz_title} assessment`,
          detail: `Scored ${percentage}% and earned ${activity_data.xp_gained || 0} XP`
        }
      case 'achievement_earned':
        return {
          message: `earned a new achievement`,
          detail: activity_data.quiz_title || 'Achievement unlocked'
        }
      case 'level_up':
        return {
          message: `leveled up!`,
          detail: `Reached a new skill level`
        }
      default:
        return {
          message: 'had some activity',
          detail: 'Keep up the great work!'
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Community Feed</h1>
        <p className="text-slate-400">See what other learners are achieving in real-time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">2,847</div>
              <div className="text-slate-400 text-sm">Active Learners</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">15,432</div>
              <div className="text-slate-400 text-sm">Assessments Taken</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">8,921</div>
              <div className="text-slate-400 text-sm">Achievements Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <Activity className="w-5 h-5 text-slate-400" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-32"></div>
                </div>
                <div className="h-3 bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type)
              const color = getActivityColor(activity.activity_type)
              const { message, detail } = formatActivityMessage(activity)
              
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-slate-700/30 transition-colors">
                  <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white">
                      <span className="font-medium">{activity.user_name}</span>{' '}
                      <span className="text-slate-300">{message}</span>
                    </p>
                    <p className="text-slate-400 text-sm truncate">{detail}</p>
                  </div>
                  <div className="text-slate-500 text-sm flex-shrink-0">
                    {formatTimeAgo(activity.created_at)}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No recent activity</p>
            <p className="text-slate-500 text-sm">Be the first to complete an assessment!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommunityFeed