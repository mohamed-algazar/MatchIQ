import React from 'react';
import type { MatchStatistics } from '../../services/matchService';
import { Activity, Zap, Map as MapIcon, RotateCcw } from 'lucide-react';

interface MatchSummaryProps {
    stats: MatchStatistics | null;
    isLoading?: boolean;
}

const MatchSummary: React.FC<MatchSummaryProps> = ({ stats, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const possession1 = stats.possession_team_1;
    const possession2 = stats.possession_team_2;

    return (
        <div className="space-y-8">
            {/* Possession Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-end mb-4">
                    <div className="text-left">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Team A</span>
                        <div className="text-4xl font-black text-white">{possession1.toFixed(1)}%</div>
                    </div>
                    <div className="text-center pb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Possession</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Team B</span>
                        <div className="text-4xl font-black text-white">{possession2.toFixed(1)}%</div>
                    </div>
                </div>

                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
                        style={{ width: `${possession1}%` }}
                    />
                    <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out"
                        style={{ width: `${possession2}%` }}
                    />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Top Speed"
                    value={`${stats.top_speed.toFixed(1)} km/h`}
                    icon={<Zap className="w-6 h-6 text-yellow-400" />}
                    trend="+2.4% vs avg"
                    color="yellow"
                />
                <MetricCard
                    title="Total Distance"
                    value={`${(stats.total_distance_team_1 + stats.total_distance_team_2).toFixed(1)} m`}
                    icon={<MapIcon className="w-6 h-6 text-emerald-400" />}
                    trend="High intensity"
                    color="emerald"
                />
                <MetricCard
                    title="Total Passes"
                    value={stats.total_passes.toString()}
                    icon={<RotateCcw className="w-6 h-6 text-blue-400" />}
                    trend="Precision: 84%"
                    color="blue"
                />
                <MetricCard
                    title="Work Rate"
                    value="Elite"
                    icon={<Activity className="w-6 h-6 text-rose-400" />}
                    trend="Top 5% percentile"
                    color="rose"
                />
            </div>

            {/* Team Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamStatsCard
                    teamName="Team A"
                    distance={stats.total_distance_team_1}
                    color="blue"
                />
                <TeamStatsCard
                    teamName="Team B"
                    distance={stats.total_distance_team_2}
                    color="red"
                />
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, trend, color }: any) => (
    <div className="group bg-slate-900/40 backdrop-blur-md border border-slate-800/50 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 bg-${color}-500/10 rounded-xl group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{trend}</span>
        </div>
        <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
);

const TeamStatsCard = ({ teamName, distance, color }: any) => (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 overflow-hidden relative`}>
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-[60px] rounded-full`}></div>
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <div className={`w-2 h-6 bg-${color}-500 rounded-full`}></div>
            {teamName} Performance
        </h3>

        <div className="space-y-6">
            <div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Total Distance</span>
                    <span className="text-white font-mono">{distance.toFixed(0)}m</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-${color}-500 transition-all duration-1000`}
                        style={{ width: `${Math.min((distance / 10000) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Avg Speed</div>
                    <div className="text-lg font-bold text-white">24.5<span className="text-xs ml-1 text-slate-400">km/h</span></div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Sprints</div>
                    <div className="text-lg font-bold text-white">12</div>
                </div>
            </div>
        </div>
    </div>
);

export default MatchSummary;
