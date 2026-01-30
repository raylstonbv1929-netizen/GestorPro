import React from 'react';
import { X, History, TrendingUp, TrendingDown, Calendar, Box, ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { formatNumber } from '../../../utils/format';
import { Product, StockMovement } from '../../../types';

interface ProductHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    movements: StockMovement[];
}

export const ProductHistoryDrawer: React.FC<ProductHistoryDrawerProps> = ({
    isOpen,
    onClose,
    product,
    movements
}) => {
    if (!isOpen) return null;

    const productMovements = movements
        .filter(m => m.productId === product.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="fixed inset-0 z-[120] flex justify-end">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <Card variant="glass" className="w-full max-w-lg h-full relative z-10 p-0 overflow-hidden border-l border-slate-800 shadow-2xl rounded-none flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/40">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <History size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Histórico do Insumo</h4>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Rastreabilidade Total de Operações</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all border border-slate-800">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/50 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
                            <Box size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-white font-black uppercase italic">{product.name}</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{product.category}</p>
                        </div>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {productMovements.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-30 gap-4">
                            <ShieldCheck size={48} />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-center">Nenhum registro de movimentação encontrado para este protocolo</p>
                        </div>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-slate-800">
                            {productMovements.map((mov, idx) => (
                                <div key={mov.id} className="relative pl-10 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className={`absolute left-2.5 top-0 w-3 h-3 rounded-full -translate-x-1/2 border-4 border-slate-950 z-10 ${mov.type === 'in' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`} />

                                    <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl hover:border-slate-700 transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${mov.type === 'in' ? 'text-emerald-400' : 'text-orange-400'}`}>
                                                    {mov.type === 'in' ? 'ENTRADA DE MATERIAL' : 'SAÍDA / APLICAÇÃO'}
                                                </span>
                                                <div className="flex items-center gap-2 text-[11px] text-white font-black italic">
                                                    {mov.type === 'in' ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-orange-500" />}
                                                    {mov.type === 'in' ? '+' : '-'}{formatNumber(mov.quantity)} {mov.quantityUnit}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-slate-300 font-bold mb-0.5">{new Date(mov.date).toLocaleDateString()}</div>
                                                <div className="text-[8px] text-slate-500 font-black uppercase tracking-tighter flex items-center justify-end gap-1">
                                                    <Calendar size={8} /> {new Date(mov.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-4 italic py-3 border-y border-slate-800/30">
                                            {mov.reason || 'SEM JUSTIFICATIVA TÉCNICA REGISTRADA'}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-[8px] font-black text-emerald-500 border border-slate-800">
                                                    {mov.user?.substring(0, 2).toUpperCase() || 'SYS'}
                                                </div>
                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{mov.user}</span>
                                            </div>
                                            {mov.batch && (
                                                <span className="text-[8px] px-2 py-1 bg-slate-950 text-slate-400 border border-slate-800 rounded-lg font-black uppercase tracking-widest">
                                                    LOTE: {mov.batch}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Footer */}
                <div className="p-8 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-4">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Saldo Total Atual de Auditoria</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white italic">{formatNumber(product.stock)}</span>
                            <span className="text-[10px] text-slate-500 font-black uppercase">{product.unit}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
