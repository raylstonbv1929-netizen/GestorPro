import React, { useState, useMemo } from 'react';
import {
    ClipboardList, Plus, X, CheckCircle2, Circle, Clock, AlertCircle,
    Trash2, Edit, Filter, Search, User, Calendar, MapPin,
    ChevronRight, Target, Activity, LayoutGrid, List
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const TasksPage = () => {
    const { tasks, setTasks, properties, addActivity } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<{
        text: string;
        priority: 'high' | 'medium' | 'low';
        due: string;
        assignee: string;
        propertyId: string;
    }>({
        text: '', priority: 'medium', due: '', assignee: '', propertyId: ''
    });

    // Stats for the Industrial Header
    const stats = useMemo(() => {
        const total = tasks.length;
        const pending = tasks.filter((t: any) => !t.done).length;
        const completed = total - pending;
        const urgent = tasks.filter((t: any) => t.priority === 'high' && !t.done).length;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        return { total, pending, completed, urgent, progress };
    }, [tasks]);

    const filteredTasks = tasks.filter((t: any) => {
        const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.assignee.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ? true :
            filter === 'pending' ? !t.done :
                filter === 'done' ? t.done :
                    t.priority === filter;
        return matchesSearch && matchesFilter;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            propertyId: formData.propertyId ? parseInt(formData.propertyId) : undefined
        };

        if (editingId) {
            setTasks(tasks.map((t: any) => t.id === editingId ? { ...t, ...data } : t));
            addActivity('Editou tarefa', formData.text);
        } else {
            setTasks([{ ...data, id: Date.now(), done: false }, ...tasks]);
            addActivity('Adicionou tarefa', formData.text);
        }
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ text: '', priority: 'medium', due: '', assignee: '', propertyId: '' });
    };

    const toggleTask = (id: number) => {
        const task = tasks.find((t: any) => t.id === id);
        if (task) {
            setTasks(tasks.map((t: any) => t.id === id ? { ...t, done: !t.done } : t));
            addActivity(task.done ? 'Reabriu tarefa' : 'Concluiu tarefa', task.text);
        }
    };

    const deleteTask = (id: number) => {
        const task = tasks.find((t: any) => t.id === id);
        if (task && window.confirm(`Excluir tarefa: "${task.text}"?`)) {
            setTasks(tasks.filter((t: any) => t.id !== id));
            addActivity('Removeu tarefa', task.text);
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden">
            {/* TACTICAL HEADER - INDUSTRIAL SHARP */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 lowercase">
                            <ClipboardList className="text-emerald-500" size={32} />
                            CONTROLE TÁTICO OPERACIONAL
                        </h2>
                        <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">
                            Log de Atividades e Gestão de Fluxo
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ text: '', priority: 'medium', due: '', assignee: '', propertyId: '' });
                            setIsFormOpen(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-6 py-3 rounded-none font-black uppercase tracking-tighter transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]"
                    >
                        <Plus size={20} strokeWidth={3} /> Nova Ocorrência
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-slate-800 border border-slate-800">
                    <div className="bg-slate-900 p-4">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Ativo</p>
                        <p className="text-2xl font-mono font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="bg-slate-900 p-4">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Pendências</p>
                        <p className="text-2xl font-mono font-bold text-amber-500">{stats.pending}</p>
                    </div>
                    <div className="bg-slate-900 p-4">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Urgência [High]</p>
                        <p className="text-2xl font-mono font-bold text-rose-500">{stats.urgent}</p>
                    </div>
                    <div className="bg-slate-900 p-4 col-span-2">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Progresso Operacional</p>
                        <div className="flex items-end gap-3">
                            <p className="text-2xl font-mono font-bold text-emerald-500">{stats.progress.toFixed(0)}%</p>
                            <div className="flex-1 h-3 bg-slate-950 mb-2 border border-slate-800 p-0.5">
                                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${stats.progress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-800/80 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="BUSCAR EM REGISTROS OPERACIONAIS..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-none pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50 font-bold tracking-widest transition-all"
                    />
                </div>
                <div className="flex items-center gap-1">
                    {['all', 'pending', 'done', 'high'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${filter === f
                                ? 'bg-emerald-500 text-emerald-950 border-emerald-500'
                                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-900'
                                }`}
                        >
                            {f === 'all' ? 'Ver Tudo' : f === 'pending' ? 'Pendentes' : f === 'done' ? 'Concluídos' : 'Urgentes'}
                        </button>
                    ))}
                </div>
            </div>

            {/* TASK CARDS GRID */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task: any) => {
                        const property = properties.find(p => p.id === task.propertyId);
                        return (
                            <div
                                key={task.id}
                                className={`group bg-slate-900 border transition-all relative flex flex-col ${task.done
                                    ? 'border-slate-800/50 opacity-60'
                                    : 'border-slate-800 hover:border-emerald-500/40'
                                    }`}
                            >
                                {/* TASK BODY */}
                                <div className="p-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <button
                                            onClick={() => toggleTask(task.id)}
                                            className={`p-1.5 transition-all shrink-0 ${task.done
                                                ? 'bg-emerald-500 text-emerald-950'
                                                : 'bg-slate-950 border border-slate-800 text-slate-700 hover:text-emerald-500 hover:border-emerald-500/30'
                                                }`}
                                        >
                                            {task.done ? <CheckCircle2 size={18} strokeWidth={3} /> : <Circle size={18} strokeWidth={3} />}
                                        </button>
                                        <h3 className={`flex-1 font-black text-sm uppercase tracking-tight leading-tight transition-all ${task.done ? 'line-through text-slate-500' : 'text-white'}`}>
                                            {task.text}
                                        </h3>
                                        <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${getPriorityStyle(task.priority)}`}>
                                            {task.priority}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div className="bg-slate-950/50 p-2 border border-slate-800/50">
                                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                <Calendar size={10} /> Data Limite
                                            </p>
                                            <p className="text-[10px] font-mono font-bold text-slate-300">
                                                {(() => {
                                                    const today = new Date().toISOString().split('T')[0];
                                                    const tomorrow = new Date();
                                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                                    const tomorrowStr = tomorrow.toISOString().split('T')[0];

                                                    if (task.due === today) return 'HOJE';
                                                    if (task.due === tomorrowStr) return 'AMANHÃ';
                                                    return task.due.split('-').reverse().join('/');
                                                })()}
                                            </p>
                                        </div>
                                        <div className="bg-slate-950/50 p-2 border border-slate-800/50">
                                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                <User size={10} /> Atribuído
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase truncate">{task.assignee}</p>
                                        </div>
                                    </div>

                                    {property && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 mt-1">
                                            <div className="w-1.5 h-1.5 bg-emerald-500" />
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                                                <MapPin size={10} className="text-emerald-500" /> {property.name}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* CARD FOOTER WITH ACTIONS */}
                                <div className="bg-slate-950/50 border-t border-slate-800 p-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[8px] text-slate-600 font-mono italic uppercase">REF_ID: {task.id.toString().slice(-6)}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingId(task.id);
                                                setFormData({ ...task, propertyId: task.propertyId?.toString() || '' });
                                                setIsFormOpen(true);
                                            }}
                                            className="p-1.5 bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 transition-all border border-slate-700"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all border border-slate-700"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredTasks.length === 0 && (
                        <div className="col-span-full py-20 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
                            <Activity size={32} className="mb-4 opacity-20" />
                            <p className="font-mono text-[10px] uppercase tracking-widest">Nenhuma tarefa operacional em log</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL - TACTICAL FORM */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                {editingId ? 'EDICÃO DE PROTOCOLO' : 'REGISTRO DE NOVA TAREFA'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white p-2">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500" /> Descrição do Objetivo
                                    </label>
                                    <textarea
                                        required
                                        autoFocus
                                        rows={2}
                                        value={formData.text}
                                        onChange={e => setFormData({ ...formData, text: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-bold placeholder:text-slate-800 transition-all resize-none uppercase text-sm"
                                        placeholder="EX: APLICAÇÃO DE DEFENSIVO TALHÃO 04"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Nível de Prioridade</label>
                                    <div className="flex gap-1">
                                        {[
                                            { id: 'high', label: 'ALTA', color: 'peer-checked:bg-rose-500 peer-checked:text-rose-950 border-rose-500/20 text-rose-500' },
                                            { id: 'medium', label: 'MÉDIA', color: 'peer-checked:bg-amber-500 peer-checked:text-amber-950 border-amber-500/20 text-amber-500' },
                                            { id: 'low', label: 'BAIXA', color: 'peer-checked:bg-emerald-500 peer-checked:text-emerald-950 border-emerald-500/20 text-emerald-500' }
                                        ].map((p) => (
                                            <label key={p.id} className="flex-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value={p.id}
                                                    checked={formData.priority === p.id}
                                                    onChange={() => setFormData({ ...formData, priority: p.id as any })}
                                                    className="sr-only peer"
                                                />
                                                <div className={`py-2 text-[10px] font-black text-center border transition-all ${p.color} bg-slate-950 hover:bg-slate-900`}>
                                                    {p.label}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Data de Execução</label>
                                        <div className="flex gap-1 mb-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const today = new Date().toISOString().split('T')[0];
                                                    setFormData({ ...formData, due: today });
                                                }}
                                                className="text-[8px] font-black px-1.5 py-1 bg-slate-800 hover:bg-emerald-500 hover:text-emerald-950 transition-all border border-slate-700"
                                            >
                                                HOJE
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const tomorrow = new Date();
                                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                                    setFormData({ ...formData, due: tomorrow.toISOString().split('T')[0] });
                                                }}
                                                className="text-[8px] font-black px-1.5 py-1 bg-slate-800 hover:bg-emerald-500 hover:text-emerald-950 transition-all border border-slate-700"
                                            >
                                                AMANHÃ
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        required
                                        type="date"
                                        value={formData.due}
                                        onChange={e => setFormData({ ...formData, due: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-mono font-bold transition-all text-sm [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Propriedade Alvo</label>
                                    <select
                                        value={formData.propertyId}
                                        onChange={e => setFormData({ ...formData, propertyId: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold appearance-none uppercase transition-all"
                                    >
                                        <option value="">NÃO ESPECIFICADA</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Responsável Tático</label>
                                    <input
                                        required
                                        value={formData.assignee}
                                        onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold transition-all uppercase"
                                        placeholder="EX: JOÃO SILVA"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-1 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-8 py-3 bg-slate-950 border border-slate-800 text-slate-400 font-black uppercase tracking-widest hover:text-white transition-all"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    className="px-12 py-3 bg-emerald-500 text-emerald-950 font-black uppercase tracking-tighter hover:bg-emerald-400 transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]"
                                >
                                    Gravar Protocolo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
