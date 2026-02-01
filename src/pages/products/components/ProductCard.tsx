import React from 'react';
import { Warehouse, DollarSign, MapPin, Info, Edit, Trash2, Box, History, ShieldCheck, Zap, ArrowRight, Activity, Copy } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { formatCurrency, formatNumber } from '../../../utils/format';
import { Product } from '../../../types';

interface ProductCardProps {
    prod: Product;
    settings: any;
    onEdit: (prod: Product) => void;
    onDelete: (id: number) => void;
    onAdjustStock: (id: number, amount: number) => void;
    onViewHistory: (prod: Product) => void;
    onDuplicate: (prod: Product) => void;
    getCategoryStyles: (category: string) => string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    prod,
    settings,
    onEdit,
    onDelete,
    onAdjustStock,
    onViewHistory,
    onDuplicate,
    getCategoryStyles
}) => {
    return (
        <Card variant="glass" className="group p-0 border-slate-800/60 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative shadow-xl">
            <div className="absolute top-0 right-0 p-6 z-10 flex gap-2">
                <button onClick={() => onDelete(prod.id)} className="text-slate-800 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
            </div>

            {/* Status Bar Indicator */}
            <div className={`h-1.5 w-full ${prod.status === 'ok' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />

            <div className="p-8">
                <div className="flex items-start gap-5 mb-8">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all duration-500 shadow-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Box size={32} className="relative z-10" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-black text-white text-xl uppercase tracking-tighter italic leading-none truncate group-hover:text-emerald-300 transition-colors uppercase">{prod.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border ${getCategoryStyles(prod.category)}`}>
                                {prod.category}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border ${prod.status === 'ok' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(251,146,60,0.1)]'}`}>
                                {prod.status === 'ok' ? 'NOMINAL' : 'ALERTA'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Telemetry Grid */}
                    <div className="grid grid-cols-2 gap-px bg-slate-800/40 border border-slate-800/40 rounded-2xl overflow-hidden">
                        <div className="bg-slate-950/60 p-5 flex flex-col gap-1.5">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic flex items-center gap-1.5"><Warehouse size={12} /> Saldo Operacional</p>
                            <div className="flex flex-col">
                                {prod.capacityUnit && prod.unitWeight > 1 ? (
                                    <>
                                        <p className="text-base font-black text-white italic">
                                            {Math.floor(prod.stock)} <span className="text-slate-500 text-xs uppercase">{prod.unit}</span>
                                            {prod.stock % 1 !== 0 && (
                                                <span className="text-emerald-500 ml-1">
                                                    + {formatNumber((prod.stock % 1) * prod.unitWeight)} <span className="text-[10px]">{prod.capacityUnit.toUpperCase()}</span>
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-tighter italic mt-1">
                                            Capacidade: {formatNumber(prod.stock * prod.unitWeight)} {prod.capacityUnit.toUpperCase()}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-base font-black text-white italic">{formatNumber(prod.stock)} <span className="text-slate-500 text-xs uppercase">{prod.unit}</span></p>
                                        {prod.unitWeight > 1 && (
                                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-tighter italic mt-1">
                                                Capacidade: {formatNumber(prod.stock * prod.unitWeight)} {['Fertilizantes', 'Sementes', 'Corretivos', 'Nutrição Foliar', 'Suplementos & Nutrição', 'Big Bag'].some(c => prod.category.includes(c)) ? 'KG' : 'L'}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-950/60 p-5 flex flex-col gap-1.5">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic flex items-center gap-1.5"><DollarSign size={12} /> Valorização Un.</p>
                            <p className="text-base font-black text-emerald-400 italic">{formatCurrency(prod.price, settings.currency)}</p>
                        </div>
                    </div>

                    {/* Stock Health Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1 mb-1">
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic">Nível de Contingência</p>
                            <span className={`text-[9px] font-black italic ${prod.status === 'ok' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                {Math.round(Math.min((Number(prod.stock) / (Math.max(Number(prod.minStock), 1) * 2)) * 100, 100))}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <div
                                className={`h-full transition-all duration-1000 ${prod.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : (Number(prod.stock) <= Number(prod.minStock) / 2 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-orange-500 shadow-[0_0_8px_#f97316]')}`}
                                style={{ width: `${Math.min((Number(prod.stock) / (Math.max(Number(prod.minStock), 1) * 2)) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center px-1 text-[9px]">
                            <span className="text-slate-500 font-bold uppercase">Mínimo Crítico: {formatNumber(prod.minStock)} {prod.unit}</span>
                        </div>
                    </div>

                    {/* Technical Dossier Snippet */}
                    <div className="bg-slate-950/50 p-4 rounded-[1.25rem] border border-slate-900 space-y-3 group-hover:border-emerald-500/20 transition-all">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-600 italic flex items-center gap-1.5"><MapPin size={12} /> {prod.location || 'GLOBAL_STK'}</span>
                            <span className="text-emerald-500/70 italic">REF: {prod.batch || 'AUTO_GEN'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="space-y-0.5">
                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic leading-none">Patrimônio Lote</p>
                                <p className="text-lg font-black text-white italic tracking-tight">{formatCurrency(Number(prod.stock) * Number(prod.price), settings.currency)}</p>
                            </div>
                            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg group-hover:border-emerald-500/30 transition-all">
                                <ShieldCheck size={14} className="text-emerald-500/30 group-hover:text-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Footer Action Bar */}
            <div className="mt-auto bg-slate-950/50 p-6 border-t border-slate-900/60 flex justify-between items-center group-hover:bg-slate-900/60 transition-colors">
                <div className="flex gap-2">
                    <button onClick={() => onViewHistory(prod)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95" title="Log de Eventos"><History size={16} /></button>
                    <button onClick={() => onEdit(prod)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-95" title="Ajuste de Matriz"><Edit size={16} /></button>
                    <button onClick={() => onDuplicate(prod)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all active:scale-95" title="Duplicar Registro"><Copy size={16} /></button>
                </div>

                <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-[1.25rem] shadow-inner">
                    <button onClick={() => onAdjustStock(prod.id, -1)} className="w-12 h-10 flex items-center justify-center bg-slate-950 hover:bg-orange-500/20 text-slate-600 hover:text-orange-400 rounded-xl border border-slate-800 transition-all font-black text-xl active:scale-90">-</button>
                    <button onClick={() => onAdjustStock(prod.id, 1)} className="w-12 h-10 flex items-center justify-center bg-slate-950 hover:bg-emerald-500/20 text-slate-600 hover:text-emerald-400 rounded-xl border border-slate-800 transition-all font-black text-xl active:scale-90">+</button>
                </div>
            </div>
        </Card>
    );
};
