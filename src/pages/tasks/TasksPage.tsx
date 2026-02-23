import React, { useState, useMemo } from 'react';
import {
    ClipboardList, Plus, X, CheckCircle2, Circle, Clock, AlertCircle,
    Trash2, Edit, Filter, Search, User, Calendar, MapPin,
    ChevronRight, Target, Activity, LayoutGrid, List, Zap,
    ShieldCheck, Landmark, RefreshCw, MoreVertical, Star,
    ArrowRight, MessageSquare, SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { TechnicalConfirmModal } from '../../components/ui/TechnicalConfirmModal';
import { TacticalFilterBlade } from '../../components/common/TacticalFilterBlade';
import { Task } from '../../types';

export const TasksPage = () => {
    const { tasks, setTasks, properties, addActivity } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'urgent'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const [formData, setFormData] = useState<Partial<Task>>({
        text: '',
        priority: 'medium',
        due: new Date().toISOString().split('T')[0],
        assignee: ''
    });

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t: Task) => t.done).length;
        const pending = total - completed;
        const urgent = tasks.filter((t: Task) => t.priority === 'high' && !t.done).length;
        const progress = total > 0 ? (completed / total) * 100 : 0;
        return { total, pending, completed, urgent, progress };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task: Task) => {
            const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' ? true :
                filter === 'pending' ? !task.done :
                    filter === 'completed' ? task.done :
                        filter === 'urgent' ? task.priority === 'high' :
                            true; // Should not happen with defined filters
            return matchesSearch && matchesFilter;
        });
    }, [tasks, searchTerm, filter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            propertyId: formData.propertyId ? (typeof formData.propertyId === 'string' ? parseInt(formData.propertyId) : formData.propertyId) : undefined
        };

        if (editingTask) {
            setTasks(tasks.map((t: Task) => t.id === editingTask.id ? { ...t, ...data } as Task : t));
            addActivity('Retificou protocolo de missão', formData.text || '', 'neutral');
        } else {
            setTasks([{ ...data, id: Date.now(), done: false } as Task, ...tasks]);
            addActivity('Homologou nova missão operacional', formData.text || '', 'neutral');
        }
        setIsFormOpen(false);
        resetForm();
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData(task);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setEditingTask(null);
        setFormData({ text: '', priority: 'medium', due: new Date().toISOString().split('T')[0], assignee: '' });
    };

    const handleToggleTask = (taskToToggle: Task) => {
        const updatedTasks = tasks.map((t: Task) =>
            t.id === taskToToggle.id ? { ...t, done: !t.done } : t
        );
        setTasks(updatedTasks);
        addActivity(taskToToggle.done ? 'Missão suspensa/reaberta' : 'Missão cumprida', taskToToggle.text, 'neutral');
    };

    const deleteTask = (task: Task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTask = () => {
        if (taskToDelete) {
            setTasks(tasks.filter((t: Task) => t.id !== taskToDelete.id));
            addActivity('Removeu missão do log tático', taskToDelete.text, 'neutral');
            setTaskToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
            {/* TASK SENTINEL COMMAND CENTER */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500 z-20" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <ClipboardList className="text-sky-500" size={32} />
                        Controle Tático de Missões
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                        <Activity size={12} className="text-sky-500/50" /> Orquestração de Fluxo e Cumprimento de Objetivos
                    </p>
                </div>

                <div className="flex gap-4 relative z-10 lg:w-auto w-full">
                    <button
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="flex-1 lg:flex-none bg-sky-600 hover:bg-sky-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-sky-500/20 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-sky-800"
                    >
                        <Plus size={20} /> Nova Ocorrência
                    </button>
                    <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        className={`px-6 py-5 rounded-2xl border transition-all flex items-center gap-3 font-black text-[10px] tracking-widest uppercase italic group ${isFilterPanelOpen ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
                    >
                        <SlidersHorizontal size={20} className="group-hover:rotate-180 transition-transform duration-500" /> Advanced_Filters
                    </button>
                </div>
            </div>

            {/* TELEMETRY MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Missões Registradas', value: stats.total.toString().padStart(2, '0'), icon: ClipboardList, color: 'sky', code: 'TASK_TTL' },
                    { label: 'Pendências Críticas', value: stats.urgent.toString().padStart(2, '0'), icon: AlertCircle, color: 'rose', code: 'TASK_URG' },
                    { label: 'Objetivos Cumpridos', value: stats.completed.toString().padStart(2, '0'), icon: CheckCircle2, color: 'emerald', code: 'TASK_OK' },
                    { label: 'Eficiência de Entrega', value: stats.progress.toFixed(1), unit: '%', icon: Activity, color: 'amber', code: 'TASK_EFF' }
                ].map((item, idx) => (
                    <Card key={idx} className="group p-6 border-slate-900 hover:border-slate-800 bg-slate-950 relative overflow-hidden rounded-[2rem]">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${item.color}-500`}>
                            <item.icon size={48} />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic group-hover:text-slate-400 transition-colors">{item.label}</p>
                        <h4 className="text-3xl font-black text-white italic tracking-tighter group-hover:translate-x-1 transition-transform">
                            {item.value} {item.unit && <span className="text-xs font-black text-slate-600 uppercase italic">{item.unit}</span>}
                        </h4>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-[8px] font-black text-slate-700 tracking-widest uppercase italic">{item.code}</span>
                            <div className={`h-1 flex-1 mx-4 bg-slate-800 rounded-full overflow-hidden`}>
                                <div className={`h-full bg-${item.color}-500 shadow-[0_0_8px] shadow-${item.color}-500`} style={{ width: idx === 3 ? `${item.value}%` : '100%' }} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <TacticalFilterBlade
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                title="Scanner de Varredura Operacional"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onReset={() => {
                    setSearchTerm('');
                    setFilter('all');
                }}
                progress={stats.progress}
                metrics={[
                    { label: 'MISSÕES NO RADAR', value: filteredTasks.length.toString().padStart(3, '0') },
                    { label: 'EFICIÊNCIA GLOBAL', value: `${stats.progress.toFixed(1)}%` }
                ]}
            >
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado de Prontidão</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'all', label: 'Ver Tudo' },
                                { id: 'pending', label: 'Pendentes' },
                                { id: 'completed', label: 'Cumpridas' },
                                { id: 'urgent', label: 'Urgentes' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id as 'all' | 'pending' | 'completed' | 'urgent')}
                                    className={`px-4 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${filter === f.id ? 'bg-sky-600 text-white border-sky-400 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-sky-500/5 rounded-2xl border border-sky-500/10 space-y-3">
                        <p className="text-[8px] text-sky-400 font-black uppercase tracking-widest italic flex items-center gap-2">
                            <Activity size={12} /> Log de Operações
                        </p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic leading-relaxed">
                            A busca avançada permite localizar missões por descrição ou oficial responsável no campo de batalha.
                        </p>
                    </div>
                </div>
            </TacticalFilterBlade>

            {/* TASK GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                {filteredTasks.map((task: Task) => {
                    const property = properties.find(p => p.id === task.propertyId);
                    return (
                        <Card
                            key={task.id}
                            variant="glass"
                            className={`group p-0 border-slate-800/60 transition-all duration-500 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative ${task.done ? 'opacity-50' : 'hover:border-sky-500/40 shadow-xl'}`}
                        >
                            <div className="absolute top-0 right-0 p-6 z-10 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                                <button onClick={() => deleteTask(task)} className="text-slate-800 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                            </div>

                            <div className={`h-1.5 w-full ${task.done ? 'bg-slate-800' : task.priority === 'high' ? 'bg-rose-500 animate-pulse' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                            <div className="p-8">
                                <div className="flex items-start gap-5 mb-6">
                                    <button
                                        onClick={() => handleToggleTask(task)}
                                        className={`w-14 h-14 rounded-[1.25rem] border flex items-center justify-center transition-all duration-500 ${task.done ? 'bg-emerald-500 border-emerald-400 text-emerald-950' : 'bg-slate-950 border-slate-800 text-slate-700 hover:border-sky-500/50 hover:text-sky-400 shadow-xl active:scale-95'}`}
                                    >
                                        {task.done ? <CheckCircle2 size={28} strokeWidth={3} /> : <Circle size={28} strokeWidth={3} />}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <h4 className={`font-black text-lg uppercase tracking-tighter italic leading-tight group-hover:text-sky-300 transition-colors ${task.done ? 'text-slate-600 line-through' : 'text-white'}`}>{task.text}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${getPriorityStyle(task.priority)}`}>
                                                {task.priority === 'high' ? 'URGENTE' : task.priority === 'medium' ? 'OPERACIONAL' : 'ROTINA'}
                                            </span>
                                            {task.done && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20 italic">OK_SYNC</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-px bg-slate-800/40 border border-slate-800/40 rounded-2xl overflow-hidden">
                                        <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic flex items-center gap-1.5"><Calendar size={10} /> Deadline</p>
                                            <p className={`text-[10px] font-black italic ${task.done ? 'text-slate-600' : 'text-slate-300'}`}>
                                                {(() => {
                                                    const today = new Date().toISOString().split('T')[0];
                                                    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
                                                    const tomStr = tomorrow.toISOString().split('T')[0];
                                                    if (task.due === today) return 'PROTOCOLO_HOJE';
                                                    if (task.due === tomStr) return 'AMANHÃ';
                                                    return task.due.split('-').reverse().join('/');
                                                })()}
                                            </p>
                                        </div>
                                        <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic flex items-center gap-1.5"><User size={10} /> Comando</p>
                                            <p className="text-[10px] font-black text-slate-300 uppercase truncate italic">{task.assignee || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {property && (
                                        <div className="bg-slate-950/50 p-4 rounded-[1.25rem] border border-slate-900 flex justify-between items-center group-hover:border-sky-500/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-900 rounded-lg text-sky-500/50 group-hover:text-sky-400 group-hover:bg-sky-500/10 transition-all">
                                                    <MapPin size={16} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest italic leading-none">Alvo Territorial</p>
                                                    <p className="text-[11px] font-black text-white italic uppercase tracking-tight">{property.name}</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={14} className="text-slate-800 group-hover:text-sky-500 transition-all group-hover:translate-x-1" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto bg-slate-950/50 p-6 border-t border-slate-900 flex justify-between items-center group-hover:bg-slate-900/60 transition-colors">
                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-2">
                                    <Clock size={12} className="text-sky-800" /> REF_LOG_{task.id.toString().slice(-6)}
                                </span>

                                <button
                                    onClick={() => handleEdit(task)}
                                    className="px-6 py-3 bg-slate-950 border border-slate-800 hover:border-sky-500/50 rounded-xl text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3"
                                >
                                    <Edit size={14} /> DETALHES TÉCNICOS
                                </button>
                            </div>
                        </Card>
                    );
                })}
                {filteredTasks.length === 0 && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-10 italic space-y-6 grayscale">
                        <Star size={80} />
                        <p className="text-xs font-black uppercase tracking-[0.5em] text-center">Nenhum protocolo detectado sob este filtro.</p>
                    </div>
                )}
            </div>

            {/* PROTOCOL MODAL: TASK */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                maxWidth="max-w-2xl"
            >
                <Card variant="glass" className="relative z-10 p-0 overflow-hidden border-sky-500/20 shadow-2xl rounded-[1.5rem] md:rounded-[3rem] !scale-100 flex flex-col">
                        <div className="h-1.5 w-full bg-slate-900">
                            <div className="h-full bg-sky-500 shadow-[0_0_15px_#0ea5e9]" style={{ width: editingTask ? '100%' : '50%' }} />
                        </div>

                        <div className="p-10 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                                    <ClipboardList size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{editingTask ? 'Retificação de Missão' : 'Nova Homologação Operacional'}</h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
                                        <Zap size={12} className="text-sky-500" /> Registro em Log Tático Centralizado
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-lg active:scale-90"><X size={28} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-slate-950/40">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                                    <MessageSquare size={12} className="text-sky-500" /> Objetivos e Diretrizes da Missão
                                </label>
                                <textarea
                                    required
                                    autoFocus
                                    rows={3}
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-sky-500/50 font-black placeholder:text-slate-800 transition-all resize-none uppercase text-sm italic"
                                    placeholder="EX: APLICAÇÃO DE FUNGICIDA / MANUTENÇÃO DE TRATOR 402"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Nível de Resposta (Prioridade)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'high', label: 'HIGH', color: 'rose' },
                                            { id: 'medium', label: 'OPER', color: 'amber' },
                                            { id: 'low', label: 'ROUT', color: 'emerald' }
                                        ].map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p.id as 'high' | 'medium' | 'low' })}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.priority === p.id ? `bg-${p.color}-500/10 border-${p.color}-500 text-${p.color}-400 shadow-lg shadow-${p.color}-500/20` : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Data Limite (Deadline)</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.due}
                                        onChange={e => setFormData({ ...formData, due: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-sky-500/50 italic [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-900">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Vetor Territorial</label>
                                    <select
                                        value={formData.propertyId || ''}
                                        onChange={e => setFormData({ ...formData, propertyId: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-sky-500/50 italic appearance-none cursor-pointer"
                                    >
                                        <option value="">(NÃO ESPECIFICADO)</option>
                                        {properties.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Oficial de Missão (Assignee)</label>
                                    <input
                                        required
                                        value={formData.assignee}
                                        onChange={e => setFormData({ ...formData, assignee: e.target.value.toUpperCase() })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-sky-500/50 italic"
                                        placeholder="NOME DO RESPONSÁVEL"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-10">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all italic">Abortar</button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="px-16 py-5 rounded-2xl bg-sky-600 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-sky-500 transition-all shadow-2xl shadow-sky-500/30 active:scale-95 border-b-4 border-sky-800 italic"
                                >
                                    Efetivar Protocolo
                                </button>
                            </div>
                        </form>
                    </Card>
            </Modal>

            <TechnicalConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteTask}
                title="Desativação de Protocolo de Missão"
                description="Você está prestes a remover permanentemente este registro do log tático. Isso eliminará qualquer rastro operacional desta missão no dashboard."
                criticalInfo="Missões deletadas não podem ser recuperadas via interface comum, apenas através de restauração total do snapshot do sistema."
            />
        </div>
    );
};
