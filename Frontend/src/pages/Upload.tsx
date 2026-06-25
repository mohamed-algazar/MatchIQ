import React, { useState } from 'react';
import UploadZone from '../features/upload/UploadZone';
import { useNavigate } from 'react-router-dom';
import { Cpu, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import { matchService } from '../services/matchService';

const Upload: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing'>('idle');
    const [progress, setProgress] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleUpload = async (file: File) => {
        if (!title.trim()) {
            setError('Please provide a match title before uploading');
            return;
        }

        setError(null);
        setStatus('uploading');

        try {
            // 1. Create Match Metadata
            const match = await matchService.create(title, description);

            // 2. Upload Video
            await matchService.uploadVideo(match.id, file, (p) => {
                setProgress(p);
            });

            setStatus('processing');
            // Allow some time for the processing UI to be seen before redirecting
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            console.error(err);
            setError('Upload failed. Please ensure the backend is running.');
            setStatus('idle');
            setProgress(0);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight italic uppercase">
                    New Analysis <span className="text-slate-500">Pipeline</span>
                </h1>
                <p className="text-slate-400">Specify match details and upload footage for AI extraction.</p>
            </div>

            {status === 'idle' || status === 'uploading' ? (
                <div className="flex flex-col gap-8">
                    <div className="w-full">
                        <UploadZone
                            onUpload={handleUpload}
                            isUploading={status === 'uploading'}
                            progress={progress}
                        />
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="w-full">
                            <Card title="Match Metadata" subtitle="Required for identification">
                                <div className="space-y-4 mt-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Match Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Manchester City vs Arsenal"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Description (Optional)</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="League, Round, or Tactical notes..."
                                            rows={3}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500 transition-colors resize-none"
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <CheckCircle size={12} className="rotate-45" /> {error}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="!p-4 bg-slate-900/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Clock size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-tight">Async Engine</p>
                                        <p className="text-xs text-slate-500">Processing on Celery GPU Workers</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="!p-4 bg-slate-900/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><Cpu size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-tight">AI Tracking</p>
                                        <p className="text-xs text-slate-500">Spatial extraction activated</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-xl mx-auto py-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-green-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-green-500">
                            <Cpu size={32} className="animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-white tracking-tight uppercase italic">AI Inference Initialized</h2>
                        <p className="text-slate-400 max-w-sm mx-auto">
                            The matching analytical engine is now extracting player trajectories and normalizing coordinates.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 max-w-xs mx-auto">
                        {[
                            { label: 'Registering Field Lines', active: true },
                            { label: 'Identifying Team Hierarchies', active: true },
                            { label: 'Wait for Spatial Telemetry', active: false },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-800">
                                <div className={`w-2 h-2 rounded-full ${step.active ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                <span className={`text-sm ${step.active ? 'text-slate-200' : 'text-slate-600'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
