import React from 'react';
import { X, Filter, RefreshCcw, Check, Calendar, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { maskNumber } from '../../../utils/format';

export interface FilterCriteria {
    categories: string[];
    status: string[];
    minPrice: string;
    maxPrice: string;
    minStock: string;
    maxStock: string;
    expirationWindow: number | null;
}

interface AdvancedFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterCriteria;
    setFilters: (filters: FilterCriteria) => void;
    onClear: () => void;
}

const CATEGORIES = [
    { label: 'AGRÍCOLAS', items: ['Fertilizantes', 'Sementes', 'Defensivos', 'Herbicidas', 'Fungicidas', 'Inseticidas', 'Adjuvantes', 'Corretivos', 'Nutrição Foliar'] },
    { label: 'LOGÍSTICA', items: ['Combustível', 'Lubrificantes', 'Peças', 'Pneus', 'Filtros'] },
    { label: 'MANUTENÇÃO', items: ['Ferramentas', 'Materiais de Construção', 'Elétrica', 'Hidráulica', 'Ferragens'] },
    { label: 'OPERACIONAL', items: ['EPIs', 'Embalagens', 'Limpeza'] },
    { label: 'PECUÁRIA', items: ['Medicamentos Veterinários', 'Suplementos & Nutrição', 'Vacinas'] }
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    isOpen,
    onClose,
    filters,
    setFilters,
    onClear
}) => {
    if (!isOpen) return null;

    const toggleCategory = (cat: string) => {
        const newCats = filters.categories.includes(cat)
            ? filters.categories.filter(c => c !== cat)
            : [...filters.categories, cat];
        setFilters({ ...filters, categories: newCats });
    };

    const toggleStatus = (status: string) => {
        const newStatus = filters.status.includes(status)
            ? filters.status.filter(s => s !== status)
            : [...filters.status, status];
        setFilters({ ...filters, status: newStatus });
    };

    return (
        <div className="fixed inset-0 z-[120] flex justify-end">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <Card variant="glass" className="w-full max-w-md h-full relative z-10 p-0 overflow-hidden border-l border-slate-800 shadow-2xl rounded-none flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Parâmetros de Busca</h4>
                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] leading-none mt-1">Refino tático de auditoria</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all border border-slate-800">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                    {/* Categories Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package size={14} className="text-emerald-500" /> Divisões Estratégicas
                            </h5>
                        </div>
                        <div className="space-y-4">
                            {CATEGORIES.map(group => (
                                <div key={group.label} className="space-y-2">
                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest pl-1">{group.label}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map(cat => {
                                            const isActive = filters.categories.includes(cat);
                                            return (
                                                <button
                                                    key={cat}
                                                    onClick={() => toggleCategory(cat)}
                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${isActive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                                >
                                                    {isActive && <Check size={10} strokeWidth={3} />}
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Section */}
                    <div className="space-y-4">
                        <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <AlertTriangle size={14} className="text-orange-500" /> Alertas & Integridade
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'ok', label: 'Estoque Íntegro', color: 'emerald' },
                                { id: 'low', label: 'Reserva Baixa', color: 'orange' },
                                { id: 'critical', label: 'Crítico/Ruptura', color: 'rose' },
                                { id: 'expiring', label: 'Perto do Vencimento', color: 'amber' }
                            ].map(st => {
                                const isActive = filters.status.includes(st.id);
                                return (
                                    <button
                                        key={st.id}
                                        onClick={() => toggleStatus(st.id)}
                                        className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all text-left flex flex-col gap-2 ${isActive ? `bg-${st.color}-500/10 border-${st.color}-500/40 text-${st.color}-400` : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? `bg-${st.color}-500 shadow-[0_0_8px_${st.color}-500]` : 'bg-slate-700'}`} />
                                        {st.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Range Filters */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <DollarSign size={14} className="text-blue-500" /> Preço (Min/Max)
                            </h5>
                            <div className="flex gap-2">
                                <input placeholder="MIN" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-bold text-white focus:border-blue-500/50 outline-none transition-all shadow-inner uppercase" />
                                <input placeholder="MAX" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-bold text-white focus:border-blue-500/50 outline-none transition-all shadow-inner uppercase" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package size={14} className="text-emerald-500" /> Saldo (Min/Max)
                            </h5>
                            <div className="flex gap-2">
                                <input placeholder="MIN" value={filters.minStock} onChange={e => setFilters({ ...filters, minStock: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner uppercase" />
                                <input placeholder="MAX" value={filters.maxStock} onChange={e => setFilters({ ...filters, maxStock: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner uppercase" />
                            </div>
                        </div>
                    </div>

                    {/* Expiration Section */}
                    <div className="space-y-4">
                        <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Calendar size={14} className="text-rose-500" /> Janela de Vencimento
                        </h5>
                        <div className="flex gap-2">
                            {[30, 60, 90, 180].map(days => (
                                <button
                                    key={days}
                                    onClick={() => setFilters({ ...filters, expirationWindow: filters.expirationWindow === days ? null : days })}
                                    className={`flex-1 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filters.expirationWindow === days ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}
                                >
                                    {days} DIAS
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-800 bg-slate-950/60 flex gap-4">
                    <button
                        onClick={onClear}
                        className="flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={14} /> RESETAR
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-[2] p-4 rounded-xl bg-emerald-500 text-emerald-950 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
                    >
                        APLICAR FILTROS
                    </button>
                </div>
            </Card>
        </div>
    );
};
