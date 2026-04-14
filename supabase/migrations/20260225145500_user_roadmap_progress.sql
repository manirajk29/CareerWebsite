/*
  # Add user roadmap progress tracking

  1. New Tables
    - `user_roadmap_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `step_id` (uuid, references roadmap_steps)
      - `status` (text, check constraint: pending, in-progress, completed)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for users to manage their own progress
*/

CREATE TABLE IF NOT EXISTS public.user_roadmap_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    step_id UUID REFERENCES public.roadmap_steps(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, step_id)
);

ALTER TABLE public.user_roadmap_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
    ON public.user_roadmap_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON public.user_roadmap_progress
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS user_roadmap_progress_user_id_idx ON public.user_roadmap_progress(user_id);
CREATE INDEX IF NOT EXISTS user_roadmap_progress_step_id_idx ON public.user_roadmap_progress(step_id);
