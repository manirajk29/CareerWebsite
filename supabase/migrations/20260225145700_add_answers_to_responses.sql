-- Add answers column to user_responses to track individual quiz answers

ALTER TABLE public.user_responses 
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb;
