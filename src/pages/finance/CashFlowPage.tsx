import React, { useState } from 'react';
import {
    Activity, Calendar, Download, Printer, TrendingUp, TrendingDown
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatCurrency } from '../../utils/format';

export const CashFlowPage = () => {
    const { transactions, settings, currentDate } = useApp();

    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const getDailyCashFlow = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const dailyData = [];
        let runningBalance = 0; // In a real app, this would come from previous month's closing balance

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            const dayTransactions = transactions.filter(t => t.date === dateStr);
            const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            runningBalance += (dayIncome - dayExpense);

            dailyData.push({
                day: i,
                date: dateStr,
                income: dayIncome,
                expense: dayExpense,
                balance: runningBalance,
                transactions: dayTransactions
            });
        }
        return dailyData;
    };

    const dailyFlow = getDailyCashFlow();
    const totalMonthIncome = dailyFlow.reduce((sum, d) => sum + d.income, 0);
    const totalMonthExpense = dailyFlow.reduce((sum, d) => sum + d.expense, 0);
    const closingBalance = dailyFlow[dailyFlow.length - 1]?.balance || 0;

    const chartData = dailyFlow.map(d => ({
        label: d.day.toString(),
        value: d.balance,
        type: d.balance >= 0 ? 'income' as const : 'expense' as const
    }));

    const handleDownloadCSV = () => {
        const headers = ["Dia", "Data", "Entradas", "Saídas", "Saldo Acumulado"];
        const rows = dailyFlow.map(d => [
            d.day,
            new Date(d.date).toLocaleDateString('pt-BR'),
            d.income.toFixed(2),
            d.expense.toFixed(2),
            d.balance.toFixed(2)
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `fluxo_caixa_${monthNames[selectedMonth]}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col printable-area overflow-y-auto pr-2 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Activity className="text-emerald-400" size={28} /> Fluxo de Caixa
                    </h2>
                    <p className="text-slate-400 text-sm">Monitoramento diário de liquidez e saldo acumulado</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                        <Calendar size={16} className="text-slate-500" />
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer">
                            {monthNames.map((m, i) => <option key={i} value={i} className="bg-slate-900">{m}</option>)}
                        </select>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer">
                            {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                        </select>
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
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-slate-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Saldo Inicial</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(0, settings.currency)}</p>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-emerald-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Total Entradas</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(totalMonthIncome, settings.currency)}</p>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-rose-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <p className="text-rose-400 text-[10px] uppercase font-bold tracking-wider">Total Saídas</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(totalMonthExpense, settings.currency)}</p>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-blue-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-blue-400 text-[10px] uppercase font-bold tracking-wider">Saldo Final</p>
                    <p className={`text-2xl font-black ${closingBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>{formatCurrency(closingBalance, settings.currency)}</p>
                </Card>
            </div>

            <Card variant="highlight" className="p-6 h-64 flex flex-col no-print animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Evolução do Saldo Diário
                </h3>
                <div className="flex-1 w-full relative flex items-end gap-1">
                    {chartData.map((d, i) => {
                        const maxVal = Math.max(...chartData.map(c => Math.abs(c.value))) || 1;
                        const heightPercent = Math.min(Math.abs(d.value) / maxVal * 100, 100);
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                <div
                                    className={`w-full min-h-[2px] rounded-t-sm transition-all duration-300 ${d.value >= 0 ? 'bg-emerald-500/40 group-hover:bg-emerald-400' : 'bg-rose-500/40 group-hover:bg-rose-400'}`}
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 border border-slate-700 shadow-xl">
                                    Dia {d.label}: {formatCurrency(d.value, settings.currency)}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-between mt-4 text-[9px] text-slate-500 uppercase font-black px-1 tracking-widest">
                    <span>Início do Mês</span>
                    <span>Fim do Mês</span>
                </div>
            </Card>

            <Card variant="white" className="flex-1 border-t-8 border-blue-500 shadow-xl overflow-hidden animate-fade-in card-white" style={{ animationDelay: '0.6s' }}>
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black no-print">GP</div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fluxo de Caixa Mensal</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Mês de Referência: {monthNames[selectedMonth]} de {selectedYear}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-medium">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Saldo Final Acumulado</p>
                        <p className={`text-3xl font-black leading-none ${closingBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                            {formatCurrency(closingBalance, settings.currency)}
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px]">Dia</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px]">Movimentações</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px] text-right">Entradas</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px] text-right">Saídas</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px] text-right">Saldo do Dia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {dailyFlow.filter(d => d.transactions.length > 0).map((day) => (
                                <tr key={day.day} className="hover:bg-slate-50/80 transition-colors bg-white">
                                    <td className="px-4 py-3 font-black text-slate-900 text-xs">
                                        {day.day.toString().padStart(2, '0')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            {day.transactions.map(t => (
                                                <div key={t.id} className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    <span className="text-[10px] text-slate-600 font-medium">{t.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-[10px] text-emerald-600 font-bold">
                                        {day.income > 0 ? `+ ${formatCurrency(day.income, settings.currency)}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-[10px] text-rose-600 font-bold">
                                        {day.expense > 0 ? `- ${formatCurrency(day.expense, settings.currency)}` : '-'}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-bold font-mono text-xs ${day.balance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                        {formatCurrency(day.balance, settings.currency)}
                                    </td>
                                </tr>
                            ))}
                            {dailyFlow.every(d => d.transactions.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400 italic text-xs">
                                        Nenhuma movimentação registrada para este período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50 flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                        <p>GestorPro - Controle de Liquidez</p>
                        <p>Análise temporal de disponibilidade financeira</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Média Diária de Entradas</p>
                            <p className="text-xl font-black text-slate-800">{formatCurrency(totalMonthIncome / 30, settings.currency)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Saldo Final do Mês</p>
                            <p className="text-xl font-black text-blue-600">{formatCurrency(closingBalance, settings.currency)}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
