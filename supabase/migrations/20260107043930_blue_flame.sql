/*
  # Career Guidance Platform - Initial Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `current_goal` (text) 
      - `xp_points` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `quizzes`
      - `id` (serial, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `difficulty` (text with check constraint)
      - `created_at` (timestamptz)
    
    - `questions`
      - `id` (serial, primary key) 
      - `quiz_id` (integer, foreign key to quizzes)
      - `question_text` (text)
      - `options` (jsonb for multiple choice options)
      - `correct_answer` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to quizzes and questions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  current_goal text,
  xp_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id serial PRIMARY KEY,
  quiz_id integer NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Quizzes policies (public read)
CREATE POLICY "Anyone can read quizzes"
  ON quizzes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Questions policies (public read)
CREATE POLICY "Anyone can read questions"
  ON questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample quiz data
INSERT INTO quizzes (title, description, category, difficulty) VALUES
('Frontend Developer Assessment', 'Test your knowledge of HTML, CSS, JavaScript, and React fundamentals', 'Frontend Development', 'intermediate'),
('Data Analyst Fundamentals', 'Assess your skills in data analysis, SQL, and statistical thinking', 'Data Analytics', 'beginner'),
('UI/UX Design Principles', 'Evaluate your understanding of design principles, user research, and prototyping', 'Design', 'beginner'),
('Backend Development Skills', 'Test your knowledge of server-side programming, databases, and APIs', 'Backend Development', 'advanced'),
('Digital Marketing Basics', 'Assess your understanding of SEO, social media, and content marketing', 'Marketing', 'beginner'),
('Product Management Essentials', 'Evaluate your knowledge of product strategy, roadmapping, and stakeholder management', 'Product Management', 'intermediate');

-- Insert sample questions for Frontend Developer Assessment
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(1, 'What is the Virtual DOM in React?', '{"A": "A copy of the real DOM kept in memory", "B": "A virtual reality interface", "C": "A database abstraction", "D": "A CSS framework"}', 'A'),
(1, 'Which CSS property is used to create flexible layouts?', '{"A": "display: block", "B": "display: flex", "C": "display: inline", "D": "display: none"}', 'B'),
(1, 'What does useState return in React?', '{"A": "A single value", "B": "An object with methods", "C": "An array with state value and setter function", "D": "A promise"}', 'C');

-- Insert sample questions for Data Analyst Fundamentals  
INSERT INTO questions (quiz_id, question_text, options, correct_answer) VALUES
(2, 'What does SQL stand for?', '{"A": "Structured Query Language", "B": "Simple Question Language", "C": "Sequential Query Logic", "D": "Standard Query Library"}', 'A'),
(2, 'Which measure of central tendency is most affected by outliers?', '{"A": "Mode", "B": "Median", "C": "Mean", "D": "Range"}', 'C'),
(2, 'What type of chart is best for showing trends over time?', '{"A": "Pie chart", "B": "Bar chart", "C": "Line chart", "D": "Scatter plot"}', 'C');