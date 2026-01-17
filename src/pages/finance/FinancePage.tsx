import React, { useState } from 'react';
import {
    Wallet, Filter, Download, X, Plus, Search, Activity, TrendingUp,
    TrendingDown, Calendar, User, Edit, Trash2
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
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
    const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
    const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
    const [transactionForm, setTransactionForm] = useState<{
        description: string;
        category: string;
        amount: string;
        date: string;
        status: 'paid' | 'pending';
        type: 'income' | 'expense';
        entity: string;
    }>({
        description: '', category: 'Outros', amount: '', date: '', status: 'pending', type: 'expense', entity: ''
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

    const categories = ['Todas', ...new Set([...AGRICULTURAL_CATEGORIES, ...transactions.map(t => t.category)])].sort();
    const categoriesForForm = categories.filter(c => c !== 'Todas');

    const filteredTransactions = transactions.filter(t => {
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

    const resetFilters = () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterCategory('Todas');
        setFilterStatus('all');
        setStartDate('');
        setEndDate('');
        setSortBy('date-desc');
    };

    const handleTransactionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amountVal = parseValue(transactionForm.amount);
        if (isNaN(amountVal) || amountVal <= 0) return;

        if (editingTransactionId) {
            setTransactions(transactions.map(t => t.id === editingTransactionId ? { ...t, ...transactionForm, amount: amountVal } : t));
            addActivity('Transação atualizada', transactionForm.description, transactionForm.type as any);
        } else {
            const newTransaction: any = { ...transactionForm, amount: amountVal, id: Date.now() };
            setTransactions([newTransaction, ...transactions]);
            addActivity(transactionForm.type === 'income' ? 'Receita registrada' : 'Despesa registrada', transactionForm.description, transactionForm.type as any);
        }
        setIsTransactionFormOpen(false);
        setEditingTransactionId(null);
        setTransactionForm({ description: '', category: 'Outros', amount: '', date: '', status: 'pending', type: 'expense', entity: '' });
    };

    const deleteTransaction = (id: number) => {
        const transaction = transactions.find(t => t.id === id);
        if (transaction && window.confirm('Tem certeza que deseja excluir esta transação?')) {
            setTransactions(transactions.filter(t => t.id !== id));
            addActivity('Transação excluída', transaction.description, 'neutral');
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
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `financeiro_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;
    const pendingAmount = filteredTransactions.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

    const expenseByCategory = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);
    const categoryChartData = Object.entries(expenseByCategory).map(([label, value]) => ({ label, value, type: 'expense' as const }));

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col overflow-y-auto pr-2 pb-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Wallet className="text-emerald-400" size={28} />
                            Gestão Financeira
                        </h2>
                        <p className="text-slate-400 text-sm">Controle de fluxo de caixa e saúde financeira</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 border text-xs font-bold transition-all ${isAdvancedFilterOpen ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                        >
                            <Filter size={16} /> Filtros Avançados
                        </button>
                        <button
                            onClick={handleDownloadCSV}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-700 text-xs font-bold transition-all"
                        >
                            <Download size={16} /> Exportar
                        </button>
                        <button
                            onClick={() => { setIsTransactionFormOpen(true); setEditingTransactionId(null); setTransactionForm({ description: '', category: 'Outros', amount: '', date: '', status: 'pending', type: 'expense', entity: '' }); }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Nova Transação</span>
                        </button>
                    </div>
                </div>

                {isTransactionFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsTransactionFormOpen(false)} />
                        <Card variant="highlight" className="w-full max-w-2xl relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100" style={{ transform: 'none' }}>
                            <form onSubmit={handleTransactionSubmit} className="space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">{editingTransactionId ? 'Editar Transação' : 'Nova Transação'}</h3>
                                    <button type="button" onClick={() => setIsTransactionFormOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Tipo</label>
                                        <select value={transactionForm.type} onChange={e => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner">
                                            <option value="income">Receita (+)</option>
                                            <option value="expense">Despesa (-)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Valor</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-slate-500 text-sm">{settings.currency}</span>
                                            <input required placeholder="0,00" value={transactionForm.amount} onChange={e => setTransactionForm({ ...transactionForm, amount: maskValue(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Descrição</label>
                                        <input required placeholder="Ex: Venda de Soja Lote 42" value={transactionForm.description} onChange={e => setTransactionForm({ ...transactionForm, description: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Categoria</label>
                                        <div className="flex flex-col gap-2">
                                            <select
                                                value={categoriesForForm.includes(transactionForm.category) ? transactionForm.category : 'custom'}
                                                onChange={e => {
                                                    if (e.target.value === 'custom') {
                                                        setTransactionForm({ ...transactionForm, category: '' });
                                                    } else {
                                                        setTransactionForm({ ...transactionForm, category: e.target.value });
                                                    }
                                                }}
                                                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner"
                                            >
                                                <option value="" disabled>Selecione uma categoria...</option>
                                                {categoriesForForm.map(c => <option key={c} value={c}>{c}</option>)}
                                                <option value="custom">+ Outra (Personalizada)</option>
                                            </select>
                                            {(!categoriesForForm.includes(transactionForm.category) || transactionForm.category === '') && (
                                                <input
                                                    required
                                                    placeholder="Nome da nova categoria..."
                                                    value={transactionForm.category}
                                                    onChange={e => setTransactionForm({ ...transactionForm, category: e.target.value })}
                                                    className="bg-slate-950 border border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none animate-slide-down"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Entidade (Cliente/Fornecedor)</label>
                                        <input placeholder="Ex: Cooperativa ABC" value={transactionForm.entity} onChange={e => setTransactionForm({ ...transactionForm, entity: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Data</label>
                                        <input type="date" required value={transactionForm.date} onChange={e => setTransactionForm({ ...transactionForm, date: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Status</label>
                                        <select value={transactionForm.status} onChange={e => setTransactionForm({ ...transactionForm, status: e.target.value as 'paid' | 'pending' })} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner">
                                            <option value="pending">Pendente</option>
                                            <option value="paid">Pago / Recebido</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setIsTransactionFormOpen(false)} className="px-8 py-3 rounded-xl bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
                                    <button type="submit" className="px-10 py-3 rounded-xl bg-emerald-500 text-emerald-950 font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                                        {editingTransactionId ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR LANÇAMENTO'}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {isAdvancedFilterOpen && (
                    <Card variant="highlight" className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in border-emerald-500/20">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Tipo</label>
                            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500">
                                <option value="all">Todos os Tipos</option>
                                <option value="income">Receitas</option>
                                <option value="expense">Despesas</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Categoria</label>
                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Status</label>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500">
                                <option value="all">Todos os Status</option>
                                <option value="paid">Pago</option>
                                <option value="pending">Pendente</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Período</label>
                            <div className="flex items-center gap-2">
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-900 text-white text-[10px] px-2 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500" />
                                <span className="text-slate-600">-</span>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-900 text-white text-[10px] px-2 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Ordenar por</label>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500">
                                <option value="date-desc">Data (Mais Recente)</option>
                                <option value="date-asc">Data (Mais Antiga)</option>
                                <option value="amount-desc">Maior Valor</option>
                                <option value="amount-asc">Menor Valor</option>
                                <option value="name-asc">Descrição (A-Z)</option>
                            </select>
                        </div>
                        <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-700/50">
                            <button onClick={resetFilters} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                                <X size={12} /> Limpar Filtros
                            </button>
                        </div>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="flex flex-col justify-between border-l-4 border-l-emerald-500 p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Receita (Filtro)</p>
                        <p className="text-2xl font-black text-white">{formatCurrency(totalIncome, settings.currency)}</p>
                    </Card>
                    <Card className="flex flex-col justify-between border-l-4 border-l-rose-500 p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Despesa (Filtro)</p>
                        <p className="text-2xl font-black text-white">{formatCurrency(totalExpense, settings.currency)}</p>
                    </Card>
                    <Card className="flex flex-col justify-between border-l-4 border-l-blue-500 p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Saldo do Período</p>
                        <p className={`text-2xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(balance, settings.currency)}</p>
                    </Card>
                    <Card className="flex flex-col justify-between border-l-4 border-l-amber-500 p-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Pendente</p>
                        <p className="text-2xl font-black text-amber-400">{formatCurrency(pendingAmount, settings.currency)}</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card variant="highlight" className="lg:col-span-2 p-4 flex flex-col h-64">
                        <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-4 flex items-center gap-2">
                            <Activity size={14} /> Distribuição de Despesas por Categoria
                        </h3>
                        <div className="flex-1 flex items-end">
                            {categoryChartData.length > 0 ? (
                                <SimpleBarChart data={categoryChartData} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs italic">Nenhuma despesa no período</div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-4 flex flex-col justify-center items-center text-center">
                        <div className="w-24 h-24 rounded-full border-8 border-slate-800 flex items-center justify-center mb-4 relative">
                            <div className={`absolute inset-0 rounded-full border-8 transition-all duration-1000 ${balance >= 0 ? 'border-emerald-500' : 'border-rose-500'}`} style={{ clipPath: `inset(0 0 ${Math.max(0, 100 - (totalIncome > 0 ? (balance / totalIncome) * 100 : 0))}% 0)` }}></div>
                            <span className="text-xl font-black text-white">{totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">Margem Operacional</h4>
                        <p className="text-xs text-slate-500 mt-1">Eficiência do período selecionado</p>
                    </Card>
                </div>

                <Card variant="highlight" className="p-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por descrição ou entidade..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-all"
                        />
                    </div>
                </Card>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Search size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">Nenhuma transação encontrada com os filtros atuais.</p>
                        <button onClick={resetFilters} className="text-emerald-500 text-xs font-black uppercase mt-2 hover:underline">Limpar Filtros</button>
                    </div>
                ) : (
                    filteredTransactions.map((t, idx) => (
                        <div
                            key={t.id}
                            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all animate-fade-in group"
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {t.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg leading-tight">{t.description}</h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                        <span className="flex items-center gap-1"><User size={12} /> {t.entity || 'N/A'}</span>
                                        <span className="bg-slate-900/50 px-2 py-0.5 rounded text-[10px] uppercase font-black text-slate-400">{t.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between w-full md:w-auto gap-8">
                                <div className="text-right">
                                    <p className={`text-xl font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, settings.currency)}
                                    </p>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${t.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                        {t.status === 'paid' ? 'Pago' : 'Pendente'}
                                    </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => { setEditingTransactionId(t.id); setTransactionForm(t as any); setIsTransactionFormOpen(true); }} className="p-2.5 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"><Edit size={18} /></button>
                                    <button onClick={() => deleteTransaction(t.id)} className="p-2.5 hover:bg-rose-500/10 rounded-xl text-slate-600 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
};
