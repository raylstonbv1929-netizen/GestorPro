import React, { useState, useEffect } from 'react';
import {
    Wallet, DollarSign, Package, Truck, ChevronRight,
    ClipboardList, ArrowUpRight, AlertCircle, Clock,
    TrendingUp, TrendingDown, Target
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
        if (start === end) return;

        let totalMiliseconds = 1000;
        let incrementTime = (totalMiliseconds / end) * 5;

        let timer = setInterval(() => {
            start += Math.max(1, Math.floor(end / 100));
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 10);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{formatCurrency(count, currency)}</span>;
};

export const DashboardPage = () => {
    const {
        transactions, tasks, settings, activities, setActiveTab,
        products, suppliers
    } = useApp();

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    const chartData: { label: string, value: number, type: 'income' | 'expense' | 'neutral' }[] = [
        { label: 'Entradas', value: totalIncome, type: 'income' },
        { label: 'Saídas', value: totalExpense, type: 'expense' },
        { label: 'Patrimônio', value: Math.max(0, balance), type: 'income' }
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
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Financeiro - O Coração do Dashboard */}
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-2xl opacity-30 rounded-full"></div>
                <Card variant="highlight" glow rounded="rounded-[4px]" className="relative border-slate-700/50 overflow-visible group">
                    <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>

                    <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
                        <div className="flex-1 w-full">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Fluxo de Caixa Consolidado</p>
                            </div>
                            <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-4 flex items-baseline gap-2">
                                <CountUp value={balance} currency={settings.currency} />
                                <span className="text-xs font-medium text-emerald-500/60 tracking-normal hidden md:inline-block uppercase">Balanço Atualizado</span>
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                                <div className="space-y-1">
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Entradas</p>
                                    <p className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                                        <TrendingUp size={16} />
                                        {formatCurrency(totalIncome, settings.currency)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Saídas</p>
                                    <p className="text-xl font-bold text-rose-400 flex items-center gap-2">
                                        <TrendingDown size={16} />
                                        {formatCurrency(totalExpense, settings.currency)}
                                    </p>
                                </div>
                                <div className="hidden md:block bg-slate-900/40 p-3 rounded border border-slate-800/60">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Meta Mensal</span>
                                        <span className="text-[10px] text-emerald-400 font-bold">82%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[82%] shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-72 bg-slate-950/40 p-6 border border-slate-800/50 rounded-[2px] relative group-hover:border-emerald-500/20 transition-colors">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.05),transparent)] pointer-events-none"></div>
                            <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                                <Target size={12} />
                                Distribuição de Capital
                            </h4>
                            <SimpleBarChart data={chartData} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Grid Secundário - Limpo e Técnico */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Estoque e Fornecedores em cards menores */}
                <div className="lg:col-span-1 space-y-6">
                    <Card rounded="rounded-[2px]" className="group hover:border-blue-500/30">
                        <div className="flex justify-between items-center mb-2">
                            <Package className="text-blue-500/50" size={18} />
                            <span className="text-xs font-black text-blue-500/40 tracking-tighter">STOCK_MS</span>
                        </div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold">Produtos Ativos</p>
                        <h3 className="text-3xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors">{products.length}</h3>
                        <div className="mt-4 flex gap-1 h-1">
                            <div className="flex-1 bg-blue-500/40"></div>
                            <div className="flex-1 bg-blue-500/20"></div>
                            <div className="flex-1 bg-slate-800"></div>
                        </div>
                    </Card>

                    <Card rounded="rounded-[2px]" className="group hover:border-amber-500/30">
                        <div className="flex justify-between items-center mb-2">
                            <Truck className="text-amber-500/50" size={18} />
                            <span className="text-xs font-black text-amber-500/40 tracking-tighter">SUPP_CH</span>
                        </div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold">Cadeia de Fornecimento</p>
                        <h3 className="text-3xl font-black text-white mt-1 group-hover:text-amber-400 transition-colors">{suppliers.filter(s => s.status === 'active').length}</h3>
                        <button onClick={() => setActiveTab('suppliers')} className="mt-4 text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 hover:text-amber-400 transition-colors">
                            Gerenciar Rede <ChevronRight size={12} />
                        </button>
                    </Card>
                </div>

                {/* Tarefas e Atividades com mais destaque secundário */}
                <Card rounded="rounded-[2px]" className="lg:col-span-2 flex flex-col group">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 border border-slate-800 group-hover:border-emerald-500/20 transition-colors">
                                <ClipboardList size={20} className="text-slate-400 group-hover:text-emerald-400" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Painel de Operações</h3>
                        </div>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1.5 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
                        >
                            Ver Todas
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <span className="text-5xl font-black text-white leading-none tracking-tighter">{pendingTasksCount}</span>
                            <p className="text-slate-500 text-xs font-bold uppercase mt-1">Status: Pendente</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 uppercase font-black">Prioridade Máxima</span>
                                <span className="text-xs font-bold text-rose-500">{highPriorityCount}</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 overflow-hidden">
                                <div className="bg-rose-500 h-full" style={{ width: pendingTasksCount > 0 ? `${(highPriorityCount / pendingTasksCount) * 100}%` : '0%' }}></div>
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium">Análise de risco operacional: Média</p>
                        </div>
                    </div>
                </Card>

                {/* Log de Atividade Lateral */}
                <Card rounded="rounded-[2px]" variant="glass" className="lg:col-span-1 border-none bg-slate-900/20 shadow-none hover:bg-slate-900/30">
                    <div className="flex items-center gap-2 mb-6 text-slate-500">
                        <Clock size={14} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">System_Log</h4>
                    </div>
                    <div className="space-y-6">
                        {activities.slice(0, 4).map(act => (
                            <div key={act.id} className="relative pl-4 border-l border-slate-800">
                                <div className={`absolute -left-[3.5px] top-1 w-1.5 h-1.5 rounded-full ${act.type === 'income' ? 'bg-emerald-500' : act.type === 'expense' ? 'bg-rose-500' : 'bg-slate-600'}`}></div>
                                <p className="text-[9px] text-slate-600 font-bold mb-0.5">{formatTime(act.time).toUpperCase()}</p>
                                <p className="text-[11px] text-slate-400 leading-tight">
                                    <span className="text-slate-200">{settings.userName}</span>: {act.action} <span className="text-slate-200">{act.target}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
