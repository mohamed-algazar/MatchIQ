import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';

import VideoOverlayPlayer from '../features/video/VideoOverlayPlayer';
import SoccerPitch from '../features/analytics/SoccerPitch';
import HeatmapOverlay from '../features/analytics/HeatmapOverlay';
import PassingNetwork from '../features/analytics/PassingNetwork';
import MatchSummary from '../features/analytics/MatchSummary';
import { matchService } from '../services/matchService';
import type { MatchStatistics } from '../services/matchService';
import { ToggleLeft, ToggleRight, Download, Share2, Loader2, TrendingUp } from 'lucide-react';
import { useParams } from 'react-router-dom';

const Analysis: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const matchId = id ? parseInt(id) : 1; // Fallback for dev

    const [showHeatmap, setShowHeatmap] = useState(true);
    const [activeTab, setActiveTab] = useState<'heatmap' | 'network'>('heatmap');
    const [stats, setStats] = useState<MatchStatistics | null>(null);
    const [telemetry, setTelemetry] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [telemetryLoading, setTelemetryLoading] = useState(true);
    const [match, setMatch] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setStatsLoading(true);
                setTelemetryLoading(true);

                const [statsData, telemetryData, matchData] = await Promise.all([
                    matchService.getStatistics(matchId),
                    matchService.getTelemetry(matchId),
                    matchService.getById(matchId)
                ]);

                setStats(statsData);
                setTelemetry(telemetryData);
                setMatch(matchData);
            } catch (error) {
                console.error("Failed to fetch match data", error);
            } finally {
                setStatsLoading(false);
                setTelemetryLoading(false);
            }
        };
        fetchData();
    }, [matchId]);

    // Format telemetry for VideoOverlayPlayer
    const formattedFrames = telemetry.map(f => ({
        frameNumber: f.frame_number,
        timestamp: f.timestamp,
        playerCoordinates: f.data.players.map((p: any) => ({
            id: p.id.toString(),
            x: p.x,
            y: p.y,
            team: p.team === 1 ? 'home' as const : 'away' as const
        }))
    }));

    // Generate heatmap from all positions
    const heatmapData = telemetry.flatMap(f => f.data.players).map(p => ({
        x: p.x,
        y: p.y,
        value: 1
    }));

    // Mock data for passing network
    const networkData = {
        nodes: [
            { id: '1', name: 'Rodri' }, { id: '2', name: 'De Bruyne' },
            { id: '3', name: 'Foden' }, { id: '4', name: 'Haaland' },
            { id: '5', name: 'Bernardo' }
        ],
        links: [
            { source: '1', target: '2', weight: 15 },
            { source: '2', target: '3', weight: 8 },
            { source: '3', target: '4', weight: 12 },
            { source: '2', target: '5', weight: 10 },
            { source: '1', target: '5', weight: 5 },
        ]
    };

    // Construct video URL
    const videoUrl = match?.processed_video_path
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${match.processed_video_path}`
        : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Tactical Analysis Engine</h1>
                    <p className="text-slate-400">Deep-dive spatial telemetry and event-based tracking.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => matchService.downloadReport(matchId)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                        <Download size={18} />
                        <span className="text-sm font-bold">Export Report</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-slate-950 rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-500/10">
                        <Share2 size={18} />
                        <span className="text-sm font-bold">Share Session</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Video Column */}
                <div className="space-y-6">
                    <Card title="Match Footage Tracking" subtitle="AI-Sync Bounding Boxes & Identifiers">
                        <VideoOverlayPlayer
                            videoUrl={videoUrl}
                            frames={formattedFrames.length > 0 ? formattedFrames : []}
                            isLoading={telemetryLoading}
                        />
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="!p-4 border-l-4 border-l-green-500">
                            <p className="text-xs text-slate-500 font-black uppercase mb-1">Inference Engine</p>
                            <p className="text-xl font-bold">98.2% Accuracy</p>
                        </Card>
                        <Card className="!p-4 border-l-4 border-l-blue-500">
                            <p className="text-xs text-slate-500 font-black uppercase mb-1">FPS Target</p>
                            <p className="text-xl font-bold">60.0 Real-time</p>
                        </Card>
                    </div>
                </div>

                {/* Spatial Column */}
                <div className="space-y-6">
                    <Card className="min-h-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('heatmap')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'heatmap' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                                >
                                    HEATMAP
                                </button>
                                <button
                                    onClick={() => setActiveTab('network')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'network' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                                >
                                    PASSING NETWORK
                                </button>
                            </div>

                            {activeTab === 'heatmap' && (
                                <button
                                    onClick={() => setShowHeatmap(!showHeatmap)}
                                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showHeatmap ? <ToggleRight className="text-green-500" size={24} /> : <ToggleLeft size={24} />}
                                    <span className="text-xs font-bold">DENSITY SCAN</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1">
                            {activeTab === 'heatmap' ? (
                                <div className="animate-in fade-in duration-500">
                                    <SoccerPitch className="w-full">
                                        {showHeatmap && <HeatmapOverlay data={heatmapData} />}
                                    </SoccerPitch>
                                </div>
                            ) : (
                                <div className="h-[400px] w-full animate-in zoom-in-95 duration-500">
                                    <PassingNetwork {...networkData} width={500} height={400} />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                            <div className="space-y-2">
                                <p>Pitch Grid Resolution</p>
                                <p className="text-slate-200">105m x 68m (Standard)</p>
                            </div>
                            <div className="space-y-2">
                                <p>Telemetry Source</p>
                                <p className="text-slate-200 text-green-500">AI Coordinate Mapping</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Performance Summary Section */}
            <div className="pt-8 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <TrendingUp className="text-green-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Performance Summary</h2>
                        <p className="text-sm text-slate-400">AI-computed match metrics and physical benchmarks.</p>
                    </div>
                </div>

                <MatchSummary stats={stats} isLoading={statsLoading} />
            </div>
        </div>
    );
};

export default Analysis;
