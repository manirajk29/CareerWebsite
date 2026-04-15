import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
    Target, BookOpen, Star, Trophy, ArrowRight, Zap, 
    CheckCircle2, ChevronRight, Layout, Server, Database, 
    Shield, Brain, Sparkles, Rocket
} from 'lucide-react';
import QuizInterface from './QuizInterface';
import QuizResults from './QuizResults';

interface DomainInfo {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    skills: string[];
}

const DOMAIN_DETAILS: Record<string, DomainInfo> = {
    'fs': {
        title: 'Full Stack Development',
        description: 'Building end-to-end web applications with modern technologies.',
        icon: Layout,
        color: 'from-indigo-500 to-purple-600',
        skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs']
    },
    'ds': {
        title: 'Data Science',
        description: 'Extracting knowledge and insights from structured and unstructured data.',
        icon: Database,
        color: 'from-emerald-500 to-teal-600',
        skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'Data Visualization']
    },
    'uiux': {
        title: 'UI/UX Design',
        description: 'Designing intuitive and delightful user experiences and interfaces.',
        icon: Sparkles,
        color: 'from-pink-500 to-rose-600',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility']
    },
    'cyber': {
        title: 'Cybersecurity',
        description: 'Protecting systems, networks, and programs from digital attacks.',
        icon: Shield,
        color: 'from-red-500 to-orange-600',
        skills: ['Network Security', 'Ethical Hacking', 'Cryptography', 'Risk Management', 'Linux']
    }
};

const DomainMastery: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [currentGoal, setCurrentGoal] = useState<string | null>(null);
    const [view, setView] = useState<'overview' | 'quiz' | 'results'>('overview');
    const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
    const [score, setScore] = useState<{ correct: number, total: number } | null>(null);

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('current_goal')
                .eq('id', user!.id)
                .maybeSingle();

            if (data) setCurrentGoal(data.current_goal);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const domain = useMemo(() => {
        if (!currentGoal) return null;
        return DOMAIN_DETAILS[currentGoal] || {
            title: 'Custom Path',
            description: 'Your personalized learning journey.',
            icon: Rocket,
            color: 'from-blue-500 to-indigo-600',
            skills: ['Continuous Learning']
        };
    }, [currentGoal]);

    const handleStartQuiz = (level: 'beginner' | 'intermediate' | 'advanced') => {
        setSelectedLevel(level);
        setView('quiz');
    };

    const handleQuizComplete = (correct: number, total: number) => {
        setScore({ correct, total });
        setView('results');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                <p className="text-slate-500">Preparing your skill check...</p>
            </div>
        );
    }

    if (!domain) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">No Domain Suggested Yet</h2>
                <p className="text-slate-400 mb-8">Take the career quiz or set your goal in Settings to get domain-specific skill assessments.</p>
                <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                    Set Career Goal
                </button>
            </div>
        );
    }

    if (view === 'quiz' && selectedLevel) {
        // In a real app, you'd fetch specific quiz IDs based on domain + level
        // Here we'll use a placeholder quiz interface
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-center text-white">
               <h2 className="text-2xl font-bold mb-4 capitalize">{selectedLevel} {domain.title} Quiz</h2>
               <p className="text-slate-400 mb-8 italic">Simulating Quiz Experience...</p>
               <div className="bg-slate-800 p-12 rounded-3xl">
                    <p className="mb-8">This is where the specialized {selectedLevel} level questions for {domain.title} would appear.</p>
                    <button 
                        onClick={() => handleQuizComplete(8, 10)}
                        className="px-8 py-3 bg-indigo-600 rounded-xl font-bold"
                    >
                        Complete Mock Quiz
                    </button>
               </div>
            </div>
        );
    }

    if (view === 'results' && score) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <QuizResults 
                    score={score.correct} 
                    totalQuestions={score.total} 
                    quizTitle={`${selectedLevel?.toUpperCase()} ${domain.title}`}
                    onBackToGallery={() => setView('overview')}
                    onRetakeQuiz={() => setView('quiz')}
                />
            </div>
        );
    }

    const Icon = domain.icon;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className={`relative bg-gradient-to-br ${domain.color} rounded-[3rem] p-10 md:p-16 overflow-hidden mb-12`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center flex-shrink-0 shadow-2xl">
                        <Icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Your Suggested Path</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">Master {domain.title}</h1>
                        <p className="text-indigo-100 text-lg md:text-xl max-w-xl opacity-90 leading-relaxed">
                            {domain.description} Explore domain-specific assessments and elevate your professional skills.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Skill Checks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-white">Skill Assessments</h2>
                        <span className="text-sm text-slate-500">Check your proficiency in {domain.title}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { level: 'beginner' as const, desc: 'Core fundamentals and basic concepts.', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
                            { level: 'intermediate' as const, desc: 'Real-world application and advanced syntax.', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/20' },
                            { level: 'advanced' as const, desc: 'Architecture, performance, and best practices.', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-500/20' }
                        ].map((item) => (
                            <button
                                key={item.level}
                                onClick={() => handleStartQuiz(item.level)}
                                className={`group p-6 rounded-3xl border ${item.border} bg-slate-800/40 hover:bg-slate-800/60 transition-all text-left flex items-center justify-between`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white capitalize">{item.level} Assessment</h3>
                                        <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-all`}>
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-bold text-white mb-6">Required Skills</h3>
                        <div className="space-y-3">
                            {domain.skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                    <CheckCircle2 className={`w-5 h-5 ${domain.color.split(' ')[0].replace('from-', 'text-')}`} />
                                    <span className="text-slate-300 font-medium">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem]">
                        <Brain className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Why this domain?</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Based on your career quiz, you show a strong affinity for problem-solving and technical implementation. Mastering these skills will unlock high-growth opportunities.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainMastery;
