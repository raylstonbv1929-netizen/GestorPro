import React, { useState, useMemo } from 'react';
import {
    Truck, Plus, Star, User, Phone, Mail, Edit, Trash2,
    MessageSquare, MapPin, Clock, Activity, ShieldCheck,
    CheckCircle2, AlertCircle, Layers, Zap, Info, ShieldAlert,
    Building2, FileText, Landmark, SlidersHorizontal, Search, X, CreditCard
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { TacticalFilterBlade } from '../../components/common/TacticalFilterBlade';

export const SuppliersPage = () => {
    const { suppliers, setSuppliers, addActivity } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const [form, setForm] = useState({
        name: '',
        category: 'Insumos',
        contact: '',
        email: '',
        phone: '',
        cnpj: '',
        address: '',
        leadTime: '',
        paymentTerms: '30 dias',
        status: 'active' as 'active' | 'inactive',
        rating: 3,
        safetyLevel: 'high' as 'high' | 'medium' | 'low'
    });

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.cnpj && s.cnpj.includes(searchTerm)) ||
                s.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || s.status === filter;
            return matchesSearch && matchesFilter;
        });
    }, [suppliers, searchTerm, filter]);

    const stats = useMemo(() => {
        const active = suppliers.filter(s => s.status === 'active' || !s.status).length;
        const total = suppliers.length;
        const percent = total > 0 ? (active / total) * 100 : 0;

        return {
            total,
            active,
            inactive: total - active,
            percent
        };
    }, [suppliers]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplierId) {
            setSuppliers(suppliers.map(s => s.id === editingSupplierId ? { ...s, ...form } : s));
            addActivity('Atualizou parceiro técnico', form.name, 'neutral');
        } else {
            const newSupplier = {
                ...form,
                id: Date.now(),
                lastOrder: "Sem pedidos ativos"
            };
            setSuppliers([newSupplier, ...suppliers]);
            addActivity('Homologou novo fornecedor', form.name, 'neutral');
        }
        setIsFormOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setEditingSupplierId(null);
        setForm({
            name: '', category: 'Insumos', contact: '', email: '', phone: '',
            cnpj: '', address: '', leadTime: '', paymentTerms: '30 dias',
            status: 'active', rating: 3, safetyLevel: 'high'
        });
    };

    const deleteSupplier = (id: number) => {
        const supplier = suppliers.find(s => s.id === id);
        if (supplier && window.confirm(`Deseja remover permanentemente o registro de ${supplier.name}?`)) {
            addActivity('Desvinculou fornecedor', supplier.name, 'neutral');
            setSuppliers(suppliers.filter(s => s.id !== id));
        }
    };

    const openWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
            {/* AGROGEST SENTINEL HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 z-20" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Truck className="text-emerald-500" size={32} />
                        Mapeamento de Suprimentos
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                        <Activity size={12} className="text-emerald-500/50" /> Portal de Homologação de Parceiros Estratégicos
                    </p>
                </div>

                <div className="flex gap-4 relative z-10 lg:w-auto w-full">
                    <button
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="flex-1 lg:flex-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-emerald-700"
                    >
                        <Plus size={20} /> Homologar Parceiro
                    </button>
                    <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        className={`px-6 py-5 rounded-2xl border transition-all flex items-center gap-3 font-black text-[10px] tracking-widest uppercase italic group ${isFilterPanelOpen ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
                    >
                        <SlidersHorizontal size={20} className="group-hover:rotate-180 transition-transform duration-500" /> Advanced_Filters
                    </button>
                </div>
            </div>

            {/* TELEMETRY MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 border border-slate-900 p-6 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Layers size={48} className="text-blue-500" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Matriz de Suprimentos</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{stats.total.toString().padStart(2, '0')} <span className="text-xs text-slate-600 font-normal not-italic">ENTIDADES</span></h4>
                    <div className="mt-4 w-full h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{ width: '100%' }} />
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-6 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Capacidade de Entrega</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{stats.percent.toFixed(0)}% <span className="text-xs text-slate-600 font-normal not-italic">OPERATIVO</span></h4>
                    <div className="mt-4 w-full h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${stats.percent}%` }} />
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-6 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertCircle size={48} className="text-rose-500" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Sinalização de Risco</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{stats.inactive.toString().padStart(2, '0')} <span className="text-xs text-slate-600 font-normal not-italic">SUSPENSÕES</span></h4>
                    <div className="mt-4 w-full h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full ${stats.inactive > 0 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse' : 'bg-slate-800'}`} style={{ width: stats.inactive > 0 ? '100%' : '0%' }} />
                    </div>
                </div>
            </div>

            {/* TACTICAL FILTER BLADE */}
            <TacticalFilterBlade
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                title="Scanner de Varredura de Suprimentos"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onReset={() => {
                    setSearchTerm('');
                    setFilter('all');
                }}
                progress={(filteredSuppliers.length / Math.max(suppliers.length, 1)) * 100}
                metrics={[
                    { label: 'ENTIDADES LOCALIZADAS', value: filteredSuppliers.length.toString().padStart(3, '0') },
                    { label: 'SINCRONIZAÇÃO', value: '100%' }
                ]}
            >
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Status de Homologação</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['all', 'active', 'inactive'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-4 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${filter === s ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'}`}
                                >
                                    {s === 'all' ? 'Ver Todos' : s === 'active' ? 'Homologados' : 'Suspensos'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-3">
                        <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest italic flex items-center gap-2">
                            <Info size={12} /> Dica de Varredura
                        </p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic leading-relaxed">
                            A busca avançada permite localizar parceiros por Nome Jurídico, CNPJ ou Categoria Operacional em tempo real.
                        </p>
                    </div>
                </div>
            </TacticalFilterBlade>

            {/* SUPPLIER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                {filteredSuppliers.map(sup => (
                    <Card key={sup.id} variant="glass" className="group p-0 border-slate-800/60 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative">
                        <div className="absolute top-0 right-0 p-6">
                            <button onClick={() => deleteSupplier(sup.id)} className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>

                        {/* Status Bar */}
                        <div className={`h-1.5 w-full ${sup.status === 'inactive' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500/30'}`} />

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all duration-500 shadow-xl">
                                        <Building2 size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-lg uppercase tracking-tighter italic leading-none">{sup.name}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2.5 py-1 bg-slate-900 rounded-lg text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] border border-slate-800">{sup.category}</span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${sup.status === 'active' || !sup.status ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                {sup.status === 'inactive' ? 'Suspenso' : 'Homologado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6 bg-slate-950/50 p-5 rounded-[1.5rem] border border-slate-900 flex-1">
                                    <div className="space-y-1">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5"><CreditCard size={10} /> Registro CNPJ</p>
                                        <p className="text-xs font-bold text-slate-300 font-mono tracking-tight">{sup.cnpj || '00.000.000/0000-00'}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5 justify-end"><Clock size={10} /> Lead Operativo</p>
                                        <p className="text-xs font-bold text-slate-300 italic">{sup.leadTime || '0'} DIAS ÚTEIS</p>
                                    </div>
                                </div>

                                <div className="space-y-3 px-2">
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <User size={14} className="text-emerald-500/30" />
                                        <span className="font-bold uppercase tracking-tight truncate">{sup.contact || 'CONTATO NÃO DEFINIDO'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <Mail size={14} className="text-emerald-500/30" />
                                        <span className="font-bold truncate">{sup.email || 'EMAIL@DOMINIO.COM.BR'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <MapPin size={14} className="text-emerald-500/30" />
                                        <span className="font-bold uppercase truncate">{sup.address || 'CIDADE / ESTADO - BR'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Footer Action Bar */}
                        <div className="mt-auto bg-slate-900/40 p-6 border-t border-slate-800/60 flex justify-between items-center group-hover:bg-slate-900/60 transition-colors">
                            <div className="flex gap-1 text-amber-500/20 group-hover:text-amber-500/50 transition-colors">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < (sup.rating || 0) ? "currentColor" : "none"} className={i < (sup.rating || 0) ? "text-amber-500" : ""} />
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => sup.phone && openWhatsApp(sup.phone)}
                                    className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-slate-500 hover:text-emerald-400 transition-all active:scale-90"
                                    title="WhatsApp Direto"
                                >
                                    <MessageSquare size={18} />
                                </button>
                                <button
                                    onClick={() => { setEditingSupplierId(sup.id); setForm({ ...form, ...sup }); setIsFormOpen(true); }}
                                    className="px-6 py-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3"
                                >
                                    <Edit size={14} /> GESTÃO
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* PROTOCOL MODAL: HOMOLOGAÇÃO */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                maxWidth="max-w-5xl"
            >
                <Card variant="glass" className="relative z-10 p-0 overflow-hidden border-emerald-500/20 shadow-2xl rounded-[1.5rem] md:rounded-[3rem] !scale-100 flex flex-col h-[95vh] md:h-[90vh]">
                        {/* Integrity progress bar */}
                        <div className="h-1.5 w-full bg-slate-900">
                            <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: editingSupplierId ? '100%' : '50%' }} />
                        </div>

                        <div className="p-10 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{editingSupplierId ? 'Atualização de Homologação' : 'Nova Homologação de Parceiro'}</h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
                                        <Zap size={12} className="text-emerald-500" /> Protocolo AgroGest Pro Edition
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-lg active:scale-90"><X size={28} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Identifying Cluster */}
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                                            <FileText size={14} /> Identidade Jurídica e Comercial
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Razão Social / Nome Fantasia</label>
                                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} placeholder="EX: FERTILIZANTES SANTA ROSA S.A." className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all italic placeholder:text-slate-800" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">CNPJ / Registro Receita</label>
                                                <input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all font-mono" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                                            <Landmark size={14} /> Localização e Logística
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Endereço Completo</label>
                                                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value.toUpperCase() })} placeholder="RUA DAS FLORES, 123 - CIDADE/UF" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all italic placeholder:text-slate-800" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Lead Time (Dias)</label>
                                                <input type="number" value={form.leadTime} onChange={e => setForm({ ...form, leadTime: e.target.value })} placeholder="EX: 7" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Control Cluster */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                                            <Zap size={14} /> Status e Compliance
                                        </h4>
                                        <div className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Categoria Operacional</label>
                                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                                                    <option>Insumos</option><option>Maquinário</option><option>Sementes</option><option>Combustível</option><option>Serviços</option><option>Outros</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Integridade Operacional</label>
                                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                                                    <option value="active">HOMOLOGADO / ATIVO</option>
                                                    <option value="inactive">SUSPENSO / EM REVISÃO</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Reputação de Entrega</label>
                                                <div className="flex justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })} className={`p-1 transition-all hover:scale-125 ${s <= form.rating ? 'text-amber-500' : 'text-slate-800'}`}>
                                                            <Star size={24} fill={s <= form.rating ? "currentColor" : "none"} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Combined Contact Strip */}
                                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-800">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2 italic"><User size={12} /> Representante Direto</label>
                                        <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value.toUpperCase() })} placeholder="NOME DO CONTATO" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all italic placeholder:text-slate-800" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2 italic"><Phone size={12} /> Telefone / WhatsApp</label>
                                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2 italic"><Mail size={12} /> E-mail de Relacionamento</label>
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value.toLowerCase() })} placeholder="EMAIL@PARCEIRO.COM.BR" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-10 border-t border-slate-800 bg-slate-950 backdrop-blur-3xl flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4 text-slate-500 opacity-40">
                                <ShieldAlert size={20} />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Auditor de Integridade SpeedGrid™ v4.0</span>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all shadow-lg active:scale-95">CANCELAR</button>
                                <button type="submit" onClick={handleSubmit} className="px-16 py-5 rounded-2xl bg-emerald-500 text-emerald-950 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 border-b-4 border-emerald-700">ORDEM DE HOMOLOGAÇÃO</button>
                            </div>
                        </div>
                    </Card>
            </Modal>
        </div>
    );
};
