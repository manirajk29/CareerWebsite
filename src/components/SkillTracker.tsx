import React, { useState, useMemo } from 'react';
import {
    Layout, Server, Layers, Cloud, Brain,
    ChevronRight, ArrowLeft, CheckCircle2, Circle, Lock,
    Zap, Target, Trophy, TrendingUp, BookOpen, Wrench,
    MessageSquare, ClipboardList, Flag, Star, Rocket,
    ChevronDown, ChevronUp, PlayCircle, Award, BarChart2
} from 'lucide-react';

// ─── Domain Data ────────────────────────────────────────────────────────────

interface Question {
    id: string;
    text: string;
    options: string[];
    answer: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    explanation: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    type: 'reading' | 'coding' | 'project' | 'quiz';
    xp: number;
    estimatedTime: string;
}

interface Checkpoint {
    id: string;
    label: string;
    skills: string[];
    unlocksAt: number; // completed tasks required
}

interface Domain {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    border: string;
    badge: string;
    questions: Question[];
    tasks: Task[];
    checkpoints: Checkpoint[];
}

const DOMAINS: Domain[] = [
    {
        id: 'frontend',
        title: 'Frontend Development',
        description: 'Master HTML, CSS, JavaScript, React and build stunning user interfaces.',
        icon: Layout,
        gradient: 'from-blue-500 to-cyan-500',
        border: 'border-blue-500/40',
        badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        questions: [
            { id: 'fe-q1', text: 'Which CSS property makes an element a flex container?', options: ['display: flex', 'position: flex', 'flex: true', 'layout: flex'], answer: 0, difficulty: 'Easy', explanation: 'display: flex turns the element into a flex container, enabling Flexbox layout for its children.' },
            { id: 'fe-q2', text: 'What does the "useState" hook return in React?', options: ['A DOM element', 'A state value and a setter function', 'A component class', 'An event handler'], answer: 1, difficulty: 'Easy', explanation: 'useState returns a tuple: the current state value and a function to update it.' },
            { id: 'fe-q3', text: 'What is the Virtual DOM in React?', options: ['A browser API', 'A lightweight in-memory representation of the actual DOM', 'A CSS engine', 'A server-side rendering tool'], answer: 1, difficulty: 'Medium', explanation: 'React keeps a lightweight Virtual DOM in memory and syncs it with the real DOM efficiently using diffing.' },
            { id: 'fe-q4', text: 'Which hook should you use to fetch data when a component mounts?', options: ['useCallback', 'useMemo', 'useEffect', 'useRef'], answer: 2, difficulty: 'Medium', explanation: 'useEffect with an empty dependency array [] runs once after the initial render — perfect for data fetching.' },
            { id: 'fe-q5', text: 'What is a "closure" in JavaScript?', options: ['A CSS animation', 'A function that retains access to its outer scope variables', 'A type of React hook', 'A module bundler config'], answer: 1, difficulty: 'Hard', explanation: 'A closure is a function that "closes over" the variables from the scope in which it was defined, retaining access even after the outer function has returned.' },
        ],
        tasks: [
            { id: 'fe-t1', title: 'Build a Flex Layout', description: 'Create a responsive nav bar using Flexbox with a logo, links, and a CTA button.', type: 'coding', xp: 50, estimatedTime: '30 min' },
            { id: 'fe-t2', title: 'Read: React Hooks Guide', description: 'Study the official React Hooks docs — useState, useEffect, useContext.', type: 'reading', xp: 30, estimatedTime: '20 min' },
            { id: 'fe-t3', title: 'Mini Project: Todo App', description: 'Build a working Todo app with add, complete, and delete features using React.', type: 'project', xp: 100, estimatedTime: '1.5 hrs' },
            { id: 'fe-t4', title: 'CSS Grid Challenge', description: 'Recreate a dashbaord layout using CSS Grid with header, sidebar, and content areas.', type: 'coding', xp: 60, estimatedTime: '45 min' },
            { id: 'fe-t5', title: 'API Fetch Practice', description: 'Fetch data from a public REST API (JSONPlaceholder) and display it as a card list.', type: 'coding', xp: 80, estimatedTime: '1 hr' },
            { id: 'fe-t6', title: 'Final Project: Portfolio Site', description: 'Build a personal portfolio website with smooth scroll, dark mode, and responsive design.', type: 'project', xp: 200, estimatedTime: '3 hrs' },
        ],
        checkpoints: [
            { id: 'fe-c1', label: 'HTML & CSS Fundamentals', skills: ['Semantic HTML', 'Flexbox', 'Grid', 'Responsive Design'], unlocksAt: 0 },
            { id: 'fe-c2', label: 'JavaScript Essentials', skills: ['Variables & Types', 'Functions & Closures', 'DOM Manipulation', 'ES6+ Features'], unlocksAt: 1 },
            { id: 'fe-c3', label: 'React Basics', skills: ['Components', 'Props & State', 'Hooks', 'Event Handling'], unlocksAt: 3 },
            { id: 'fe-c4', label: 'Advanced React', skills: ['Context API', 'Custom Hooks', 'Performance', 'Testing'], unlocksAt: 5 },
        ],
    },
    {
        id: 'backend',
        title: 'Backend Development',
        description: 'Learn Node.js, databases, REST APIs, authentication, and server-side architecture.',
        icon: Server,
        gradient: 'from-green-500 to-emerald-500',
        border: 'border-green-500/40',
        badge: 'bg-green-500/10 text-green-300 border-green-500/30',
        questions: [
            { id: 'be-q1', text: 'What HTTP method is used to create a new resource?', options: ['GET', 'PUT', 'POST', 'DELETE'], answer: 2, difficulty: 'Easy', explanation: 'POST is used to submit data to create a new resource on the server.' },
            { id: 'be-q2', text: 'Which status code means "Not Found"?', options: ['200', '301', '403', '404'], answer: 3, difficulty: 'Easy', explanation: 'HTTP 404 means the server could not find the requested resource.' },
            { id: 'be-q3', text: 'What is middleware in Express.js?', options: ['A database connector', 'A function that executes between request and response', 'A templating engine', 'A routing library'], answer: 1, difficulty: 'Medium', explanation: 'Middleware functions have access to req, res, and the next() function, and sit in the request–response cycle.' },
            { id: 'be-q4', text: 'What is JWT used for?', options: ['Styling components', 'Stateless authentication', 'Database queries', 'File uploads'], answer: 1, difficulty: 'Medium', explanation: 'JSON Web Tokens (JWT) are used for stateless authentication — the server signs a token the client presents on future requests.' },
            { id: 'be-q5', text: 'What does "N+1 query problem" mean?', options: ['A CSS specificity issue', 'Running N extra queries for each of N records instead of 1 joined query', 'A Node.js memory leak', 'A REST naming convention'], answer: 1, difficulty: 'Hard', explanation: 'The N+1 problem occurs when you fetch a list of N items and then run 1 extra query per item instead of a single JOIN query.' },
        ],
        tasks: [
            { id: 'be-t1', title: 'Setup Express Server', description: 'Create a Node.js + Express server with health-check and JSON endpoints.', type: 'coding', xp: 50, estimatedTime: '30 min' },
            { id: 'be-t2', title: 'Read: REST API Design', description: 'Study REST principles: resources, verbs, status codes, and versioning.', type: 'reading', xp: 30, estimatedTime: '20 min' },
            { id: 'be-t3', title: 'Build a CRUD API', description: 'Create a full CRUD API for a "books" resource with in-memory storage.', type: 'project', xp: 100, estimatedTime: '1.5 hrs' },
            { id: 'be-t4', title: 'Database Integration', description: 'Connect your API to a PostgreSQL database using an ORM.', type: 'coding', xp: 80, estimatedTime: '1 hr' },
            { id: 'be-t5', title: 'Add JWT Auth', description: 'Secure your API with JWT-based login/register endpoints and protected routes.', type: 'coding', xp: 100, estimatedTime: '1.5 hrs' },
            { id: 'be-t6', title: 'Deploy to Cloud', description: 'Deploy your Node API to Railway or Render with environment secrets and CI/CD.', type: 'project', xp: 150, estimatedTime: '2 hrs' },
        ],
        checkpoints: [
            { id: 'be-c1', label: 'HTTP & REST Basics', skills: ['HTTP verbs', 'Status codes', 'REST principles', 'Postman testing'], unlocksAt: 0 },
            { id: 'be-c2', label: 'Node.js & Express', skills: ['Event loop', 'Middleware', 'Routing', 'Error handling'], unlocksAt: 1 },
            { id: 'be-c3', label: 'Databases', skills: ['SQL basics', 'Joins', 'ORM usage', 'Indexing'], unlocksAt: 3 },
            { id: 'be-c4', label: 'Security & Deployment', skills: ['JWT Auth', 'HTTPS', 'Rate limiting', 'Cloud deploy'], unlocksAt: 5 },
        ],
    },
    {
        id: 'fullstack',
        title: 'Full Stack Development',
        description: 'Combine frontend and backend skills to build complete, production-ready applications.',
        icon: Layers,
        gradient: 'from-purple-500 to-pink-500',
        border: 'border-purple-500/40',
        badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        questions: [
            { id: 'fs-q1', text: 'What is CORS and why does it matter?', options: ['A CSS framework', 'Cross-Origin Resource Sharing — a browser security policy for cross-domain requests', 'A database ORM', 'A cloud storage service'], answer: 1, difficulty: 'Medium', explanation: 'CORS controls which origins can make requests to your server. You must configure CORS headers to allow your frontend to access your backend API.' },
            { id: 'fs-q2', text: 'What is the purpose of environment variables?', options: ['Store CSS themes', 'Keep sensitive config (API keys, DB URLs) out of source code', 'Define component props', 'Set browser cookies'], answer: 1, difficulty: 'Easy', explanation: 'Environment variables separate config from code, keeping secrets like DB passwords out of your repository.' },
            { id: 'fs-q3', text: 'What does "SSR" stand for in Next.js?', options: ['Static Style Rendering', 'Server-Side Rendering', 'Secure Script Runtime', 'Synchronous State Resolution'], answer: 1, difficulty: 'Medium', explanation: 'SSR fetches data and renders HTML on the server for each request, improving SEO and initial load performance.' },
            { id: 'fs-q4', text: 'What is a monorepo?', options: ['A single-use repository', 'A single repository containing multiple packages or apps', 'A database architecture', 'A CSS methodology'], answer: 1, difficulty: 'Hard', explanation: 'A monorepo stores frontend, backend, and shared packages in one repo, simplifying dependency management and shared code.' },
            { id: 'fs-q5', text: 'What does "hydration" mean in React SSR?', options: ['Adding CSS styles', 'The client attaches React event handlers to server-rendered HTML', 'Fetching data from an API', 'Compiling TypeScript'], answer: 1, difficulty: 'Hard', explanation: 'Hydration is the process where React on the client "takes over" the static server-rendered HTML and makes it interactive.' },
        ],
        tasks: [
            { id: 'fs-t1', title: 'Setup Next.js App', description: 'Create a Next.js app with TypeScript, Tailwind, and basic page routing.', type: 'coding', xp: 50, estimatedTime: '30 min' },
            { id: 'fs-t2', title: 'Read: Full Stack Architecture', description: 'Study how frontend, backend, and databases interconnect in modern apps.', type: 'reading', xp: 30, estimatedTime: '20 min' },
            { id: 'fs-t3', title: 'Build Login System', description: 'Create a full auth flow: signup, login, protected routes, JWT or session.', type: 'project', xp: 120, estimatedTime: '2 hrs' },
            { id: 'fs-t4', title: 'Real-time Features', description: 'Add WebSocket-based live notifications or chat to your app.', type: 'coding', xp: 100, estimatedTime: '2 hrs' },
            { id: 'fs-t5', title: 'CI/CD Pipeline', description: 'Set up GitHub Actions to auto-test and deploy your full stack app on push.', type: 'coding', xp: 80, estimatedTime: '1 hr' },
            { id: 'fs-t6', title: 'Capstone: SaaS App', description: 'Build a minimal SaaS with auth, billing, dashboard, and API — deployed to production.', type: 'project', xp: 250, estimatedTime: '5 hrs' },
        ],
        checkpoints: [
            { id: 'fs-c1', label: 'Frontend + Backend Connection', skills: ['Fetch/Axios', 'CORS', 'API integration', 'Env variables'], unlocksAt: 0 },
            { id: 'fs-c2', label: 'Authentication Flow', skills: ['Session vs JWT', 'Protected routes', 'OAuth basics', 'Refresh tokens'], unlocksAt: 2 },
            { id: 'fs-c3', label: 'Database & State', skills: ['ORM patterns', 'State management', 'Caching', 'Optimistic updates'], unlocksAt: 3 },
            { id: 'fs-c4', label: 'Production Ready', skills: ['CI/CD', 'Monitoring', 'Error tracking', 'Scalability'], unlocksAt: 5 },
        ],
    },
    {
        id: 'cloud',
        title: 'Cloud & DevOps',
        description: 'Deploy, scale, and automate infrastructure with AWS, Docker, Kubernetes, and CI/CD.',
        icon: Cloud,
        gradient: 'from-sky-500 to-indigo-500',
        border: 'border-sky-500/40',
        badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        questions: [
            { id: 'cl-q1', text: 'What does Docker containerize?', options: ['Only databases', 'An application and all its dependencies into a portable unit', 'CSS styles', 'DNS records'], answer: 1, difficulty: 'Easy', explanation: 'Docker packages your app with its runtime, libraries, and config into a self-contained image that runs the same everywhere.' },
            { id: 'cl-q2', text: 'What is Kubernetes used for?', options: ['CSS animations', 'Automating deployment, scaling, and management of containerized apps', 'SQL queries', 'API testing'], answer: 1, difficulty: 'Medium', explanation: 'Kubernetes (K8s) orchestrates containers across multiple machines, handling scaling, load balancing, and self-healing.' },
            { id: 'cl-q3', text: 'What is an S3 bucket?', options: ['A Node.js module', 'AWS object storage for files, images, and static assets', 'A type of EC2 instance', 'A firewall rule'], answer: 1, difficulty: 'Easy', explanation: 'Amazon S3 (Simple Storage Service) stores and serves objects (files, images, backups) at scale with high durability.' },
            { id: 'cl-q4', text: 'What does IaC stand for?', options: ['Interface as Component', 'Infrastructure as Code — managing infrastructure via config files', 'Integrated API Cache', 'Internet Access Control'], answer: 1, difficulty: 'Medium', explanation: 'Infrastructure as Code (IaC) lets you provision and manage cloud resources through version-controlled config files (Terraform, Pulumi).' },
            { id: 'cl-q5', text: 'What is a "blue-green deployment"?', options: ['A CSS color scheme', 'Running two identical production environments to enable zero-downtime deploys', 'A Git branching strategy', 'A database backup method'], answer: 1, difficulty: 'Hard', explanation: 'Blue-green deployment keeps two production environments. Traffic switches from blue (current) to green (new) — rollback is instant.' },
        ],
        tasks: [
            { id: 'cl-t1', title: 'Write a Dockerfile', description: 'Containerize a Node.js app with a multi-stage Dockerfile and run it locally.', type: 'coding', xp: 60, estimatedTime: '45 min' },
            { id: 'cl-t2', title: 'Read: Cloud Fundamentals', description: 'Learn about IaaS, PaaS, SaaS, and core AWS/GCP concepts.', type: 'reading', xp: 30, estimatedTime: '20 min' },
            { id: 'cl-t3', title: 'Deploy to AWS EC2', description: 'Launch an EC2 instance, install Node, and deploy your API with PM2.', type: 'project', xp: 100, estimatedTime: '1.5 hrs' },
            { id: 'cl-t4', title: 'GitHub Actions CI Pipeline', description: 'Create a GitHub Actions workflow that lints, tests, and builds on every push.', type: 'coding', xp: 80, estimatedTime: '1 hr' },
            { id: 'cl-t5', title: 'Kubernetes Basics', description: 'Write a Deployment and Service YAML, apply to a local minikube cluster.', type: 'coding', xp: 100, estimatedTime: '2 hrs' },
            { id: 'cl-t6', title: 'Full Infrastructure Stack', description: 'Provision S3, RDS, and an EC2 app server using Terraform.', type: 'project', xp: 200, estimatedTime: '4 hrs' },
        ],
        checkpoints: [
            { id: 'cl-c1', label: 'Linux & Networking', skills: ['Shell basics', 'SSH', 'DNS', 'HTTP/HTTPS'], unlocksAt: 0 },
            { id: 'cl-c2', label: 'Docker & Containers', skills: ['Dockerfile', 'docker-compose', 'Volumes', 'Networking'], unlocksAt: 1 },
            { id: 'cl-c3', label: 'Cloud Platforms', skills: ['EC2', 'S3', 'IAM', 'Serverless'], unlocksAt: 3 },
            { id: 'cl-c4', label: 'Orchestration & IaC', skills: ['Kubernetes', 'Helm', 'Terraform', 'Monitoring'], unlocksAt: 5 },
        ],
    },
    {
        id: 'ai',
        title: 'AI & Machine Learning',
        description: 'Learn Python, ML algorithms, neural networks, and build real AI-powered applications.',
        icon: Brain,
        gradient: 'from-violet-500 to-fuchsia-500',
        border: 'border-violet-500/40',
        badge: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
        questions: [
            { id: 'ai-q1', text: 'What is supervised learning?', options: ['Learning without labels', 'Training a model on labeled input-output pairs', 'A cloud ML service', 'A Python library'], answer: 1, difficulty: 'Easy', explanation: 'In supervised learning, the model learns a mapping from inputs to outputs using labeled training examples (e.g., images labeled "cat" or "dog").' },
            { id: 'ai-q2', text: 'What does a "loss function" measure?', options: ['Training speed', 'How wrong the model\'s predictions are compared to the truth', 'GPU memory usage', 'Dataset size'], answer: 1, difficulty: 'Easy', explanation: 'The loss function quantifies the error between predicted and actual values. The training process minimizes this error.' },
            { id: 'ai-q3', text: 'What is overfitting?', options: ['When a model trains too quickly', 'When a model performs well on training data but poorly on new data', 'When training data is missing', 'A GPU memory error'], answer: 1, difficulty: 'Medium', explanation: 'Overfitting happens when a model memorizes training data instead of learning generalizable patterns — it fails on unseen data.' },
            { id: 'ai-q4', text: 'What is the purpose of "attention" in Transformers?', options: ['To speed up training', 'To let the model focus on relevant parts of the input dynamically', 'To reduce dataset size', 'To compress the model weights'], answer: 1, difficulty: 'Hard', explanation: 'Self-attention allows each token to weigh the importance of every other token in the sequence, capturing long-range dependencies.' },
            { id: 'ai-q5', text: 'What is "gradient descent"?', options: ['A type of neural network', 'An optimization algorithm that iteratively adjusts weights to minimize loss', 'A data preprocessing method', 'A regularization technique'], answer: 1, difficulty: 'Medium', explanation: 'Gradient descent computes the gradient of the loss with respect to model parameters and steps in the opposite direction to reduce error.' },
        ],
        tasks: [
            { id: 'ai-t1', title: 'Python & NumPy Basics', description: 'Write Python scripts using NumPy for array operations, slicing, and broadcasting.', type: 'coding', xp: 50, estimatedTime: '30 min' },
            { id: 'ai-t2', title: 'Read: ML Fundamentals', description: 'Study supervised vs unsupervised learning, bias-variance tradeoff, and evaluation metrics.', type: 'reading', xp: 30, estimatedTime: '25 min' },
            { id: 'ai-t3', title: 'Train a Classifier', description: 'Train a Logistic Regression or Decision Tree on the Iris dataset using scikit-learn.', type: 'project', xp: 80, estimatedTime: '1 hr' },
            { id: 'ai-t4', title: 'Neural Network from Scratch', description: 'Implement a simple 2-layer neural network using only NumPy — no frameworks.', type: 'coding', xp: 120, estimatedTime: '2 hrs' },
            { id: 'ai-t5', title: 'Fine-tune a Transformer', description: 'Fine-tune a pre-trained BERT model on a text classification task using HuggingFace.', type: 'coding', xp: 150, estimatedTime: '2.5 hrs' },
            { id: 'ai-t6', title: 'Build an AI App', description: 'Create an end-to-end AI web app — model inference API + React frontend.', type: 'project', xp: 250, estimatedTime: '5 hrs' },
        ],
        checkpoints: [
            { id: 'ai-c1', label: 'Python & Data', skills: ['NumPy', 'Pandas', 'Matplotlib', 'Data cleaning'], unlocksAt: 0 },
            { id: 'ai-c2', label: 'ML Foundations', skills: ['Linear models', 'Decision trees', 'Evaluation metrics', 'Cross-validation'], unlocksAt: 1 },
            { id: 'ai-c3', label: 'Deep Learning', skills: ['Neural nets', 'CNNs', 'RNNs', 'Backpropagation'], unlocksAt: 3 },
            { id: 'ai-c4', label: 'Advanced AI', skills: ['Transformers', 'Fine-tuning', 'MLOps', 'Deployment'], unlocksAt: 5 },
        ],
    },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface Progress {
    completedTasks: Set<string>;
    questionResults: Record<string, boolean>; // questionId -> correct
}

const taskTypeIcon: Record<Task['type'], React.ElementType> = {
    reading: BookOpen,
    coding: Wrench,
    project: Rocket,
    quiz: ClipboardList,
};

const taskTypeColor: Record<Task['type'], string> = {
    reading: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    coding: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    project: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    quiz: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const difficultyColor: Record<Question['difficulty'], string> = {
    Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
};

// ─── Domain Selector ─────────────────────────────────────────────────────────

const DomainSelector: React.FC<{ onSelect: (d: Domain) => void }> = ({ onSelect }) => (
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="relative text-center mb-14">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[180px] bg-violet-600/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
                    <Zap className="w-4 h-4" />
                    <span>Skill Improvement & Progress Tracking</span>
                </div>
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 mb-4 tracking-tight">
                    Choose Your Domain
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Select a domain to get <span className="text-violet-300 font-semibold">domain-specific questions</span>, practice tasks, learning checkpoints, and an auto-updating progress dashboard.
                </p>
            </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
                { icon: Target, label: 'Pick a Domain', desc: 'Choose your career path', color: 'from-violet-500 to-fuchsia-500' },
                { icon: MessageSquare, label: 'Answer Questions', desc: 'Domain-specific Q&A', color: 'from-blue-500 to-cyan-500' },
                { icon: ClipboardList, label: 'Complete Tasks', desc: 'Hands-on practice', color: 'from-emerald-500 to-teal-500' },
                { icon: Trophy, label: 'Track Progress', desc: 'Unlock milestones', color: 'from-amber-500 to-orange-500' },
            ].map((step, i) => {
                const Icon = step.icon;
                return (
                    <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 text-center">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-3`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white text-sm font-semibold">{step.label}</p>
                        <p className="text-slate-500 text-xs mt-1">{step.desc}</p>
                    </div>
                );
            })}
        </div>

        {/* Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAINS.map(domain => {
                const Icon = domain.icon;
                return (
                    <button
                        key={domain.id}
                        onClick={() => onSelect(domain)}
                        className={`group relative text-left bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border ${domain.border} hover:border-opacity-80 transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50`}
                    >
                        <div className={`absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br ${domain.gradient} opacity-5 group-hover:opacity-15 rounded-full blur-2xl transition-opacity duration-500`} />

                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${domain.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                            <Icon className="w-7 h-7 text-white" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white">
                            {domain.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-5">
                            {domain.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <span className={`text-xs px-2.5 py-1 rounded-full border ${domain.badge}`}>
                                    {domain.questions.length} Questions
                                </span>
                                <span className="text-xs px-2.5 py-1 rounded-full border border-slate-600/40 text-slate-400 bg-slate-700/40">
                                    {domain.tasks.length} Tasks
                                </span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    </button>
                );
            })}
        </div>
    </div>
);

// ─── Skill Dashboard ──────────────────────────────────────────────────────────

const SkillDashboard: React.FC<{ domain: Domain; onBack: () => void }> = ({ domain, onBack }) => {
    const [progress, setProgress] = useState<Progress>({ completedTasks: new Set(), questionResults: {} });
    const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'tasks' | 'milestones'>('dashboard');
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<Record<string, number>>({});
    const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());

    const Icon = domain.icon;

    // ── Derived stats ──────────────────────────────────────────────────────
    const totalXP = useMemo(() => {
        return domain.tasks
            .filter(t => progress.completedTasks.has(t.id))
            .reduce((sum, t) => sum + t.xp, 0);
    }, [progress.completedTasks, domain.tasks]);

    const maxXP = useMemo(() => domain.tasks.reduce((s, t) => s + t.xp, 0), [domain.tasks]);
    const taskPct = Math.round((progress.completedTasks.size / domain.tasks.length) * 100);

    const correctAnswers = useMemo(
        () => Object.values(progress.questionResults).filter(Boolean).length,
        [progress.questionResults]
    );
    const questionPct = submittedQuestions.size > 0
        ? Math.round((correctAnswers / submittedQuestions.size) * 100)
        : 0;

    const unlockedCheckpoints = domain.checkpoints.filter(c => progress.completedTasks.size >= c.unlocksAt);

    const nextTask = domain.tasks.find(t => !progress.completedTasks.has(t.id));

    const overallPct = Math.round(
        ((progress.completedTasks.size / domain.tasks.length) * 0.7 +
            (submittedQuestions.size > 0 ? correctAnswers / domain.questions.length : 0) * 0.3) * 100
    );

    // ── Handlers ───────────────────────────────────────────────────────────
    const toggleTask = (taskId: string) => {
        setProgress(prev => {
            const next = new Set(prev.completedTasks);
            next.has(taskId) ? next.delete(taskId) : next.add(taskId);
            return { ...prev, completedTasks: next };
        });
    };

    const submitQuestion = (qId: string, qAnswer: number) => {
        const q = domain.questions.find(q => q.id === qId);
        if (!q) return;
        const correct = qAnswer === q.answer;
        setProgress(prev => ({ ...prev, questionResults: { ...prev.questionResults, [qId]: correct } }));
        setSubmittedQuestions(prev => new Set(prev).add(qId));
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
        { id: 'questions', label: `Questions (${domain.questions.length})`, icon: MessageSquare },
        { id: 'tasks', label: `Tasks (${domain.tasks.length})`, icon: ClipboardList },
        { id: 'milestones', label: 'Milestones', icon: Flag },
    ] as const;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back */}
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Domains</span>
            </button>

            {/* Hero */}
            <div className={`relative rounded-2xl overflow-hidden mb-8 border ${domain.border} bg-slate-800/50`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} opacity-5`} />
                <div className="relative z-10 p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${domain.gradient} flex items-center justify-center shadow-xl flex-shrink-0`}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${domain.gradient} mb-1`}>
                            {domain.title}
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">{domain.description}</p>
                    </div>
                    {/* XP badge */}
                    <div className="flex-shrink-0 text-center bg-slate-900/60 border border-slate-700/50 rounded-xl px-5 py-3">
                        <p className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${domain.gradient}`}>{totalXP}</p>
                        <p className="text-slate-500 text-xs">/ {maxXP} XP</p>
                    </div>
                </div>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 mb-8 overflow-x-auto">
                {tabs.map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                ? `bg-gradient-to-r ${domain.gradient} text-white shadow-lg`
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <TabIcon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── TAB: Dashboard ─────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Overall Progress', value: `${overallPct}%`, sub: 'combined score', icon: TrendingUp, grad: domain.gradient },
                            { label: 'Tasks Completed', value: `${progress.completedTasks.size}/${domain.tasks.length}`, sub: `${taskPct}% done`, icon: CheckCircle2, grad: 'from-emerald-500 to-teal-500' },
                            { label: 'Quiz Accuracy', value: submittedQuestions.size > 0 ? `${questionPct}%` : '—', sub: `${correctAnswers}/${submittedQuestions.size} correct`, icon: Target, grad: 'from-blue-500 to-cyan-500' },
                            { label: 'XP Earned', value: totalXP.toString(), sub: `of ${maxXP} total`, icon: Star, grad: 'from-amber-500 to-orange-500' },
                        ].map((card, i) => {
                            const CardIcon = card.icon;
                            return (
                                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.grad} flex items-center justify-center mb-3`}>
                                        <CardIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-white font-bold text-xl">{card.value}</p>
                                    <p className="text-slate-500 text-xs">{card.label}</p>
                                    <p className="text-slate-600 text-xs mt-0.5">{card.sub}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Overall progress bar */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-white font-semibold">Learning Progress</p>
                            <p className={`text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${domain.gradient}`}>{overallPct}%</p>
                        </div>
                        <div className="w-full h-3 bg-slate-700/60 rounded-full overflow-hidden mb-4">
                            <div className={`h-full bg-gradient-to-r ${domain.gradient} rounded-full transition-all duration-700`} style={{ width: `${overallPct}%` }} />
                        </div>

                        {/* Per-task progress */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {domain.tasks.map(task => {
                                const done = progress.completedTasks.has(task.id);
                                const TaskIcon = taskTypeIcon[task.type];
                                return (
                                    <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-700/40 bg-slate-800/30'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${done ? `bg-gradient-to-br ${domain.gradient}` : 'bg-slate-700/60'}`}>
                                            {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <TaskIcon className="w-4 h-4 text-slate-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-medium truncate ${done ? 'text-emerald-200' : 'text-slate-300'}`}>{task.title}</p>
                                            <p className="text-slate-600 text-xs">+{task.xp} XP</p>
                                        </div>
                                        {done && <span className="text-xs text-emerald-400 font-medium flex-shrink-0">✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Next Recommended Step */}
                    {nextTask && (
                        <div className={`bg-slate-800/50 border ${domain.border} rounded-2xl p-6`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Rocket className="w-5 h-5 text-violet-400" />
                                <p className="text-white font-semibold">Next Recommended Step</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${domain.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                    {React.createElement(taskTypeIcon[nextTask.type], { className: 'w-6 h-6 text-white' })}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-lg">{nextTask.title}</p>
                                    <p className="text-slate-400 text-sm mt-1">{nextTask.description}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border ${taskTypeColor[nextTask.type]}`}>
                                            {nextTask.type.charAt(0).toUpperCase() + nextTask.type.slice(1)}
                                        </span>
                                        <span className="text-xs text-slate-500">⏱ {nextTask.estimatedTime}</span>
                                        <span className="text-xs text-amber-400 font-medium">+{nextTask.xp} XP</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { toggleTask(nextTask.id); setActiveTab('tasks'); }}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r ${domain.gradient} text-white hover:opacity-90 transition-opacity`}
                                >
                                    Start →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Completed milestones preview */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-white font-semibold flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" /> Completed Milestones
                            </p>
                            <button onClick={() => setActiveTab('milestones')} className="text-xs text-slate-400 hover:text-white transition-colors">
                                View all →
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {domain.checkpoints.map(cp => {
                                const unlocked = progress.completedTasks.size >= cp.unlocksAt;
                                return (
                                    <div key={cp.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${unlocked ? `border-amber-500/30 bg-amber-500/10 text-amber-200` : 'border-slate-700/40 bg-slate-800/30 text-slate-600'}`}>
                                        {unlocked ? <Trophy className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
                                        {cp.label}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: Questions ─────────────────────────────────────────── */}
            {activeTab === 'questions' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm">{submittedQuestions.size}/{domain.questions.length} answered · {correctAnswers} correct</p>
                        {submittedQuestions.size > 0 && (
                            <span className={`text-sm font-bold ${questionPct >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {questionPct}% accuracy
                            </span>
                        )}
                    </div>

                    {domain.questions.map((q, qi) => {
                        const submitted = submittedQuestions.has(q.id);
                        const chosen = selectedAnswer[q.id];
                        const correct = submitted ? progress.questionResults[q.id] : null;
                        const isOpen = expandedQuestion === q.id;

                        return (
                            <div key={q.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${submitted ? (correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5') : 'border-slate-700/50 bg-slate-800/40'}`}>
                                {/* Question header */}
                                <button
                                    onClick={() => setExpandedQuestion(isOpen ? null : q.id)}
                                    className="w-full flex items-start gap-4 p-5 text-left"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${submitted ? (correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300') : 'bg-slate-700/60 text-slate-400'}`}>
                                        {submitted ? (correct ? '✓' : '✗') : qi + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor[q.difficulty]}`}>{q.difficulty}</span>
                                            {submitted && <span className="text-xs text-slate-500">{correct ? '✅ Correct' : '❌ Incorrect'}</span>}
                                        </div>
                                        <p className="text-slate-100 text-sm font-medium leading-snug">{q.text}</p>
                                    </div>
                                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />}
                                </button>

                                {/* Answer options */}
                                {isOpen && (
                                    <div className="px-5 pb-5 space-y-2">
                                        {q.options.map((opt, oi) => {
                                            const isChosen = chosen === oi;
                                            const isCorrectOption = oi === q.answer;
                                            let cls = 'border-slate-700/50 bg-slate-700/20 text-slate-300 hover:border-slate-500';
                                            if (submitted) {
                                                if (isCorrectOption) cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';
                                                else if (isChosen && !isCorrectOption) cls = 'border-red-500/40 bg-red-500/10 text-red-300';
                                                else cls = 'border-slate-700/30 bg-slate-800/20 text-slate-600';
                                            } else if (isChosen) {
                                                cls = 'border-violet-500/50 bg-violet-500/10 text-violet-200';
                                            }

                                            return (
                                                <button
                                                    key={oi}
                                                    onClick={() => !submitted && setSelectedAnswer(prev => ({ ...prev, [q.id]: oi }))}
                                                    disabled={submitted}
                                                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${cls} disabled:cursor-default`}
                                                >
                                                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs flex-shrink-0 font-bold">
                                                        {String.fromCharCode(65 + oi)}
                                                    </span>
                                                    {opt}
                                                </button>
                                            );
                                        })}

                                        {/* Submit / Explanation */}
                                        {!submitted ? (
                                            <button
                                                disabled={chosen === undefined}
                                                onClick={() => submitQuestion(q.id, chosen)}
                                                className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r ${domain.gradient} text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed`}
                                            >
                                                Submit Answer
                                            </button>
                                        ) : (
                                            <div className={`mt-3 p-4 rounded-xl border text-sm leading-relaxed ${correct ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200' : 'border-amber-500/20 bg-amber-500/5 text-amber-200'}`}>
                                                <p className="font-semibold mb-1">💡 Explanation</p>
                                                <p className="text-slate-300">{q.explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── TAB: Tasks ─────────────────────────────────────────────── */}
            {activeTab === 'tasks' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm">{progress.completedTasks.size}/{domain.tasks.length} completed</p>
                        <p className="text-sm font-bold text-amber-400">{totalXP} / {maxXP} XP</p>
                    </div>

                    {domain.tasks.map((task, idx) => {
                        const done = progress.completedTasks.has(task.id);
                        const TaskIcon = taskTypeIcon[task.type];
                        return (
                            <div key={task.id} className={`rounded-2xl border transition-all duration-300 ${done ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-800/40'}`}>
                                <div className="flex items-start gap-4 p-5">
                                    {/* Step number */}
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all ${done ? `bg-gradient-to-br ${domain.gradient} shadow-lg` : 'bg-slate-700/60 text-slate-400'}`}>
                                        {done ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span>{idx + 1}</span>}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className={`font-semibold text-sm ${done ? 'text-emerald-100' : 'text-slate-100'}`}>{task.title}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${taskTypeColor[task.type]}`}>
                                                <TaskIcon className="w-3 h-3 inline mr-1" />
                                                {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-xs leading-relaxed">{task.description}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-slate-500">⏱ {task.estimatedTime}</span>
                                            <span className="text-xs text-amber-400 font-medium">+{task.xp} XP</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${done
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30'
                                            : `bg-gradient-to-r ${domain.gradient} text-white hover:opacity-90 shadow-md`
                                            }`}
                                    >
                                        {done ? (
                                            <><CheckCircle2 className="w-3.5 h-3.5" /> Done</>
                                        ) : (
                                            <><PlayCircle className="w-3.5 h-3.5" /> Mark Done</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── TAB: Milestones ────────────────────────────────────────── */}
            {activeTab === 'milestones' && (
                <div className="space-y-4">
                    <p className="text-slate-400 text-sm mb-4">
                        Complete tasks to unlock milestones. {unlockedCheckpoints.length}/{domain.checkpoints.length} milestones unlocked.
                    </p>

                    {domain.checkpoints.map((cp, idx) => {
                        const unlocked = progress.completedTasks.size >= cp.unlocksAt;
                        const CpIcon = [BookOpen, Wrench, Rocket, Briefcase][idx] || Trophy;
                        return (
                            <div key={cp.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${unlocked ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-700/50 bg-slate-800/30 opacity-70'}`}>
                                <div className="flex items-start gap-4 p-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${unlocked ? `bg-gradient-to-br ${domain.gradient} shadow-lg` : 'bg-slate-700/60'}`}>
                                        {unlocked
                                            ? <Trophy className="w-7 h-7 text-white" />
                                            : <Lock className="w-6 h-6 text-slate-500" />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className={`font-bold text-lg ${unlocked ? 'text-amber-100' : 'text-slate-500'}`}>{cp.label}</h3>
                                            {unlocked && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">✓ Unlocked</span>}
                                        </div>
                                        {!unlocked && (
                                            <p className="text-slate-600 text-xs mb-2">Complete {cp.unlocksAt} tasks to unlock</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {cp.skills.map(skill => (
                                                <span key={skill} className={`text-xs px-2.5 py-1 rounded-lg border ${unlocked ? 'border-amber-500/20 bg-amber-500/10 text-amber-200' : 'border-slate-700/40 bg-slate-800/40 text-slate-600'}`}>
                                                    {unlocked ? <Star className="w-2.5 h-2.5 inline mr-1 text-amber-400" /> : null}
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Unlock progress bar */}
                                {!unlocked && cp.unlocksAt > 0 && (
                                    <div className="px-6 pb-4">
                                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                                            <span>Progress to unlock</span>
                                            <span>{Math.min(progress.completedTasks.size, cp.unlocksAt)}/{cp.unlocksAt} tasks</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${domain.gradient} rounded-full transition-all duration-500`}
                                                style={{ width: `${Math.min((progress.completedTasks.size / cp.unlocksAt) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* All done! */}
                    {unlockedCheckpoints.length === domain.checkpoints.length && (
                        <div className="text-center py-10 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                            <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3" />
                            <h3 className="text-2xl font-bold text-white mb-1">All Milestones Unlocked! 🎉</h3>
                            <p className="text-slate-400 text-sm">You've mastered <span className="text-white font-medium">{domain.title}</span>!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

const SkillTracker: React.FC = () => {
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

    return selectedDomain
        ? <SkillDashboard domain={selectedDomain} onBack={() => setSelectedDomain(null)} />
        : <DomainSelector onSelect={setSelectedDomain} />;
};

export default SkillTracker;

// re-export domain type for other components if needed
export type { Domain };
