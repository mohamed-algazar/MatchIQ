import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Maximize, Settings, Loader2 } from 'lucide-react';

interface PlayerCoordinate {
    id: string;
    x: number;
    y: number;
    team: 'home' | 'away';
}

interface FrameData {
    frameNumber: number;
    timestamp: number;
    playerCoordinates: PlayerCoordinate[];
}

interface VideoOverlayPlayerProps {
    videoUrl: string;
    frames: FrameData[];
    isLoading?: boolean;
}

const VideoOverlayPlayer: React.FC<VideoOverlayPlayerProps> = ({ videoUrl, frames, isLoading }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Drawing Loop
    const drawOverlay = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !frames.length) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Find current frame based on video time
        // Optimization: In a real app, use a binary search or a frame index mapping
        const time = video.currentTime;
        const currentFrame = frames.find(f => Math.abs(f.timestamp - time) < 0.05) ||
            frames.reduce((prev, curr) =>
                Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time) ? curr : prev
            );

        if (currentFrame) {
            currentFrame.playerCoordinates.forEach(player => {
                // Normalize coordinates (assuming 0-100 or specific resolution from backend)
                const scaleX = canvas.width / 100;
                const scaleY = canvas.height / 100;
                const x = player.x * scaleX;
                const y = player.y * scaleY;

                // Draw bounding box / circle
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, Math.PI * 2);
                ctx.strokeStyle = player.team === 'home' ? '#22c55e' : '#3b82f6';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw ID label
                ctx.fillStyle = player.team === 'home' ? '#22c55e' : '#3b82f6';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(player.id, x, y - 25);

                // Background for label for legibility
                ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                const labelWidth = ctx.measureText(player.id).width + 10;
                ctx.fillRect(x - labelWidth / 2, y - 40, labelWidth, 18);
                ctx.fillStyle = 'white';
                ctx.fillText(player.id, x, y - 27);
            });
        }

        if (!video.paused && !video.ended) {
            requestAnimationFrame(drawOverlay);
        }
    }, [frames]);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handlePlay = () => {
                setIsPlaying(true);
                requestAnimationFrame(drawOverlay);
            };
            const handlePause = () => setIsPlaying(false);
            const handleTimeUpdate = () => setCurrentTime(video.currentTime);
            const handleLoadedMetadata = () => {
                setDuration(video.duration);
                // Resize canvas to match video
                if (canvasRef.current) {
                    canvasRef.current.width = video.clientWidth;
                    canvasRef.current.height = video.clientHeight;
                }
            };

            video.addEventListener('play', handlePlay);
            video.addEventListener('pause', handlePause);
            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('loadedmetadata', handleLoadedMetadata);

            return () => {
                video.removeEventListener('play', handlePlay);
                video.removeEventListener('pause', handlePause);
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [drawOverlay]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    return (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            {/* Video Layer */}
            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-auto aspect-video cursor-pointer"
                onClick={togglePlay}
            />

            {/* Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all duration-500">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
                    <p className="text-slate-300 text-sm font-medium animate-pulse">Syncing Tactical Telemetry...</p>
                </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group/progress">
                        <div
                            className="absolute h-full bg-green-500 rounded-full transition-all duration-100"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={togglePlay}
                                className="w-10 h-10 rounded-full bg-green-500 text-slate-950 flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
                            </button>
                            <button title='btn submit' className="text-slate-400 hover:text-white transition-colors">
                                <RotateCcw size={20} />
                            </button>
                            <span className="text-xs font-mono text-slate-300">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-slate-400">
                            <button title='btn submit' className="hover:text-white transition-colors"><Settings size={20} /></button>
                            <button title='btn submit' className="hover:text-white transition-colors"><Maximize size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default VideoOverlayPlayer;
