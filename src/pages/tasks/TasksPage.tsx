import React, { useState } from 'react';
import {
    ClipboardList, Plus, X, CheckCircle2, Circle, Clock, AlertCircle,
    Trash2, Edit, Filter, Search, User, Calendar
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';

export const TasksPage = () => {
    const { tasks, setTasks, addActivity } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<{
        text: string;
        priority: 'high' | 'medium' | 'low';
        due: string;
        assignee: string;
    }>({
        text: '', priority: 'medium', due: '', assignee: ''
    });

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
        if (editingId) {
            setTasks(tasks.map((t: any) => t.id === editingId ? { ...t, ...formData } : t));
            addActivity('Editou tarefa', formData.text);
        } else {
            setTasks([{ ...formData, id: Date.now(), done: false }, ...tasks]);
            addActivity('Adicionou tarefa', formData.text);
        }
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ text: '', priority: 'medium', due: '', assignee: '' });
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ClipboardList className="text-emerald-400" size={28} /> Gerenciamento de Tarefas
                    </h2>
                    <p className="text-slate-400 text-sm">Organize as atividades do dia a dia da fazenda</p>
                </div>
                <button
                    onClick={() => {
                        setIsFormOpen(true);
                        setEditingId(null);
                        setFormData({ text: '', priority: 'medium', due: '', assignee: '' });
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} /> Nova Tarefa
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4 bg-slate-800/20 border-slate-700/50">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><ClipboardList size={20} /></div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total</p>
                        <p className="text-xl font-black text-white">{tasks.length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-slate-800/20 border-slate-700/50">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><Clock size={20} /></div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Pendentes</p>
                        <p className="text-xl font-black text-white">{tasks.filter((t: any) => !t.done).length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-slate-800/20 border-slate-700/50">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><CheckCircle2 size={20} /></div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Concluídas</p>
                        <p className="text-xl font-black text-white">{tasks.filter((t: any) => t.done).length}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-slate-800/20 border-slate-700/50">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><AlertCircle size={20} /></div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Urgentes</p>
                        <p className="text-xl font-black text-white">{tasks.filter((t: any) => t.priority === 'high' && !t.done).length}</p>
                    </div>
                </Card>
            </div>

            <Card variant="highlight" className="p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar tarefas..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['all', 'pending', 'done', 'high', 'medium', 'low'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${filter === f
                                    ? 'bg-emerald-500 text-emerald-950 border-emerald-500'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendentes' : f === 'done' ? 'Concluídas' : f === 'high' ? 'Alta' : f === 'medium' ? 'Média' : 'Baixa'}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {filteredTasks.map((task: any) => (
                    <div
                        key={task.id}
                        className={`group bg-slate-800/30 border rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-slate-800/50 ${task.done ? 'border-slate-800 opacity-60' : 'border-slate-700/50 hover:border-emerald-500/30'}`}
                    >
                        <button
                            onClick={() => toggleTask(task.id)}
                            className={`transition-colors ${task.done ? 'text-emerald-500' : 'text-slate-600 hover:text-emerald-400'}`}
                        >
                            {task.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className={`font-medium text-white transition-all ${task.done ? 'line-through text-slate-500' : ''}`}>
                                {task.text}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <Calendar size={12} />
                                    <span>{task.due}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <User size={12} />
                                    <span>{task.assignee}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={() => {
                                    setEditingId(task.id);
                                    setFormData({ text: task.text, priority: task.priority, due: task.due, assignee: task.assignee });
                                    setIsFormOpen(true);
                                }}
                                className="p-2 hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 rounded-lg transition-all"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredTasks.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
                            <ClipboardList size={32} />
                        </div>
                        <p className="text-slate-500">Nenhuma tarefa encontrada para este filtro.</p>
                    </div>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <Card className="w-full max-w-md relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100" style={{ transform: 'none' }}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-white">{editingId ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">O que precisa ser feito?</label>
                                    <input required value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Descrição da tarefa" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-bold ml-1">Prioridade</label>
                                        <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500">
                                            <option value="high">Alta</option>
                                            <option value="medium">Média</option>
                                            <option value="low">Baixa</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-bold ml-1">Prazo</label>
                                        <input required value={formData.due} onChange={e => setFormData({ ...formData, due: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Ex: Hoje, Amanhã, 20/05" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Responsável</label>
                                    <input required value={formData.assignee} onChange={e => setFormData({ ...formData, assignee: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Quem irá realizar?" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all">Cancelar</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-black hover:bg-emerald-400 transition-all">SALVAR TAREFA</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
