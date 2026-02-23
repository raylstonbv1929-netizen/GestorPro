import React, { useState, useMemo } from 'react';
import {
    Briefcase, Users, UserCheck, HardHat, Ban, Search, X, Plus, Edit, Trash2, Phone, Mail, Calendar,
    User, DollarSign, Activity, MapPin, Target, ChevronRight, Zap, ShieldCheck, FileText, Landmark,
    Clock, MoreVertical, CheckCircle2, AlertCircle, RefreshCw, Star, Filter, SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatNumber, maskValue } from '../../utils/format';
import { Modal } from '../../components/common/Modal';
import { TacticalFilterBlade } from '../../components/common/TacticalFilterBlade';
import { useTacticalFilter } from '../../hooks/useTacticalFilter';
import { Collaborator } from '../../types';

export const CollaboratorsPage = () => {
    const { collaborators, setCollaborators, addActivity } = useApp();
    const {
        isSidebarOpen: isFilterPanelOpen,
        setIsSidebarOpen: setIsFilterPanelOpen,
        searchTerm, setSearchTerm,
        dateFilter, setDateFilter,
        advancedFilters, setAdvancedFilters,
        updateAdvancedFilter,
        filteredData: filteredCollaborators,
        resetFilters
    } = useTacticalFilter<Collaborator>({
        data: collaborators,
        searchFields: ['name', 'role', 'department', 'email'],
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const roles = useMemo(() => [...new Set(collaborators.map(c => c.role))].sort(), [collaborators]);
    const departments = useMemo(() => [...new Set(collaborators.map(c => c.department || 'GLOBAL'))].sort(), [collaborators]);

    const [formData, setFormData] = useState<{
        name: string;
        role: string;
        department: string;
        phone: string;
        email: string;
        status: 'active' | 'vacation' | 'inactive';
        salary: string;
        hireDate: string;
    }>({
        name: '', role: 'Operador de Máquinas', department: '', phone: '', email: '', status: 'active', salary: '', hireDate: new Date().toISOString().split('T')[0]
    });

    const stats = useMemo(() => {
        const total = collaborators.length;
        const active = collaborators.filter((c: any) => c.status === 'active' || !c.status).length;
        const vacation = collaborators.filter((c: any) => c.status === 'vacation').length;
        const inactive = collaborators.filter((c: any) => c.status === 'inactive').length;
        const percent = total > 0 ? (active / total) * 100 : 0;
        return { total, active, vacation, inactive, percent };
    }, [collaborators]);

    // Removal of filteredCollaborators useMemo as it's handled by useTacticalFilter

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const rawSalary = formData.salary.toString().replace(/\D/g, '');
        const newCollaborator = {
            ...formData,
            salary: Number(rawSalary) / 100
        };

        if (editingId) {
            setCollaborators(collaborators.map((c: any) => c.id === editingId ? { ...c, ...newCollaborator } : c));
            addActivity('Atualizou dossiê de colaborador', newCollaborator.name, 'neutral');
        } else {
            setCollaborators([{ ...newCollaborator, id: Date.now() }, ...collaborators]);
            addActivity('Recrutou novo colaborador', newCollaborator.name, 'neutral');
        }
        setIsFormOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', role: 'Operador de Máquinas', department: '', phone: '', email: '', status: 'active', salary: '', hireDate: new Date().toISOString().split('T')[0] });
    };

    const handleDelete = (id: number) => {
        const collaborator = collaborators.find((c: any) => c.id === id);
        if (collaborator && window.confirm(`Deseja remover permanentemente o registro de ${collaborator.name}?`)) {
            addActivity('Removeu colaborador do systema', collaborator.name, 'neutral');
            setCollaborators(collaborators.filter((c: any) => c.id !== id));
            if (editingId === id) resetForm();
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'vacation': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'inactive': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
            {/* COLLABORATOR SENTINEL COMMAND CENTER */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 z-20" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Briefcase className="text-indigo-500" size={32} />
                        Corpo Operacional & Talentos
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                        <Activity size={12} className="text-indigo-500/50" /> Monitoramento de Disponibilidade e Ativos Humanos
                    </p>
                </div>

                <div className="flex gap-4 relative z-10 lg:w-auto w-full">
                    <button
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="flex-1 lg:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-indigo-800"
                    >
                        <Plus size={20} /> Registrar Ativo
                    </button>
                    <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        className={`px-6 py-5 rounded-2xl border transition-all flex items-center gap-3 font-black text-[10px] tracking-widest uppercase italic group ${isFilterPanelOpen ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
                    >
                        <SlidersHorizontal size={20} className="group-hover:rotate-180 transition-transform duration-500" /> Advanced_Filters
                    </button>
                </div>
            </div>

            {/* TELEMETRY MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Efetivo Total', value: stats.total, icon: Users, color: 'indigo', code: 'TEAM_TTL' },
                    { label: 'Prontidão Operacional', value: stats.active, icon: UserCheck, color: 'emerald', code: 'TEAM_RDY' },
                    { label: 'Ciclo de Descanso', value: stats.vacation, icon: Star, color: 'amber', code: 'TEAM_VAC' },
                    { label: 'Ativos Suspensos', value: stats.inactive, icon: Ban, color: 'rose', code: 'TEAM_OFF' }
                ].map((item, idx) => (
                    <Card key={idx} className="group p-6 border-slate-900 hover:border-slate-800 bg-slate-950 relative overflow-hidden rounded-[2rem]">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${item.color}-500`}>
                            <item.icon size={48} />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic group-hover:text-slate-400 transition-colors">{item.label}</p>
                        <h4 className="text-3xl font-black text-white italic tracking-tighter group-hover:translate-x-1 transition-transform">
                            {item.value.toString().padStart(2, '0')}
                        </h4>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-[8px] font-black text-slate-700 tracking-widest uppercase italic">{item.code}</span>
                            <div className={`h-1 flex-1 mx-4 bg-slate-800 rounded-full overflow-hidden`}>
                                <div className={`h-full bg-${item.color}-500 shadow-[0_0_8px] shadow-${item.color}-500`} style={{ width: stats.total > 0 ? `${Math.max((item.value / stats.total) * 100, 4)}%` : '2%' }} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* SCANNER PANEL */}
            <TacticalFilterBlade
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                title="Scanner de Varredura de Capital Humano"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onReset={resetFilters}
                progress={(filteredCollaborators.length / Math.max(collaborators.length, 1)) * 100}
                metrics={[
                    { label: 'ATIVOS RASTREADOS', value: filteredCollaborators.length.toString().padStart(2, '0') },
                    { label: 'PRONTIDÃO', value: stats.percent.toFixed(0) + '%' }
                ]}
            >
                {/* SECTOR: STATUS OPERACIONAL */}
                <div className="space-y-6">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 border-l-2 border-indigo-500 pl-3">
                        DISPONIBILIDADE DO ATIVO
                    </h4>
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 block">ESTADO ATUAL</label>
                        <select
                            value={advancedFilters.status || 'all'}
                            onChange={e => updateAdvancedFilter('status', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                        >
                            <option value="all">Ver Todos</option>
                            <option value="active">Operativo / Ativo</option>
                            <option value="vacation">Em Ciclo de Férias</option>
                            <option value="inactive">Suspenso / Inativo</option>
                        </select>
                    </div>
                </div>

                {/* SECTOR: TÉCNICO */}
                <div className="space-y-6">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 border-l-2 border-emerald-500 pl-3">
                        ESPECIFICAÇÕES TÉCNICAS
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 block">CARGO / FUNÇÃO</label>
                            <select
                                value={advancedFilters.role || 'all'}
                                onChange={e => updateAdvancedFilter('role', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                            >
                                <option value="all">Todas as Funções</option>
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 block">SETOR / DEPARTAMENTO</label>
                            <select
                                value={advancedFilters.department || 'all'}
                                onChange={e => updateAdvancedFilter('department', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                            >
                                <option value="all">Todos os Setores</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </TacticalFilterBlade>

            {/* COLLABORATOR GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                {filteredCollaborators.map((c: any) => (
                    <Card key={c.id} variant="default" className="group p-0 border-slate-800/60 hover:border-indigo-500/40 transition-all duration-300 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative">
                        <div className="absolute top-0 right-0 p-6 z-10 flex gap-2">
                            <button onClick={() => handleDelete(c.id)} className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>

                        {/* Status Bar */}
                        <div className={`h-1.5 w-full ${c.status === 'inactive' ? 'bg-rose-500 animate-pulse' : c.status === 'vacation' ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all duration-500 shadow-xl font-black italic">
                                        {c.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-white text-lg uppercase tracking-tighter italic leading-none truncate group-hover:text-indigo-300 transition-colors">{c.name}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2.5 py-1 bg-slate-900 rounded-lg text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] border border-slate-800 flex items-center gap-1.5">
                                                <HardHat size={10} className="shrink-0" />
                                                <span className="hidden lg:inline">{c.role}</span>
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${getStatusStyle(c.status)}`}>
                                                {c.status === 'active' ? 'Operativo' : c.status === 'vacation' ? 'Férias' : 'Suspenso'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Details Cluster */}
                                <div className="grid grid-cols-2 gap-px bg-slate-800/40 border border-slate-800/40 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5"><MapPin size={10} /> Setor</p>
                                        <p className="text-[10px] font-black text-slate-300 uppercase truncate italic">{c.department || 'GLOBAL'}</p>
                                    </div>
                                    <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Desde</p>
                                        <p className="text-[10px] font-black text-slate-300 italic">{(c.hireDate || '').split('-').reverse().join('/')}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 p-5 rounded-[1.5rem] border border-slate-900 flex justify-between items-center group-hover:border-indigo-500/20 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5"><DollarSign size={10} /> Custo Mensal</p>
                                        <p className="text-xl font-black text-white italic tracking-tighter">R$ {c.salary ? formatNumber(c.salary) : '0,00'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl group-hover:border-indigo-500/40 transition-all">
                                        <ShieldCheck className="text-indigo-500/50 group-hover:text-indigo-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-3 px-2">
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <Phone size={14} className="text-indigo-500/30" />
                                        <span className="font-bold truncate">{c.phone || '(00) 00000-0000'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                                        <Mail size={14} className="text-indigo-500/30" />
                                        <span className="font-bold truncate uppercase">{c.email || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Footer Action Bar */}
                        <div className="mt-auto bg-slate-900/40 p-6 border-t border-slate-800/60 flex justify-between items-center group-hover:bg-slate-900/60 transition-colors">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-indigo-500 animate-pulse" />
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Ativo Rastreado</span>
                            </div>

                            <button
                                onClick={() => { setEditingId(c.id); setFormData({ ...c, salary: maskValue(c.salary.toString()) } as any); setIsFormOpen(true); }}
                                className="px-6 py-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3"
                            >
                                <Edit size={14} /> DETALHES TÉCNICOS
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* PROTOCOL MODAL: COLABORADOR */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                maxWidth="max-w-5xl"
            >
                <Card variant="glass" className="relative z-10 p-0 overflow-hidden border-indigo-500/20 shadow-2xl rounded-[1.5rem] md:rounded-[3rem] !scale-100 flex flex-col h-[95vh] md:h-[90vh]">
                        {/* Integrity progress bar */}
                        <div className="h-1.5 w-full bg-slate-900">
                            <div className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]" style={{ width: `${(Object.values(formData).filter(v => v !== '').length / 8) * 100}%` }} />
                        </div>

                        <div className="p-10 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <UserCheck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{editingId ? 'Atualização de Prontuário' : 'Registro de Recrutamento'}</h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
                                        <Zap size={12} className="text-indigo-500" /> Sistema de Gestão de Ativos Humanos
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-lg active:scale-90"><X size={28} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 group/form">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-3 italic"><FileText size={14} /> Identificação Personalíssima</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Nome Completo do Ativo</label>
                                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} placeholder="EX: RENATO AUGUSTO SILVA" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all italic" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Cargo / Função</label>
                                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-indigo-500/50 italic appearance-none cursor-pointer">
                                                    <option>Operador de Máquinas</option><option>Agrônomo</option><option>Gerente de Produção</option>
                                                    <option>Técnico Agrícola</option><option>Veterinário</option><option>Capataz</option><option>Administrativo</option>
                                                    <option>Outros</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Setor / Departamento</label>
                                                <input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value.toUpperCase() })} placeholder="EX: CAMPO 04 / LOGÍSTICA" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all italic" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 border-t border-slate-800 pt-8">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-3 italic"><Landmark size={14} /> Canais de Comunicação</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Telefone Operacional</label>
                                                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value.toLowerCase() })} placeholder="COLABORADOR@AGROGEST.COM" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-8">
                                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                                        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-3 italic"><DollarSign size={14} /> Estrutura de Custos</h4>
                                        <div className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Vencimento Mensal</label>
                                                <div className="relative">
                                                    <input required value={formData.salary} onChange={e => setFormData({ ...formData, salary: maskValue(e.target.value) })} placeholder="0,00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xl font-black text-white outline-none focus:border-indigo-500/50 italic text-right" />
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 italic">R$</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Data de Admissão</label>
                                                <input type="date" value={formData.hireDate} onChange={e => setFormData({ ...formData, hireDate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-indigo-500/50 [color-scheme:dark]" />
                                            </div>
                                            <div className="space-y-1.5 pt-4">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 mb-2 block italic">Estado do Ativo</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['active', 'vacation', 'inactive'].map(s => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, status: s as any })}
                                                            className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${formData.status === s ? getStatusStyle(s) + ' border-current' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                                                        >
                                                            {s === 'active' ? 'Ativo' : s === 'vacation' ? 'Férias' : 'Off'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/20 border border-slate-800/50 p-6 rounded-[1.5rem] flex items-center gap-4 text-slate-600">
                                        <ShieldCheck size={20} className="shrink-0" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest italic leading-tight">Os dados estão em conformidade com a LGPD e políticas internas da fazenda.</p>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-10 border-t border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4 text-slate-500 opacity-40 italic">
                                <Users size={20} />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Compliance Equipe v2.5</span>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all active:scale-95 italic">Abortar</button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="px-16 py-5 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 border-b-4 border-indigo-800 italic"
                                >
                                    Efetivar Registro
                                </button>
                            </div>
                        </div>
                    </Card>
            </Modal>
        </div>
    );
};
