import React, { useState, useMemo } from 'react';
import {
    Users, BadgeCheck, Ban, Search, X, Plus, Star, User, Phone, Mail, Edit, Trash2,
    MessageSquare, Globe, MapPin, CreditCard, Clock, Activity, ShieldCheck, MoreVertical,
    CheckCircle2, AlertCircle, ExternalLink, Filter, Layers, Zap, Info, ShieldAlert,
    Building2, FileText, Landmark, Wallet, TrendingUp
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';

export const ClientsPage = () => {
    const { clients, setClients, addActivity } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const [form, setForm] = useState({
        name: '',
        type: 'Produtor Rural',
        contact: '',
        email: '',
        phone: '',
        cnpj: '',
        address: '',
        city: '',
        rating: 3,
        status: 'active' as 'active' | 'inactive',
        creditLimit: 50000,
        usedCredit: 0
    });

    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.cnpj && c.cnpj.includes(searchTerm)) ||
                c.city.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || c.status === filter;
            return matchesSearch && matchesFilter;
        });
    }, [clients, searchTerm, filter]);

    const stats = useMemo(() => {
        const active = clients.filter(c => c.status === 'active' || !c.status).length;
        const total = clients.length;
        const percent = total > 0 ? (active / total) * 100 : 0;

        return {
            total,
            active,
            inactive: total - active,
            percent
        };
    }, [clients]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClientId) {
            setClients(clients.map(c => c.id === editingClientId ? { ...c, ...form } : c));
            addActivity('Atualizou registro de cliente', form.name);
        } else {
            const newClient = {
                ...form,
                id: Date.now(),
                usedCredit: 0
            };
            setClients([newClient, ...clients]);
            addActivity('Cadastrou novo cliente', form.name);
        }
        setIsFormOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setEditingClientId(null);
        setForm({
            name: '', type: 'Produtor Rural', contact: '', email: '', phone: '',
            cnpj: '', address: '', city: '', rating: 3, status: 'active',
            creditLimit: 50000, usedCredit: 0
        });
    };

    const deleteClient = (id: number) => {
        const client = clients.find(c => c.id === id);
        if (client && window.confirm(`Deseja remover permanentemente o registro de ${client.name}?`)) {
            addActivity('Removeu cliente do sistema', client.name);
            setClients(clients.filter(c => c.id !== id));
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
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 z-20" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Users className="text-blue-500" size={32} />
                        Portfólio de Clientes
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                        <Activity size={12} className="text-blue-500/50" /> Gestão Tática de Relacionamento e Crédito
                    </p>
                </div>

                <div className="flex gap-4 relative z-10 lg:w-auto w-full">
                    <button
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-blue-800"
                    >
                        <Plus size={20} /> Novo Cliente
                    </button>
                    <button
                        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                        className={`p-5 rounded-2xl border transition-all ${isFilterPanelOpen ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white group-hover:border-slate-700'}`}
                    >
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* TELEMETRY MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 border border-slate-900 p-6 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={48} className="text-blue-500" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Base de Atendimento</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{stats.total.toString().padStart(2, '0')} <span className="text-xs text-slate-600 font-normal not-italic">ENTIDADES</span></h4>
                    <div className="mt-4 w-full h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{ width: '100%' }} />
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-6 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={48} className="text-emerald-500" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Taxa de Conversão/Atividade</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{stats.percent.toFixed(0)}% <span className="text-xs text-slate-600 font-normal not-italic">FIDELIZADO</span></h4>
                    <div className="mt-4 w-full h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${stats.percent}%` }} />
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-6 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert size={48} className="text-rose-500" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic">Bloqueios de Crédito</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">{stats.inactive.toString().padStart(2, '0')} <span className="text-xs text-slate-600 font-normal not-italic">SUSPENSÕES</span></h4>
                    <div className="mt-4 w-full h-[3px] bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full ${stats.inactive > 0 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse' : 'bg-slate-800'}`} style={{ width: stats.inactive > 0 ? '100%' : '0%' }} />
                    </div>
                </div>
            </div>

            {/* SCANNER PANEL */}
            {isFilterPanelOpen && (
                <div className="bg-slate-950/80 border border-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] mb-6 animate-in slide-in-from-top-4 duration-500 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-blue-500/50 z-20" />
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Search size={12} className="text-blue-500" /> Scanner de Identidade (NOME/CNPJ/CIDADE)
                        </label>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                            <div className="lg:col-span-8">
                                <div className="relative group h-full">
                                    <input
                                        type="text"
                                        placeholder="INICIAR VARREDURA..."
                                        className="w-full h-full bg-slate-900/50 border border-slate-800 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-blue-500/50 transition-all italic placeholder:text-slate-800"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                                        <Zap size={16} className="text-blue-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 flex gap-3 overflow-x-auto custom-scrollbar pb-2 lg:pb-0 h-full">
                                {['all', 'active', 'inactive'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilter(s)}
                                        className={`flex-1 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex items-center justify-center ${filter === s ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'}`}
                                    >
                                        {s === 'all' ? 'Ver Todos' : s === 'active' ? 'Ativos' : 'Bloqueados'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CLIENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                {filteredClients.map(client => (
                    <Card key={client.id} variant="glass" className="group p-0 border-slate-800/60 hover:border-blue-500/40 transition-all duration-500 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative">
                        <div className="absolute top-0 right-0 p-6 z-10">
                            <button onClick={() => deleteClient(client.id)} className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>

                        {/* Status Bar */}
                        <div className={`h-1.5 w-full ${client.status === 'inactive' ? 'bg-rose-500 animate-pulse' : 'bg-blue-500/30'}`} />

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all duration-500 shadow-xl font-black italic">
                                        {client.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-lg uppercase tracking-tighter italic leading-none">{client.name}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2.5 py-1 bg-slate-900 rounded-lg text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] border border-slate-800">{client.type}</span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${client.status === 'active' || !client.status ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                {client.status === 'inactive' ? 'Bloqueado' : 'Operativo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Finance Cluster */}
                                <div className="bg-slate-950/50 p-5 rounded-[1.5rem] border border-slate-900 space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <div className="space-y-1">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5"><Wallet size={10} /> Crédito Consumido</p>
                                            <p className="text-xs font-bold text-slate-300 font-mono tracking-tight">R$ {((client.usedCredit || 0)).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5 justify-end"><CreditCard size={10} /> Teto Aprovado</p>
                                            <p className="text-xs font-bold text-blue-400 italic">R$ {((client.creditLimit || 50000)).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Credit Progress Bar */}
                                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${((client.usedCredit || 0) / (client.creditLimit || 50000)) > 0.8 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`}
                                            style={{ width: `${Math.min(((client.usedCredit || 0) / (client.creditLimit || 50000)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 px-2">
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <User size={14} className="text-blue-500/30" />
                                        <span className="font-bold uppercase tracking-tight truncate">{client.contact || 'RESPONSÁVEL NÃO IDENTIFICADO'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <Phone size={14} className="text-blue-500/30" />
                                        <span className="font-bold truncate">{client.phone || '(00) 00000-0000'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <MapPin size={14} className="text-blue-500/30" />
                                        <span className="font-bold uppercase truncate">{client.city || 'TERRITÓRIO NACIONAL'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Footer Action Bar */}
                        <div className="mt-auto bg-slate-900/40 p-6 border-t border-slate-800/60 flex justify-between items-center group-hover:bg-slate-900/60 transition-colors">
                            <div className="flex gap-1 text-amber-500/20 group-hover:text-amber-500/50 transition-colors">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < (client.rating || 0) ? "currentColor" : "none"} className={i < (client.rating || 0) ? "text-amber-500" : ""} />
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => client.phone && openWhatsApp(client.phone)}
                                    className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-slate-500 hover:text-emerald-400 transition-all active:scale-90"
                                    title="WhatsApp Direto"
                                >
                                    <MessageSquare size={18} />
                                </button>
                                <button
                                    onClick={() => { setEditingClientId(client.id); setForm({ ...form, ...client }); setIsFormOpen(true); }}
                                    className="px-6 py-3 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3"
                                >
                                    <Edit size={14} /> DOSSIÊ
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* PROTOCOL MODAL: CLIENTE */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 md:p-4">
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={() => setIsFormOpen(false)} />

                    <Card variant="glass" className="w-full max-w-5xl relative z-10 p-0 overflow-hidden border-blue-500/20 shadow-2xl rounded-[1.5rem] md:rounded-[3rem] !scale-100 flex flex-col h-[95vh] md:h-[90vh]">
                        {/* Integrity progress bar */}
                        <div className="h-1.5 w-full bg-slate-900">
                            <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" style={{ width: editingClientId ? '100%' : '50%' }} />
                        </div>

                        <div className="p-10 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{editingClientId ? 'Atualização de Dossiê' : 'Protocolo de Novo Cliente'}</h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
                                        <Zap size={12} className="text-blue-500" /> Sistema de Homologação Comercial
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
                                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3">
                                            <FileText size={14} /> Identificação Jurídica e Comercial
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Razão Social / Nome</label>
                                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} placeholder="EX: FAZENDA PROGRESSO E CIA" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all italic placeholder:text-slate-800" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">CNPJ / CPF</label>
                                                <input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all font-mono" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3">
                                            <Landmark size={14} /> Localização de Atendimento
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Endereço Fiscal/Entrega</label>
                                                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value.toUpperCase() })} placeholder="ESTRADA RURAL KM 12 - ZONA RURAL" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all italic placeholder:text-slate-800" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Cidade / UF</label>
                                                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value.toUpperCase() })} placeholder="SORRISO - MT" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all italic placeholder:text-slate-800" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Control Cluster */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3">
                                            <Wallet size={14} /> Política Financeira
                                        </h4>
                                        <div className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Perfil do Cliente</label>
                                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                                    <option>Produtor Rural</option><option>Cooperativa</option><option>Revenda</option><option>Indústria</option><option>Exportador</option><option>Varejo</option><option>Outros</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Limite de Crédito Globale</label>
                                                <input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: parseFloat(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-blue-400 outline-none focus:border-blue-500 transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Status de Crédito</label>
                                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                                    <option value="active">OPERATIVO / CRÉDITO LIBERADO</option>
                                                    <option value="inactive">BLOQUEADO / EM ANÁLISE</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Combined Contact Strip */}
                                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-800">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2 italic"><User size={12} /> Gestor de Contrato</label>
                                        <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value.toUpperCase() })} placeholder="NOME DO RESPONSÁVEL" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all italic placeholder:text-slate-800" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2 italic"><Phone size={12} /> Telefone Direto</label>
                                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2 italic"><Mail size={12} /> E-mail de Faturamento</label>
                                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value.toLowerCase() })} placeholder="FINANCEIRO@CLIENTE.COM.BR" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-10 border-t border-slate-800 bg-slate-950 backdrop-blur-3xl flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4 text-slate-500 opacity-40">
                                <ShieldAlert size={20} />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Compliance Comercial v2.1</span>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all shadow-lg active:scale-95">ABORTAR</button>
                                <button type="submit" onClick={handleSubmit} className="px-16 py-5 rounded-2xl bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 border-b-4 border-blue-800">EXECUTAR HOMOLOGAÇÃO</button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
