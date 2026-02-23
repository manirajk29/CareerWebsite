import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { ArrowLeft, CheckCircle2, Circle, Clock } from 'lucide-react';

type Roadmap = Database['public']['Tables']['roadmaps']['Row'];
type RoadmapStep = Database['public']['Tables']['roadmap_steps']['Row'];

interface RoadmapDetailProps {
    roadmap: Roadmap;
    onBack: () => void;
}

const RoadmapDetail: React.FC<RoadmapDetailProps> = ({ roadmap, onBack }) => {
    const [steps, setSteps] = useState<RoadmapStep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSteps();
    }, [roadmap.id]);

    const fetchSteps = async () => {
        try {
            const { data, error } = await supabase
                .from('roadmap_steps')
                .select('*')
                .eq('roadmap_id', roadmap.id)
                .order('step_order', { ascending: true });

            if (error) throw error;
            setSteps(data || []);
        } catch (error) {
            console.error('Error fetching roadmap steps:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
            case 'in-progress':
                return <Clock className="w-6 h-6 text-amber-400" />;
            default:
                return <Circle className="w-6 h-6 text-slate-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Done</span>;
            case 'in-progress':
                return <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Learning</span>;
            default:
                return null; // Don't show badge for pending to keep UI clean
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Header */}
            <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Roadmaps</span>
            </button>

            <div className="mb-12 text-center pb-8 border-b border-slate-800">
                <h1 className={`text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${roadmap.color_gradient} mb-6 tracking-tight drop-shadow-lg`}>
                    {roadmap.title}
                </h1>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    {roadmap.description}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center my-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-slate-700 via-indigo-900/50 to-slate-800 shadow-xl" />

                    {/* Steps Flow */}
                    <div className="space-y-8 relative z-10">
                        {steps.map((step) => (
                            <div key={step.id} className="group flex items-start">
                                {/* Step Connector Node */}
                                <div className="flex-shrink-0 w-20 flex justify-center mt-1 relative">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center relative z-10 border-2 border-slate-700 group-hover:border-indigo-500 transition-colors shadow-lg group-hover:shadow-indigo-500/20">
                                        <span className="text-slate-400 font-bold group-hover:text-indigo-400 transition-colors">{step.step_order}</span>
                                    </div>
                                    {/* Glowing dot effect */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
                                </div>

                                {/* Step Content Card */}
                                <div className="flex-1 ml-4 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 focus-within:border-indigo-500/50 hover:border-slate-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 relative overflow-hidden cursor-pointer">
                                    {/* Subtle gradient background on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors">
                                                    {step.title}
                                                </h3>
                                                {getStatusBadge(step.status)}
                                            </div>
                                            <button className="text-slate-500 hover:text-indigo-400 transition-colors pointer-events-auto" title="Mark status">
                                                {getStatusIcon(step.status)}
                                            </button>
                                        </div>
                                        <p className="text-slate-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapDetail;
