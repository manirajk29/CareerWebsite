import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import LearningDashboard from './LearningDashboard';
import SkillProgressPage from './SkillProgressPage';
import MilestonesPage from './MilestonesPage';
import { Rocket, Zap, ChevronRight, Target, Brain, Layout, Server, Layers, Cloud } from 'lucide-react';

export type ViewState = 'selection' | 'dashboard' | 'skill-progress' | 'milestones';

interface Roadmap {
    id: string;
    title: string;
    description: string;
    icon_name: string;
    color_gradient: string;
}

const getIcon = (name: string) => {
    switch (name) {
        case 'Layout': return Layout;
        case 'Server': return Server;
        case 'Layers': return Layers;
        case 'Cloud': return Cloud;
        case 'Brain': return Brain;
        default: return Rocket;
    }
};

const ContinuousLearningTracker: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<ViewState>('selection');
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const fetchRoadmaps = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('roadmaps')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            setRoadmaps(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRoadmap = (roadmap: Roadmap) => {
        setSelectedRoadmap(roadmap);
        setView('dashboard');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                <p className="text-slate-500 animate-pulse">Initializing your learning journey...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                <p className="text-red-400 font-medium">Error loading roadmaps: {error}</p>
                <button 
                    onClick={fetchRoadmaps}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (view === 'selection') {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
                        <Zap className="w-4 h-4" />
                        <span>Continuous Learning Tracker</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-4">Choose Your Path</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Select a career roadmap to start your structured learning journey with domain-specific questions, tasks, and automated progress tracking.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map((roadmap) => {
                        const Icon = getIcon(roadmap.icon_name);
                        return (
                            <button
                                key={roadmap.id}
                                onClick={() => handleSelectRoadmap(roadmap)}
                                className="group relative text-left bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-indigo-500/60 transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className={`absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br ${roadmap.color_gradient} opacity-5 group-hover:opacity-15 rounded-full blur-2xl transition-opacity duration-500`} />
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roadmap.color_gradient} flex items-center justify-center mb-5 shadow-lg`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white">{roadmap.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">{roadmap.description}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Start Tracking →</span>
                                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (!selectedRoadmap) return null;

    return (
        <div>
            {view === 'dashboard' && (
                <LearningDashboard 
                    roadmap={selectedRoadmap} 
                    onViewChange={setView} 
                    onBack={() => setView('selection')} 
                />
            )}
            {view === 'skill-progress' && (
                <SkillProgressPage 
                    roadmap={selectedRoadmap} 
                    onBack={() => setView('dashboard')} 
                />
            )}
            {view === 'milestones' && (
                <MilestonesPage 
                    roadmap={selectedRoadmap} 
                    onBack={() => setView('dashboard')} 
                />
            )}
        </div>
    );
};

export default ContinuousLearningTracker;
