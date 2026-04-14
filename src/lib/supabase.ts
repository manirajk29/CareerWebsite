import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          current_goal: string | null
          xp_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          current_goal?: string | null
          xp_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          current_goal?: string | null
          xp_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: number
          title: string
          description: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          category?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
        }
      }
      roadmaps: {
        Row: {
          id: string
          title: string
          description: string
          icon_name: string
          color_gradient: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon_name: string
          color_gradient: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon_name?: string
          color_gradient?: string
          created_at?: string
        }
      }
      roadmap_steps: {
        Row: {
          id: string
          roadmap_id: string
          title: string
          description: string
          step_order: number
          status: 'pending' | 'in-progress' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          title: string
          description: string
          step_order: number
          status?: 'pending' | 'in-progress' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          title?: string
          description?: string
          step_order?: number
          status?: 'pending' | 'in-progress' | 'completed'
          created_at?: string
        }
      }
      user_roadmap_progress: {
        Row: {
          id: string
          user_id: string
          step_id: string
          status: 'pending' | 'in-progress' | 'completed'
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          step_id: string
          status?: 'pending' | 'in-progress' | 'completed'
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          step_id?: string
          status?: 'pending' | 'in-progress' | 'completed'
          completed_at?: string | null
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: number
          quiz_id: number
          question_text: string
          options: any
          correct_answer: string
          created_at: string
        }
        Insert: {
          id?: number
          quiz_id: number
          question_text: string
          options: any
          correct_answer: string
          created_at?: string
        }
        Update: {
          id?: number
          quiz_id?: number
          question_text?: string
          options?: any
          correct_answer?: string
          created_at?: string
        }
      }
      user_responses: {
        Row: {
          id: string
          user_id: string
          quiz_id: number
          score: number
          total_questions: number
          answers: string[]
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: number
          score: number
          total_questions: number
          answers?: string[]
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: number
          score?: number
          total_questions?: number
          answers?: string[]
          completed_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_data?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_data?: any
          created_at?: string
        }
      }
    }
  }
}