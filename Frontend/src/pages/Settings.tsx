import React from 'react';
import Card from '../components/ui/Card';
import { User, Bell, Shield, Palette, Languages, Globe } from 'lucide-react';

const Settings: React.FC = () => {
    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-slate-400">Manage your profile, preferences, and security settings</p>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* Profile Section */}
                <Card title="Account Profile" subtitle="Public identity and personal details">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-gold/20 to-accent-blue/20 flex items-center justify-center text-accent-gold border border-white/10 overflow-hidden">
                                <User size={48} className="transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <button title='btn submit' className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors shadow-xl">
                                <Palette size={14} />
                            </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
                                <input
                                    title='input data'
                                    type="text"
                                    defaultValue="Mahmoud Analyst"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent-blue/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
                                <input
                                    title='input data'
                                    type="email"
                                    defaultValue="mahmoud@football-ai.com"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent-blue/50 transition-colors"
                                />
                            </div>
                            <div className="md:col-span-2 pt-2">
                                <button title='btn submit' className="bg-accent-blue hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/10 active:scale-95">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Notifications */}
                    <Card title="Notifications" subtitle="How you receive match insights">
                        <div className="space-y-4">
                            {[
                                { label: 'Match Analysis Ready', icon: Globe, enabled: true },
                                { label: 'New Tactical Reports', icon: Bell, enabled: true },
                                { label: 'System Announcements', icon: Shield, enabled: false },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className="text-slate-400" />
                                        <span className="text-sm font-medium text-slate-200">{item.label}</span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${item.enabled ? 'bg-pitch-green' : 'bg-slate-700'}`}>
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.enabled ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Preferences */}
                    <Card title="Preferences" subtitle="Personalize your dashboard experience">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Language</label>
                                <div className="relative group">
                                    <Languages size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select title='input select' className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-11 py-2.5 text-slate-200 appearance-none focus:outline-none focus:border-accent-blue/50 transition-colors">
                                        <option>English (US)</option>
                                        <option>Arabic (SA)</option>
                                        <option>Spanish (ES)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unit System</label>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 rounded-xl bg-accent-blue text-white text-xs font-bold border border-accent-blue/20 transition-all shadow-lg shadow-blue-500/10">Metric (KM/h)</button>
                                    <button className="flex-1 py-2 rounded-xl bg-slate-900/50 text-slate-400 text-xs font-bold border border-slate-800 hover:text-slate-300 transition-all">Imperial (MPH)</button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Security Section */}
                <Card title="Security" subtitle="Protect your account and tactical data">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 py-4 px-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-accent-gold/30 hover:bg-accent-gold/5 group transition-all">
                            <div className="flex items-center gap-4 mb-1">
                                <Shield size={20} className="text-accent-gold group-hover:scale-110 transition-transform" />
                                <span className="font-semibold text-white">Two-Factor Auth</span>
                            </div>
                            <p className="text-xs text-slate-500 text-left">Add an extra layer of security to your account.</p>
                        </button>
                        <button className="flex-1 py-4 px-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-accent-blue/30 hover:bg-accent-blue/5 group transition-all">
                            <div className="flex items-center gap-4 mb-1">
                                <User size={20} className="text-accent-blue group-hover:scale-110 transition-transform" />
                                <span className="font-semibold text-white">Change Password</span>
                            </div>
                            <p className="text-xs text-slate-500 text-left">Update your password regularly for safety.</p>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
