import React from 'react';
import { Brain, Target, Rocket, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingProps {
    onGetStarted: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
    const features = [
        {
            icon: <Target className="w-6 h-6 text-indigo-400" />,
            title: 'Career Guidance',
            description: 'AI-driven insights to help you find the perfect career path based on your unique interests and strengths.'
        },
        {
            icon: <Rocket className="w-6 h-6 text-purple-400" />,
            title: 'Skill Development',
            description: 'Master in-demand skills with curated content and interactive assessments designed for modern roles.'
        },
        {
            icon: <Sparkles className="w-6 h-6 text-pink-400" />,
            title: 'Learning Roadmap',
            description: 'Follow step-by-step journeys from beginner to expert, tracking your progress every step of the way.'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">CareerAI</span>
                </div>
                <button
                    onClick={onGetStarted}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm font-medium transition-all"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
                <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-8">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-300">New: AI-Powered Career Pathfinding</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                    Launch Your Career with <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        Intelligence and Purpose
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
                    Navigate your professional journey with precision. From interest quizzes to structured roadmaps, we provide the tools you need to become career-ready.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onGetStarted}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold text-lg flex items-center justify-center space-x-2 transition-all shadow-xl shadow-indigo-500/25 transform hover:scale-[1.02]"
                    >
                        <span>Get Started Free</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-2 text-slate-400 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>No credit card required</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-slate-800/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-slate-800/40 backdrop-blur-sm border border-slate-800 p-8 rounded-3xl hover:border-slate-700 transition-all group"
                        >
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 group-hover:bg-slate-800 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 mb-20 text-center">
                <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />

                    <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
                        Ready to Build Your Future?
                    </h2>
                    <p className="text-slate-300 mb-10 text-lg relative z-10">
                        Join thousands of students who have already found their path with CareerAI.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="px-10 py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold transition-all relative z-10 shadow-lg"
                    >
                        Start Your Journey Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/50 text-center">
                <p className="text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} CareerAI. All rights reserved. Built with passion for your future.
                </p>
            </footer>
        </div>
    );
};

export default Landing;
