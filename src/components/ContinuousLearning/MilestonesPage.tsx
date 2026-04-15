import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
    Award, ArrowLeft, CheckCircle2, Trophy, Star, 
    Calendar, Map, Flag, Zap, ShieldCheck
} from 'lucide-react';

interface Milestone {
    id: string;
    title: string;
    completed_at: string;
    order: number;
}

interface MilestonesPageProps {
    roadmap: {
        id: string;
        title: string;
        color_gradient: string;
    };
    onBack: () => void;
}

const MilestonesPage: React.FC<MilestonesPageProps> = ({ roadmap, onBack }) => {
    const { user } = useAuth();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchMilestones();
    }, [user, roadmap.id]);

    const fetchMilestones = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_roadmap_progress')
                .select('completed_at, roadmap_steps(title, step_order)')
                .eq('user_id', user!.id)
                .eq('status', 'completed')
                .order('completed_at', { ascending: false });

            if (error) throw error;

            const formatted = (data || []).map((item: any) => ({
                id: Math.random().toString(), // local id
                title: item.roadmap_steps.title,
                completed_at: item.completed_at,
                order: item.roadmap_steps.step_order
            }));

            setMilestones(formatted);
        } catch (err) {
            console.error('Error fetching milestones:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                <p className="text-slate-500">Retrieving your achievements...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            <div className="text-center mb-16">
                <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-400/5">
                    <Trophy className="w-10 h-10 text-yellow-400" />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3">Completed Milestones</h1>
                <p className="text-slate-400 max-w-lg mx-auto">
                    Your achievements in the <span className="text-white font-semibold">{roadmap.title}</span> roadmap. Every step you complete is a milestone toward mastery.
                </p>
            </div>

            {milestones.length === 0 ? (
                <div className="bg-slate-800/40 border border-dashed border-slate-700 p-12 rounded-3xl text-center">
                    <Map className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400 mb-2">No Milestones Yet</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Start your learning journey to unlock achievements and track your progress here.</p>
                    <button 
                        onClick={onBack}
                        className={`px-6 py-2.5 bg-gradient-to-r ${roadmap.color_gradient} text-white rounded-xl font-semibold shadow-lg`}
                    >
                        Back to Dashboard
                    </button>
                </div>
            ) : (
                <div className="relative space-y-8">
                    {/* Vertical line connector */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-800 hidden md:block" />

                    {milestones.map((milestone, idx) => (
                        <div key={milestone.id} className="relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
                            {/* Icon node */}
                            <div className={`relative z-10 w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:border-yellow-500/50 transition-all duration-500`}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${roadmap.color_gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                                <Star className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform duration-500" />
                            </div>

                            {/* Card */}
                            <div className="flex-1 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-3xl hover:border-slate-600/80 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Achieved</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">{milestone.title}</h3>
                                        <div className="flex items-center gap-4 text-slate-500 text-xs">
                                            <span className="flex items-center gap-1.5">
                                                <Zap className="w-3.5 h-3.5" /> Roadmap Step {milestone.order}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> Completed on {new Date(milestone.completed_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-xl">
                                        <Award className="w-4 h-4 text-yellow-400" />
                                        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">+100 XP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MilestonesPage;
