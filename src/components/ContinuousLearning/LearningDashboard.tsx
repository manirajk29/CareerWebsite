import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ViewState } from './ContinuousLearningTracker';
import { 
    Award, BookOpen, TrendingUp, ArrowRight, CheckCircle2, 
    ArrowLeft, Trophy, Zap, Clock, Star, MapPin
} from 'lucide-react';

interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    step_order: number;
}

interface LearningDashboardProps {
    roadmap: {
        id: string;
        title: string;
        description: string;
        color_gradient: string;
    };
    onViewChange: (view: ViewState) => void;
    onBack: () => void;
}

const LearningDashboard: React.FC<LearningDashboardProps> = ({ roadmap, onViewChange, onBack }) => {
    const { user } = useAuth();
    const [steps, setSteps] = useState<RoadmapStep[]>([]);
    const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchDashboardData();
    }, [user, roadmap.id]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [stepsRes, progressRes] = await Promise.all([
                supabase.from('roadmap_steps').select('*').eq('roadmap_id', roadmap.id).order('step_order', { ascending: true }),
                supabase.from('user_roadmap_progress').select('step_id').eq('user_id', user!.id).eq('status', 'completed')
            ]);

            if (stepsRes.error) throw stepsRes.error;
            if (progressRes.error) throw progressRes.error;

            setSteps(stepsRes.data || []);
            setCompletedStepIds(new Set(progressRes.data?.map(p => p.step_id) || []));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = steps.length;
        const completed = steps.filter(s => completedStepIds.has(s.id)).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        const remaining = total - completed;
        const nextStep = steps.find(s => !completedStepIds.has(s.id));

        return { total, completed, remaining, percentage, nextStep };
    }, [steps, completedStepIds]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
                <div className="h-12 w-full max-w-md bg-slate-800 rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
                   {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">{roadmap.title} Dashboard</h1>
                        <p className="text-slate-400 text-sm">Track your progress and master this domain.</p>
                    </div>
                </div>
                <button 
                    onClick={() => onViewChange('skill-progress')}
                    className={`px-6 py-3 bg-gradient-to-r ${roadmap.color_gradient} text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all flex items-center gap-2`}
                >
                    <Zap className="w-5 h-5" />
                    <span>Continue Learning</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Completed Skills', value: stats.completed, total: stats.total, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                    { label: 'Remaining Topics', value: stats.remaining, total: stats.total, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Learning Percentage', value: `${stats.percentage}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Current Level', value: stats.percentage >= 100 ? 'Master' : stats.percentage >= 60 ? 'Advanced' : stats.percentage >= 30 ? 'Intermediate' : 'Beginner', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-white">
                            {stat.value}
                            {stat.total !== undefined && <span className="text-slate-500 text-sm font-normal ml-1">/ {stat.total}</span>}
                        </h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Progress & Next Step */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Progress Card */}
                    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-8 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Learning Percentage</h2>
                            <span className="text-emerald-400 font-bold">{stats.percentage}% Complete</span>
                        </div>
                        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-700">
                            <div 
                                className={`h-full bg-gradient-to-r ${roadmap.color_gradient} transition-all duration-1000 ease-out`}
                                style={{ width: `${stats.percentage}%` }}
                            />
                        </div>
                        <p className="text-slate-400 text-sm italic">"Consistency is the key to mastery. Keep going!"</p>
                    </div>

                    {/* Next Recommended Step */}
                    {stats.nextStep ? (
                        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                            <div className="relative z-10">
                                <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 block">Recommended for you</span>
                                <h3 className="text-2xl font-bold text-white mb-2">{stats.nextStep.title}</h3>
                                <p className="text-slate-300 text-sm mb-6 line-clamp-2">{stats.nextStep.description}</p>
                                <button 
                                    onClick={() => onViewChange('skill-progress')}
                                    className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <span>Start Step</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl text-center">
                            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Roadmap Completed!</h3>
                            <p className="text-slate-300 mb-6">You've mastered all the topics in this roadmap. Ready for the next challenge?</p>
                            <button 
                                onClick={onBack}
                                className="text-emerald-400 font-semibold hover:underline"
                            >
                                Explorer other roadmaps →
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats / Info */}
                <div className="space-y-6">
                    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Skill Progress', icon: Zap, view: 'skill-progress' },
                                { label: 'Completed Milestones', icon: Award, view: 'milestones' }
                            ].map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => onViewChange(link.view as ViewState)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group"
                                >
                                    <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                                        <link.icon className="w-5 h-5" />
                                        <span className="font-medium">{link.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <h3 className="text-lg font-bold text-white">Learning Details</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Total Steps</span>
                                <span className="text-white font-medium">{stats.total}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Avg. Step Time</span>
                                <span className="text-white font-medium">~45 mins</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Total XP Available</span>
                                <span className="text-white font-medium">1,200 XP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningDashboard;
