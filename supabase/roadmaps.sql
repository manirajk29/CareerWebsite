-- Drop tables if they exist to ensure clean schema
DROP TABLE IF EXISTS public.roadmap_steps CASCADE;
DROP TABLE IF EXISTS public.roadmaps CASCADE;

-- Create Roadmaps Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    color_gradient TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Roadmap Steps Table
CREATE TABLE IF NOT EXISTS public.roadmap_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone for roadmaps and steps
CREATE POLICY "Roadmaps are viewable by everyone." 
ON public.roadmaps FOR SELECT 
USING (true);

CREATE POLICY "Roadmap steps are viewable by everyone." 
ON public.roadmap_steps FOR SELECT 
USING (true);

-- Insert Sample Data
DO $$
DECLARE
    frontend_id UUID := gen_random_uuid();
    backend_id UUID := gen_random_uuid();
    fs_id UUID := gen_random_uuid();
    devops_id UUID := gen_random_uuid();
    ai_id UUID := gen_random_uuid();
BEGIN
    -- Frontend
    INSERT INTO public.roadmaps (id, title, description, icon_name, color_gradient)
    VALUES (frontend_id, 'Frontend Developer', 'Step by step guide to becoming a modern frontend developer in 2024.', 'Layout', 'from-blue-500 to-cyan-400');

    INSERT INTO public.roadmap_steps (roadmap_id, title, description, step_order)
    VALUES 
        (frontend_id, 'Internet', 'Learn how the internet works, HTTP, DNS, and hosting.', 1),
        (frontend_id, 'HTML', 'Learn the basics of HTML, semantic HTML, forms and validations.', 2),
        (frontend_id, 'CSS', 'Learn CSS basics, layouts (Flexbox/Grid), responsive design, and CSS variables.', 3),
        (frontend_id, 'JavaScript', 'Learn syntax, basic constructs, DOM manipulation, Fetch API, and ES6+ features.', 4),
        (frontend_id, 'Version Control (Git)', 'Learn basic Git commands, branching, and collaborating on GitHub.', 5),
        (frontend_id, 'React', 'Learn components, hooks, state management, and routing.', 6);

    -- Backend
    INSERT INTO public.roadmaps (id, title, description, icon_name, color_gradient)
    VALUES (backend_id, 'Backend Developer', 'Step by step guide to becoming a modern backend developer.', 'Server', 'from-emerald-500 to-teal-400');

    INSERT INTO public.roadmap_steps (roadmap_id, title, description, step_order)
    VALUES 
        (backend_id, 'Internet', 'Learn how the internet works, HTTP/HTTPS, DNS, and hosting.', 1),
        (backend_id, 'Basic Frontend Knowledge', 'Basic understanding of HTML, CSS, and JS to communicate with frontends.', 2),
        (backend_id, 'OS and General Knowledge', 'Terminal usage, memory management, threads vs processes, POSIX basics.', 3),
        (backend_id, 'Pick a Language', 'Learn a language like Python, Node.js, Go, or Java.', 4),
        (backend_id, 'Relational Databases', 'Learn SQL, PostgreSQL, indexing, and normalization.', 5),
        (backend_id, 'APIs', 'Learn REST, JSON APIs, Authentication (JWT/OAuth), and GraphQL.', 6);

    -- Full Stack
    INSERT INTO public.roadmaps (id, title, description, icon_name, color_gradient)
    VALUES (fs_id, 'Full Stack', 'Comprehensive guide to mastering both frontend and backend development.', 'Layers', 'from-purple-500 to-pink-500');

    INSERT INTO public.roadmap_steps (roadmap_id, title, description, step_order)
    VALUES 
        (fs_id, 'Frontend Basics', 'HTML, CSS, JavaScript fundamentals.', 1),
        (fs_id, 'Backend Basics', 'Server logic, APIs, and basic database interaction.', 2),
        (fs_id, 'Database Design', 'Schema design for relational and NoSQL databases.', 3),
        (fs_id, 'Frameworks', 'React (Next.js) and a backend framework (Express/Django).', 4),
        (fs_id, 'DevOps Basics', 'CI/CD, Docker basics, and deployment strategies.', 5);

    -- DevOps
    INSERT INTO public.roadmaps (id, title, description, icon_name, color_gradient)
    VALUES (devops_id, 'DevOps', 'Step by step guide for DevOps, SRE, or Cloud Engineers.', 'Cloud', 'from-orange-500 to-red-500');

    INSERT INTO public.roadmap_steps (roadmap_id, title, description, step_order)
    VALUES 
        (devops_id, 'Learn a Programming Language', 'Python, Go, or Node.js for scripting.', 1),
        (devops_id, 'Operating Systems', 'Linux basics, terminal, file systems, and bash scripting.', 2),
        (devops_id, 'Networking, Security', 'DNS, OSI Model, Firewalls, HTTPS, SSL/TLS.', 3),
        (devops_id, 'Containers & Orchestration', 'Docker containers and Kubernetes introduction.', 4),
        (devops_id, 'Infrastructure as Code', 'Terraform and Ansible.', 5),
        (devops_id, 'CI/CD', 'GitHub Actions, Jenkins, or GitLab CI.', 6);

    -- AI Engineer
    INSERT INTO public.roadmaps (id, title, description, icon_name, color_gradient)
    VALUES (ai_id, 'AI Engineer', 'Guide to becoming an AI and Machine Learning Engineer.', 'Brain', 'from-indigo-500 to-purple-600');

    INSERT INTO public.roadmap_steps (roadmap_id, title, description, step_order)
    VALUES 
        (ai_id, 'Mathematics', 'Linear Algebra, Calculus, Statistics and Probability.', 1),
        (ai_id, 'Programming', 'Python mastery, Numpy, Pandas, Matplotlib.', 2),
        (ai_id, 'Machine Learning', 'Supervised/Unsupervised learning, Scikit-learn.', 3),
        (ai_id, 'Deep Learning', 'Neural networks, PyTorch or TensorFlow.', 4),
        (ai_id, 'Natural Language Processing', 'Transformers, Hugging Face, LLMs.', 5),
        (ai_id, 'MLOps', 'Model deployment, tracking (MLflow), and monitoring.', 6);
END $$;
