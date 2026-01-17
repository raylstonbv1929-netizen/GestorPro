import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck, Search, History, Plus, ArrowRightLeft, DollarSign,
    AlertTriangle, AlertCircle, RefreshCw, ChevronRight, ArrowDown, X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatCurrency, parseValue, maskValue, maskNumber } from '../../utils/format';

export const InventoryPage = () => {
    const {
        products, stockMovements, settings, handleStockAdjustment,
        collaborators, properties, plots, calculateNormalizedQuantity
    } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [historyProduct, setHistoryProduct] = useState<any>(null);
    const [adjustmentType, setAdjustmentType] = useState('in'); // 'in' or 'out'
    const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [adjustmentUnit, setAdjustmentUnit] = useState('');

    const [adjustmentBatch, setAdjustmentBatch] = useState('');
    const [adjustmentCost, setAdjustmentCost] = useState('');
    const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().split('T')[0]);
    const [adjustmentOperator, setAdjustmentOperator] = useState(settings.userName);
    const [adjustmentPlotId, setAdjustmentPlotId] = useState('');
    const [historyFilter, setHistoryFilter] = useState('all'); // all, in, out (for the main list)

    const [stockStatusFilter, setStockStatusFilter] = useState('all'); // all, low, critical

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (stockStatusFilter === 'all') return true;
        if (stockStatusFilter === 'low') return p.status === 'low' || p.status === 'critical';
        if (stockStatusFilter === 'critical') return p.status === 'critical';

        return true;
    });

    const urgencyStats = {
        low: products.filter(p => p.status === 'low').length,
        critical: products.filter(p => p.status === 'critical').length
    };

    const filteredMovements = stockMovements.filter(m => {
        if (historyFilter === 'all') return true;
        return m.type === historyFilter;
    });

    const stats = {
        totalMovements: stockMovements.length,
        entriesCount: stockMovements.filter(m => m.type === 'in').length,
        exitsCount: stockMovements.filter(m => m.type === 'out').length,
        totalValueAdded: stockMovements.filter(m => m.type === 'in').reduce((acc, m) => acc + (m.cost || 0), 0)
    };

    useEffect(() => {
        if (selectedProduct && adjustmentQuantity) {
            const qty = parseValue(adjustmentQuantity);
            if (!isNaN(qty)) {
                const normalized = calculateNormalizedQuantity(selectedProduct, qty, adjustmentUnit);
                if (adjustmentType === 'in') {
                    setAdjustmentCost((normalized * selectedProduct.price).toFixed(2));
                }
            }
        } else {
            setAdjustmentCost('');
        }
    }, [adjustmentQuantity, adjustmentUnit, adjustmentType, selectedProduct]);

    const handleStockAdjustmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !adjustmentQuantity) return;

        let finalReason = adjustmentReason;
        if (adjustmentType === 'out' && adjustmentPlotId) {
            const plot = plots.find(p => p.id === parseInt(adjustmentPlotId));
            if (plot) {
                finalReason = `Aplicação: ${plot.name}${adjustmentReason ? ` - ${adjustmentReason}` : ''}`;
            }
        }

        handleStockAdjustment({
            productId: selectedProduct.id,
            type: adjustmentType,
            quantity: adjustmentQuantity,
            reason: finalReason,
            unit: adjustmentUnit,
            batch: adjustmentBatch,
            cost: parseValue(adjustmentCost),
            updatePrice: false,
            date: adjustmentDate,
            customUser: adjustmentOperator
        });
        closeModal();
    };

    const openAdjustment = (product: any, type: string) => {
        setSelectedProduct(product);
        setAdjustmentType(type);
        setAdjustmentQuantity('');
        setAdjustmentReason('');
        setAdjustmentUnit(product.unit);
        setAdjustmentBatch('');
        setAdjustmentCost('');
        setAdjustmentDate(new Date().toISOString().split('T')[0]);
        setAdjustmentOperator(settings.userName);
        setAdjustmentPlotId('');
        setIsAdjustmentModalOpen(true);
    };

    const closeModal = () => {
        setIsAdjustmentModalOpen(false);
        setSelectedProduct(null);
    };

    const getConversionDisplay = () => {
        if (!selectedProduct || !adjustmentQuantity) return null;
        const qty = parseValue(adjustmentQuantity);
        if (isNaN(qty)) return null;

        const normalized = calculateNormalizedQuantity(selectedProduct, qty, adjustmentUnit);
        const currentStock = Number(selectedProduct.stock);
        const newStock = adjustmentType === 'in' ? currentStock + normalized : currentStock - normalized;

        const weight = parseFloat(String(selectedProduct.unitWeight)) || 1;
        const totalKgAfter = newStock * weight;
        const diffKg = normalized * weight;

        return (
            <div className="mt-4 space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/50 animate-fade-in shadow-inner">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 uppercase font-black tracking-wider">Conversão:</span>
                    <span className="text-emerald-400 font-black">{qty} {adjustmentUnit} = {normalized.toFixed(4)} {selectedProduct.unit}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 uppercase font-black tracking-wider">Equivalente em Peso:</span>
                    <span className="text-blue-400 font-black">{diffKg.toFixed(2)} kg</span>
                </div>
                <div className="pt-3 border-t border-slate-800/50">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs font-bold">Estoque após {adjustmentType === 'in' ? 'entrada' : 'saída'}:</span>
                        <div className="text-right">
                            <p className={`text-xl font-black ${newStock < 0 ? 'text-rose-500' : 'text-white'}`}>
                                {newStock.toFixed(2)} {selectedProduct.unit}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold">({totalKgAfter.toFixed(2)} kg)</p>
                        </div>
                    </div>
                </div>
                {newStock < 0 && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                        <AlertCircle size={14} className="text-rose-500" />
                        <p className="text-[10px] text-rose-400 font-black uppercase">Atenção: Estoque ficará negativo!</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="animate-fade-in space-y-6 flex flex-col h-[calc(100vh-180px)]">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ClipboardCheck className="text-emerald-400" /> Inventário & Auditoria
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 animate-fade-in overflow-hidden" style={{ animationDelay: '0.1s', transform: 'translateZ(0)' }}>
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><History size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Movimentações</p><p className="text-xl font-black text-white">{stats.totalMovements}</p></div>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 animate-fade-in overflow-hidden" style={{ animationDelay: '0.2s', transform: 'translateZ(0)' }}>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Plus size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Entradas</p><p className="text-xl font-black text-white">{stats.entriesCount}</p></div>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 animate-fade-in overflow-hidden" style={{ animationDelay: '0.3s', transform: 'translateZ(0)' }}>
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><ArrowRightLeft size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Saídas</p><p className="text-xl font-black text-white">{stats.exitsCount}</p></div>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 animate-fade-in overflow-hidden" style={{ animationDelay: '0.4s', transform: 'translateZ(0)' }}>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><DollarSign size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Investimento Mês</p><p className="text-xl font-black text-white">{formatCurrency(stats.totalValueAdded, settings.currency)}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
                    <Card variant="highlight" className="p-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar item para ajuste..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-all"
                                style={{ transform: 'translateZ(0)' }}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setStockStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${stockStatusFilter === 'all' ? 'bg-slate-700 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                Todos os Itens
                                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">{products.length}</span>
                            </button>
                            <button
                                onClick={() => setStockStatusFilter('low')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${stockStatusFilter === 'low' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-amber-400/70'}`}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                <AlertTriangle size={14} />
                                Estoque Baixo
                                {urgencyStats.low > 0 && <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">{urgencyStats.low}</span>}
                            </button>
                            <button
                                onClick={() => setStockStatusFilter('critical')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${stockStatusFilter === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-rose-400/70'}`}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                <AlertCircle size={14} />
                                Estoque Crítico
                                {urgencyStats.critical > 0 && <span className="bg-rose-500/20 px-1.5 py-0.5 rounded text-[10px]">{urgencyStats.critical}</span>}
                            </button>
                        </div>
                    </Card>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-20 custom-scrollbar">
                        {filteredProducts.map((prod, idx) => (
                            <div key={prod.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all animate-fade-in group overflow-hidden" style={{ animationDelay: `${0.1 + idx * 0.05}s`, transform: 'translateZ(0)' }}>
                                <div>
                                    <h4 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{prod.name}</h4>
                                    <p className="text-sm text-slate-400">
                                        Atual: <span className="text-white font-bold">{Number(prod.stock).toFixed(2)} {prod.unit}</span>
                                        <span className="text-xs text-slate-500 ml-1">({(prod.stock * (parseFloat(String(prod.unitWeight)) || 1)).toFixed(2)} {['L', 'ml', 'galão', 'tambor', 'bombona', 'balde', 'frasco', 'ampola', 'bisnaga'].includes(prod.unit) ? 'L' : 'kg'})</span>
                                        • Peso Ref: {prod.unitWeight}kg/{prod.unit}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setHistoryProduct(prod); setIsHistoryModalOpen(true); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all" title="Ver Histórico"><History size={18} /></button>
                                    <button onClick={() => openAdjustment(prod, 'in')} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1 transition-all"><Plus size={14} /> Entrada</button>
                                    <button onClick={() => openAdjustment(prod, 'out')} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1 transition-all"><ArrowRightLeft size={14} /> Saída</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2"><History size={18} className="text-slate-400" /> Histórico</h3>
                        <div className="flex bg-slate-900 rounded-lg p-0.5">
                            <button onClick={() => setHistoryFilter('all')} className={`px-2 py-1 text-[10px] rounded-md ${historyFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Todos</button>
                            <button onClick={() => setHistoryFilter('in')} className={`px-2 py-1 text-[10px] rounded-md ${historyFilter === 'in' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}>Entradas</button>
                            <button onClick={() => setHistoryFilter('out')} className={`px-2 py-1 text-[10px] rounded-md ${historyFilter === 'out' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400'}`}>Saídas</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative">
                        <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-800"></div>
                        {filteredMovements.map(mov => (
                            <div key={mov.id} className="relative pl-8 group">
                                <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-slate-900 z-10 ${mov.type === 'in' ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}`}>
                                    {mov.type === 'in' ? <Plus size={10} /> : <ArrowDown size={10} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{mov.productName}</p>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`text-xs font-bold ${mov.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {mov.type === 'in' ? 'Entrada' : 'Saída'} de {mov.quantity} {mov.quantityUnit}
                                            </p>
                                            {mov.batch && <p className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded w-fit mt-1">Lote/NF: {mov.batch}</p>}
                                        </div>
                                        <p className="text-[10px] text-slate-600 text-right">
                                            {new Date(mov.date).toLocaleDateString('pt-BR')} {new Date(mov.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 italic">{mov.reason}</p>
                                </div>
                            </div>
                        ))}
                        {filteredMovements.length === 0 && <p className="text-center text-slate-500 text-sm py-4">Nenhum registro encontrado.</p>}
                    </div>
                </Card>
            </div>

            {isAdjustmentModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-fade-in max-h-[95vh] overflow-y-auto custom-scrollbar relative">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
                                    {adjustmentType === 'in' ? 'Registrar Entrada' : 'Registrar Saída'}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">Item: <span className="text-slate-300">{selectedProduct.name}</span></p>
                            </div>
                            <div className={`p-4 rounded-3xl shadow-lg ${adjustmentType === 'in' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                <RefreshCw size={28} className={adjustmentType === 'out' ? 'rotate-180' : ''} />
                            </div>
                        </div>

                        <form onSubmit={handleStockAdjustmentSubmit} className="space-y-6">
                            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/50 shadow-inner">
                                <button type="button" onClick={() => setAdjustmentType('in')} className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${adjustmentType === 'in' ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}>Entrada</button>
                                <button type="button" onClick={() => setAdjustmentType('out')} className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${adjustmentType === 'out' ? 'bg-rose-500 text-rose-950 shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300'}`}>Saída</button>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 block mb-2">Quantidade</label>
                                    <input autoFocus className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-3xl font-black outline-none focus:border-blue-500/50 transition-all shadow-inner" value={adjustmentQuantity} onChange={e => setAdjustmentQuantity(maskNumber(e.target.value))} placeholder="0,00" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 block mb-2">Unidade</label>
                                    <div className="relative">
                                        <select className="w-full h-[76px] bg-slate-950 border border-slate-800 rounded-2xl px-4 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all shadow-inner appearance-none cursor-pointer" value={adjustmentUnit} onChange={e => setAdjustmentUnit(e.target.value)}>
                                            <optgroup label="Peso/Massa">
                                                <option>kg</option>
                                                <option>g</option>
                                                <option>mg</option>
                                                <option>ton</option>
                                                <option>@ (arroba)</option>
                                            </optgroup>
                                            <optgroup label="Volume/Líquidos">
                                                <option>L</option>
                                                <option>ml</option>
                                                <option>galão</option>
                                                <option>tambor</option>
                                                <option>bombona</option>
                                                <option>balde</option>
                                                <option>frasco</option>
                                                <option>ampola</option>
                                                <option>bisnaga</option>
                                            </optgroup>
                                            <optgroup label="Embalagens/Unidades">
                                                <option>un</option>
                                                <option>sc (saco)</option>
                                                <option>bag (big bag)</option>
                                                <option>pacote</option>
                                                <option>caixa</option>
                                                <option>fardo</option>
                                                <option>palete</option>
                                                <option>kit</option>
                                                <option>par</option>
                                                <option>dúzia</option>
                                                <option>milheiro</option>
                                            </optgroup>
                                            <optgroup label="Medidas/Dimensões">
                                                <option>metro</option>
                                                <option>cm</option>
                                                <option>mm</option>
                                                <option>m²</option>
                                                <option>m³</option>
                                                <option>rolo</option>
                                                <option>bobina</option>
                                                <option>barra</option>
                                                <option>tubo</option>
                                                <option>folha</option>
                                            </optgroup>
                                            <optgroup label="Agrícola/Especiais">
                                                <option>dose</option>
                                                <option>ha (hectare)</option>
                                                <option>alqueire</option>
                                            </optgroup>
                                        </select>
                                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 block mb-2">Data</label>
                                    <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all shadow-inner" value={adjustmentDate} onChange={e => setAdjustmentDate(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 block mb-2">Operador</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-xs font-bold outline-none focus:border-blue-500/50 transition-all shadow-inner cursor-pointer appearance-none" value={adjustmentOperator} onChange={e => setAdjustmentOperator(e.target.value)}>
                                            {collaborators.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 block mb-2">{adjustmentType === 'in' ? 'Nº Lote / NF' : 'Destino / Uso'}</label>
                                {adjustmentType === 'in' ? (
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm font-medium outline-none transition-all shadow-inner focus:border-emerald-500/50"
                                        value={adjustmentBatch}
                                        onChange={e => setAdjustmentBatch(e.target.value)}
                                        placeholder="Opcional"
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <select
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm font-bold outline-none focus:border-rose-500/50 transition-all shadow-inner appearance-none cursor-pointer"
                                                value={adjustmentPlotId}
                                                onChange={e => setAdjustmentPlotId(e.target.value)}
                                            >
                                                <option value="">Selecione um Talhão (Opcional)</option>
                                                {properties.map(prop => (
                                                    <optgroup key={prop.id} label={prop.name}>
                                                        {plots.filter(p => p.propertyId === prop.id).map(plot => (
                                                            <option key={plot.id} value={plot.id}>{plot.name}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm font-medium outline-none transition-all shadow-inner focus:border-rose-500/50"
                                            value={adjustmentReason}
                                            onChange={e => setAdjustmentReason(e.target.value)}
                                            placeholder="Observação ou Destino Manual (Ex: Venda, Descarte)"
                                        />
                                    </div>
                                )}
                            </div>

                            {adjustmentType === 'in' && (
                                <div>
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 block mb-2">Custo Total (R$)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-4 text-slate-600 font-bold">R$</span>
                                        <input className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold outline-none focus:border-emerald-500/50 transition-all shadow-inner" value={adjustmentCost} onChange={e => setAdjustmentCost(maskValue(e.target.value))} placeholder="0,00" />
                                    </div>
                                </div>
                            )}

                            {getConversionDisplay()}

                            <div className="flex gap-4 mt-10">
                                <button type="button" onClick={closeModal} className="flex-1 py-5 rounded-2xl border border-slate-800 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 hover:text-white transition-all">Cancelar</button>
                                <button type="submit" className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white transition-all shadow-xl ${adjustmentType === 'in' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20'}`}>
                                    Confirmar {adjustmentType === 'in' ? 'Entrada' : 'Saída'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isHistoryModalOpen && historyProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)} />
                    <Card className="w-full max-w-2xl relative z-10 shadow-2xl border-slate-800 !scale-100 !hover:scale-100 max-h-[90vh] flex flex-col" style={{ transform: 'none' }}>
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">Histórico: {historyProduct.name}</h3>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">Movimentações recentes deste item</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {stockMovements.filter(m => m.productId === historyProduct.id).length === 0 ? (
                                <div className="py-20 text-center text-slate-500 italic">Nenhuma movimentação registrada para este produto.</div>
                            ) : (
                                stockMovements.filter(m => m.productId === historyProduct.id).map(mov => (
                                    <div key={mov.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${mov.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {mov.type === 'in' ? <Plus size={18} /> : <ArrowRightLeft size={18} className="rotate-90" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{mov.type === 'in' ? 'Entrada' : 'Saída'} de {mov.quantity} {mov.quantityUnit}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">{new Date(mov.date).toLocaleDateString('pt-BR')} às {new Date(mov.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 font-medium">{mov.reason}</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Por: {mov.user}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
