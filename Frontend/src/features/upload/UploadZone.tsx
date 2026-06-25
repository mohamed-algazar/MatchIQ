import React, { useState, useCallback } from 'react';
import { Upload as UploadIcon, X, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
    onUpload: (file: File) => void;
    isUploading: boolean;
    progress: number;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isUploading, progress }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const validateAndUpload = (file: File) => {
        if (!file.type.startsWith('video/')) {
            setError('Please upload a valid video file (MP4, MOV).');
            return;
        }
        if (file.size > 2 * 1024 * 1024 * 1024) {
            setError('File size exceeds the 2GB limit.');
            return;
        }
        setError(null);
        onUpload(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndUpload(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`relative group transition-all duration-300 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-12 text-center min-h-[350px] ${dragActive ? 'border-green-500 bg-green-500/5' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                    } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    title='input data'
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept="video/*"
                    disabled={isUploading}
                />

                {/* Icon & Label */}
                <div className={`w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-green-500 border border-slate-700 shadow-xl mb-6 group-hover:scale-110 transition-transform ${dragActive ? 'scale-110 !bg-green-500 !text-slate-950 shadow-green-500/20' : ''}`}>
                    <UploadIcon size={32} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                        {dragActive ? 'Drop to start analysis' : 'Ready to analyze match?'}
                    </h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                        Drag match footage here or <span className="text-green-500 font-bold underline decoration-green-500/30 underline-offset-4">browse files</span>
                    </p>
                </div>

                <div className="mt-8 flex gap-3 text-xs text-slate-500 uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 border border-slate-700">MP4</span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 border border-slate-700">MOV</span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 border border-slate-700">MAX 2GB</span>
                </div>
            </div>

            {/* Progress Overlay */}
            {isUploading && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 font-medium">Uploading high-fidelity footage...</span>
                        <span className="text-green-500 font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300 relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[progress-stripe_1s_linear_infinite]"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in shake duration-300">
                    <AlertCircle size={18} />
                    <p className="font-medium">{error}</p>
                    <button title='close' onClick={() => setError(null)} className="ml-auto hover:text-red-300"><X size={16} /></button>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
