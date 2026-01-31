import React, { useState, useMemo } from 'react';
import {
    Wallet, Filter, Download, X, Plus, Search, Activity, TrendingUp,
    TrendingDown, Calendar, User, Edit, Trash2, Zap, ShieldCheck,
    FileText, Landmark, Clock, ArrowUpRight, ArrowDownRight,
    Settings, MoreHorizontal, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { SimpleBarChart } from '../../components/common/SimpleBarChart';
import { formatCurrency, parseValue, maskValue } from '../../utils/format';

export const FinancePage = () => {
    const {
        transactions, setTransactions, addActivity, settings
    } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [filterStatus, setFilterStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<{
        description: string;
        category: string;
        amount: string;
        date: string;
        status: 'paid' | 'pending';
        type: 'income' | 'expense';
        entity: string;
    }>({
        description: '', category: 'Outros', amount: '', date: new Date().toISOString().split('T')[0], status: 'pending', type: 'expense', entity: ''
    });
    const [sortBy, setSortBy] = useState('date-desc');

    const AGRICULTURAL_CATEGORIES = [
        'Vendas de Grãos', 'Vendas de Animais', 'Serviços Prestados', 'Venda de Insumos',
        'Insumos Agrícolas', 'Sementes', 'Fertilizantes', 'Defensivos', 'Corretivos',
        'Combustível', 'Lubrificantes', 'Manutenção', 'Peças', 'Pneus',
        'Folha de Pagamento', 'Encargos Sociais', 'Pró-labore', 'Alimentação',
        'Energia Elétrica', 'Internet/Telefone', 'Água',
        'Impostos e Taxas', 'Arrendamento', 'Fretes', 'Armazenagem',
        'Seguros', 'Juros e Tarifas', 'Empréstimos', 'Outros'
    ];

    const categories = useMemo(() => ['Todas', ...new Set([...AGRICULTURAL_CATEGORIES, ...transactions.map(t => t.category)])].sort(), [transactions]);
    const categoriesForForm = useMemo(() => categories.filter(c => c !== 'Todas'), [categories]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.entity.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;
            const matchesCategory = filterCategory === 'Todas' || t.category === filterCategory;
            const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

            const tDate = new Date(t.date);
            const matchesStart = !startDate || tDate >= new Date(startDate);
            const matchesEnd = !endDate || tDate <= new Date(endDate);

            return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesStart && matchesEnd;
        }).sort((a, b) => {
            if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortBy === 'amount-desc') return b.amount - a.amount;
            if (sortBy === 'amount-asc') return a.amount - b.amount;
            if (sortBy === 'name-asc') return a.description.localeCompare(b.description);
            return 0;
        });
    }, [transactions, searchTerm, filterType, filterCategory, filterStatus, startDate, endDate, sortBy]);

    const stats = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        const balance = income - expense;
        const pending = filteredTransactions.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

        const expenseByCategory = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(expenseByCategory)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value]) => ({ label, value, type: 'expense' as const }));

        return { income, expense, balance, pending, chartData };
    }, [filteredTransactions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountVal = parseValue(form.amount);
        if (isNaN(amountVal) || amountVal <= 0) return;

        if (editingId) {
            setTransactions(transactions.map(t => t.id === editingId ? { ...t, ...form, amount: amountVal } : t));
            addActivity('Atualizou lançamento financeiro', form.description, form.type as any);
        } else {
            const newTransaction: any = { ...form, amount: amountVal, id: Date.now() };
            setTransactions([newTransaction, ...transactions]);
            addActivity(form.type === 'income' ? 'Registrou nova receita' : 'Registrou nova despesa', form.description, form.type as any);
        }
        setIsFormOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ description: '', category: 'Outros', amount: '', date: new Date().toISOString().split('T')[0], status: 'pending', type: 'expense', entity: '' });
    };

    const deleteTransaction = (id: number) => {
        const t = transactions.find(transaction => transaction.id === id);
        if (t && window.confirm(`Deseja remover permanentemente o lançamento "${t.description}"?`)) {
            setTransactions(transactions.filter(transaction => transaction.id !== id));
            addActivity('Removeu lançamento financeiro', t.description, 'neutral');
        }
    };

    const handleDownloadCSV = () => {
        const headers = ['Data', 'Descrição', 'Entidade', 'Categoria', 'Tipo', 'Valor', 'Status'];
        const rows = filteredTransactions.map(t => [
            new Date(t.date).toLocaleDateString('pt-BR'),
            t.description,
            t.entity || 'N/A',
            t.category,
            t.type === 'income' ? 'Receita' : 'Despesa',
            Number(t.amount).toFixed(2),
            t.status === 'paid' ? 'Pago' : 'Pendente'
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
            {/* FINANCIAL SENTINEL COMMAND CENTER */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 z-20" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Wallet className="text-amber-500" size={32} />
                        Gestão de Ativos & Fluxo
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                        <Activity size={12} className="text-amber-500/50" /> Inteligência Financeira e Controle de Integridade
                    </p>
                </div>

                <div className="flex gap-4 relative z-10 lg:w-auto w-full">
                    <button
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-emerald-800"
                    >
                        <Plus size={20} /> Novo Lançamento
                    </button>
                    <button
                        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                        className={`p-5 rounded-2xl border transition-all ${isFilterPanelOpen ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white group-hover:border-slate-700'}`}
                    >
                        <Filter size={20} />
                    </button>
                    <button
                        onClick={handleDownloadCSV}
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all shadow-lg active:scale-90"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* TELEMETRY MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Entradas de Capital', value: stats.income, icon: TrendingUp, color: 'emerald', code: 'CASH_IN' },
                    { label: 'Despesas Operacionais', value: stats.expense, icon: TrendingDown, color: 'rose', code: 'CASH_OUT' },
                    { label: 'Saldo do Período', value: stats.balance, icon: Wallet, color: stats.balance >= 0 ? 'blue' : 'rose', code: 'CASH_BAL' },
                    { label: 'Pendências de Fluxo', value: stats.pending, icon: Clock, color: 'amber', code: 'PEND_CLR' }
                ].map((item, idx) => (
                    <Card key={idx} className="group p-6 border-slate-900 hover:border-slate-800 bg-slate-950 relative overflow-hidden rounded-[2rem]">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${item.color}-500`}>
                            <item.icon size={48} />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic group-hover:text-slate-400 transition-colors">{item.label}</p>
                        <h4 className={`text-2xl font-black italic tracking-tighter transition-all group-hover:translate-x-1 ${item.color === 'emerald' ? 'text-emerald-400' : item.color === 'rose' ? 'text-rose-400' : 'text-white'}`}>
                            {formatCurrency(item.value, settings.currency)}
                        </h4>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-[8px] font-black text-slate-700 tracking-widest uppercase italic">{item.code}</span>
                            <div className={`h-1 flex-1 mx-4 bg-slate-900 rounded-full overflow-hidden`}>
                                <div className={`h-full bg-${item.color}-500 shadow-[0_0_8px] shadow-${item.color}-500`} style={{ width: '100%' }} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* SCANNER & FILTERS */}
            {isFilterPanelOpen && (
                <div className="bg-slate-950/80 border border-slate-900 p-8 rounded-[2.5rem] mb-6 animate-in slide-in-from-top-4 duration-500 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500/50 z-20" />

                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1 mb-4 italic">
                                <Search size={12} className="text-amber-500" /> Scanner de Varredura Financeira
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="FILTRAR POR DESCRIÇÃO OU ENTIDADE..."
                                    className="w-full bg-slate-900/50 border border-slate-800 py-5 px-8 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-amber-500/50 transition-all italic placeholder:text-slate-800"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                                    <Zap size={18} className="text-amber-500" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Vetor de Fluxo</p>
                                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                                    <option value="all">Todas as Direções</option><option value="income">Receitas (+)</option><option value="expense">Despesas (-)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Segmento de Custo</p>
                                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Status de Liquidação</p>
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                                    <option value="all">Todos os Estados</option><option value="paid">Finalizado / Pago</option><option value="pending">Aguardando / Pendente</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">Período Fiscal</p>
                                <div className="flex gap-2">
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-[10px] font-bold text-slate-400 outline-none focus:border-amber-500/50" />
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-[10px] font-bold text-slate-400 outline-none focus:border-amber-500/50" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-6 pt-4 border-t border-slate-900">
                            <button onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterCategory('Todas'); setFilterStatus('all'); setStartDate(''); setEndDate(''); }} className="text-[10px] font-black text-slate-600 hover:text-rose-400 uppercase tracking-widest transition-all italic flex items-center gap-2">
                                <RefreshCw size={12} /> Resetar Varredura
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA: ANALYTICS + LEDGER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Ledger / Transaction List */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                            <Clock size={14} className="text-amber-500" /> Registro Cronológico de Movimentações
                        </h3>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Ordenar:</span>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent text-[10px] font-black text-white uppercase tracking-widest outline-none cursor-pointer">
                                <option value="date-desc">Data Desc</option><option value="date-asc">Data Asc</option><option value="amount-desc">Maior Valor</option><option value="amount-asc">Menor Valor</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredTransactions.map((t, idx) => (
                            <div
                                key={t.id}
                                className="bg-slate-950/40 border border-slate-900/60 p-5 rounded-[1.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-slate-900/40 hover:border-slate-800 transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${t.type === 'income' ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`} />

                                <div className="flex items-center gap-6 flex-1">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {t.type === 'income' ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-white text-base leading-none uppercase italic tracking-tighter truncate group-hover:text-amber-400 transition-colors">{t.description}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-600 mt-2 font-black uppercase tracking-widest italic">
                                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-amber-500/50" /> {new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                            <span className="flex items-center gap-1.5"><User size={12} className="text-amber-500/50" /> {t.entity || 'N/A'}</span>
                                            <span className="px-2 py-0.5 bg-slate-900/80 rounded border border-slate-800 text-slate-500 group-hover:text-slate-300 transition-colors">{t.category}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto gap-8">
                                    <div className="text-right shrink-0">
                                        <p className={`text-xl font-black italic tracking-tighter ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {formatCurrency(t.amount, settings.currency)}
                                        </p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border mt-1.5 inline-block ${t.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'}`}>
                                            {t.status === 'paid' ? 'Liquidação Coberta' : 'Aguardando Compensação'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingId(t.id); setForm({ ...t, amount: maskValue(t.amount.toString()) } as any); setIsFormOpen(true); }} className="w-10 h-10 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-600 hover:text-white rounded-xl transition-all flex items-center justify-center active:scale-90"><Edit size={16} /></button>
                                        <button onClick={() => deleteTransaction(t.id)} className="w-10 h-10 bg-slate-900 border border-slate-800 hover:bg-rose-500/10 text-slate-800 hover:text-rose-500 rounded-xl transition-all flex items-center justify-center active:scale-90"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredTransactions.length === 0 && (
                            <div className="py-24 flex flex-col items-center justify-center bg-slate-950/20 border border-dashed border-slate-900 rounded-[2.5rem] space-y-4 opacity-30 italic">
                                <Search size={48} className="text-slate-800" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum Registro Identificado na Matriz</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Analytics Pillar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card rounded="rounded-[2rem]" className="p-8 border-slate-900 bg-slate-950 flex flex-col h-80 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <TrendingDown size={48} className="text-rose-500" />
                        </div>
                        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 italic">
                            <Activity size={14} className="text-rose-500" /> Maiores Centros de Custo (TOP 5)
                        </h3>
                        <div className="flex-1 min-h-0 group-hover:scale-[1.02] transition-transform duration-500">
                            {stats.chartData.length > 0 ? (
                                <SimpleBarChart data={stats.chartData} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-[9px] font-black text-slate-800 uppercase tracking-widest italic">Aguardando Coleta de Dados</div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-8 flex flex-col justify-center items-center text-center gap-6 rounded-[2rem] bg-slate-950 border-slate-900 group">
                        <div className="w-32 h-32 rounded-full border-[10px] border-slate-900 flex items-center justify-center relative shadow-2xl">
                            <div
                                className={`absolute inset-0 rounded-full border-[10px] transition-all duration-1000 ${stats.balance >= 0 ? 'border-emerald-500/60 shadow-[0_0_15px_#10b98140]' : 'border-rose-500/60 shadow-[0_0_15px_#f43f5e40]'}`}
                                style={{ clipPath: `inset(0 0 ${Math.max(0, 100 - (stats.income > 0 ? ((stats.income - stats.expense) / stats.income) * 100 : 0))}% 0)` }}
                            />
                            <span className="text-2xl font-black text-white italic tracking-tighter group-hover:scale-110 transition-transform">{stats.income > 0 ? Math.round((stats.balance / stats.income) * 100) : 0}%</span>
                        </div>
                        <div>
                            <h4 className="font-black text-white text-xs uppercase tracking-widest italic">Eficiência Operacional</h4>
                            <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-widest">Margem de Fluxo Realizada</p>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[2rem] bg-slate-950 border-slate-900 space-y-4">
                        <div className="flex items-center gap-3 text-amber-500/50">
                            <ShieldCheck size={16} />
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] italic">Sistema de Auditoria Fiscal</p>
                        </div>
                        <p className="text-[10px] text-slate-400 italic leading-relaxed">Todos os lançamentos são protegidos por logs de integridade e backup redundante em nuvem.</p>
                    </Card>
                </div>
            </div>

            {/* PROTOCOL MODAL: FINANCEIRO */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 md:p-4">
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={() => setIsFormOpen(false)} />

                    <Card variant="glass" className="w-full max-w-4xl relative z-10 p-0 overflow-hidden border-amber-500/20 shadow-2xl rounded-[1.5rem] md:rounded-[3rem] !scale-100 flex flex-col h-[95vh] md:h-[90vh]">
                        <div className="h-1.5 w-full bg-slate-900">
                            <div className={`h-full ${form.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_15px]`} style={{ width: editingId ? '100%' : '50%' }} />
                        </div>

                        <div className="p-10 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${form.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                    {form.type === 'income' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{editingId ? 'Retificação de Lançamento' : 'Novo Registro de Fluxo'}</h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
                                        <Zap size={12} className="text-amber-500" /> Matriz de Inteligência Contábil
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-lg active:scale-90"><X size={28} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                <div className="md:col-span-8 space-y-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-3 italic"><FileText size={14} /> Atributos da Transação</h4>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Descrição do Lançamento</label>
                                            <input required value={form.description} onChange={e => setForm({ ...form, description: e.target.value.toUpperCase() })} placeholder="EX: VENDA DE SAFRA SOJA LOTE 42" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-amber-500/50 transition-all italic" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Entidade Envolvida</label>
                                                <input value={form.entity} onChange={e => setForm({ ...form, entity: e.target.value.toUpperCase() })} placeholder="EX: COOPERATIVA AGROINDUSTRIAL" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-amber-500/50 transition-all italic" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Categoria Fiscal</label>
                                                <select
                                                    value={categoriesForForm.includes(form.category) ? form.category : 'custom'}
                                                    onChange={e => e.target.value === 'custom' ? setForm({ ...form, category: '' }) : setForm({ ...form, category: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-amber-500/50 appearance-none italic"
                                                >
                                                    {categoriesForForm.map(c => <option key={c} value={c}>{c}</option>)}
                                                    <option value="custom">+ PERSONALIZADA</option>
                                                </select>
                                                {!categoriesForForm.includes(form.category) && (
                                                    <input required placeholder="NOME DA CATEGORIA" value={form.category} onChange={e => setForm({ ...form, category: e.target.value.toUpperCase() })} className="mt-2 w-full bg-slate-950 border border-amber-500/30 rounded-xl px-4 py-3 text-[10px] font-black text-amber-400 outline-none italic" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-4 space-y-8">
                                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-3 italic"><Landmark size={14} /> Matriz Monetária</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Direcionamento</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button type="button" onClick={() => setForm({ ...form, type: 'income' })} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${form.type === 'income' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>Receita</button>
                                                    <button type="button" onClick={() => setForm({ ...form, type: 'expense' })} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${form.type === 'expense' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>Despesa</button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Valor do Montante</label>
                                                <div className="relative">
                                                    <input required value={form.amount} onChange={e => setForm({ ...form, amount: maskValue(e.target.value) })} placeholder="0,00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xl font-black text-white outline-none focus:border-amber-500/50 italic text-right" />
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 italic">{settings.currency}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Data Efetiva</label>
                                                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-amber-500/50 italic" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Status de Liquidez</label>
                                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-amber-500/50 appearance-none cursor-pointer italic">
                                                    <option value="paid">PAGO / EFETIVADO</option><option value="pending">PENDENTE / AGENDADO</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-10 border-t border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4 text-slate-500 opacity-40">
                                <ShieldCheck size={20} />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Auditoria Financeira v5.0</span>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all active:scale-95 italic">Abortar</button>
                                <button type="submit" onClick={handleSubmit} className="px-16 py-5 rounded-2xl bg-amber-600 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-amber-500 transition-all shadow-2xl shadow-amber-500/30 active:scale-95 border-b-4 border-amber-800 italic">Efetivar Lançamento</button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
