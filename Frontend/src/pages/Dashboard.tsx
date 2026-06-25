import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { matchService, type Match } from '../services/matchService';
import { Activity, Zap, Target, Users, Clock, Loader2, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await matchService.getAll();
                setMatches(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch match data');
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse p-8">
                <div className="h-10 w-64 bg-slate-800 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>)}
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <AlertCircle size={48} className="text-red-500" />
                <h2 className="text-xl font-bold text-white">{error}</h2>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase">
                        Analytics <span className="text-slate-500">Overview</span>
                    </h1>
                    <p className="text-slate-400">Manage your match footage and review tactical insights</p>
                </div>
                <div className="flex gap-4">
                    <Card className="!py-2 !px-4 bg-slate-900/50 border-slate-800">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-green-500" />
                            <span className="text-xs font-bold text-slate-300">{matches.length} Total Matches</span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Match Grid */}
            <div className="grid grid-cols-1 gap-6">
                {matches.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center py-20 border-dashed border-2 border-slate-800">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} className="text-slate-600" />
                        </div>
                        <h3 className="text-white font-bold text-lg">No matches processed yet</h3>
                        <p className="text-slate-500 mb-6">Upload your first match footage to start the AI analysis</p>
                        <a href="/upload" className="px-8 py-3 bg-green-500 text-slate-950 font-black uppercase tracking-tighter rounded-lg hover:bg-green-400 transition-all">
                            Go to Upload
                        </a>
                    </Card>
                ) : (
                    matches.map((match) => (
                        <Card key={match.id} className="group hover:bg-slate-800/30 transition-all border-slate-800/50 hover:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
                                        <Zap size={24} className="text-slate-600 group-hover:text-green-400 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-xl">{match.title}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(match.created_at).toLocaleDateString()}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${match.status === 'completed' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                                                match.status === 'processing' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10 animate-pulse' :
                                                    match.status === 'failed' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                                        'border-slate-700 text-slate-500 bg-slate-800'
                                                }`}>
                                                {match.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {match.status === 'completed' ? (
                                        <a href={`/analysis?id=${match.id}`} className="px-4 py-2 bg-green-500 text-slate-950 rounded-lg font-bold text-sm hover:bg-green-400 flex items-center gap-2">
                                            Review Analysis <Target size={16} />
                                        </a>
                                    ) : match.status === 'processing' ? (
                                        <div className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg font-bold text-sm flex items-center gap-2">
                                            AI Processing... <Loader2 size={16} className="animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 bg-slate-800 text-slate-600 rounded-lg font-bold text-sm">
                                            Awaiting Task
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
