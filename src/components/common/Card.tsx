import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
    variant?: 'default' | 'highlight' | 'glass' | 'white';
    style?: React.CSSProperties;
    rounded?: string;
    onClick?: () => void;
}

export const Card = ({
    children,
    className = "",
    glow = false,
    variant = 'default',
    style = {},
    rounded = "rounded-2xl",
    onClick
}: CardProps) => {
    const variants = {
        default: 'bg-slate-950/40 border-slate-900/60 shadow-lg',
        highlight: 'bg-gradient-to-br from-slate-900/60 to-slate-950/60 border-slate-800/50 shadow-xl',
        glass: 'bg-slate-900/30 backdrop-blur-xl border-slate-800/60 shadow-2xl',
        white: 'bg-white text-slate-900 border-slate-200 shadow-sm'
    };

    return (
        <div
            onClick={onClick}
            className={`border p-6 relative transition-all duration-500 hover:scale-[1.01] hover:border-emerald-500/30 hover:shadow-emerald-900/10 overflow-hidden ${rounded} will-change-transform ${variants[variant]} ${className} ${glow ? 'hover:shadow-emerald-900/20' : ''} ${onClick ? 'cursor-pointer' : ''}`}
            style={{ transform: 'translateZ(0)', ...style }}
        >
            {children}
        </div>
    );
};
