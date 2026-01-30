import React, { useState, useMemo } from 'react';
import {
    Briefcase, Users, UserCheck, HardHat, Ban, Search, X, Plus, Edit, Trash2, Phone, Mail, Calendar,
    User, DollarSign, Activity, MapPin, Target, ChevronRight
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatNumber, maskValue } from '../../utils/format';

export const CollaboratorsPage = () => {
    const { collaborators, setCollaborators, addActivity } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
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
        name: '', role: 'Operador de Máquinas', department: '', phone: '', email: '', status: 'active', salary: '', hireDate: ''
    });

    const stats = useMemo(() => {
        const total = collaborators.length;
        const active = collaborators.filter((c: any) => c.status === 'active').length;
        const vacation = collaborators.filter((c: any) => c.status === 'vacation').length;
        const inactive = collaborators.filter((c: any) => c.status === 'inactive').length;
        return { total, active, vacation, inactive };
    }, [collaborators]);

    const filteredCollaborators = collaborators.filter((c: any) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || c.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const rawSalary = formData.salary.toString().replace(/\D/g, '');
        const newCollaborator = {
            ...formData,
            salary: Number(rawSalary) / 100
        };

        if (editingId) {
            setCollaborators(collaborators.map((c: any) => c.id === editingId ? { ...c, ...newCollaborator } : c));
            addActivity('Editou colaborador', newCollaborator.name);
        } else {
            setCollaborators([{ ...newCollaborator, id: Date.now() }, ...collaborators]);
            addActivity('Adicionou colaborador', newCollaborator.name);
        }
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ name: '', role: 'Operador de Máquinas', department: '', phone: '', email: '', status: 'active', salary: '', hireDate: '' });
    };

    const handleDelete = (id: number) => {
        const collaborator = collaborators.find((c: any) => c.id === id);
        if (collaborator && window.confirm(`Deseja realmente excluir o colaborador ${collaborator.name}?`)) {
            addActivity('Removeu colaborador', collaborator.name);
            setCollaborators(collaborators.filter((c: any) => c.id !== id));
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'vacation': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'inactive': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'ATIVO';
            case 'vacation': return 'FÉRIAS';
            case 'inactive': return 'INATIVO';
            default: return 'DESCONHECIDO';
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden">
            {/* TACTICAL HEADER - INDUSTRIAL SHARP */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 lowercase">
                            <Briefcase className="text-emerald-500" size={32} />
                            GESTÃO DE ATIVOS HUMANOS
                        </h2>
                        <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">
                            Monitoramento de Equipe e Recursos Operacionais
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', role: 'Operador de Máquinas', department: '', phone: '', email: '', status: 'active', salary: '', hireDate: '' });
                            setIsFormOpen(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-6 py-3 rounded-none font-black uppercase tracking-tighter transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)] active:translate-x-0.5 active:translate-y-0.5"
                    >
                        <Plus size={20} strokeWidth={3} /> Registrar Colaborador
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 border border-slate-800">
                    <button onClick={() => setFilter('all')} className={`bg-slate-900 p-4 text-left transition-all ${filter === 'all' ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Equipe</p>
                        <p className="text-2xl font-mono font-bold text-white">{stats.total}</p>
                    </button>
                    <button onClick={() => setFilter('active')} className={`bg-slate-900 p-4 text-left transition-all ${filter === 'active' ? 'bg-emerald-500/10' : 'hover:bg-slate-800/50'}`}>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Status [ATIVO]</p>
                        <p className="text-2xl font-mono font-bold text-emerald-500">{stats.active}</p>
                    </button>
                    <button onClick={() => setFilter('vacation')} className={`bg-slate-900 p-4 text-left transition-all ${filter === 'vacation' ? 'bg-amber-500/10' : 'hover:bg-slate-800/50'}`}>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Status [FÉRIAS]</p>
                        <p className="text-2xl font-mono font-bold text-amber-500">{stats.vacation}</p>
                    </button>
                    <button onClick={() => setFilter('inactive')} className={`bg-slate-900 p-4 text-left transition-all ${filter === 'inactive' ? 'bg-rose-500/10' : 'hover:bg-slate-800/50'}`}>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Status [INATIVO]</p>
                        <p className="text-2xl font-mono font-bold text-rose-500">{stats.inactive}</p>
                    </button>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-800/80 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="BUSCAR COLABORADOR POR NOME, CARGO OU DEP..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 font-bold tracking-widest transition-all"
                    />
                </div>
            </div>

            {/* COLLABORATOR CARDS GRID */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCollaborators.map((c: any) => (
                        <div
                            key={c.id}
                            className={`group bg-slate-900 border transition-all relative flex flex-col ${c.status === 'inactive'
                                ? 'border-slate-800/50 opacity-60'
                                : 'border-slate-800 hover:border-emerald-500/40'
                                }`}
                        >
                            {/* CARD BODY */}
                            <div className="p-5 flex flex-col gap-5">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-lg text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                                            {c.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm text-white uppercase tracking-tight leading-tight group-hover:text-emerald-500 transition-colors">{c.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="w-1.5 h-1.5 bg-slate-700 group-hover:bg-emerald-500" />
                                                <span className="text-[9px] text-slate-500 group-hover:text-slate-400 font-black uppercase tracking-widest transition-all">
                                                    {c.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(c.status)}`}>
                                        {getStatusLabel(c.status)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-px bg-slate-800/50 border border-slate-800/50">
                                    <div className="bg-slate-950/30 p-2.5">
                                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <Phone size={10} className="text-emerald-500" /> Contato
                                        </p>
                                        <p className="text-[10px] font-mono font-bold text-slate-300 truncate">{c.phone || 'NÃO INF.'}</p>
                                    </div>
                                    <div className="bg-slate-950/30 p-2.5">
                                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <Mail size={10} className="text-emerald-500" /> E-mail
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-300 truncate uppercase">{c.email || 'NÃO INF.'}</p>
                                    </div>
                                    <div className="bg-slate-950/30 p-2.5">
                                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <Briefcase size={10} className="text-emerald-500" /> Depto.
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-300 uppercase truncate">{c.department || 'NÃO INF.'}</p>
                                    </div>
                                    <div className="bg-slate-950/30 p-2.5">
                                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            <Calendar size={10} className="text-emerald-500" /> Admissão
                                        </p>
                                        <p className="text-[10px] font-mono font-bold text-slate-300">{c.hireDate ? c.hireDate.split('-').reverse().join('/') : 'NÃO INF.'}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-950 border border-slate-800 p-3 flex justify-between items-center group-hover:border-emerald-500/20 transition-all">
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={14} className="text-emerald-500" />
                                        <p className="text-xl font-mono font-black text-white tracking-tighter">
                                            {formatNumber(c.salary)}
                                        </p>
                                    </div>
                                    <p className="text-[8px] text-slate-600 font-mono uppercase">REC_SYS_V2</p>
                                </div>
                            </div>

                            {/* CARD FOOTER ACTIONS */}
                            <div className="bg-slate-950/50 border-t border-slate-800 p-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setEditingId(c.id);
                                        setFormData({ ...c, salary: maskValue(c.salary) });
                                        setIsFormOpen(true);
                                    }}
                                    className="p-1.5 bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 transition-all border border-slate-700"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all border border-slate-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredCollaborators.length === 0 && (
                        <div className="col-span-full py-20 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
                            <Activity size={32} className="mb-4 opacity-20" />
                            <p className="font-mono text-[10px] uppercase tracking-widest">Nenhum ativo humano encontrado no log</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL - TACTICAL FORM (CONSOLE MILITAR) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
                        {/* SCAN-LINE ANIMATION EFFECT */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,1)_50%)] bg-[length:100%_4px] animate-pulse" />

                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                    {editingId ? 'EDICÃO DE REGISTRO' : 'REKRUTAMENTO & REGISTRO'}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1.5 bg-slate-800 border border-slate-700 relative">
                                        {/* OPTION C: INTEGRITY BAR */}
                                        <div
                                            className="absolute left-0 top-0 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                                            style={{
                                                width: `${(Object.values(formData).filter(v => v !== '' && v !== '0,00').length / 8) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-[8px] font-mono text-emerald-500 font-black">
                                        ID_READY: {Math.round((Object.values(formData).filter(v => v !== '' && v !== '0,00').length / 8) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white p-2 ml-4 self-start">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                            {/* OPTION A: ZONA 01 - IDENTIFICAÇÃO */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800/50">
                                    <div className="w-2 h-2 bg-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[01] PARAMETROS DE IDENTIFICAÇÃO</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Nome Completo do Ativo</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            required
                                            autoFocus
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-bold placeholder:text-slate-900 transition-all uppercase text-sm"
                                            placeholder="EX: JOÃO DA SILVA"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Cargo / Função Técnica</label>
                                        <div className="relative group">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                                            <select
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500 font-bold appearance-none uppercase transition-all text-sm relative"
                                            >
                                                <optgroup label="GESTÃO E ESTRATÉGIA" className="bg-slate-900 text-slate-500 font-black">
                                                    <option>Gerente Geral</option>
                                                    <option>Gerente de Produção</option>
                                                    <option>Gerente Financeiro</option>
                                                    <option>Gerente de Pecuária</option>
                                                    <option>Gerente de Agricultura</option>
                                                    <option>Administrador Agrícola</option>
                                                    <option>Diretor Operacional</option>
                                                </optgroup>
                                                <optgroup label="CORPO TÉCNICO" className="bg-slate-900 text-slate-500 font-black">
                                                    <option>Agrônomo</option>
                                                    <option>Médico Veterinário</option>
                                                    <option>Zootecnista</option>
                                                    <option>Técnico Agrícola</option>
                                                    <option>Técnico em Agropecuária</option>
                                                    <option>Técnico em Irrigação</option>
                                                    <option>Técnico de Segurança do Trabalho</option>
                                                    <option>Consultor Técnico</option>
                                                </optgroup>
                                                <optgroup label="OPERAÇÃO DE CAMPO (AGRICULTURA)" className="bg-slate-900 text-slate-500 font-black">
                                                    <option>Operador de Máquinas</option>
                                                    <option>Tratorista</option>
                                                    <option>Operador de Colheitadeira</option>
                                                    <option>Safrista</option>
                                                    <option>Auxiliar de Campo</option>
                                                    <option>Irrigador</option>
                                                    <option>Aplicador de Defensivos</option>
                                                    <option>Canteirista</option>
                                                </optgroup>
                                                <optgroup label="OPERAÇÃO DE CAMPO (PECUÁRIA)" className="bg-slate-900 text-slate-500 font-black">
                                                    <option>Capataz</option>
                                                    <option>Campeiro</option>
                                                    <option>Peão de Pecuária</option>
                                                    <option>Inseminador</option>
                                                    <option>Retireiro</option>
                                                    <option>Tratador de Animais</option>
                                                    <option>Serviços Gerais (Pecuária)</option>
                                                </optgroup>
                                                <optgroup label="LOGÍSTICA E MANUTENÇÃO" className="bg-slate-900 text-slate-500 font-black">
                                                    <option>Almoxarife</option>
                                                    <option>Mecânico Agrícola</option>
                                                    <option>Mecânico Industrial</option>
                                                    <option>Eletricista</option>
                                                    <option>Motorista (Caminhão)</option>
                                                    <option>Motorista (Puxada)</option>
                                                    <option>Operador de Silo</option>
                                                    <option>Classificador de Grãos</option>
                                                    <option>Lubrificador</option>
                                                </optgroup>
                                                <optgroup label="APOIO E ADMINISTRATIVO" className="bg-slate-900 text-slate-500 font-black">
                                                    <option>Auxiliar Administrativo</option>
                                                    <option>Faturista</option>
                                                    <option>Contador Agrícola</option>
                                                    <option>Cozinheiro(a)</option>
                                                    <option>Auxiliar de Cozinha</option>
                                                    <option>Zelador</option>
                                                    <option>Vigia</option>
                                                    <option>Serviços Gerais</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Departamento / Setor</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input
                                                value={formData.department}
                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-bold transition-all uppercase text-sm placeholder:text-slate-900"
                                                placeholder="EX: PRODUÇÃO"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ZONA 02 - COMUNICAÇÃO & LOGÍSTICA */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800/50">
                                    <div className="w-2 h-2 bg-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[02] CANAIS DE DESPACHO E CONTATO</span>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Telefone Operacional</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono font-bold transition-all text-sm placeholder:text-slate-900"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">E-mail de Cadastro</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-bold transition-all text-sm placeholder:text-slate-900"
                                                placeholder="USUARIO@DOMINIO.COM"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ZONA 03 - FINANCEIRO & CONTRATUAL */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800/50">
                                    <div className="w-2 h-2 bg-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">[03] PARAMETROS CUSTO E ADMISSÃO</span>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Custo Mensal (R$)</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input
                                                value={formData.salary}
                                                onChange={e => setFormData({ ...formData, salary: maskValue(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono font-black transition-all text-sm placeholder:text-slate-900"
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Data de Ingresso</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                                            <input
                                                type="date"
                                                value={formData.hireDate}
                                                onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono font-bold transition-all text-sm [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Status Operacional do Ativo</label>
                                    <div className="flex gap-1">
                                        {[
                                            { id: 'active', label: 'ATIVO', color: 'peer-checked:bg-emerald-500 peer-checked:text-emerald-950 border-emerald-500/20 text-emerald-500' },
                                            { id: 'vacation', label: 'FÉRIAS', color: 'peer-checked:bg-amber-500 peer-checked:text-amber-950 border-amber-500/20 text-amber-500' },
                                            { id: 'inactive', label: 'INATIVO', color: 'peer-checked:bg-rose-500 peer-checked:text-rose-950 border-rose-500/20 text-rose-500' }
                                        ].map((s) => (
                                            <label key={s.id} className="flex-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value={s.id}
                                                    checked={formData.status === s.id}
                                                    onChange={() => setFormData({ ...formData, status: s.id as any })}
                                                    className="sr-only peer"
                                                />
                                                <div className={`py-3 text-[10px] font-black text-center border transition-all ${s.color} bg-slate-950 hover:bg-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]`}>
                                                    {s.label}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-1 pt-6 border-t border-slate-800/50">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-8 py-3 bg-slate-950 border border-slate-800 text-slate-400 font-black uppercase tracking-widest hover:text-white transition-all active:scale-95"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    className="px-12 py-3 bg-emerald-500 text-emerald-950 font-black uppercase tracking-tighter hover:bg-emerald-400 transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)] active:translate-x-0.5 active:translate-y-0.5"
                                >
                                    Gravar Registro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
