import React, { useState, useEffect, useMemo } from 'react';
import {
    Wallet, DollarSign, Package, Truck, ChevronRight,
    ClipboardList, ArrowUpRight, AlertCircle, Clock,
    TrendingUp, TrendingDown, Target, Activity, Zap,
    ShieldCheck, Star, Users, Briefcase, Globe
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { SimpleBarChart } from '../../components/common/SimpleBarChart';
import { formatCurrency, formatNumber } from '../../utils/format';

const CountUp = ({ value, currency }: { value: number, currency: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) {
            setCount(end);
            return;
        }

        let totalMiliseconds = 1000;
        let incrementTime = 10;
        let steps = totalMiliseconds / incrementTime;
        let increment = end / steps;

        let timer = setInterval(() => {
            start += increment;
            if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{formatCurrency(count, currency)}</span>;
};

export const DashboardPage = () => {
    const {
        transactions, tasks, settings, activities, setActiveTab,
        products, suppliers, clients, collaborators
    } = useApp();

    const stats = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        const balance = totalIncome - totalExpense;

        const chartData: { label: string, value: number, type: 'income' | 'expense' | 'neutral' }[] = [
            { label: 'Entradas', value: totalIncome, type: 'income' },
            { label: 'Saídas', value: totalExpense, type: 'expense' },
            { label: 'Líquido', value: Math.max(0, balance), type: 'income' }
        ];

        const pendingTasksCount = tasks.filter(t => !t.done).length;
        const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.done).length;

        return {
            totalIncome,
            totalExpense,
            balance,
            chartData,
            pendingTasksCount,
            highPriorityCount
        };
    }, [transactions, tasks]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'agora';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}M`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}H`;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
            {/* AGROGEST SENTINEL COMMAND CENTER */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 z-20" />

                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Consolidado em Tempo Real</p>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic flex items-baseline gap-4 group-hover:scale-[1.01] transition-transform duration-700">
                        <CountUp value={stats.balance} currency={settings.currency} />
                        <span className="text-xs font-black text-emerald-500/60 not-italic uppercase tracking-[0.2em] hidden md:block">Disponibilidade de Caixa</span>
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                        <div className="space-y-1">
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5 italic"><TrendingUp size={10} className="text-emerald-500" /> Entradas</p>
                            <p className="text-xl font-black text-slate-200 italic tracking-tight">{formatCurrency(stats.totalIncome, settings.currency)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1.5 italic"><TrendingDown size={10} className="text-rose-500" /> Saídas</p>
                            <p className="text-xl font-black text-slate-200 italic tracking-tight">{formatCurrency(stats.totalExpense, settings.currency)}</p>
                        </div>
                        <div className="md:col-span-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic">Performance de Meta</span>
                                    <span className="text-[9px] text-emerald-400 font-black italic">82%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[82%] shadow-[0_0_10px_#10b981]"></div>
                                </div>
                            </div>
                            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                                <Zap className="text-amber-500" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-80 bg-slate-950/60 p-6 rounded-[2rem] border border-slate-800/50 relative overflow-hidden group-hover:border-emerald-500/20 transition-all duration-700 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.05),transparent)] pointer-events-none"></div>
                    <h4 className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4 flex items-center gap-2 italic">
                        <Target size={12} className="text-emerald-500" /> Distribuiçãode Capital
                    </h4>
                    <SimpleBarChart data={stats.chartData} />
                </div>
            </div>

            {/* TELEMETRY MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Inventário Ativo', value: products.length, icon: Package, color: 'blue', tab: 'products', code: 'STOCK_MS' },
                    { label: 'Rede de Suprimentos', value: suppliers.length, icon: Truck, color: 'emerald', tab: 'suppliers', code: 'SUPP_CH' },
                    { label: 'Portfólio de Clientes', value: clients.length, icon: Users, color: 'blue', tab: 'clients', code: 'CLIENT_DB' },
                    { label: 'Corpo Operacional', value: collaborators.length, icon: Briefcase, color: 'purple', tab: 'collaborators', code: 'TEAM_STR' }
                ].map((item, idx) => (
                    <Card
                        key={idx}
                        onClick={() => setActiveTab(item.tab as any)}
                        className={`group p-6 border-slate-900 hover:border-${item.color}-500/40 transition-all duration-500 cursor-pointer overflow-hidden rounded-[2rem] bg-slate-950 relative`}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${item.color}-500`}>
                            <item.icon size={48} />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 bg-slate-900 border border-slate-800 rounded-xl group-hover:border-${item.color}-500/20 transition-colors`}>
                                <item.icon size={20} className={`text-${item.color}-500/70 group-hover:text-${item.color}-400`} />
                            </div>
                            <span className={`text-[8px] font-black text-slate-700 tracking-widest group-hover:text-${item.color}-500/50 transition-colors uppercase italic`}>{item.code}</span>
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{item.label}</p>
                        <h4 className="text-3xl font-black text-white italic tracking-tighter group-hover:translate-x-1 transition-transform">{item.value.toString().padStart(2, '0')}</h4>
                    </Card>
                ))}
            </div>

            {/* OPERATIONAL DUAL-CORE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Operations & Tasks Panel */}
                <Card className="lg:col-span-8 p-0 rounded-[2.5rem] border-slate-900 bg-slate-950 overflow-hidden flex flex-col group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/20 z-10" />

                    <div className="p-8 border-b border-slate-900 bg-slate-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">Console de Operações</h3>
                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1.5 italic">Controle de Readiness Operacional</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest rounded-xl transition-all active:scale-95"
                        >
                            Ver Protocolos
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10 items-center h-full">
                        <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2 py-4">
                            <span className="text-8xl font-black text-white tracking-tighter italic leading-none">{stats.pendingTasksCount}</span>
                            <div className="space-y-1">
                                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Missões Ativas</p>
                                <div className="h-1 w-12 bg-blue-500/30 mx-auto rounded-full" />
                            </div>
                        </div>

                        <div className="md:col-span-8 space-y-8">
                            <div className="bg-slate-900/30 p-6 rounded-[2rem] border border-slate-900/50 space-y-6">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle size={14} className="text-rose-500" />
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Prioridade Crítica</span>
                                        </div>
                                        <span className="text-xs font-black text-rose-500 italic uppercase">Urgente</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                                        <div
                                            className="bg-rose-500 h-full shadow-[0_0_10px_#f43f5e]"
                                            style={{ width: stats.pendingTasksCount > 0 ? `${(stats.highPriorityCount / stats.pendingTasksCount) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <p className="text-[9px] text-slate-600 font-black uppercase italic tracking-widest">{stats.highPriorityCount} Tarefas de Alta Relevância</p>
                                        <p className="text-[9px] text-slate-600 font-black italic">{stats.pendingTasksCount > 0 ? Math.round((stats.highPriorityCount / stats.pendingTasksCount) * 100) : 0}%</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800/50">
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <ShieldCheck size={16} className="text-emerald-500/50" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic leading-tight">Integridade da Frota: <span className="text-emerald-400">NOMINAL</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* System Activity Log */}
                <Card variant="glass" className="lg:col-span-4 p-8 rounded-[2.5rem] border-slate-900/40 bg-slate-950/40 flex flex-col group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Activity size={48} className="text-slate-500" />
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <Clock size={16} className="text-slate-600 animate-pulse" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">System_Log_v5.0</h4>
                    </div>

                    <div className="flex-1 space-y-8 relative">
                        <div className="absolute left-[3.5px] top-4 bottom-4 w-px bg-slate-800/50" />

                        {activities.slice(0, 5).map((act, idx) => (
                            <div key={act.id} className="relative pl-6 group/item cursor-default">
                                <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full z-10 border border-slate-950 transition-all duration-300 ${act.type === 'income' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : act.type === 'expense' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-700'}`}></div>

                                <div className="space-y-1 group-hover/item:translate-x-1 transition-transform">
                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic">{formatTime(act.time)} • IDENT: {act.id.toString().slice(-4)}</p>
                                    <p className="text-xs text-slate-400 leading-tight font-bold">
                                        <span className="text-slate-200 uppercase italic font-black text-[10px] bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800 mr-1.5">{settings.userName.split(' ')[0]}</span>
                                        {act.action} <span className="text-blue-400 italic">{act.target}</span>
                                    </p>
                                </div>
                            </div>
                        ))}

                        {activities.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                                <Activity size={32} />
                                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum Registro Ativo</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className="mt-8 w-full py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[9px] font-black text-slate-600 hover:text-slate-200 hover:border-slate-700 transition-all uppercase tracking-[0.2em] italic"
                    >
                        Acessar Logs de Auditoria
                    </button>
                </Card>
            </div>
        </div>
    );
};
