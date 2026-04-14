import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
    ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronUp,
    BookOpen, Wrench, Rocket, Briefcase, Trophy, Star, Target, TrendingUp
} from 'lucide-react';

type Roadmap = Database['public']['Tables']['roadmaps']['Row'];
type RoadmapStep = Database['public']['Tables']['roadmap_steps']['Row'];
type StepWithStatus = RoadmapStep & { userStatus: string };

interface RoadmapDetailProps {
    roadmap: Roadmap;
    onBack: () => void;
}

// ─── Level configuration ───────────────────────────────────────────────────
interface LevelConfig {
    label: string;
    icon: React.ElementType;
    gradient: string;
    border: string;
    glow: string;
    badge: string;
    range: [number, number]; // step_order range [start, end] inclusive
}

const LEVELS: LevelConfig[] = [
    {
        label: 'Beginner Level',
        icon: BookOpen,
        gradient: 'from-emerald-500 to-teal-500',
        border: 'border-emerald-500/40',
        glow: 'shadow-emerald-500/20',
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        range: [1, 3],
    },
    {
        label: 'Intermediate Level',
        icon: Wrench,
        gradient: 'from-blue-500 to-indigo-500',
        border: 'border-blue-500/40',
        glow: 'shadow-blue-500/20',
        badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        range: [4, 6],
    },
    {
        label: 'Advanced Level',
        icon: Rocket,
        gradient: 'from-purple-500 to-pink-500',
        border: 'border-purple-500/40',
        glow: 'shadow-purple-500/20',
        badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        range: [7, 9],
    },
    {
        label: 'Career Preparation',
        icon: Briefcase,
        gradient: 'from-amber-500 to-orange-500',
        border: 'border-amber-500/40',
        glow: 'shadow-amber-500/20',
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        range: [10, 999],
    },
];

function getLevelForStep(order: number): number {
    for (let i = 0; i < LEVELS.length; i++) {
        const [start, end] = LEVELS[i].range;
        if (order >= start && order <= end) return i;
    }
    return LEVELS.length - 1;
}

// ─── Sub-topic list per level (static enrichment) ─────────────────────────
const LEVEL_SUBTOPICS: Record<number, string[][]> = {
    0: [['Fundamentals', 'Basic Concepts', 'Terminology'], ['Core Principles', 'Setup & Tools', 'First Project'], ['Practice Problems', 'Mini Projects', 'Review']],
    1: [['Popular Frameworks', 'Libraries', 'CLI Tools'], ['Testing Basics', 'Debugging', 'Version Control'], ['APIs', 'Databases', 'Integration']],
    2: [['Architecture Patterns', 'Performance', 'Security'], ['Advanced Tools', 'CI/CD', 'Cloud Basics'], ['Open Source', 'Portfolio Projects', 'Real-world Apps']],
    3: [['Resume Building', 'LinkedIn Optimization', 'GitHub Portfolio'], ['Technical Interview Prep', 'DSA Practice', 'System Design'], ['Soft Skills', 'Networking', 'Job Applications']],
};

