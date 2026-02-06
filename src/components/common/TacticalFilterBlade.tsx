import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Activity, RefreshCw, Zap, Search } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Metric {
    label: string;
    value: string | number;
    isCurrency?: boolean;
    currencySymbol?: string;
}

interface TacticalFilterBladeProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    metrics: Metric[];
    progress?: number; // 0 to 100
    onReset: () => void;
    children: React.ReactNode;
    footerActions?: React.ReactNode;
}

export const TacticalFilterBlade: React.FC<TacticalFilterBladeProps> = ({
    isOpen,
    onClose,
    title = "PAINEL DE FILTROS AVANÇADOS",
    searchTerm,
    onSearchChange,
    metrics,
    progress = 0,
    onReset,
    children,
    footerActions
}) => {
    // Handle Escape key and body overflow
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <>
            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    will-change: transform;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                    will-change: opacity;
                }
                .grain-overlay {
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    opacity: 0.03;
                    pointer-events: none;
                }
            `}</style>

            <div className="fixed inset-0 z-[999] flex justify-end overflow-hidden font-sans">
                {/* Backdrop Blur - Reduced from 30px to 12px for performance */}
                <div
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
                    onClick={onClose}
                />

                <div className="w-full max-w-lg bg-slate-950/95 backdrop-blur-md border-l border-white/5 shadow-[-20px_0_80px_rgba(0,0,0,0.8)] relative z-10 flex flex-col animate-slide-in-right h-full overflow-hidden">
                    <div className="absolute inset-0 grain-overlay opacity-10" />

                    {/* Header Terminal */}
                    <div className="px-8 py-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center shrink-0">
                        <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                            <Activity size={14} /> {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-slate-950 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all active:scale-95 hover:bg-white/5"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12 relative">
                        {/* Metrics Section */}
                        <div className="grid grid-cols-2 gap-8">
                            {metrics.map((metric, idx) => (
                                <div key={idx}>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">{metric.label}</p>
                                    <p className={`${idx === 0 ? 'text-3xl' : 'text-xl'} font-mono font-black text-white italic tracking-tighter truncate`}>
                                        {metric.isCurrency && typeof metric.value === 'number'
                                            ? formatCurrency(metric.value, metric.currencySymbol || 'BRL')
                                            : metric.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Progress Bar if applied */}
                        {progress > 0 && (
                            <div className="h-1 w-full bg-slate-900 overflow-hidden relative">
                                <div
                                    className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}

                        {/* Search HUD */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">BARRA DE BUSCA GLOBAL</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-cyan-500 transition-colors">
                                    <Search size={16} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="BUSCAR GLOBALMENTE..."
                                    value={searchTerm}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 py-4 pl-12 pr-4 text-xs font-mono text-white outline-none transition-all italic placeholder:text-slate-800"
                                />
                            </div>
                        </div>

                        {children}
                    </div>

                    {/* FOOTER */}
                    <div className="p-8 border-t border-slate-900 bg-slate-900/40 flex gap-4">
                        <button
                            onClick={onReset}
                            className="flex-1 py-4 bg-slate-900 border border-slate-800 text-slate-500 hover:text-orange-500 hover:border-orange-500/50 text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} /> LIMPAR TODOS OS FILTROS
                        </button>
                        {footerActions || (
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest transition-all italic shadow-lg shadow-cyan-900/20"
                            >
                                APLICAR FILTROS
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};
