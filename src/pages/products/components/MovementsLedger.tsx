import React from 'react';
import { History, ShieldCheck, Box, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { formatNumber } from '../../../utils/format';
import { StockMovement } from '../../../types';

interface MovementsLedgerProps {
    stockMovements: StockMovement[];
    products: any[];
}

export const MovementsLedger: React.FC<MovementsLedgerProps> = ({ stockMovements, products }) => {
    return (
        <Card className="flex-1 overflow-hidden flex flex-col p-0 border-slate-800/60 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-2xl shadow-3xl">
            <div className="p-10 border-b border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-950/40">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <History size={24} className="text-emerald-500" /> Auditoria de Fluxo de Insumos
                    </h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 ml-9">Registro cronológico de integridade logística</p>
                </div>
                <div className="px-6 py-3 bg-slate-950 rounded-2xl border border-slate-800 text-[10px] text-emerald-500/80 font-black uppercase tracking-widest shadow-inner flex items-center gap-3">
                    <ShieldCheck size={14} /> Total de {stockMovements.length} Operações Seguras
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-950 z-20">
                        <tr className="border-b border-slate-800">
                            <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolo / Data</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Insumo Auditado</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Operação</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Volume</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Justificativa / Observação</th>
                            <th className="px-10 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Assinatura</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                        {stockMovements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-10 py-48 text-center bg-slate-950/20">
                                    <div className="flex flex-col items-center gap-6 text-slate-700">
                                        <div className="p-8 bg-slate-900/50 rounded-full border border-slate-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                                            <History size={80} className="opacity-10" />
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-[0.3em] opacity-30 italic">Lote de dados vazio</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            stockMovements.map(mov => (
                                <tr key={mov.id} className="hover:bg-emerald-500/[0.02] transition-colors group border-l-4 border-l-transparent hover:border-l-emerald-500">
                                    <td className="px-10 py-6">
                                        <div className="text-[11px] font-black text-slate-300 mb-0.5">{new Date(mov.date).toLocaleDateString('pt-BR')}</div>
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                                            <Calendar size={10} /> {new Date(mov.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all shadow-inner">
                                                <Box size={14} />
                                            </div>
                                            <div className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors uppercase italic">{mov.productName}</div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] border inline-flex items-center gap-1.5 shadow-sm ${mov.type === 'in' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/5 text-orange-400 border-orange-500/20'}`}>
                                            {mov.type === 'in' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {mov.type === 'in' ? 'Entrada' : 'Saída'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className={`text-sm font-black italic ${mov.type === 'in' ? 'text-emerald-400' : 'text-orange-400'}`}>
                                            {mov.type === 'in' ? '+' : '-'}{formatNumber(mov.quantity)}
                                            <span className="ml-2 text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{mov.quantityUnit}</span>
                                        </div>
                                        {(() => {
                                            const p = products.find(prod => prod.id === mov.productId);
                                            if (p && p.capacityUnit && p.unitWeight > 1) {
                                                return (
                                                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mt-1 italic">
                                                        ≈ {formatNumber(mov.quantity * p.unitWeight)} {p.capacityUnit.toUpperCase()}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="text-[10px] text-slate-400 font-bold max-w-[300px] leading-relaxed italic">{mov.reason || 'S/ JUSTIFICATIVA TÉCNICA'}</div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-[10px] font-black text-emerald-400 border border-slate-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/30 transition-all">
                                                {mov.user?.substring(0, 2).toUpperCase() || 'SYS'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">{mov.user}</span>
                                                <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.1em]">Operador</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
