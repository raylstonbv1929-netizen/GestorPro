import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
    variant?: 'default' | 'highlight' | 'glass' | 'white';
    style?: React.CSSProperties;
    rounded?: string;
}

export const Card = ({
    children,
    className = "",
    glow = false,
    variant = 'default',
    style = {},
    rounded = "rounded-2xl"
}: CardProps) => {
    const variants = {
        default: 'bg-slate-800/40 border-slate-700/50',
        highlight: 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-600/50',
        glass: 'bg-slate-900/30 backdrop-blur-md border-slate-800/60',
        white: 'bg-white text-slate-900 border-slate-200 shadow-sm'
    };

    return (
        <div
            className={`backdrop-blur-xl border p-6 shadow-2xl relative transition-all duration-500 hover:scale-[1.01] hover:border-emerald-500/30 hover:shadow-emerald-900/10 overflow-hidden ${rounded} will-change-transform ${variants[variant]} ${className} ${glow ? 'hover:shadow-emerald-900/20' : ''}`}
            style={{ transform: 'translateZ(0)', ...style }}
        >
            {children}
        </div>
    );
};
