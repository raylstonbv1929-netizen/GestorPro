import React, { useState } from 'react';
import {
    Truck, BadgeCheck, Ban, Search, X, Plus, Factory, Star, User, Phone, Mail, Edit, Trash2
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';

export const SuppliersPage = () => {
    const { suppliers, setSuppliers, addActivity } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
    const [supplierForm, setSupplierForm] = useState<{
        name: string;
        category: string;
        contact: string;
        email: string;
        phone: string;
        status: 'active' | 'inactive';
    }>({
        name: '', category: 'Insumos', contact: '', email: '', phone: '', status: 'active'
    });

    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || s.status === filter;
        return matchesSearch && matchesFilter;
    });

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'active' || !s.status).length;
    const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive').length;

    const handleSupplierSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplierId) {
            setSuppliers(suppliers.map(s => s.id === editingSupplierId ? { ...s, ...supplierForm } : s));
            addActivity('Editou fornecedor', supplierForm.name);
        } else {
            const newSupplier: any = {
                ...supplierForm,
                id: Date.now(),
                status: "active",
                rating: 3,
                lastOrder: "N/A"
            };
            setSuppliers([newSupplier, ...suppliers]);
            addActivity('Adicionou fornecedor', supplierForm.name);
        }
        setIsSupplierFormOpen(false);
        setEditingSupplierId(null);
        setSupplierForm({ name: '', category: 'Insumos', contact: '', email: '', phone: '', status: 'active' });
    };

    const deleteSupplier = (id: number) => {
        const supplier = suppliers.find(s => s.id === id);
        if (supplier) {
            addActivity('Removeu fornecedor', supplier.name);
        }
        setSuppliers(suppliers.filter(s => s.id !== id));
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Truck className="text-emerald-400" /> Fornecedores
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setFilter('all')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'all' ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700/50'}`}>
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Truck size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Total</p><p className="text-xl font-black text-white">{totalSuppliers}</p></div>
                </button>
                <button onClick={() => setFilter('active')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'active' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/50'}`}>
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><BadgeCheck size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Ativos</p><p className="text-xl font-black text-white">{activeSuppliers}</p></div>
                </button>
                <button onClick={() => setFilter('inactive')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'inactive' ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-700/50'}`}>
                    <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400"><Ban size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Inativos</p><p className="text-xl font-black text-white">{inactiveSuppliers}</p></div>
                </button>
            </div>

            <Card variant="highlight" className="p-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                    </div>
                    <button onClick={() => { setIsSupplierFormOpen(true); setEditingSupplierId(null); setSupplierForm({ name: '', category: 'Insumos', contact: '', email: '', phone: '', status: 'active' }); }} className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                        <Plus size={18} /> <span>Novo Fornecedor</span>
                    </button>
                </div>
            </Card>

            {isSupplierFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsSupplierFormOpen(false)} />
                    <Card variant="highlight" className="w-full max-w-2xl relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100" style={{ transform: 'none' }}>
                        <form onSubmit={handleSupplierSubmit} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-white">{editingSupplierId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                                <button type="button" onClick={() => setIsSupplierFormOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Nome / Razão Social</label>
                                    <input required placeholder="Ex: Fertilizantes do Brasil" value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Categoria</label>
                                    <select value={supplierForm.category} onChange={e => setSupplierForm({ ...supplierForm, category: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500">
                                        <option>Insumos</option>
                                        <option>Maquinário</option>
                                        <option>Sementes</option>
                                        <option>Combustível</option>
                                        <option>Fertilizantes</option>
                                        <option>Defensivos</option>
                                        <option>Peças</option>
                                        <option>Serviços</option>
                                        <option>Logística</option>
                                        <option>Tecnologia</option>
                                        <option>Outros</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Pessoa de Contato</label>
                                    <input placeholder="Nome do contato" value={supplierForm.contact} onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">E-mail</label>
                                    <input type="email" placeholder="email@exemplo.com" value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Telefone</label>
                                    <input placeholder="(00) 00000-0000" value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Status</label>
                                    <select value={supplierForm.status} onChange={e => setSupplierForm({ ...supplierForm, status: e.target.value as 'active' | 'inactive' })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500">
                                        <option value="active">Ativo</option>
                                        <option value="inactive">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsSupplierFormOpen(false)} className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all">Cancelar</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">SALVAR FORNECEDOR</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto p-4">
                {filteredSuppliers.map(sup => (
                    <Card key={sup.id} className="group hover:border-emerald-500/30 p-4">
                        <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
                                    <Factory size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{sup.name}</h4>
                                    <span className="text-[10px] text-slate-500 uppercase">{sup.category}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${sup.status === 'active' || !sup.status ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                    {sup.status === 'inactive' ? 'Inativo' : 'Ativo'}
                                </span>
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < sup.rating ? "currentColor" : "none"} className={i >= sup.rating ? "text-slate-600" : ""} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-xs text-slate-400 mb-3">
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><User size={12} className="text-emerald-500/50" /> {sup.contact || 'Não informado'}</div>
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><Phone size={12} className="text-emerald-500/50" /> {sup.phone || 'Não informado'}</div>
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><Mail size={12} className="text-emerald-500/50" /> {sup.email || 'Não informado'}</div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-slate-800/50 flex justify-end gap-2">
                            <button onClick={() => { setEditingSupplierId(sup.id); setSupplierForm(sup as any); setIsSupplierFormOpen(true); }} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Edit size={14} /></button>
                            <button onClick={() => deleteSupplier(sup.id)} className="p-1.5 hover:bg-rose-500/10 rounded text-slate-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
