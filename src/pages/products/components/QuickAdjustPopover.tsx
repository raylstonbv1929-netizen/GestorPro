import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { maskNumber, parseValue, maskValue, formatNumber } from '../../../utils/format';
import { Product, Collaborator, Property, Plot } from '../../../types';

interface QuickAdjustPopoverProps {
    product: Product;
    onClose: () => void;
    onAdjust: (payload: any) => void;
    collaborators: Collaborator[];
    properties: Property[];
    plots: Plot[];
    settings: any;
}

export const QuickAdjustPopover: React.FC<QuickAdjustPopoverProps> = ({
    product,
    onClose,
    onAdjust,
    collaborators,
    properties,
    plots,
    settings
}) => {
    const [quantity, setQuantity] = useState('');
    const [type, setType] = useState<'in' | 'out'>('in');
    const [reason, setReason] = useState('Ajuste de Auditoria');
    const [operator, setOperator] = useState(settings.userName || '');
    const [plotId, setPlotId] = useState('');
    const [cost, setCost] = useState('');
    const [batch, setBatch] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const qtyValue = parseValue(quantity);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseValue(quantity);
        if (qty > 0) {
            let finalReason = reason;
            if (type === 'out' && plotId) {
                const plot = plots.find(p => p.id === parseInt(plotId));
                if (plot) {
                    finalReason = `Aplicação: ${plot.name}${reason !== 'Ajuste de Auditoria' ? ` - ${reason}` : ''}`;
                }
            }

            onAdjust({
                productId: product.id,
                type,
                quantity: qty,
                reason: finalReason,
                operator,
                plotId: plotId ? parseInt(plotId) : undefined,
                cost: type === 'in' ? parseValue(cost) : undefined,
                batch: batch || undefined,
                date
            });
            onClose();
        }
    };

    const getConversionDisplay = () => {
        if (!qtyValue) return null;
        const normalized = qtyValue; // Simplify for now as the original page used a complex calculateNormalizedQuantity
        const currentStock = Number(product.stock);
        const newStock = type === 'in' ? currentStock + normalized : currentStock - normalized;
        const weight = parseFloat(String(product.unitWeight)) || 1;
        const totalKgAfter = newStock * weight;

        return (
            <div className="mt-4 space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/50 animate-fade-in shadow-inner">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 uppercase font-black tracking-wider">Peso da Operação:</span>
                    <span className="text-emerald-400 font-black">≈ {(normalized * weight).toFixed(2)} KG/L</span>
                </div>
                <div className="pt-3 border-t border-slate-800/50">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Estoque Previsto:</span>
                        <div className="text-right">
                            <p className={`text-xl font-black ${newStock < 0 ? 'text-rose-500' : 'text-white'}`}>
                                {newStock.toFixed(2)} {product.unit}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">({totalKgAfter.toFixed(2)} KG/L)</p>
                        </div>
                    </div>
                </div>
                {newStock < 0 && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                        <AlertCircle size={14} className="text-rose-500" />
                        <p className="text-[8px] text-rose-400 font-black uppercase">Atenção: Estoque ficará negativo!</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
            <Card variant="glass" className="w-full max-w-lg relative z-10 p-0 overflow-hidden border-emerald-500/20 shadow-2xl rounded-[2.5rem] flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${type === 'in' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'} border`}>
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                                {type === 'in' ? 'Protocolo de Entrada' : 'Guia de Saída'}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1.5">{product.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all border border-slate-800">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                    {/* Selector e Qtd */}
                    <div className="space-y-6">
                        <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                            <button type="button" onClick={() => setType('in')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'in' ? 'bg-emerald-500 text-emerald-950' : 'text-slate-500 hover:text-slate-300'}`}>Entrada</button>
                            <button type="button" onClick={() => setType('out')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'out' ? 'bg-orange-500 text-orange-950' : 'text-slate-500 hover:text-slate-300'}`}>Saída</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Volume ({product.unit})</label>
                                <input autoFocus placeholder="0,00" value={quantity} onChange={e => setQuantity(maskNumber(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-3xl font-black text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner italic" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Data da Operação</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-[76px] bg-slate-950 border border-slate-800 rounded-2xl px-5 text-white font-bold outline-none focus:border-emerald-500/50 shadow-inner" />
                            </div>
                        </div>
                    </div>

                    {/* Detalhes Logísticos */}
                    <div className="space-y-6 pt-6 border-t border-slate-800/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Operador / Responsável</label>
                                <div className="relative">
                                    <select value={operator} onChange={e => setOperator(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-black text-white outline-none focus:border-emerald-500/50 appearance-none cursor-pointer">
                                        {collaborators.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                                    </select>
                                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Finalidade Técnico-Operacional</label>
                                <div className="relative">
                                    <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-black text-white outline-none focus:border-emerald-500/50 appearance-none cursor-pointer">
                                        <option value="Ajuste de Auditoria">AJUSTE DE AUDITORIA</option>
                                        <option value="Entrada de Compra">ENTRADA DE COMPRA</option>
                                        <option value="Uso em Campo">USO EM CAMPO / APLICAÇÃO</option>
                                        <option value="Quebra/Perda">QUEBRA / LOSS</option>
                                        <option value="Retorno de Aplicação">RETORNO DE CAMPO</option>
                                    </select>
                                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {type === 'out' && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Talhão de Destino</label>
                                <div className="relative">
                                    <select value={plotId} onChange={e => setPlotId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-black text-white outline-none focus:border-orange-500/50 appearance-none cursor-pointer">
                                        <option value="">NÃO VINCULAR A TALHÃO ESPECÍFICO</option>
                                        {properties.map(prop => (
                                            <optgroup key={prop.id} label={prop.name.toUpperCase()}>
                                                {plots.filter(p => p.propertyId === prop.id).map(plot => (
                                                    <option key={plot.id} value={plot.id}>{plot.name.toUpperCase()}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {type === 'in' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Nº Lote / Nota Fiscal</label>
                                    <input placeholder="OPCIONAL" value={batch} onChange={e => setBatch(e.target.value.toUpperCase())} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs font-black text-white focus:border-emerald-500/50 outline-none shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Custo Total da Carga</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-black text-[10px]">R$</span>
                                        <input placeholder="0,00" value={cost} onChange={e => setCost(maskValue(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-xs font-black text-white focus:border-emerald-500/50 outline-none shadow-inner" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {getConversionDisplay()}
                </form>

                <div className="p-8 border-t border-slate-800 bg-slate-950/40">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!quantity || qtyValue <= 0}
                        className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale ${type === 'in' ? 'bg-emerald-500 text-emerald-950 shadow-emerald-500/20' : 'bg-orange-500 text-orange-950 shadow-orange-500/20'}`}
                    >
                        {type === 'in' ? 'CONFIRMAR RECEBIMENTO' : 'AUTORIZAR RETRIRADA'}
                    </button>
                    <button onClick={onClose} className="w-full mt-4 py-2 text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Abortar Missão</button>
                </div>
            </Card>
        </div>
    );
};