// ─── Component ────────────────────────────────────────────────────────────
const RoadmapDetail: React.FC<RoadmapDetailProps> = ({ roadmap, onBack }) => {
    const { user } = useAuth();
    const [steps, setSteps] = useState<StepWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0]));
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
    const [toggling, setToggling] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchSteps();
    }, [roadmap.id, user?.id]);

    const fetchSteps = async () => {
        if (!user) return;
        try {
            const [{ data: stepsData, error: stepsError }, { data: progressData, error: progressError }] = await Promise.all([
                supabase.from('roadmap_steps').select('*').eq('roadmap_id', roadmap.id).order('step_order', { ascending: true }),
                supabase.from('user_roadmap_progress').select('*').eq('user_id', user.id),
            ]);
            if (stepsError) throw stepsError;
            if (progressError) throw progressError;

            const merged = (stepsData || []).map(step => ({
                ...step,
                userStatus: progressData?.find(p => p.step_id === step.id)?.status || 'pending',
            }));
            setSteps(merged);
        } catch (err) {
            console.error('Error fetching roadmap steps:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStepStatus = async (stepId: string, currentStatus: string) => {
        if (!user || toggling.has(stepId)) return;
        const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        setToggling(prev => new Set(prev).add(stepId));
        try {
            const { error } = await supabase
                .from('user_roadmap_progress')
                .upsert(
                    { user_id: user.id, step_id: stepId, status: nextStatus, completed_at: nextStatus === 'completed' ? new Date().toISOString() : null },
                    { onConflict: 'user_id, step_id' }
                );
            if (error) throw error;
            setSteps(prev => prev.map(s => s.id === stepId ? { ...s, userStatus: nextStatus } : s));
        } catch (err) {
            console.error('Error updating step status:', err);
        } finally {
            setToggling(prev => { const s = new Set(prev); s.delete(stepId); return s; });
        }
    };

    // ─── Derived data ──────────────────────────────────────────────────────
    const completedCount = useMemo(() => steps.filter(s => s.userStatus === 'completed').length, [steps]);
    const totalCount = steps.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const grouped = useMemo(() => {
        return LEVELS.map((lvl, idx) => ({
            level: lvl,
            levelIdx: idx,
            steps: steps.filter(s => getLevelForStep(s.step_order) === idx),
        }));
    }, [steps]);

    const toggleLevel = (idx: number) => {
        setExpandedLevels(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const toggleStep = (id: string) => {
        setExpandedSteps(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Roadmaps</span>
            </button>

            {/* Hero */}
            <div className="relative mb-10 text-center">
                <div className={`absolute inset-0 bg-gradient-to-r ${roadmap.color_gradient} opacity-5 rounded-3xl blur-2xl`} />
                <div className="relative z-10 py-10 px-6">
                    <h1 className={`text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${roadmap.color_gradient} mb-4 tracking-tight`}>
                        {roadmap.title}
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        {roadmap.description}
                    </p>
                </div>
            </div>

            {/* ── Progress Tracker ─────────────────────────────────────── */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Your Progress</p>
                            <p className="text-slate-500 text-xs">{completedCount} of {totalCount} topics completed</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${roadmap.color_gradient}`}>
                            {progressPct}%
                        </p>
                        {progressPct === 100 && (
                            <p className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                                <Trophy className="w-3 h-3" /> Complete!
                            </p>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${roadmap.color_gradient} transition-all duration-700 ease-out`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>

                {/* Level mini-progress */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                    {grouped.map(({ level, levelIdx, steps: lvlSteps }) => {
                        const done = lvlSteps.filter(s => s.userStatus === 'completed').length;
                        const total = lvlSteps.length;
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                        const LvlIcon = level.icon;
                        return (
                            <div key={levelIdx} className="text-center">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${level.gradient} flex items-center justify-center mx-auto mb-1 ${pct === 100 ? 'shadow-lg' : 'opacity-40'}`}>
                                    <LvlIcon className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-slate-500 text-[10px]">{pct}%</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Roadmap Levels ───────────────────────────────────────── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                    <p className="text-slate-500 text-sm">Loading your roadmap...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {grouped.map(({ level, levelIdx, steps: lvlSteps }) => {
                        if (lvlSteps.length === 0) return null;
                        const isExpanded = expandedLevels.has(levelIdx);
                        const lvlDone = lvlSteps.filter(s => s.userStatus === 'completed').length;
                        const lvlPct = Math.round((lvlDone / lvlSteps.length) * 100);
                        const LvlIcon = level.icon;
                        const allDone = lvlDone === lvlSteps.length;

                        return (
                            <div
                                key={levelIdx}
                                className={`rounded-2xl border ${level.border} overflow-hidden transition-all duration-300 ${allDone ? `shadow-lg ${level.glow}` : ''}`}
                            >
                                {/* Level Header */}
                                <button
                                    onClick={() => toggleLevel(levelIdx)}
                                    className="w-full flex items-center justify-between p-5 bg-slate-800/70 hover:bg-slate-800/90 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <LvlIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {allDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                                <h2 className="text-white font-bold text-lg leading-tight">{level.label}</h2>
                                            </div>
                                            <p className="text-slate-500 text-sm mt-0.5">
                                                {lvlDone}/{lvlSteps.length} topics · {lvlPct}% done
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:block w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${level.gradient} rounded-full transition-all duration-500`}
                                                style={{ width: `${lvlPct}%` }}
                                            />
                                        </div>
                                        {isExpanded
                                            ? <ChevronUp className="w-5 h-5 text-slate-400" />
                                            : <ChevronDown className="w-5 h-5 text-slate-400" />
                                        }
                                    </div>
                                </button>

                                {/* Steps inside level */}
                                {isExpanded && (
                                    <div className="p-4 bg-slate-900/40 space-y-3">
                                        {/* Connector line */}
                                        <div className="relative">
                                            <div className={`absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b ${level.gradient} opacity-20`} />

                                            <div className="space-y-3">
                                                {lvlSteps.map((step, stepIdx) => {
                                                    const isStepExpanded = expandedSteps.has(step.id);
                                                    const isDone = step.userStatus === 'completed';
                                                    const isTogglingThis = toggling.has(step.id);
                                                    const subtopics = LEVEL_SUBTOPICS[levelIdx]?.[stepIdx] || [];

                                                    return (
                                                        <div key={step.id} className="relative pl-14">
                                                            {/* Node */}
                                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${isDone ? `bg-gradient-to-br ${level.gradient} border-transparent shadow-lg` : 'bg-slate-800 border-slate-600 hover:border-slate-400'}`}>
                                                                {isDone
                                                                    ? <CheckCircle2 className="w-5 h-5 text-white" />
                                                                    : <span className="text-slate-400 text-sm font-bold">{step.step_order}</span>
                                                                }
                                                            </div>

                                                            {/* Step card */}
                                                            <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${isDone ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60'}`}>
                                                                {/* Card header */}
                                                                <div className="flex items-center justify-between p-4 gap-3">
                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                        <div className="flex-1 min-w-0">
                                                                            <h3 className={`font-semibold text-sm leading-snug ${isDone ? 'text-emerald-100' : 'text-slate-100'}`}>
                                                                                {step.title}
                                                                            </h3>
                                                                            <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{step.description}</p>
                                                                        </div>
                                                                        {isDone && (
                                                                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${level.badge}`}>
                                                                                ✓ Done
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                                        {/* Expand subtopics */}
                                                                        {subtopics.length > 0 && (
                                                                            <button
                                                                                onClick={() => toggleStep(step.id)}
                                                                                className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                                                                title="Expand topics"
                                                                            >
                                                                                {isStepExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                            </button>
                                                                        )}
                                                                        {/* Mark complete */}
                                                                        <button
                                                                            onClick={() => toggleStepStatus(step.id, step.userStatus)}
                                                                            disabled={isTogglingThis}
                                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isDone
                                                                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-red-500/20 hover:text-red-300 border border-emerald-500/30 hover:border-red-500/30'
                                                                                : `bg-gradient-to-r ${level.gradient} text-white hover:opacity-90 shadow-md`
                                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                        >
                                                                            {isTogglingThis ? (
                                                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                            ) : isDone ? (
                                                                                <>
                                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                                    <span>Completed</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Circle className="w-3 h-3" />
                                                                                    <span>Mark Done</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Expandable sub-topics */}
                                                                {isStepExpanded && subtopics.length > 0 && (
                                                                    <div className="px-4 pb-4 border-t border-slate-700/40">
                                                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-3 mb-2 flex items-center gap-1">
                                                                            <Target className="w-3 h-3" /> Topics to cover
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {subtopics.map((topic) => (
                                                                                <div
                                                                                    key={topic}
                                                                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-700/60 border border-slate-600/40 text-slate-300"
                                                                                >
                                                                                    <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                                                                    {topic}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bottom CTA */}
            {!loading && progressPct === 100 && (
                <div className="mt-10 text-center py-10 px-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-2">Roadmap Complete! 🎉</h3>
                    <p className="text-slate-400 text-sm max-w-md mx-auto">
                        You've completed the entire <span className="text-white font-medium">{roadmap.title}</span> roadmap. You're ready to apply for jobs!
                    </p>
                </div>
            )}
        </div>
    );
};

export default RoadmapDetail;
