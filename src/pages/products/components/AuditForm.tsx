import React, { useState } from 'react';
import { X, Info, Warehouse, DollarSign, ChevronRight, Scale, Plus, CheckCheck } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { maskNumber, maskValue, parseValue, formatCurrency, formatNumber } from '../../../utils/format';

interface AuditFormProps {
    isOpen: boolean;
    editingProductId: number | null;
    productForm: any;
    setProductForm: (form: any) => void;
    activeFormZone: number;
    setActiveFormZone: (zone: number) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onSaveAndContinue: () => void;
    settings: any;
}

export const AuditForm: React.FC<AuditFormProps> = ({
    isOpen,
    editingProductId,
    productForm,
    setProductForm,
    activeFormZone,
    setActiveFormZone,
    onClose,
    onSubmit,
    onSaveAndContinue,
    settings
}) => {
    const [showSuccessNotice, setShowSuccessNotice] = useState(false);

    if (!isOpen) return null;

    const handleQuickSave = () => {
        if (!productForm.name) return;
        onSaveAndContinue();
        setShowSuccessNotice(true);
        setTimeout(() => setShowSuccessNotice(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />

            <Card variant="glass" className="w-full max-w-4xl relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-emerald-500/20 !scale-100 !hover:scale-100 p-0 overflow-hidden rounded-[2.5rem]" style={{ transform: 'none' }}>
                <div className="flex flex-col h-[80vh] md:h-auto">
                    {/* Modal Header */}
                    <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{editingProductId ? 'Alterar Registro' : 'Iniciação de Insumo'}</h3>
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1 pl-1 border-l-2 border-emerald-500 ml-0.5">Protocolo de Integridade Cadastral</p>
                        </div>
                        <button type="button" onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-900 rounded-2xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"><X size={24} /></button>
                    </div>

                    <form onSubmit={onSubmit} className="flex-1 flex flex-col md:flex-row">
                        {/* Zone Selector (Sidebar) */}
                        <div className="w-full md:w-64 bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto">
                            {[
                                { id: 1, label: '01. IDENTIFICAÇÃO', icon: Info },
                                { id: 2, label: '02. LOGÍSTICA', icon: Warehouse },
                                { id: 3, label: '03. FINANCEIRO', icon: DollarSign }
                            ].map(zone => (
                                <button
                                    key={zone.id}
                                    type="button"
                                    onClick={() => setActiveFormZone(zone.id)}
                                    className={`flex-1 md:flex-none p-4 rounded-2xl flex items-center gap-4 transition-all border shrink-0 ${activeFormZone === zone.id ? 'bg-emerald-500 text-emerald-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700 font-bold'}`}
                                >
                                    <zone.icon size={18} />
                                    <span className="text-[10px] uppercase tracking-widest hidden md:block">{zone.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Zone Content */}
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar min-h-[400px]">
                            {activeFormZone === 1 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-lg"><Info size={32} /></div>
                                        <div>
                                            <p className="text-xs text-white font-black uppercase tracking-widest mb-1">Mapeamento de Insumo</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">Defina a nomenclatura oficial e a divisão estratégica para o rastreio de custos e aplicação.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3 group">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1 group-focus-within:text-emerald-500 transition-colors">Nomenclature Técnica</label>
                                            <input required placeholder="EX: FERTILIZANTE NPK 20-00-20 (GRANULADO)" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner uppercase italic" />
                                        </div>
                                        <div className="flex flex-col gap-3 group">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Divisão Estratégica</label>
                                            <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner uppercase appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_auto] bg-[position:right_1.5rem_center] bg-no-repeat">
                                                <optgroup label="AGRÍCOLAS" className="bg-slate-900">
                                                    <option>Fertilizantes</option>
                                                    <option>Sementes</option>
                                                    <option>Defensivos</option>
                                                    <option>Herbicidas</option>
                                                    <option>Fungicidas</option>
                                                    <option>Inseticidas</option>
                                                    <option>Adjuvantes</option>
                                                    <option>Corretivos</option>
                                                    <option>Nutrição Foliar</option>
                                                </optgroup>
                                                <optgroup label="LOGÍSTICA & FROTA" className="bg-slate-900">
                                                    <option>Combustível</option>
                                                    <option>Lubrificantes</option>
                                                    <option>Peças</option>
                                                    <option>Pneus</option>
                                                    <option>Filtros</option>
                                                </optgroup>
                                                <optgroup label="MANUTENÇÃO & INFRA" className="bg-slate-900">
                                                    <option>Ferramentas</option>
                                                    <option>Materiais de Construção</option>
                                                    <option>Elétrica</option>
                                                    <option>Hidráulica</option>
                                                    <option>Ferragens</option>
                                                </optgroup>
                                                <optgroup label="OPERACIONAL & SEGURANÇA" className="bg-slate-900">
                                                    <option>EPIs</option>
                                                    <option>Embalagens</option>
                                                    <option>Limpeza</option>
                                                </optgroup>
                                                <optgroup label="PECUÁRIA" className="bg-slate-900">
                                                    <option>Medicamentos Veterinários</option>
                                                    <option>Suplementos & Nutrição</option>
                                                    <option>Vacinas</option>
                                                </optgroup>
                                                <option>Outros</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeFormZone === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Unidade Logística</label>
                                            <select
                                                value={productForm.unit}
                                                onChange={e => {
                                                    const newUnit = e.target.value;
                                                    let suggestedWeight = productForm.unitWeight;
                                                    if (['kg', 'L', 'un', 'dose', 'm', 'm²', 'm³'].includes(newUnit)) suggestedWeight = '1,00';
                                                    else if (newUnit === 'ton') suggestedWeight = '1000,00';
                                                    else if (newUnit === 'sc (saco)' || newUnit === 'sc') suggestedWeight = '50,00';
                                                    else if (newUnit === 'bag (big bag)') suggestedWeight = '1000,00';
                                                    else if (newUnit === 'bombona' || newUnit === 'balde') suggestedWeight = '20,00';
                                                    else if (newUnit === '@ (arroba)') suggestedWeight = '15,00';
                                                    else if (newUnit === 'ml') suggestedWeight = '0,001';
                                                    else if (newUnit === 'g') suggestedWeight = '0,001';
                                                    setProductForm({ ...productForm, unit: newUnit, unitWeight: suggestedWeight });
                                                }}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner uppercase appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_auto] bg-[position:right_1.5rem_center] bg-no-repeat"
                                            >
                                                <optgroup label="PESO / MASSA" className="bg-slate-900">
                                                    <option>kg</option>
                                                    <option>g</option>
                                                    <option>ton</option>
                                                    <option value="@ (arroba)">@ ARROBA</option>
                                                </optgroup>
                                                <optgroup label="VOLUME / LÍQUIDOS" className="bg-slate-900">
                                                    <option>L</option>
                                                    <option>ml</option>
                                                    <option>bombona</option>
                                                    <option>balde</option>
                                                    <option>galão</option>
                                                    <option>tambor</option>
                                                    <option>frasco</option>
                                                </optgroup>
                                                <optgroup label="UNIDADES / LOGÍSTICA" className="bg-slate-900">
                                                    <option>un</option>
                                                    <option value="sc (saco)">sc (SACO)</option>
                                                    <option value="bag (big bag)">BAG (BIG BAG)</option>
                                                    <option>caixa</option>
                                                    <option>pacote</option>
                                                    <option>dose</option>
                                                </optgroup>
                                                <optgroup label="MEDIDAS TÉCNICAS" className="bg-slate-900">
                                                    <option>metro</option>
                                                    <option>m²</option>
                                                    <option>m³</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1 text-blue-400">Conversor Ref. (KG/L)</label>
                                            <input placeholder="EX: 50,00" value={productForm.unitWeight} onChange={e => setProductForm({ ...productForm, unitWeight: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Saldo Atual</label>
                                            <input placeholder="0,00" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner" />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1 text-orange-400">Reserva de Segurança (Mín.)</label>
                                            <input placeholder="0,00" value={productForm.minStock} onChange={e => setProductForm({ ...productForm, minStock: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Protocolo de Lote</label>
                                            <input placeholder="EX: LOTE-2024-X1" value={productForm.batch || ''} onChange={e => setProductForm({ ...productForm, batch: e.target.value.toUpperCase() })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner" />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1 text-rose-400">Data de Vencimento</label>
                                            <input type="date" value={productForm.expirationDate || ''} onChange={e => setProductForm({ ...productForm, expirationDate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner uppercase" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Galpão / Célula de Armazenamento</label>
                                        <input placeholder="EX: GALPÃO A-02, PRATELEIRA TÉCNICA" value={productForm.location} onChange={e => setProductForm({ ...productForm, location: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner uppercase italic" />
                                    </div>
                                </div>
                            )}

                            {activeFormZone === 3 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-lg"><Scale size={32} /></div>
                                        <div>
                                            <p className="text-xs text-white font-black uppercase tracking-widest mb-1">Cálculo de Custo Médio</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">Informe o valor de aquisição por unidade básica para cálculo do capital imobilizado no estoque.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Preço Unitário Auditado ({settings.currency})</label>
                                        <div className="relative">
                                            <div className="absolute left-6 inset-y-0 flex items-center pointer-events-none text-blue-500 font-black text-xs">{settings.currency}</div>
                                            <input placeholder="0,00" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: maskValue(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-6 py-6 text-2xl font-black text-white focus:border-blue-500/50 outline-none transition-all shadow-inner italic" />
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/40 p-8 rounded-3xl border border-slate-800/60 shadow-inner mt-10">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Resumo Financeiro do Lote</span>
                                            <span className="h-px bg-slate-800 flex-1 mx-6" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-10">
                                            <div>
                                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Volume Previsto</p>
                                                <p className="text-2xl font-black text-white italic">{formatNumber(productForm.stock)} <span className="text-[10px] text-slate-600 uppercase">{productForm.unit}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Ativo Total</p>
                                                <p className="text-2xl font-black text-blue-400 italic">{formatCurrency(parseValue(productForm.stock) * parseValue(productForm.price), settings.currency)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Static Bottom Bar */}
                    <div className="p-8 border-t border-slate-800 flex justify-between items-center bg-slate-950/60 backdrop-blur-3xl">
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${activeFormZone === i ? 'bg-emerald-500 w-8' : 'bg-slate-800'}`} />
                            ))}
                        </div>
                        <div className="flex gap-4 items-center">
                            {showSuccessNotice && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl animate-bounce-in">
                                    <CheckCheck size={14} className="text-emerald-400" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Registrado!</span>
                                </div>
                            )}

                            <button type="button" onClick={onClose} className="px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95">CANCELAR</button>

                            {!editingProductId && (
                                <button
                                    type="button"
                                    onClick={handleQuickSave}
                                    className="px-6 py-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-500 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Plus size={14} />
                                    SALVAR + NOVO
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={(e) => activeFormZone < 3 ? setActiveFormZone(activeFormZone + 1) : onSubmit(e as any)}
                                className="px-10 py-4 rounded-xl bg-emerald-500 text-emerald-950 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3"
                            >
                                {activeFormZone < 3 ? (
                                    <>ZONA SEGUINTE <ChevronRight size={16} strokeWidth={3} /></>
                                ) : (
                                    <>{editingProductId ? 'FINALIZAR ALTERAÇÃO' : 'CONFIRMAR IMPLANTAÇÃO'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
