import React, { useState } from 'react';
import {
    Users, BadgeCheck, Ban, Search, X, Plus, Star, User, Phone, MapPin, Edit, Trash2
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';

export const ClientsPage = () => {
    const { clients, setClients, addActivity } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isClientFormOpen, setIsClientFormOpen] = useState(false);
    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [clientForm, setClientForm] = useState({
        name: '', type: 'Varejo', contact: '', email: '', phone: '', city: ''
    });

    const filteredClients = clients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'active' && c.status === 'active') || (filter === 'inactive' && c.status === 'inactive');
        return matchesSearch && matchesFilter;
    });

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const inactiveClients = clients.filter(c => c.status === 'inactive').length;

    const handleClientSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClientId) {
            setClients(clients.map(c => c.id === editingClientId ? { ...c, ...clientForm } : c));
            addActivity('Editou cliente', clientForm.name);
        } else {
            const newClient: any = {
                ...clientForm,
                id: Date.now(),
                status: "active",
                rating: 3,
                creditLimit: 10000,
                usedCredit: 0,
                lastPurchase: "N/A"
            };
            setClients([newClient, ...clients]);
            addActivity('Adicionou cliente', clientForm.name);
        }
        setIsClientFormOpen(false);
        setEditingClientId(null);
        setClientForm({ name: '', type: 'Varejo', contact: '', email: '', phone: '', city: '' });
    };

    const deleteClient = (id: number) => {
        const client = clients.find(c => c.id === id);
        if (client) {
            addActivity('Removeu cliente', client.name);
        }
        setClients(clients.filter(c => c.id !== id));
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Users className="text-emerald-400" /> Clientes
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setFilter('all')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'all' ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700/50'}`}>
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Users size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Total</p><p className="text-xl font-black text-white">{totalClients}</p></div>
                </button>
                <button onClick={() => setFilter('active')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'active' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/50'}`}>
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><BadgeCheck size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Ativos</p><p className="text-xl font-black text-white">{activeClients}</p></div>
                </button>
                <button onClick={() => setFilter('inactive')} className={`bg-slate-800/40 border p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02] ${filter === 'inactive' ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-700/50'}`}>
                    <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400"><Ban size={20} /></div>
                    <div className="text-left"><p className="text-slate-400 text-[10px] uppercase font-bold">Inativos</p><p className="text-xl font-black text-white">{inactiveClients}</p></div>
                </button>
            </div>

            <Card variant="highlight" className="p-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500" />
                    </div>
                    <button onClick={() => { setIsClientFormOpen(true); setEditingClientId(null); setClientForm({ name: '', type: 'Varejo', contact: '', email: '', phone: '', city: '' }); }} className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                        <Plus size={18} /> <span>Novo Cliente</span>
                    </button>
                </div>
            </Card>

            {isClientFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsClientFormOpen(false)} />
                    <Card variant="highlight" className="w-full max-w-2xl relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100" style={{ transform: 'none' }}>
                        <form onSubmit={handleClientSubmit} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-white">{editingClientId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                                <button type="button" onClick={() => setIsClientFormOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Nome / Razão Social</label>
                                    <input required placeholder="Ex: Agropecuária Silva" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Tipo de Cliente</label>
                                    <select value={clientForm.type} onChange={e => setClientForm({ ...clientForm, type: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500">
                                        <option>Varejo</option>
                                        <option>Atacadista</option>
                                        <option>Parceiro</option>
                                        <option>Distribuidor</option>
                                        <option>Cooperativa</option>
                                        <option>Produtor Rural</option>
                                        <option>Indústria</option>
                                        <option>Exportador</option>
                                        <option>Governo</option>
                                        <option>Outros</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Pessoa de Contato</label>
                                    <input placeholder="Nome do contato" value={clientForm.contact} onChange={e => setClientForm({ ...clientForm, contact: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">E-mail</label>
                                    <input type="email" placeholder="email@exemplo.com" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Telefone</label>
                                    <input placeholder="(00) 00000-0000" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Cidade / UF</label>
                                    <input placeholder="Ex: Rio Verde - GO" value={clientForm.city} onChange={e => setClientForm({ ...clientForm, city: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsClientFormOpen(false)} className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all">Cancelar</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">SALVAR CLIENTE</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto p-4">
                {filteredClients.map(client => (
                    <Card key={client.id} className="group hover:border-emerald-500/30 p-4">
                        <div className="flex justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{client.name}</h4>
                                    <span className="text-[10px] text-slate-500 uppercase">{client.type}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < client.rating ? "currentColor" : "none"} className={i >= client.rating ? "text-slate-600" : ""} />
                                    ))}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2 text-xs text-slate-400 mb-3">
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><User size={12} className="text-emerald-500/50" /> {client.contact}</div>
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><Phone size={12} className="text-emerald-500/50" /> {client.phone}</div>
                            <div className="flex items-center gap-2 group-hover:text-slate-200 transition-colors"><MapPin size={12} className="text-emerald-500/50" /> {client.city}</div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-slate-800/50 flex justify-end gap-2">
                            <button onClick={() => { setEditingClientId(client.id); setClientForm(client); setIsClientFormOpen(true); }} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Edit size={14} /></button>
                            <button onClick={() => deleteClient(client.id)} className="p-1.5 hover:bg-rose-500/10 rounded text-slate-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
