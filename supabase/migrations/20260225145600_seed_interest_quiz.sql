-- Seed Career Interest Quiz

INSERT INTO public.quizzes (id, title, description, category, difficulty)
VALUES (0, 'Career Interest Quiz', 'Discover your ideal career path based on your interests and preferences.', 'Onboarding', 'beginner')
ON CONFLICT (id) DO NOTHING;

-- Insert Questions for Career Interest Quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer)
VALUES 
    (0, 'What subjects do you enjoy most?', '{"A": "Mathematics & Science", "B": "Art & Design", "C": "Business & Management", "D": "Literature & Social Studies"}', 'A'),
    (0, 'What kind of problems do you like solving?', '{"A": "Logical & Technical", "B": "Visual & Creative", "C": "People & Resource oriented", "D": "Analytical & Data-driven"}', 'A'),
    (0, 'Which of these areas interests you the most?', '{"A": "Building software and apps", "B": "Creating beautiful user interfaces", "C": "Leading teams and projects", "D": "Protecting systems and data"}', 'A'),
    (0, 'What is your preferred working style?', '{"A": "Deep focus on complex tasks", "B": "Collaborative brainstorming", "C": "Strategic planning and coordination", "D": "Analyzing trends and patterns"}', 'A'),
    (0, 'I prefer working on:', '{"A": "The underlying logic of a system", "B": "The parts people interact with directly", "C": "Ensuring the whole project runs smoothly", "D": "How information is used to make decisions"}', 'A')
ON CONFLICT DO NOTHING;
