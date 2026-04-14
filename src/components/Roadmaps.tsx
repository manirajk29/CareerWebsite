import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { Layout, Server, Layers, Cloud, Brain as BrainIcon, ChevronRight, Map, Sparkles } from 'lucide-react';
import RoadmapDetail from './RoadmapDetail';

type Roadmap = Database['public']['Tables']['roadmaps']['Row'];

const getIcon = (name: string) => {
    switch (name) {
        case 'Layout': return Layout;
        case 'Server': return Server;
        case 'Layers': return Layers;
        case 'Cloud': return Cloud;
        case 'Brain': return BrainIcon;
        default: return Layout;
    }
};

const gradientMap: Record<string, string> = {
    'from-blue-500 to-cyan-500': '#3b82f6',
    'from-purple-500 to-pink-500': '#a855f7',
    'from-green-500 to-emerald-500': '#22c55e',
    'from-orange-500 to-red-500': '#f97316',
    'from-indigo-500 to-violet-500': '#6366f1',
};

const Roadmaps: React.FC = () => {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const fetchRoadmaps = async () => {
        try {
            const { data, error } = await supabase
                .from('roadmaps')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            setRoadmaps(data || []);
        } catch (error) {
            console.error('Error fetching roadmaps:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedRoadmap) {
        return <RoadmapDetail roadmap={selectedRoadmap} onBack={() => setSelectedRoadmap(null)} />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hero Header */}
            <div className="relative text-center mb-16">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[200px] bg-indigo-600/10 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Step-by-step career roadmaps</span>
                    </div>
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
                        Career Roadmaps
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Choose a domain and follow a structured, step-by-step learning path from beginner to job-ready — just like <span className="text-indigo-400 font-semibold">roadmap.sh</span>.
                    </p>
                </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-8 mb-12">
                {['Choose Domain', 'Follow Roadmap', 'Track Progress'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-sm font-bold">
                            {i + 1}
                        </div>
                        <span className="text-slate-400 text-sm font-medium hidden sm:block">{step}</span>
                        {i < 2 && <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:block" />}
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center my-24 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                    <p className="text-slate-500 text-sm">Loading roadmaps...</p>
                </div>
            ) : roadmaps.length === 0 ? (
                <div className="text-center py-24">
                    <Map className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">No roadmaps available yet.</p>
                    <p className="text-slate-600 text-sm mt-1">Check back soon — we're building them!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map((roadmap) => {
                        const Icon = getIcon(roadmap.icon_name);
                        return (
                            <button
                                key={roadmap.id}
                                onClick={() => setSelectedRoadmap(roadmap)}
                                className="group relative text-left bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-indigo-500/60 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                {/* BG glow */}
                                <div className={`absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br ${roadmap.color_gradient} opacity-5 group-hover:opacity-15 rounded-full blur-2xl transition-opacity duration-500`} />

                                {/* Icon row */}
                                <div className="flex items-start justify-between mb-5 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${roadmap.color_gradient} shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 group-hover:text-indigo-400 transition-colors">
                                        <span className="text-xs font-medium">Start</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Title & desc */}
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                                        {roadmap.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                        {roadmap.description}
                                    </p>
                                </div>

                                {/* Roadmap.sh style level pills */}
                                <div className="flex flex-wrap gap-2 mt-5 relative z-10">
                                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                        <span key={level} className="text-xs px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40">
                                            {level}
                                        </span>
                                    ))}
                                </div>

                                {/* Bottom divider + CTA */}
                                <div className="mt-5 pt-4 border-t border-slate-700/40 flex items-center justify-between relative z-10">
                                    <span className="text-xs text-slate-500">Step-by-step path</span>
                                    <span className={`text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r ${roadmap.color_gradient}`}>
                                        View Roadmap →
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Roadmaps;
