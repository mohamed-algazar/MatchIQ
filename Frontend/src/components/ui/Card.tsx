import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    subtitle?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', subtitle }) => {
    return (
        <div className={`glass rounded-xl overflow-hidden border border-slate-700/50 flex flex-col ${className}`}>
            {(title || subtitle) && (
                <div className="px-6 py-4 border-b border-slate-700/50">
                    {title && <h3 className="text-lg font-semibold text-white uppercase tracking-wider">{title}</h3>}
                    {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="p-6 flex-1">
                {children}
            </div>
        </div>
    );
};

export default Card;
