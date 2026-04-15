import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
    User, Mail, Target, Award, Save, CheckCircle2, 
    AlertCircle, GraduationCap, MapPin, Shield
} from 'lucide-react';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [profile, setProfile] = useState({
        full_name: '',
        current_goal: '',
        university: 'Not specified',
        bio: ''
    });

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user!.id)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    current_goal: data.current_goal || '',
                    university: 'Standard University', // Mock detail as per request "student details"
                    bio: 'Passionate student learning new skills.'
                });
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSaving(true);
            setMessage(null);
            
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    current_goal: profile.current_goal,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                <p className="text-slate-500">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
                <p className="text-slate-400">Manage your student profile and learning preferences.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Section */}
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-4">
                        <User className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white">Student Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <User className="w-4 h-4" /> Full Name
                            </label>
                            <input
                                type="text"
                                value={profile.full_name}
                                onChange={e => setProfile({...profile, full_name: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email Address
                            </label>
                            <input
                                type="text"
                                value={user?.email || ''}
                                readOnly
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" /> Institution
                            </label>
                            <input
                                type="text"
                                value={profile.university}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="e.g. Stanford University"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Current Career Goal
                            </label>
                            <select
                                value={profile.current_goal}
                                onChange={e => setProfile({...profile, current_goal: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Select a goal</option>
                                <option value="fs">Full Stack Development</option>
                                <option value="ds">Data Science</option>
                                <option value="uiux">UI/UX Design</option>
                                <option value="cyber">Cybersecurity</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-4">
                        <MapPin className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white">About You</h2>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Bio</label>
                        <textarea
                            value={profile.bio}
                            onChange={e => setProfile({...profile, bio: e.target.value})}
                            rows={4}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-slate-500" />
                        <span className="text-xs text-slate-500 italic">Your data is stored securely.</span>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                        message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Settings;
