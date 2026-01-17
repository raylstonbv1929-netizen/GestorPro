import React, { useState } from 'react';
import {
    FileBarChart, Search, Filter, Download, Printer, X, Package, Activity
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { SimpleBarChart } from '../../components/common/SimpleBarChart';
import { formatCurrency, formatNumber } from '../../utils/format';

export const InventoryReportPage = () => {
    const { products, settings } = useApp();

    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minStock, setMinStock] = useState('');
    const [maxStock, setMaxStock] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('Todos');
    const [sortBy, setSortBy] = useState('value');
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
    const [groupByCategory, setGroupByCategory] = useState(false);
    const [isCompactView, setIsCompactView] = useState(false);

    const categories = ['Todas', ...new Set(products.map(p => p.category))];
    const locations = ['Todos', ...new Set(products.map(p => p.location || 'Não Definido'))];

    const resetFilters = () => {
        setSelectedCategory('Todas');
        setSelectedStatus('all');
        setSearchTerm('');
        setMinPrice('');
        setMaxPrice('');
        setMinStock('');
        setMaxStock('');
        setSelectedLocation('Todos');
        setSortBy('value');
    };

    const filteredProducts = products
        .filter(p => selectedCategory === 'Todas' || p.category === selectedCategory)
        .filter(p => selectedStatus === 'all' || p.status === selectedStatus)
        .filter(p => selectedLocation === 'Todos' || (p.location || 'Não Definido') === selectedLocation)
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => minPrice === '' || p.price >= parseFloat(minPrice))
        .filter(p => maxPrice === '' || p.price <= parseFloat(maxPrice))
        .filter(p => minStock === '' || p.stock >= parseFloat(minStock))
        .filter(p => maxStock === '' || p.stock <= parseFloat(maxStock))
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'stock') return b.stock - a.stock;
            if (sortBy === 'price') return b.price - a.price;
            return (b.stock * b.price) - (a.stock * a.price);
        });

    const totalStockValue = filteredProducts.reduce((acc, p) => acc + (p.stock * p.price), 0);
    const criticalItems = filteredProducts.filter(p => p.status === 'critical');
    const lowItems = filteredProducts.filter(p => p.status === 'low');
    const okItems = filteredProducts.filter(p => p.status === 'ok');
    const totalItems = filteredProducts.length;

    const replacementCost = products.reduce((acc, p) => {
        if (p.stock < p.minStock) {
            return acc + ((p.minStock - p.stock) * p.price);
        }
        return acc;
    }, 0);

    const stockHealthScore = totalItems > 0 ? Math.round((okItems.length / totalItems) * 100) : 0;

    const valueByCategory = products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + (p.stock * p.price);
        return acc;
    }, {} as Record<string, number>);
    const chartData = Object.entries(valueByCategory).map(([label, value]) => ({ label, value, type: 'income' as const }));

    const healthData = [
        { label: 'Normal', value: okItems.length, type: 'income' as const },
        { label: 'Baixo', value: lowItems.length, type: 'neutral' as const },
        { label: 'Crítico', value: criticalItems.length, type: 'expense' as const }
    ];

    const handleDownloadCSV = () => {
        const headers = ['Produto', 'Categoria', 'Localização', 'Estoque Atual', 'Unidade', 'Custo Unitário', 'Valor Total', 'Status'];
        const rows = filteredProducts.map(p => [
            p.name,
            p.category,
            p.location || 'N/A',
            Number(p.stock).toFixed(2),
            p.unit,
            Number(p.price).toFixed(2),
            (p.stock * p.price).toFixed(2),
            p.status.toUpperCase()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_estoque_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col printable-area overflow-y-auto pr-2 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileBarChart className="text-emerald-400" /> Relatório de Inventário
                    </h2>
                    <p className="text-slate-400 text-sm">Análise estratégica e financeira de insumos</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar produto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-900 text-white text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-700 outline-none focus:border-emerald-500 w-48 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                        className={`px-3 py-2 rounded-xl flex items-center gap-2 border text-xs font-bold transition-all ${isAdvancedFilterOpen ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                        <Filter size={16} /> Filtros
                    </button>
                    <button onClick={handleDownloadCSV} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 border border-slate-700 text-xs font-bold transition-all">
                        <Download size={16} /> CSV
                    </button>
                    <button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20">
                        <Printer size={16} /> Imprimir
                    </button>
                </div>
            </div>

            {isAdvancedFilterOpen && (
                <Card variant="highlight" className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in no-print border-emerald-500/20">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Categoria</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500"
                        >
                            {categories.map((c: any) => <option key={String(c)} value={String(c)}>{String(c)}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="ok">Normal</option>
                            <option value="low">Baixo</option>
                            <option value="critical">Crítico</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Localização</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500"
                        >
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Ordenar Por</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500"
                        >
                            <option value="value">Maior Valor Total</option>
                            <option value="stock">Maior Estoque</option>
                            <option value="price">Maior Preço Unit.</option>
                            <option value="name">Nome (A-Z)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Faixa de Preço ({settings.currency})</label>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500" />
                            <span className="text-slate-600">-</span>
                            <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500" />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Faixa de Estoque</label>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="Min" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500" />
                            <span className="text-slate-600">-</span>
                            <input type="number" placeholder="Max" value={maxStock} onChange={e => setMaxStock(e.target.value)} className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 outline-none focus:border-emerald-500" />
                        </div>
                    </div>
                    <div className="md:col-span-4 flex flex-wrap justify-end gap-4 pt-2 border-t border-slate-700/50">
                        <button onClick={resetFilters} className="text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                            <X size={12} /> Limpar Filtros
                        </button>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Vista Compacta</label>
                            <button
                                onClick={() => setIsCompactView(!isCompactView)}
                                className={`w-8 h-4 rounded-full relative transition-all ${isCompactView ? 'bg-blue-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isCompactView ? 'left-4' : 'left-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Agrupar por Categoria</label>
                            <button
                                onClick={() => setGroupByCategory(!groupByCategory)}
                                className={`w-8 h-4 rounded-full relative transition-all ${groupByCategory ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${groupByCategory ? 'left-4' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-blue-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Saúde do Estoque</p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-2xl font-black ${stockHealthScore > 80 ? 'text-emerald-400' : stockHealthScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{stockHealthScore}%</p>
                        <span className="text-[10px] text-slate-500">em conformidade</span>
                    </div>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-emerald-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Patrimônio Atual</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(totalStockValue, settings.currency)}</p>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-amber-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Custo de Reposição</p>
                    <p className="text-2xl font-black text-amber-400">{formatCurrency(replacementCost, settings.currency)}</p>
                    <p className="text-[10px] text-slate-500">para atingir estoque mín.</p>
                </Card>
                <Card className="flex flex-col justify-between p-4 border-l-4 border-l-rose-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Itens Críticos</p>
                    <p className="text-2xl font-black text-rose-400">{criticalItems.length}</p>
                    <p className="text-[10px] text-slate-500">necessitam compra urgente</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 no-print">
                <Card variant="highlight" className="lg:col-span-2 h-64 flex flex-col p-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-4 flex items-center gap-2">
                        <Package size={14} /> Valor por Categoria
                    </h3>
                    <div className="flex-1 flex items-end">
                        <SimpleBarChart data={chartData} />
                    </div>
                </Card>
                <Card variant="highlight" className="h-64 flex flex-col p-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-4 flex items-center gap-2">
                        <Activity size={14} /> Distribuição de Status
                    </h3>
                    <div className="flex-1 flex items-end">
                        <SimpleBarChart data={healthData} />
                    </div>
                </Card>
            </div>

            <Card variant="white" className="flex-1 border-t-8 border-emerald-500 shadow-xl overflow-hidden animate-fade-in card-white" style={{ animationDelay: '0.7s' }}>
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black no-print">GP</div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Relatório de Inventário</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                            Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Patrimônio em Insumos</p>
                        <p className="text-3xl font-black text-emerald-600 leading-none">
                            {formatCurrency(totalStockValue, settings.currency)}
                        </p>
                    </div>
                </div>

                <div className="hidden print:block p-6 bg-slate-50 border-b border-slate-200">
                    <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3">Resumo por Categoria</h4>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(valueByCategory).sort((a: any, b: any) => b[1] - a[1]).map(([cat, val]: any) => (
                            <div key={cat} className="flex justify-between border-b border-slate-200 pb-1">
                                <span className="text-[9px] text-slate-600 font-bold">{cat}</span>
                                <span className="text-[9px] text-slate-900 font-mono">{formatCurrency(val, settings.currency)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px]">Produto</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px]">Local / Categoria</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px] text-right">Estoque</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px] text-right">Custo Unit.</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px] text-right">Total Acumulado</th>
                                <th className="px-4 py-3 font-bold text-slate-700 uppercase text-[9px] text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {groupByCategory ? (
                                categories.filter(c => c !== 'Todas').map(cat => {
                                    const catProducts = filteredProducts.filter(p => p.category === cat);
                                    if (catProducts.length === 0) return null;
                                    return (
                                        <React.Fragment key={cat}>
                                            <tr className="bg-slate-100/50">
                                                <td colSpan={6} className="px-4 py-1.5 text-[9px] font-black uppercase text-slate-500 tracking-widest bg-slate-50">{cat}</td>
                                            </tr>
                                            {catProducts.map((product) => (
                                                <tr key={product.id} className={`hover:bg-slate-50/80 transition-colors bg-white`}>
                                                    <td className={`px-4 ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                                        <p className="font-bold text-slate-900 text-xs">{product.name}</p>
                                                        {!isCompactView && <p className="text-[9px] text-slate-400">ID: #{product.id.toString().padStart(4, '0')}</p>}
                                                    </td>
                                                    <td className={`px-4 ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                                        <p className="text-[10px] font-bold text-slate-700">{product.location || 'N/A'}</p>
                                                        {!isCompactView && <p className="text-[9px] text-slate-400 uppercase">{product.category}</p>}
                                                    </td>
                                                    <td className={`px-4 text-right ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                                        <p className="font-mono font-bold text-slate-700 text-xs">{formatNumber(product.stock)} {product.unit}</p>
                                                        {!isCompactView && (
                                                            <p className={`text-[8px] font-bold ${product.stock < product.minStock ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                Mín: {product.minStock} {product.unit}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 text-right text-slate-600 font-mono text-xs ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                                        {formatCurrency(product.price, settings.currency)}
                                                    </td>
                                                    <td className={`px-4 text-right ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                                        <p className="font-bold text-emerald-700 font-mono text-xs">
                                                            {formatCurrency(product.stock * product.price, settings.currency)}
                                                        </p>
                                                    </td>
                                                    <td className={`px-4 text-center ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                                        {product.status === 'critical' && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                                                                Crítico
                                                            </span>
                                                        )}
                                                        {product.status === 'low' && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">
                                                                Baixo
                                                            </span>
                                                        )}
                                                        {product.status === 'ok' && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                                Normal
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                filteredProducts.map((product, idx) => (
                                    <tr key={product.id} className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                        <td className={`px-4 ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                            <p className="font-bold text-slate-900 text-xs">{product.name}</p>
                                            {!isCompactView && <p className="text-[9px] text-slate-400">ID: #{product.id.toString().padStart(4, '0')}</p>}
                                        </td>
                                        <td className={`px-4 ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                            <p className="text-[10px] font-bold text-slate-700">{product.location || 'N/A'}</p>
                                            {!isCompactView && <p className="text-[9px] text-slate-400 uppercase">{product.category}</p>}
                                        </td>
                                        <td className={`px-4 text-right ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                            <p className="font-mono font-bold text-slate-700 text-xs">{formatNumber(product.stock)} {product.unit}</p>
                                            {!isCompactView && (
                                                <p className={`text-[8px] font-bold ${product.stock < product.minStock ? 'text-rose-500' : 'text-slate-400'}`}>
                                                    Mín: {product.minStock} {product.unit}
                                                </p>
                                            )}
                                        </td>
                                        <td className={`px-4 text-right text-slate-600 font-mono text-xs ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                            {formatCurrency(product.price, settings.currency)}
                                        </td>
                                        <td className={`px-4 text-right ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                            <p className="font-bold text-emerald-700 font-mono text-xs">
                                                {formatCurrency(product.stock * product.price, settings.currency)}
                                            </p>
                                        </td>
                                        <td className={`px-4 text-center ${isCompactView ? 'py-1.5' : 'py-3'}`}>
                                            {product.status === 'critical' && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                                                    Crítico
                                                </span>
                                            )}
                                            {product.status === 'low' && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">
                                                    Baixo
                                                </span>
                                            )}
                                            {product.status === 'ok' && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                        <p>GestorPro - Sistema de Gestão Agrícola</p>
                        <p>Documento gerado eletronicamente para fins de auditoria</p>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Itens Analisados</p>
                            <p className="text-xl font-black text-slate-800">{totalItems}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Valor Total do Relatório</p>
                            <p className="text-xl font-black text-emerald-600">{formatCurrency(totalStockValue, settings.currency)}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
