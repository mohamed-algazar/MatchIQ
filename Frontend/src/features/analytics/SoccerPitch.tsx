import React from 'react';

interface SoccerPitchProps {
    children?: React.ReactNode;
    className?: string;
}

const SoccerPitch: React.FC<SoccerPitchProps> = ({ children, className = '' }) => {
    return (
        <div className={`relative aspect-[105/68] bg-emerald-900 rounded-lg overflow-hidden border-4 border-slate-800 shadow-2xl ${className}`}>
            {/* Pitch Markings */}
            <div className="absolute inset-4 border-2 border-white/40">
                {/* Halfway line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 -translate-x-1/2" />
                {/* Center circle */}
                <div className="absolute left-1/2 top-1/2 w-[18%] aspect-square border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
                {/* Center spot */}
                <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />

                {/* Penalty Area Left */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[16%] h-[40%] border-2 border-white/40" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[6%] h-[18%] border-2 border-white/40" />
                {/* D-Arc Left */}
                <div className="absolute left-[16%] top-1/2 -translate-y-1/2 w-[8%] h-[20%] border-r-2 border-white/40 rounded-full -translate-x-1/2" />

                {/* Penalty Area Right */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[16%] h-[40%] border-2 border-white/40" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[6%] h-[18%] border-2 border-white/40" />
                {/* D-Arc Right */}
                <div className="absolute right-[16%] top-1/2 -translate-y-1/2 w-[8%] h-[20%] border-l-2 border-white/40 rounded-full translate-x-1/2" />

                {/* Goal Area Left */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-[12%] bg-white/40" />
                {/* Goal Area Right */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-[12%] bg-white/40" />
            </div>

            {/* Interactive Layer */}
            <div className="absolute inset-0 z-10">
                {children}
            </div>

            {/* Pitch Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_10%,rgba(0,0,0,0.1)_10%,rgba(0,0,0,0.1)_20%)]"></div>
        </div>
    );
};

export default SoccerPitch;
