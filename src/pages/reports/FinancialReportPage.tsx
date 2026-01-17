import React, { useState } from 'react';
import {
    FileText, Filter, Download, Printer, TrendingUp, TrendingDown,
    Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatCurrency } from '../../utils/format';

export const FinancialReportPage = () => {
    const { transactions, settings, currentDate } = useApp();

    const [reportMonth, setReportMonth] = useState(currentDate.getMonth());
    const [reportYear, setReportYear] = useState(currentDate.getFullYear());

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const reportTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === reportMonth && d.getFullYear() === reportYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalIncome = reportTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = reportTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    const expensesByCategory = reportTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    const sortedExpenses = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

    const handleDownloadCSV = () => {
        const headers = ['Data', 'Descrição', 'Entidade', 'Categoria', 'Tipo', 'Valor', 'Status'];
        const rows = reportTransactions.map(t => [
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
        link.setAttribute("download", `relatorio_financeiro_${monthNames[reportMonth]}_${reportYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const changeMonth = (delta: number) => {
        let newMonth = reportMonth + delta;
        let newYear = reportYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        setReportMonth(newMonth);
        setReportYear(newYear);
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col printable-area overflow-y-auto pr-2 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-emerald-400" /> Relatório Financeiro
                    </h2>
                    <p className="text-slate-400 text-sm">Demonstrativo de resultados e fluxo de caixa mensal</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"><ChevronLeft size={16} /></button>
                        <div className="flex items-center gap-2 px-2">
                            <Calendar size={14} className="text-slate-500" />
                            <span className="text-white text-xs font-bold min-w-[100px] text-center">{monthNames[reportMonth]} {reportYear}</span>
                        </div>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"><ChevronRight size={16} /></button>
                    </div>
                    <button onClick={handleDownloadCSV} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-700 text-xs font-bold transition-all">
                        <Download size={16} /> CSV
                    </button>
                    <button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20">
                        <Printer size={16} /> Imprimir
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-emerald-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Receitas</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(totalIncome, settings.currency)}</p>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-rose-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Despesas</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(totalExpense, settings.currency)}</p>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-blue-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Resultado Líquido</p>
                    <p className={`text-2xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(balance, settings.currency)}</p>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-amber-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Margem de Lucro</p>
                    <p className="text-2xl font-black text-white">{totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%</p>
                </Card>
            </div>

            <Card variant="white" className="flex-1 border-t-8 border-emerald-500 shadow-xl overflow-hidden animate-fade-in card-white" style={{ animationDelay: '0.5s' }}>
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black no-print">GP</div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Demonstrativo Financeiro</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Período: {monthNames[reportMonth]} de {reportYear}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-medium">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Resultado Líquido</p>
                        <p className={`text-3xl font-black leading-none ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(balance, settings.currency)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-slate-100">
                    <div className="p-6 bg-slate-50/50 border-r border-slate-100">
                        <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                            <TrendingDown size={12} /> Composição de Despesas
                        </h4>
                        <div className="space-y-3">
                            {sortedExpenses.length === 0 && <p className="text-[10px] text-slate-400 italic">Nenhuma despesa registrada.</p>}
                            {sortedExpenses.map(([cat, amount], idx) => (
                                <div key={cat} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="font-bold text-slate-700">{cat}</span>
                                        <span className="font-mono text-slate-900">{formatCurrency(amount as number, settings.currency)}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${((amount as number) / totalExpense) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px]">Data</th>
                                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px]">Descrição / Entidade</th>
                                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px]">Categoria</th>
                                    <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px] text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {reportTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-10 text-center text-slate-400 italic text-xs">
                                            Nenhuma movimentação registrada para este período.
                                        </td>
                                    </tr>
                                ) : (
                                    reportTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors bg-white">
                                            <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                                                {new Date(t.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-slate-900 text-xs">{t.description}</p>
                                                <p className="text-[9px] text-slate-400 uppercase font-medium">{t.entity || 'N/A'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold uppercase">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 text-right font-bold font-mono text-xs ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, settings.currency)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                        <p>GestorPro - Inteligência Financeira Agrícola</p>
                        <p>Documento gerado eletronicamente para fins de auditoria</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Receitas</p>
                            <p className="text-xl font-black text-emerald-600">{formatCurrency(totalIncome, settings.currency)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Despesas</p>
                            <p className="text-xl font-black text-rose-600">{formatCurrency(totalExpense, settings.currency)}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
