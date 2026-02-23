import React from 'react';
import { RefreshCw } from 'lucide-react';

export const RouteLoader = () => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center space-y-8 animate-fade-in relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent animate-pulse"></div>
            
            <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800/50 flex items-center justify-center text-emerald-500/40 shadow-2xl relative z-10 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                    <RefreshCw size={32} className="animate-spin duration-[4000ms] relative z-20 opacity-50" />
                </div>
                
                {/* Orbital Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-emerald-500/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>

            <div className="text-center space-y-2 relative z-10">
                <div className="flex items-center justify-center gap-3">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] italic animate-pulse pl-2">
                    Acessando Módulo
                </h3>
            </div>
        </div>
    );
};
