import React from 'react';
import {
    Wallet, DollarSign, Package, Truck, ChevronRight,
    ClipboardList, ArrowUpRight, AlertCircle, Clock
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { SimpleBarChart } from '../../components/common/SimpleBarChart';
import { formatCurrency, formatNumber } from '../../utils/format';

export const DashboardPage = () => {
    const {
        transactions, tasks, settings, activities, setActiveTab,
        products, suppliers
    } = useApp();

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    const chartData: any[] = [
        { label: 'Receita', value: totalIncome, type: 'income' },
        { label: 'Despesa', value: totalExpense, type: 'expense' },
        { label: 'Saldo', value: Math.max(0, balance), type: 'income' }
    ];

    const pendingTasksCount = tasks.filter(t => !t.done).length;
    const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.done).length;

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'agora mesmo';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `há ${diffInHours}h`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card variant="highlight" glow className="lg:col-span-1 relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={80} />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Saldo Líquido</p>
                            <h2 className="text-4xl font-bold text-white mt-1">{formatCurrency(balance, settings.currency)}</h2>
                        </div>
                        <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                            <DollarSign className="text-emerald-400" size={24} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 py-1 px-2 rounded">
                            <ArrowUpRight size={16} />
                            <span>Fluxo Mensal</span>
                        </div>
                        <div className="w-32">
                            <SimpleBarChart data={chartData} />
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-sm font-medium uppercase">Produtos em Estoque</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{products.length} <span className="text-base text-slate-500 font-normal">itens</span></h3>
                            </div>
                            <Package className="text-blue-400 group-hover:scale-110 transition-transform" size={28} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-2">
                            {products.slice(0, 3).map(p => (
                                <div key={p.id} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-300">{p.name}</span>
                                    <span className={`font-medium ${p.status === 'critical' ? 'text-rose-400' : p.status === 'low' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {formatNumber(p.stock)} {p.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-sm font-medium uppercase">Fornecedores Ativos</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{suppliers.filter(s => s.status === 'active').length} <span className="text-base text-slate-500 font-normal">parceiros</span></h3>
                            </div>
                            <Truck className="text-purple-400 group-hover:scale-110 transition-transform" size={28} />
                        </div>
                        <div className="mt-4 space-y-3">
                            {suppliers.filter(s => s.status === 'active').slice(0, 2).map(s => (
                                <div key={s.id} onClick={() => setActiveTab('suppliers')} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-white group-hover:bg-purple-500/20 group-hover:border group-hover:border-purple-500/30 transition-all">
                                            {s.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{s.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{s.category}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-600 group-hover:text-purple-400" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 flex flex-col relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start mb-6 z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                <ClipboardList size={24} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Gestão de Tarefas</h3>
                                <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Visão Geral</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className="group/btn flex items-center gap-2 text-sm font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                        >
                            Abrir Gerenciador
                            <ArrowUpRight size={16} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row gap-8 items-center z-10">
                        <div className="flex flex-col justify-center">
                            <h2 className="text-7xl font-black text-white tracking-tight leading-none">
                                {pendingTasksCount}
                            </h2>
                            <p className="text-slate-400 font-medium text-lg mt-2">tarefas pendentes</p>
                        </div>

                        <div className="flex-1 w-full bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={16} className="text-rose-400" />
                                    <span className="text-sm font-bold text-slate-300">Alta Prioridade</span>
                                </div>
                                <span className="text-lg font-bold text-white">{highPriorityCount}</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
                                <div className="bg-rose-500 h-2 rounded-full" style={{ width: pendingTasksCount > 0 ? `${(highPriorityCount / pendingTasksCount) * 100}%` : '0%' }}></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500">Próximo vencimento: <span className="text-slate-300 font-bold">Hoje, 17:00</span></p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col gap-6">
                    <Card className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-slate-300">
                            <Clock size={18} />
                            <h4 className="font-bold text-sm uppercase tracking-wider">Atividade Recente</h4>
                        </div>
                        <div className="relative pl-2 space-y-6">
                            <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-800"></div>
                            {activities.slice(0, 5).map(act => (
                                <div key={act.id} className="relative pl-6">
                                    <div className={`absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full ring-4 ring-slate-900 ${act.type === 'income' ? 'bg-emerald-500' : act.type === 'expense' ? 'bg-rose-500' : 'bg-slate-600'}`}></div>
                                    <p className="text-xs text-slate-500 mb-0.5">{formatTime(act.time)}</p>
                                    <p className="text-sm text-slate-300">
                                        <span className="font-bold text-emerald-400">{settings.userName}</span> {act.action} <span className="text-white font-medium">{act.target}</span>.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
