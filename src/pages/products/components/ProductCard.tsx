import React from 'react';
import { Warehouse, DollarSign, MapPin, Info, Edit, Trash2, Box, History } from 'lucide-react';
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
    getCategoryStyles: (category: string) => string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    prod,
    settings,
    onEdit,
    onDelete,
    onAdjustStock,
    onViewHistory,
    getCategoryStyles
}) => {
    return (
        <Card className="h-full p-0 border-slate-800/60 hover:border-emerald-500/30 overflow-hidden flex flex-col justify-between transition-all duration-500 group bg-slate-900/20 backdrop-blur-2xl rounded-3xl" style={{ transform: 'none' }}>
            <div className="flex-1 flex flex-col">
                {/* Top Bar: Nome e Categoria */}
                <div className="p-4 pb-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all shadow-inner relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Box size={22} className="relative z-10" />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-base tracking-tighter leading-tight group-hover:text-emerald-400 transition-colors uppercase italic">{prod.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[7px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-[0.15em] border border-transparent ${getCategoryStyles(prod.category)}`}>
                                        {prod.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${prod.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse'}`}>
                            <div className={`w-1 h-1 rounded-full ${prod.status === 'ok' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                            {prod.status === 'ok' ? 'INTEGRO' : prod.status === 'low' ? 'BAIXO' : 'CRÍTICO'}
                        </div>
                    </div>
                </div>

                {/* Main Data Section */}
                <div className="p-4 grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50 group-hover:border-emerald-500/10 transition-all">
                        <span className="text-[7px] text-slate-500 block uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Warehouse size={10} /> Saldo Físico
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-white italic">{formatNumber(prod.stock)}</span>
                            <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{prod.unit}</span>
                        </div>
                        <div className="mt-2 h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${prod.status === 'ok' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min((Number(prod.stock) / (Number(prod.minStock) * 2)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50 group-hover:border-emerald-500/10 transition-all">
                        <span className="text-[7px] text-slate-500 block uppercase font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                            <DollarSign size={10} /> Valorização
                        </span>
                        <div className="text-xl font-black text-white italic leading-none mb-1">{formatCurrency(prod.price, settings.currency)}</div>
                        <div className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">
                            Total: <span className="text-blue-400">{formatCurrency(Number(prod.stock) * Number(prod.price), settings.currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Logistics Details Area */}
                <div className="mx-4 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/30 grid grid-cols-2 gap-y-2">
                    <div className="flex flex-col">
                        <span className="text-[6px] text-slate-500 uppercase font-black tracking-widest mb-0.5 flex items-center gap-1">
                            <MapPin size={8} /> Localização
                        </span>
                        <span className="text-[9px] text-slate-300 font-bold uppercase truncate">{prod.location || 'NÃO CONFIG.'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[6px] text-slate-500 uppercase font-black tracking-widest mb-0.5 flex items-center gap-1">
                            Referência Técnica <Info size={8} />
                        </span>
                        <span className="text-[9px] text-slate-300 font-bold uppercase">{prod.unitWeight} KG/L por {prod.unit}</span>
                    </div>

                    {prod.batch && (
                        <div className="col-span-1 pt-1 border-t border-slate-800/50">
                            <span className="text-[6px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">LOTE</span>
                            <span className="text-[9px] text-white font-black">{prod.batch}</span>
                        </div>
                    )}
                    {prod.expirationDate && (
                        <div className="col-span-1 pt-1 border-t border-slate-800/50 flex flex-col items-end">
                            <span className="text-[6px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">VENCIMENTO</span>
                            <span className={`text-[9px] font-black ${new Date(prod.expirationDate) < new Date() ? 'text-rose-500' : 'text-orange-400'}`}>{new Date(prod.expirationDate).toLocaleDateString()}</span>
                        </div>
                    )}

                    <div className="col-span-2 pt-1 border-t border-slate-800/50 flex justify-between items-center mt-1">
                        <span className="text-[6px] text-slate-500 uppercase font-black tracking-widest">Saldo Auditado (Convertido)</span>
                        <span className="text-[10px] text-emerald-500 font-black italic">
                            ≈ {formatNumber(Number(prod.stock) * (Number(prod.unitWeight) || 1))} {['L', 'ml', 'galão', 'tambor', 'bombona', 'balde', 'frasco', 'ampola', 'bisnaga'].includes(prod.unit) ? 'L' : 'KG'}
                        </span>
                    </div>
                </div>

            </div>
            {/* Action Buttons */}
            <div className="p-4 bg-slate-950/20 mt-2 flex justify-between items-center border-t border-slate-800/30">
                <div className="flex gap-2">
                    <button onClick={() => onViewHistory(prod)} className="p-2.5 bg-slate-900 hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-400 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-all active:scale-90" title="Ver Histórico">
                        <History size={14} />
                    </button>
                    <button onClick={() => onEdit(prod)} className="p-2.5 bg-slate-900 hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all active:scale-90" title="Editar Registro">
                        <Edit size={14} />
                    </button>
                    <button onClick={() => onDelete(prod.id)} className="p-2.5 bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-all active:scale-90" title="Remover Item">
                        <Trash2 size={14} />
                    </button>
                </div>
                <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                    <button onClick={() => onAdjustStock(prod.id, -1)} className="w-10 h-8 flex items-center justify-center bg-slate-950 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 rounded-lg border border-slate-800 transition-all font-black text-lg active:scale-90">-</button>
                    <button onClick={() => onAdjustStock(prod.id, 1)} className="w-10 h-8 flex items-center justify-center bg-slate-950 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg border border-slate-800 transition-all font-black text-lg active:scale-90">+</button>
                </div>
            </div>
        </Card>
    );
};
