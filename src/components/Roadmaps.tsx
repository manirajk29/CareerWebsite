import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { Layout, Server, Layers, Cloud, Brain as BrainIcon, ChevronRight } from 'lucide-react';
import RoadmapDetail from './RoadmapDetail';

type Roadmap = Database['public']['Tables']['roadmaps']['Row'];

// Helper to map string icon names to Lucide icons
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
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 mt-8">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 drop-shadow-sm">
                    Developer Roadmaps
                </h1>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                    Comprehensive step-by-step guides to help you master different roles. Follow these paths to guide your learning and build your career.
                </p>
            </div>

            <div className="flex justify-center mb-12">
                <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-slate-300 font-medium">Role-based Roadmaps</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center my-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map((roadmap) => {
                        const Icon = getIcon(roadmap.icon_name);
                        return (
                            <div
                                key={roadmap.id}
                                onClick={() => setSelectedRoadmap(roadmap)}
                                className="group relative bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-slate-500/50 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
                            >
                                {/* Background gradient hint */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${roadmap.color_gradient} opacity-5 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-300 -mr-16 -mt-16`} />

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${roadmap.color_gradient} shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-colors">
                                        {roadmap.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                        {roadmap.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Roadmaps;
