import React from 'react';
import Card from '../components/ui/Card';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
    { name: '0-15', intensity: 65, speed: 22 },
    { name: '15-30', intensity: 85, speed: 28 },
    { name: '30-45', intensity: 70, speed: 24 },
    { name: '45-60', intensity: 90, speed: 32 },
    { name: '60-75', intensity: 75, speed: 26 },
    { name: '75-90', intensity: 80, speed: 29 },
];

const Analytics: React.FC = () => {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>
                <p className="text-slate-400 mt-1">Deep-dive squad performance and physical trends</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Physical Intensity" className="lg:col-span-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="intensity" stroke="#22c55e" fillOpacity={1} fill="url(#colorIntensity)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Key Performance Indices">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={20} className="text-accent-blue" />
                                <span className="text-sm text-slate-300">Expected Goals (xG)</span>
                            </div>
                            <span className="text-lg font-bold text-white">2.45</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Target size={20} className="text-accent-gold" />
                                <span className="text-sm text-slate-300">Passing Accuracy</span>
                            </div>
                            <span className="text-lg font-bold text-white">88%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Zap size={20} className="text-pitch-green" />
                                <span className="text-sm text-slate-300">Pressing Intensity</span>
                            </div>
                            <span className="text-lg font-bold text-white">9.2</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Speed Frequency distribution">
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                />
                                <Bar dataKey="speed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Squad Efficiency Matrix">
                    <div className="flex items-center justify-center h-[250px] text-slate-500 italic">
                        Interactive squad radar chart processing...
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
