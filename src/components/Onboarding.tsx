import { Sparkles, ChevronRight, Rocket, Target, Brain } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import QuizInterface from './QuizInterface';

interface OnboardingProps {
    onComplete: () => void;
}

const DOMAINS = [
    {
        id: 'fs',
        title: 'Full Stack Development',
        description: 'Master both frontend and backend to build complete web applications from scratch.',
        icon: <Rocket className="w-6 h-6 text-indigo-400" />,
        match: 'Based on your interest in technical problem solving and building software.',
        roadmapId: 'full-stack-id' // We'll need to fetch actual IDs later
    },
    {
        id: 'ds',
        title: 'Data Science',
        description: 'Analyze complex data sets to discover insights and help businesses make informed decisions.',
        icon: <Target className="w-6 h-6 text-emerald-400" />,
        match: 'Based on your interest in mathematics, science, and data-driven analysis.',
        roadmapId: 'data-science-id'
    },
    {
        id: 'uiux',
        title: 'UI/UX Design',
        description: 'Create intuitive and beautiful user interfaces that provide exceptional user experiences.',
        icon: <Sparkles className="w-6 h-6 text-pink-400" />,
        match: 'Based on your interest in art, design, and creative problem solving.',
        roadmapId: 'design-id'
    },
    {
        id: 'cyber',
        title: 'Cybersecurity',
        description: 'Protect organizations from digital threats by implementing robust security measures.',
        icon: <Brain className="w-6 h-6 text-red-400" />,
        match: 'Based on your interest in protecting systems and analytical thinking.',
        roadmapId: 'cybersecurity-id'
    }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'intro' | 'quiz' | 'suggestions'>('intro');

    const handleStartQuiz = () => {
        setStep('quiz');
    };

    const handleQuizComplete = () => {
        setStep('suggestions');
    };

    const handleDomainSelect = async (domainId: string) => {
        if (!user) return;

        try {
            await supabase
                .from('profiles')
                .update({ current_goal: domainId })
                .eq('id', user.id);

            onComplete();
        } catch (error) {
            console.error('Error saving domain selection:', error);
            onComplete(); // Proceed anyway
        }
    };

    if (step === 'intro') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-8 shadow-xl shadow-indigo-500/20">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CareerAI</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                        Let's start by understanding your interests and strengths. This quick quiz will help us recommend the best career path for you.
                    </p>
                    <button
                        onClick={handleStartQuiz}
                        className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 mx-auto transition-all transform hover:scale-[1.02]"
                    >
                        <span>Start My Career Quiz</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'quiz') {
        return (
            <div className="min-h-screen bg-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <QuizInterface
                        quizId={0}
                        onBack={() => setStep('intro')}
                        onComplete={handleQuizComplete}
                    />
                </div>
            </div>
        );
    }

    if (step === 'suggestions') {
        return (
            <div className="min-h-screen bg-slate-900 p-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Recommended Career Paths</h2>
                        <p className="text-xl text-slate-400">Based on your quiz results, we think you'd excel in these areas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {DOMAINS.map((domain) => (
                            <div
                                key={domain.id}
                                onClick={() => handleDomainSelect(domain.id)}
                                className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/50 p-8 rounded-[2.5rem] transition-all cursor-pointer group hover:transform hover:scale-[1.02]"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:bg-slate-800">
                                        {domain.icon}
                                    </div>
                                    <div className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/20">
                                        95% Match
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{domain.title}</h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">
                                    {domain.description}
                                </p>
                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/30">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Why this matches</p>
                                    <p className="text-sm text-slate-300">{domain.match}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-slate-500 text-sm mb-4 italic text-center">
                            Select a domain to view your personalized learning roadmap.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Onboarding;
