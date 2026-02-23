import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Cpu, Terminal, X, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal';

interface TechnicalConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    criticalInfo?: string;
}

export const TechnicalConfirmModal: React.FC<TechnicalConfirmModalProps> = ({
    isOpen, onClose, onConfirm, title, description, criticalInfo
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (inputValue.toUpperCase() === 'CONFIRMAR') {
            onConfirm();
            onClose();
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            maxWidth="max-w-lg"
        >
            <div className={`relative w-full bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(244,63,94,0.1)] transition-all duration-500 scale-100 animate-fade-in`}>
                {/* Header Técnico */}
                <div className="bg-rose-500/10 border-b border-rose-500/20 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 animate-pulse">
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">Alerta de Integridade</h2>
                            <p className="text-[10px] text-rose-500/70 font-bold uppercase tracking-widest mt-1">Ação Crítica de Destruição</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Corpo do Terminal */}
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Terminal size={14} className="text-emerald-500" /> System::Protocol_Level_7
                        </p>
                        <h3 className="text-xl font-black text-white tracking-tight leading-tight italic">
                            {title}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed italic">
                            {description}
                        </p>
                    </div>

                    {criticalInfo && (
                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-start gap-3">
                            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                                <span className="text-amber-500 font-black uppercase tracking-widest block mb-1 underline">Nota Técnica:</span>
                                {criticalInfo}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic ml-1">
                                Digite <span className="text-white">"CONFIRMAR"</span> para realizar o bypass:
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="SENTINEL_INPUT_REQUIRED"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 text-white text-sm font-mono tracking-widest focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-slate-800"
                                    autoFocus
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700">
                                    <Cpu size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-slate-900 text-[10px] font-black text-slate-400 uppercase tracking-widest italic rounded-2xl border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
                            >
                                Abortar Operação
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={inputValue.toUpperCase() !== 'CONFIRMAR'}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all ${inputValue.toUpperCase() === 'CONFIRMAR'
                                        ? 'bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                                        : 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <ChevronRight size={14} />
                                Executar Bypass
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Decorativo */}
                <div className="bg-slate-900/40 p-3 flex justify-center gap-8">
                    <div className="flex gap-2 text-[8px] font-black text-slate-700 uppercase italic tracking-tighter">
                        <div className="w-2 h-2 rounded-full bg-emerald-500/30"></div> LINK_ESTABLISHED
                    </div>
                    <div className="flex gap-2 text-[8px] font-black text-slate-700 uppercase italic tracking-tighter">
                        <div className="w-2 h-2 rounded-full bg-rose-500/30 animate-pulse"></div> ENCRYPTION_ACTIVE
                    </div>
                </div>
            </div>
        </Modal>
    );
};
