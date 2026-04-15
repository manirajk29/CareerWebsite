/*
  # Add user skill progress tracking

  1. New Tables
    - `user_skill_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `domain_id` (text)
      - `completed_tasks` (jsonb, array of task ids)
      - `question_results` (jsonb, mapping of question id to boolean)
      - `updated_at` (timestamptz)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for users to manage their own progress
*/

CREATE TABLE IF NOT EXISTS public.user_skill_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    domain_id TEXT NOT NULL,
    completed_tasks JSONB DEFAULT '[]'::jsonb NOT NULL,
    question_results JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, domain_id)
);

ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skill progress"
    ON public.user_skill_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill progress"
    ON public.user_skill_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill progress"
    ON public.user_skill_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS user_skill_progress_user_id_idx ON public.user_skill_progress(user_id);
