import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
    ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronUp,
    MessageSquare, ClipboardList, Flag, Star, Rocket, PlayCircle,
    Zap, Lock, ShieldCheck, HelpCircle
} from 'lucide-react';

interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    step_order: number;
}

interface StepWithProgress extends RoadmapStep {
    status: 'pending' | 'completed';
}

interface SkillProgressPageProps {
    roadmap: {
        id: string;
        title: string;
        color_gradient: string;
    };
    onBack: () => void;
}

const SkillProgressPage: React.FC<SkillProgressPageProps> = ({ roadmap, onBack }) => {
    const { user } = useAuth();
    const [steps, setSteps] = useState<StepWithProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchSteps();
    }, [user, roadmap.id]);

    const fetchSteps = async () => {
        try {
            setLoading(true);
            const [stepsRes, progressRes] = await Promise.all([
                supabase.from('roadmap_steps').select('*').eq('roadmap_id', roadmap.id).order('step_order', { ascending: true }),
                supabase.from('user_roadmap_progress').select('*').eq('user_id', user!.id)
            ]);

            if (stepsRes.error) throw stepsRes.error;
            
            const progressMap = new Map(progressRes.data?.map(p => [p.step_id, p.status]) || []);
            const merged = (stepsRes.data || []).map(step => ({
                ...step,
                status: (progressMap.get(step.id) as any) || 'pending'
            }));

            setSteps(merged);
            // Default expand the first pending step
            const firstPending = merged.find(s => s.status === 'pending');
            if (firstPending) setExpandedStepId(firstPending.id);
        } catch (err) {
            console.error('Error fetching steps:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (stepId: string, currentStatus: string) => {
        if (!user || toggling === stepId) return;
        setToggling(stepId);
        const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        
        try {
            await supabase.from('user_roadmap_progress').upsert({
                user_id: user.id,
                step_id: stepId,
                status: nextStatus,
                completed_at: nextStatus === 'completed' ? new Date().toISOString() : null
            }, { onConflict: 'user_id, step_id' });

            setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: nextStatus } : s));
        } catch (err) {
            console.error('Error toggling status:', err);
        } finally {
            setToggling(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                <p className="text-slate-500">Loading learning steps...</p>
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

            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Skill Progress</h1>
                <p className="text-slate-400">Complete tasks and answer questions to master each topic.</p>
            </div>

            <div className="space-y-4">
                {steps.map((step, idx) => {
                    const isExpanded = expandedStepId === step.id;
                    const isDone = step.status === 'completed';
                    const isTogglingThis = toggling === step.id;

                    return (
                        <div 
                            key={step.id} 
                            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                isDone 
                                    ? 'border-emerald-500/20 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' 
                                    : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60'
                            }`}
                        >
                            {/* Header */}
                            <div className="p-5 flex items-center justify-between gap-4">
                                <button 
                                    onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                                    className="flex items-center gap-4 flex-1 text-left"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all ${
                                        isDone ? `bg-gradient-to-br ${roadmap.color_gradient} text-white` : 'bg-slate-700/60 text-slate-400'
                                    }`}>
                                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <span>{step.step_order}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-lg leading-snug ${isDone ? 'text-emerald-100' : 'text-slate-100'}`}>
                                            {step.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-1">{step.description}</p>
                                    </div>
                                </button>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => toggleStatus(step.id, step.status)}
                                        disabled={isTogglingThis}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                            isDone 
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                                : `bg-gradient-to-r ${roadmap.color_gradient} text-white shadow-md hover:scale-[1.02]`
                                        } disabled:opacity-50`}
                                    >
                                        {isTogglingThis ? '...' : isDone ? 'Completed' : 'Complete Step'}
                                    </button>
                                    <button 
                                        onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                                        className="text-slate-500 hover:text-white transition-colors"
                                    >
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-5 pb-6 border-t border-slate-700/30 pt-6 space-y-6">
                                    {/* Questions Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Knowledge Checkpoints</span>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
                                            <p className="text-slate-200 text-sm font-medium mb-3">Which of the following is most important for this topic?</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {['Understanding Core Principles', 'Memorizing Syntax', 'Copying Code Snippets'].map((opt, i) => (
                                                    <button key={i} className="text-left w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-400 hover:border-indigo-500/50 transition-all">
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tasks Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
                                            <ClipboardList className="w-4 h-4" />
                                            <span>Practice Tasks</span>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Set up development environment', type: 'Setup' },
                                                { label: 'Create a basic module using this concept', type: 'Coding' }
                                            ].map((task, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-5 h-5 rounded-md border border-slate-700 flex items-center justify-center text-slate-700 group-hover:border-emerald-500/50 transition-all">
                                                            <div className="w-2 h-2 bg-emerald-500 rounded-sm opacity-0 group-hover:opacity-20 transition-all" />
                                                        </div>
                                                        <span className="text-slate-300 text-sm">{task.label}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{task.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Final Checkpoint */}
                                    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent p-4 rounded-2xl border border-indigo-500/10 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-white text-sm font-bold">Ready to master {step.title}?</h4>
                                            <p className="text-slate-400 text-xs">Complete all tasks above to move to the next milestone.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillProgressPage;
