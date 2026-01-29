import React, { useState } from 'react';
import {
    Briefcase, Users, UserCheck, HardHat, Ban, Search, X, Plus, Edit, Trash2, Phone, Mail, Calendar
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

    const filteredCollaborators = collaborators.filter((c: any) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || c.status === filter;
        return matchesSearch && matchesFilter;
    });

    const totalCollaborators = collaborators.length;
    const activeCollaborators = collaborators.filter((c: any) => c.status === 'active').length;
    const vacationCollaborators = collaborators.filter((c: any) => c.status === 'vacation').length;
    const inactiveCollaborators = collaborators.filter((c: any) => c.status === 'inactive').length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCollaborator = { ...formData, salary: Number(formData.salary.toString().replace(/\D/g, '')) / 100 };
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

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Briefcase className="text-emerald-400" size={28} /> Gestão de Colaboradores
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setFilter('all')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'all' ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700/50'}`}>
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Users size={20} /></div>
                        <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Total</p><p className="text-xl font-black text-white">{totalCollaborators}</p></div>
                    </button>
                    <button onClick={() => setFilter('active')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'active' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/50'}`}>
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><UserCheck size={20} /></div>
                        <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Ativos</p><p className="text-xl font-black text-white">{activeCollaborators}</p></div>
                    </button>
                    <button onClick={() => setFilter('vacation')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'vacation' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700/50'}`}>
                        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400"><HardHat size={20} /></div>
                        <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Férias</p><p className="text-xl font-black text-white">{vacationCollaborators}</p></div>
                    </button>
                    <button onClick={() => setFilter('inactive')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'inactive' ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-700/50'}`}>
                        <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400"><Ban size={20} /></div>
                        <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Inativos</p><p className="text-xl font-black text-white">{inactiveCollaborators}</p></div>
                    </button>
                </div>

                <Card variant="highlight" className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                            <input type="text" placeholder="Buscar por nome ou cargo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                        </div>
                        <button onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData({ name: '', role: 'Operador de Máquinas', department: '', phone: '', email: '', status: 'active', salary: '', hireDate: '' }); }} className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                            <Plus size={18} /> <span>Novo Colaborador</span>
                        </button>
                    </div>
                </Card>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <Card className="w-full max-w-2xl relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100" style={{ transform: 'none' }}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-white">{editingId ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Nome Completo</label>
                                    <input required placeholder="Ex: João Silva" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Cargo</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500">
                                        <option>Operador de Máquinas</option>
                                        <option>Agrônomo</option>
                                        <option>Gerente</option>
                                        <option>Administrativo</option>
                                        <option>Safrista</option>
                                        <option>Auxiliar Geral</option>
                                        <option>Veterinário</option>
                                        <option>Técnico Agrícola</option>
                                        <option>Tratorista</option>
                                        <option>Motorista</option>
                                        <option>Almoxarife</option>
                                        <option>Vigia</option>
                                        <option>Cozinheiro(a)</option>
                                        <option>Consultor</option>
                                        <option>Diretor</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Departamento</label>
                                    <input placeholder="Ex: Produção" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Telefone</label>
                                    <input placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">E-mail</label>
                                    <input type="email" placeholder="email@exemplo.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Salário (R$)</label>
                                    <input placeholder="0,00" value={formData.salary} onChange={e => setFormData({ ...formData, salary: maskValue(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Data de Admissão</label>
                                    <input type="date" value={formData.hireDate} onChange={e => setFormData({ ...formData, hireDate: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'vacation' | 'inactive' })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500">
                                        <option value="active">Ativo</option>
                                        <option value="vacation">Férias</option>
                                        <option value="inactive">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all">Cancelar</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">SALVAR COLABORADOR</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto p-4">
                {filteredCollaborators.map((c: any) => (
                    <Card key={c.id} className="group hover:border-emerald-500/30 p-4">
                        <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
                                    {c.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                                    <span className="text-[10px] text-slate-500 uppercase">{c.role}</span>
                                </div>
                            </div>
                            <span className={`h-fit px-2 py-0.5 rounded text-[10px] uppercase border ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.status === 'vacation' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                {c.status === 'vacation' ? 'Férias' : c.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <div className="space-y-2 text-xs text-slate-400 mb-3">
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><Phone size={12} className="text-emerald-500/50" /> {c.phone || 'Não informado'}</div>
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><Mail size={12} className="text-emerald-500/50" /> {c.email || 'Não informado'}</div>
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><Briefcase size={12} className="text-emerald-500/50" /> {c.department || 'Não informado'}</div>
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><Calendar size={12} className="text-emerald-500/50" /> Admissão: {c.hireDate || 'Não informado'}</div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-slate-800/50 flex justify-end gap-2">
                            <button onClick={() => { setEditingId(c.id); setFormData({ ...c, salary: maskValue(c.salary) }); setIsFormOpen(true); }} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Edit size={14} /></button>
                            <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-rose-500/10 rounded text-slate-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
