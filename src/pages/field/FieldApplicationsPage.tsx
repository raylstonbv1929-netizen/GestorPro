import React, { useState, useEffect, useMemo } from 'react';
import {
    Sprout, X, Edit, Plus, LandPlot, Activity, DollarSign, Search,
    Calendar, Filter, MapPin, Droplets, AlertCircle, Trash2, Copy,
    Clock, User, Wind, Thermometer, Droplet, ClipboardList, Gauge,
    ShieldCheck, ShieldAlert, Zap, Info
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatCurrency } from '../../utils/format';

// --- SUB-COMPONENTS ---

const TankHUD = ({ products, area, sprayVolume = 0 }: { products: any[], area: number, sprayVolume?: number }) => {
    // Total volume in tank = sprayVolume (L/ha) * area (ha)
    const totalVolume = (sprayVolume || 0) * (area || 0);

    return (
        <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <Gauge size={12} /> Visualização da Mistura
                    </h4>
                    <p className="text-xl font-black text-white">{totalVolume.toFixed(0)} <span className="text-sm text-slate-500 font-normal">Total de Litros</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Volume Calda</p>
                    <p className="text-sm font-bold text-slate-300">{sprayVolume} L/ha</p>
                </div>
            </div>

            <div className="relative flex-1 min-h-[200px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex flex-col-reverse">
                {/* Empty Space indicator */}
                <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[8px] font-bold text-cyan-500 uppercase tracking-tighter">PRONTO</span>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                        <Droplets size={32} className="text-slate-600 mb-2" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Inserir Produtos</span>
                    </div>
                ) : (
                    products.map((p: any, idx: number) => {
                        const height = Math.max(10, 100 / products.length);
                        const colors = [
                            'from-cyan-500/40 to-cyan-600/20',
                            'from-emerald-500/40 to-emerald-600/20',
                            'from-blue-500/40 to-blue-600/20',
                            'from-amber-500/40 to-amber-600/20'
                        ];
                        const color = colors[idx % colors.length];

                        return (
                            <div
                                key={idx}
                                className={`w-full bg-gradient-to-t ${color} border-t border-white/5 flex items-center px-4 transition-all duration-500`}
                                style={{ height: `${height}%` }}
                            >
                                <div className="flex justify-between w-full items-center">
                                    <span className="text-[10px] font-black text-white uppercase truncate pr-4">{p.productName}</span>
                                    <span className="text-[10px] font-bold text-white/50">{p.totalQuantity.toFixed(2)} {p.unit}</span>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="h-full w-full grid grid-rows-4">
                        <div className="border-t border-slate-400" />
                        <div className="border-t border-slate-400" />
                        <div className="border-t border-slate-400" />
                        <div className="border-t border-slate-400" />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Área Alvo</p>
                    <p className="text-xs font-bold text-white">{area || 0} ha</p>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <p className="text-[8px] font-bold text-slate-500 uppercase">Componentes</p>
                    <p className="text-xs font-bold text-white">{products.length} Itens</p>
                </div>
            </div>
        </div>
    );
};

export const FieldApplicationsPage = () => {
    const {
        products, setProducts, fieldApplications, setFieldApplications,
        stockMovements, setStockMovements, settings, handleStockAdjustment,
        collaborators, properties, plots, addActivity, calculateNormalizedQuantity
    } = useApp();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [advancedFilters, setAdvancedFilters] = useState({
        status: 'all',
        plotId: 'all',
        productId: 'all',
        operator: 'all'
    });
    const [editingApplicationId, setEditingApplicationId] = useState<number | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const [formData, setFormData] = useState<any>({
        date: new Date().toISOString().split('T')[0],
        plotId: '',
        areaApplied: '',
        operator: '',
        equipment: '',
        observations: '',
        target: '',
        sprayVolume: '',
        status: 'completed',
        weather: { temp: '', humidity: '', wind: '' },
        appliedProducts: []
    });

    const [currentProduct, setCurrentProduct] = useState({
        productId: '',
        dose: '',
        unit: ''
    });

    // --- INTEGRITY CHECKS ---
    const stockAlerts = useMemo(() => {
        return formData.appliedProducts.map((ap: any) => {
            const product = products.find(p => p.id === ap.productId);
            if (!product) return { id: ap.productId, status: 'ok' };
            const isInsufficient = product.stock < ap.totalQuantity;
            return {
                id: ap.productId,
                name: product.name,
                requested: ap.totalQuantity,
                available: product.stock,
                unit: product.unit,
                status: isInsufficient ? 'insufficient' : 'ok'
            };
        }).filter((a: any) => a.status === 'insufficient');
    }, [formData.appliedProducts, products]);

    const hasStockIssues = stockAlerts.length > 0;

    const selectedPlot = plots.find(p => p.id === parseInt(formData.plotId));

    useEffect(() => {
        if (selectedPlot && !formData.areaApplied) {
            setFormData((prev: any) => ({ ...prev, areaApplied: selectedPlot.area.toString() }));
        }
    }, [formData.plotId, selectedPlot]);

    const handleAddProductToMix = () => {
        const product = products.find(p => p.id === parseInt(currentProduct.productId));
        if (!product || !currentProduct.dose || !formData.areaApplied) {
            alert("Selecione um produto, defina a dose e a área aplicada.");
            return;
        }

        if (formData.appliedProducts.some((p: any) => p.productId === product.id)) {
            alert("Este produto já foi adicionado à calda.");
            return;
        }

        const area = parseFloat(formData.areaApplied);
        const doseInput = parseFloat(currentProduct.dose);
        const inputUnit = currentProduct.unit || product.unit;

        const normalizedDose = calculateNormalizedQuantity(product, doseInput, inputUnit);
        const totalQty = area * normalizedDose;
        const estimatedCost = totalQty * (product.price || 0);

        const newEntry = {
            productId: product.id,
            productName: product.name,
            dose: doseInput,
            doseUnit: inputUnit,
            normalizedDose: normalizedDose,
            totalQuantity: totalQty,
            unit: product.unit,
            cost: estimatedCost
        };

        setFormData((prev: any) => ({
            ...prev,
            appliedProducts: [...prev.appliedProducts, newEntry]
        }));

        setCurrentProduct({ productId: '', dose: '', unit: '' });
    };

    const removeProductFromMix = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            appliedProducts: prev.appliedProducts.filter((_: any, i: number) => i !== index)
        }));
    };

    const totalApplicationCost = formData.appliedProducts.reduce((acc: number, p: any) => acc + p.cost, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (hasStockIssues && formData.status === 'completed') {
            if (!confirm(`ALERTA: Há produtos com estoque insuficiente. Deseja prosseguir mesmo assim? Isso deixará o estoque negativo.`)) {
                return;
            }
        }

        if (!selectedPlot || formData.appliedProducts.length === 0) {
            alert("Selecione um talhão e adicione pelo menos um produto à calda.");
            return;
        }

        const applicationData = {
            ...formData,
            id: editingApplicationId || Date.now(),
            plotName: selectedPlot.name,
            totalCost: totalApplicationCost,
            areaApplied: parseFloat(formData.areaApplied)
        };

        if (editingApplicationId) {
            const oldApp = fieldApplications.find(a => a.id === editingApplicationId);
            if (oldApp) {
                const oldProds = oldApp.appliedProducts || [];
                const productsChanged = JSON.stringify(oldProds) !== JSON.stringify(formData.appliedProducts);
                const statusChanged = oldApp.status !== formData.status;
                const contextChanged =
                    oldApp.date !== formData.date ||
                    oldApp.operator !== formData.operator ||
                    oldApp.plotId !== formData.plotId ||
                    oldApp.areaApplied !== parseFloat(formData.areaApplied) ||
                    oldApp.sprayVolume !== parseFloat(formData.sprayVolume);

                if (productsChanged || statusChanged || contextChanged) {
                    // 1. REPOSIÇÃO ROBUSTA (UNDO)
                    let updatedProducts = [...products];
                    let updatedMovements = [...stockMovements];

                    const oldMovs = updatedMovements.filter(m => m.appId === oldApp.id);
                    if (oldMovs.length > 0) {
                        oldMovs.forEach(mov => {
                            const pIdx = updatedProducts.findIndex(p => p.id === mov.productId);
                            if (pIdx !== -1) {
                                const p = updatedProducts[pIdx];
                                const stockChange = mov.type === 'out' ? mov.realChange : -mov.realChange;
                                const newStock = p.stock + stockChange;

                                // Recalcula status
                                let newStatus: 'ok' | 'low' | 'critical' = 'ok';
                                const minStock = Number(p.minStock || 0);
                                if (newStock <= minStock) newStatus = 'low';
                                if (newStock <= minStock / 2) newStatus = 'critical';

                                updatedProducts[pIdx] = { ...p, stock: newStock, status: newStatus };
                            }
                        });
                        updatedMovements = updatedMovements.filter(m => m.appId !== oldApp.id);
                    }

                    // 2. NOVA SAÍDA (RE-APPLY) se concluído
                    if (formData.status === 'completed') {
                        formData.appliedProducts.forEach((ap: any) => {
                            const pIdx = updatedProducts.findIndex(p => p.id === ap.productId);
                            if (pIdx !== -1) {
                                const p = updatedProducts[pIdx];
                                const currentStock = p.stock;
                                const newStock = currentStock - ap.totalQuantity;

                                // Recalcula status
                                let newStatus: 'ok' | 'low' | 'critical' = 'ok';
                                const minStock = Number(p.minStock || 0);
                                if (newStock <= minStock) newStatus = 'low';
                                if (newStock <= minStock / 2) newStatus = 'critical';

                                updatedProducts[pIdx] = { ...p, stock: newStock, status: newStatus };

                                // Cria novo movimento
                                const newMov: any = {
                                    id: Date.now() + Math.random(),
                                    productId: p.id,
                                    productName: p.name,
                                    type: 'out',
                                    quantity: ap.dose,
                                    quantityUnit: ap.doseUnit,
                                    realChange: ap.totalQuantity,
                                    date: formData.date + 'T' + new Date().toTimeString().split(' ')[0],
                                    reason: `Edição de Aplicação: ${selectedPlot.name}`,
                                    user: formData.operator || settings.userName,
                                    appId: applicationData.id
                                };
                                updatedMovements = [newMov, ...updatedMovements];
                            }
                        });
                    }

                    // 3. ATUALIZA ESTADOS DE UMA VEZ PARA EVITAR RACE CONDITIONS
                    setProducts(updatedProducts);
                    setStockMovements(updatedMovements);
                }
                setFieldApplications(fieldApplications.map(a => a.id === editingApplicationId ? applicationData : a));
                addActivity('Editou aplicação', `${formData.appliedProducts.length} produtos no ${selectedPlot.name}`);
            }
        } else {
            if (formData.status === 'completed') {
                formData.appliedProducts.forEach((ap: any) => {
                    handleStockAdjustment({
                        productId: ap.productId,
                        type: 'out',
                        quantity: ap.totalQuantity,
                        reason: `Aplicação: ${selectedPlot.name}`,
                        unit: ap.unit,
                        date: formData.date,
                        customUser: formData.operator,
                        appId: applicationData.id
                    });
                });
            }
            setFieldApplications([applicationData, ...fieldApplications]);
            addActivity('Registrou aplicação', `${formData.appliedProducts.length} produtos no ${selectedPlot.name}`);
        }

        setIsFormOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            plotId: '',
            areaApplied: '',
            operator: '',
            equipment: '',
            observations: '',
            target: '',
            sprayVolume: '',
            status: 'completed',
            weather: { temp: '', humidity: '', wind: '' },
            appliedProducts: []
        });
        setCurrentProduct({ productId: '', dose: '', unit: '' });
        setEditingApplicationId(null);
    };

    const cloneApplication = (app: any) => {
        setEditingApplicationId(null);
        setFormData({
            ...app,
            id: undefined,
            date: new Date().toISOString().split('T')[0],
            appliedProducts: app.products || app.appliedProducts || []
        });
        setIsFormOpen(true);
    };

    const editApplication = (app: any) => {
        setEditingApplicationId(app.id);
        setFormData({
            ...app,
            appliedProducts: app.products || app.appliedProducts || []
        });
        setIsFormOpen(true);
    };

    const deleteApplication = (app: any) => {
        if (confirm('Deseja realmente excluir esta aplicação? REPOR ESTOQUE?')) {
            const oldMovements = stockMovements.filter(m => m.appId === app.id);
            if (oldMovements.length > 0) {
                const updatedProducts = products.map(p => {
                    const pMovs = oldMovements.filter(m => m.productId === p.id);
                    if (pMovs.length === 0) return p;

                    let newStock = p.stock;
                    pMovs.forEach(mov => {
                        newStock += (mov.type === 'out' ? mov.realChange : -mov.realChange);
                    });

                    // Recalcula status
                    let newStatus: 'ok' | 'low' | 'critical' = 'ok';
                    const minStock = Number(p.minStock || 0);
                    if (newStock <= minStock) newStatus = 'low';
                    if (newStock <= minStock / 2) newStatus = 'critical';

                    return { ...p, stock: newStock, status: newStatus };
                });

                setProducts(updatedProducts);
                setStockMovements(stockMovements.filter(m => m.appId !== app.id));
            }
            setFieldApplications(fieldApplications.filter(a => a.id !== app.id));
            addActivity('Excluiu aplicação', `Aplicação no ${app.plotName} removida e estoque reposto`);
        }
    };

    const filteredApplications = fieldApplications.filter(app => {
        const matchesSearch =
            app.plotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.operator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.appliedProducts || []).some((p: any) => p.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            app.target?.toLowerCase().includes(searchTerm.toLowerCase());

        const appDate = new Date(app.date);
        const matchesStart = !dateFilter.start || appDate >= new Date(dateFilter.start);
        const matchesEnd = !dateFilter.end || appDate <= new Date(dateFilter.end);

        const matchesStatus = advancedFilters.status === 'all' || app.status === advancedFilters.status;
        const matchesPlot = advancedFilters.plotId === 'all' || app.plotId.toString() === advancedFilters.plotId;
        const matchesOperator = advancedFilters.operator === 'all' || app.operator === advancedFilters.operator;
        const matchesProduct = advancedFilters.productId === 'all' || (app.appliedProducts || []).some((p: any) => p.productId.toString() === advancedFilters.productId);

        return matchesSearch && matchesStart && matchesEnd && matchesStatus && matchesPlot && matchesOperator && matchesProduct;
    });

    // --- SENTINEL TELEMETRY CALCULATIONS ---
    const telemetry = useMemo(() => {
        const now = new Date();
        const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Monthly Investment
        const monthlyInv = fieldApplications
            .filter(app => new Date(app.date) >= firstDayMonth && app.status === 'completed')
            .reduce((acc, app) => acc + (app.totalCost || 0), 0);

        // 2. Area Coverage (Unique plots applied this month)
        const uniquePlotsThisMonth = new Set(
            fieldApplications
                .filter(app => new Date(app.date) >= firstDayMonth && app.status === 'completed')
                .map(app => app.plotId)
        );
        const totalFarmArea = properties.reduce((acc, p) => acc + (p.totalArea || 0), 0);
        const coveredArea = plots
            .filter(p => uniquePlotsThisMonth.has(p.id))
            .reduce((acc, p) => acc + (p.area || 0), 0);
        const coveragePercent = totalFarmArea > 0 ? (coveredArea / totalFarmArea) * 100 : 0;

        // 3. Next 48h Missions
        const fortyEightHours = 48 * 60 * 60 * 1000;
        const nextMissions = fieldApplications.filter(app => {
            const appDate = new Date(app.date);
            const diff = appDate.getTime() - now.getTime();
            return app.status === 'planned' && diff > 0 && diff <= fortyEightHours;
        }).length;

        return { monthlyInv, coveragePercent, nextMissions };
    }, [fieldApplications, properties, plots]);

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col overflow-y-auto pr-2 pb-8">
            <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Sprout className="text-cyan-400" /> CONTROLE DE MISSÃO <span className="text-slate-500 font-light">| APLICAÇÕES</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 ml-9">Sistema de Integridade Operacional e Defesa de Cultivo</p>
                </div>
                <button
                    onClick={() => {
                        setIsFormOpen(true);
                        setEditingApplicationId(null);
                        resetForm();
                    }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-cyan-950 px-6 py-3 rounded-md font-black flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 border-b-4 border-cyan-700"
                >
                    <Plus size={18} />
                    <span className="uppercase text-xs tracking-widest">Inicia Protocolo</span>
                </button>
            </div>

            {/* PROTOCOLO SENTINEL: DASHBOARD DE TELEMETRIA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-900 p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={40} className="text-cyan-500" />
                    </div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Investimento Mensal (Aplicações)</p>
                    <h4 className="text-2xl font-black text-white font-mono">{formatCurrency(telemetry.monthlyInv, settings.currency)}</h4>
                    <div className="mt-2 w-full h-[2px] bg-slate-900">
                        <div className="h-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]" style={{ width: '65%' }} />
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <LandPlot size={40} className="text-emerald-500" />
                    </div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Cobertura de Defesa (Área Total)</p>
                    <h4 className="text-2xl font-black text-white font-mono">{telemetry.coveragePercent.toFixed(1)}% <span className="text-[10px] text-slate-500 font-sans tracking-normal uppercase">Protegida</span></h4>
                    <div className="mt-2 w-full h-[2px] bg-slate-900">
                        <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: `${telemetry.coveragePercent}%` }} />
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={40} className="text-orange-500" />
                    </div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Missões em Standby (48H)</p>
                    <h4 className="text-2xl font-black text-white font-mono">{telemetry.nextMissions.toString().padStart(2, '0')} <span className="text-[10px] text-slate-500 font-sans tracking-normal uppercase">Alvos</span></h4>
                    <div className="mt-2 w-full h-[2px] bg-slate-900">
                        <div className={`h-full ${telemetry.nextMissions > 0 ? 'bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse' : 'bg-slate-800'}`} style={{ width: telemetry.nextMissions > 0 ? '100%' : '0%' }} />
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsFormOpen(false)} />

                    <Card variant="highlight" className="w-full max-w-[95vw] lg:max-w-7xl relative z-10 shadow-2xl border-cyan-500/30 !scale-100 !hover:scale-100 max-h-[95vh] overflow-hidden flex flex-col bg-slate-950 border-0 rounded-none" style={{ transform: 'none' }}>

                        {/* Protocol Integrity Bar */}
                        <div className="w-full h-1 bg-slate-900 overflow-hidden">
                            <div className={`h-full transition-all duration-700 ${hasStockIssues ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} style={{ width: formData.plotId && formData.appliedProducts.length > 0 ? '100%' : '33%' }} />
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${hasStockIssues ? 'bg-orange-500 animate-pulse shadow-[0_0_10px_#f97316]' : 'bg-cyan-500 shadow-[0_0_10px_#22d3ee]'}`} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">{editingApplicationId ? 'Atualização de Protocolo' : 'Novo Protocolo de Aplicação'}</h3>
                                    </div>
                                    <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Section 1: Logistics */}
                                    <div className="lg:col-span-3 space-y-6">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-cyan-400" /> Identificação e Local
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter ml-1">Data da Missão</label>
                                                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-sm font-bold" />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter ml-1">Zona Tática (Talhão)</label>
                                                <select
                                                    required
                                                    value={formData.plotId}
                                                    onChange={e => setFormData({ ...formData, plotId: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-sm font-bold"
                                                >
                                                    <option value="">Selecione o Talhão...</option>
                                                    {properties.map(prop => (
                                                        <optgroup key={prop.id} label={prop.name.toUpperCase()}>
                                                            {plots.filter(p => p.propertyId === prop.id).map(plot => (
                                                                <option key={plot.id} value={plot.id}>{plot.name} ({plot.area} ha)</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter ml-1">Alvo / Objetivo</label>
                                                <input placeholder="Ex: Controle de Pragas, Dessecação" value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-sm font-bold" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter ml-1">Área Aplicada</label>
                                                    <div className="relative">
                                                        <input type="number" step="0.01" required placeholder="0.00" value={formData.areaApplied} onChange={e => setFormData({ ...formData, areaApplied: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-sm font-bold" />
                                                        <span className="absolute right-3 top-2 text-[10px] text-slate-600 font-black">HA</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter ml-1">Status</label>
                                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-2 text-white outline-none focus:border-cyan-500 text-sm font-bold">
                                                        <option value="completed">Concluída</option>
                                                        <option value="planned">Planejada</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Tank Mix (HUD) */}
                                    <div className="lg:col-span-6 space-y-6">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Droplets size={14} className="text-cyan-400" /> Integridade da Calda (HUD)
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="bg-slate-900 p-4 border border-slate-800 space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Volume de Calda (L/HA)</label>
                                                        <input type="number" placeholder="Volume L/ha" value={formData.sprayVolume} onChange={e => setFormData({ ...formData, sprayVolume: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-sm font-bold" />
                                                    </div>

                                                    <div className="pt-4 border-t border-slate-800 space-y-3">
                                                        <label className="text-[10px] text-cyan-500 font-black uppercase tracking-widest flex items-center gap-2">
                                                            <Plus size={12} /> Adicionar Componente
                                                        </label>
                                                        <select value={currentProduct.productId} onChange={e => setCurrentProduct({ ...currentProduct, productId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-xs font-bold">
                                                            <option value="">Selecione o Produto...</option>
                                                            {products.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()} (STK: {p.stock.toFixed(2)})</option>)}
                                                        </select>

                                                        <div className="flex gap-2">
                                                            <div className="flex-[2]">
                                                                <input type="number" step="0.001" placeholder="Dose/ha" value={currentProduct.dose} onChange={e => setCurrentProduct({ ...currentProduct, dose: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-sm px-4 py-2 text-xs text-white outline-none focus:border-cyan-500 font-bold" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <select className="w-full bg-slate-950 border border-slate-800 rounded-sm px-2 py-2 text-[10px] text-white outline-none focus:border-cyan-500 font-black" value={currentProduct.unit || (products.find(p => p.id === parseInt(currentProduct.productId))?.unit || '')} onChange={e => setCurrentProduct({ ...currentProduct, unit: e.target.value })}>
                                                                    <option value="L">L</option><option value="ml">ML</option><option value="kg">KG</option><option value="g">G</option><option value="un">UN</option>
                                                                </select>
                                                            </div>
                                                            <button type="button" onClick={handleAddProductToMix} disabled={!currentProduct.productId || !currentProduct.dose} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white p-2 rounded-sm transition-all"><Plus size={20} /></button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {formData.appliedProducts.map((p: any, i: number) => {
                                                        const pAlert = stockAlerts.find((a: any) => a.id === p.productId);
                                                        return (
                                                            <div key={i} className={`flex items-center justify-between p-3 border-l-4 ${pAlert ? 'bg-orange-500/5 border-orange-500' : 'bg-slate-900 border-cyan-500'}`}>
                                                                <div className="flex-1 min-w-0 mr-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-[10px] font-black text-white uppercase truncate">{p.productName}</p>
                                                                        {pAlert && <ShieldAlert size={10} className="text-orange-500 animate-pulse" />}
                                                                    </div>
                                                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{p.dose} {p.doseUnit}/ha • TOT: {p.totalQuantity.toFixed(2)} {p.unit}</p>
                                                                </div>
                                                                <button type="button" onClick={() => removeProductFromMix(i)} className="text-slate-600 hover:text-white p-1 transition-colors"><Trash2 size={14} /></button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="flex flex-col h-full">
                                                <TankHUD
                                                    products={formData.appliedProducts}
                                                    area={parseFloat(formData.areaApplied)}
                                                    sprayVolume={parseFloat(formData.sprayVolume)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Personnel & Weather */}
                                    <div className="lg:col-span-3 space-y-6">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Activity size={14} className="text-cyan-400" /> Operação e Inteligência
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="space-y-1 text-right">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mr-1">Operador / Piloto</label>
                                                <select value={formData.operator} onChange={e => setFormData({ ...formData, operator: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-sm font-bold appearance-none">
                                                    <option value="">Escolher Operador...</option>
                                                    {collaborators.map(c => <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter ml-1">Ativo (Equipamento)</label>
                                                <input placeholder="Ex: Unidade JD-2000" value={formData.equipment} onChange={e => setFormData({ ...formData, equipment: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-sm font-bold" />
                                            </div>

                                            <div className="bg-slate-900 p-4 border border-slate-800 grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-slate-500 font-black uppercase flex items-center gap-1"><Thermometer size={10} className="text-orange-400" /> Temp. Ar (°C)</label>
                                                    <input type="number" value={formData.weather.temp} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, temp: e.target.value } })} className="w-full bg-slate-950 border border-slate-700 rounded-none px-3 py-1.5 text-xs text-white outline-none font-black" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-slate-500 font-black uppercase flex items-center gap-1"><Droplet size={10} className="text-cyan-400" /> Umidade (%)</label>
                                                    <input type="number" value={formData.weather.humidity} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, humidity: e.target.value } })} className="w-full bg-slate-950 border border-slate-700 rounded-none px-3 py-1.5 text-xs text-white outline-none font-black" />
                                                </div>
                                                <div className="space-y-1 col-span-2">
                                                    <label className="text-[9px] text-slate-500 font-black uppercase flex items-center gap-1"><Wind size={10} className="text-white" /> Vento (km/h)</label>
                                                    <input type="number" value={formData.weather.wind} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, wind: e.target.value } })} className="w-full bg-slate-950 border border-slate-700 rounded-none px-3 py-1.5 text-xs text-white outline-none font-black" />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-tighter ml-1">Log da Missão / Notas</label>
                                                <textarea rows={2} value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-sm px-4 py-2 text-white outline-none focus:border-cyan-500 text-[10px] uppercase font-bold" placeholder="Descrever anomalias operacionais..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {hasStockIssues && (
                                    <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 flex items-center gap-4 animate-pulse">
                                        <AlertCircle className="text-orange-500" />
                                        <div>
                                            <p className="text-[10px] font-black text-orange-500 uppercase">Falha de Integridade de Estoque Detectada</p>
                                            <p className="text-[9px] text-orange-500/70 font-bold uppercase">Um ou mais componentes excedem a capacidade atual do silo.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-800 flex justify-between items-center bg-slate-950 sticky bottom-0 z-20">
                                    <div className="text-left">
                                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Alocação Estimada de Recursos</p>
                                        <p className="text-3xl font-black text-cyan-400 font-mono tracking-tighter">{formatCurrency(totalApplicationCost, settings.currency)}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-4 rounded-sm bg-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all">Abortar</button>
                                        <button
                                            type="submit"
                                            className={`${hasStockIssues ? 'bg-orange-500 hover:bg-orange-400 text-orange-950' : 'bg-cyan-500 hover:bg-cyan-400 text-cyan-950'} px-10 py-4 rounded-sm font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95 border-b-4 ${hasStockIssues ? 'border-orange-700' : 'border-cyan-700'}`}
                                        >
                                            <Zap size={14} className="inline mr-2" />
                                            {editingApplicationId ? 'Confirmar Atualização' : 'Inicializar Implantação'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Application Feed */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-2 px-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            placeholder="PESQUISAR APLICAÇÕES (TALHÃO, OPERADOR, PRODUTO)..."
                            className="w-full bg-slate-900 border border-slate-800 py-3 pl-12 pr-4 rounded-xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-cyan-500 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setAdvancedFilters(prev => ({ ...prev, status: 'all' }))}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${advancedFilters.status === 'all' ? 'bg-cyan-500 text-cyan-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setAdvancedFilters(prev => ({ ...prev, status: 'completed' }))}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${advancedFilters.status === 'completed' ? 'bg-cyan-500 text-cyan-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Deployed
                            </button>
                            <button
                                onClick={() => setAdvancedFilters(prev => ({ ...prev, status: 'planned' }))}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${advancedFilters.status === 'planned' ? 'bg-orange-500 text-orange-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Standby
                            </button>
                        </div>

                        <button
                            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            className={`p-3 rounded-xl border transition-all ${isFilterPanelOpen ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* ADVANCED SCANNER PANEL */}
                {isFilterPanelOpen && (
                    <div className="bg-slate-950 border border-slate-900 p-6 mx-2 mb-6 animate-in slide-in-from-top-4 duration-300 flex flex-wrap gap-6 items-end shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />

                        <div className="space-y-2 min-w-[200px]">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 pointer-events-none">
                                <MapPin size={10} /> Escanear Zona (Talhão)
                            </label>
                            <select
                                value={advancedFilters.plotId}
                                onChange={e => setAdvancedFilters(prev => ({ ...prev, plotId: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-500"
                            >
                                <option value="all">TODAS AS ZONAS</option>
                                {properties.map(prop => (
                                    <optgroup key={prop.id} label={prop.name.toUpperCase()}>
                                        {plots.filter(p => p.propertyId === prop.id).map(plot => (
                                            <option key={plot.id} value={plot.id}>{plot.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 min-w-[200px]">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 pointer-events-none">
                                <User size={10} /> Filtrar Operador
                            </label>
                            <select
                                value={advancedFilters.operator}
                                onChange={e => setAdvancedFilters(prev => ({ ...prev, operator: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-500"
                            >
                                <option value="all">TODOS OS OPERADORES</option>
                                {Array.from(new Set(fieldApplications.map(app => app.operator))).filter(Boolean).map(op => (
                                    <option key={op} value={op}>{op?.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 min-w-[200px]">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 pointer-events-none">
                                <Droplets size={10} /> Componente Ativo
                            </label>
                            <select
                                value={advancedFilters.productId}
                                onChange={e => setAdvancedFilters(prev => ({ ...prev, productId: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-2 text-[10px] font-black uppercase text-white outline-none focus:border-cyan-500"
                            >
                                <option value="all">TODOS OS PRODUTOS</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2 ml-auto">
                            <button
                                onClick={() => {
                                    setAdvancedFilters({ status: 'all', plotId: 'all', productId: 'all', operator: 'all' });
                                    setSearchTerm('');
                                    setDateFilter({ start: '', end: '' });
                                }}
                                className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors border border-transparent hover:border-slate-800 rounded"
                            >
                                Reset Scanner
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {filteredApplications.length === 0 ? (
                        <div className="text-center py-24 bg-slate-900/10 rounded-3xl border-2 border-dashed border-slate-800/50">
                            <Info size={48} className="mx-auto text-slate-800 mb-4" />
                            <p className="text-slate-600 font-black uppercase tracking-widest">Nenhum Protocolo Ativo Encontrado</p>
                        </div>
                    ) : (
                        filteredApplications.map((app, idx) => (
                            <div key={app.id} className="group relative bg-slate-950 border border-slate-900 hover:border-cyan-500/50 p-6 transition-all duration-300 overflow-hidden" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[80px] group-hover:bg-cyan-500/10 transition-all" />

                                <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Local do Deployment</span>
                                                <h4 className="font-black text-white text-xl tracking-tight">{app.plotName.toUpperCase()}</h4>
                                            </div>
                                            <div className="h-10 w-[1px] bg-slate-800" />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Carimbo Temporal</span>
                                                <span className="text-sm font-black text-cyan-400 flex items-center gap-1"><Calendar size={12} /> {new Date(app.date).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <div className="ml-auto">
                                                <span className={`px-4 py-1 rounded-none text-[8px] font-black uppercase tracking-widest border ${app.status === 'completed' ? 'bg-cyan-500/5 text-cyan-400 border-cyan-500/30' : 'bg-orange-500/5 text-orange-400 border-orange-500/30'}`}>
                                                    {app.status === 'completed' ? 'ATIVO / DEPLOYED' : 'PLANEJADO / STBY'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-y border-slate-900">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Área de Superfície</p>
                                                <p className="text-xs font-bold text-slate-200 flex items-center gap-2"><LandPlot size={14} className="text-slate-600" /> {app.areaApplied} HA</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Op. Autorizado</p>
                                                <p className="text-xs font-bold text-slate-200 flex items-center gap-2"><User size={14} className="text-slate-600" /> {app.operator?.toUpperCase() || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ativo Tático</p>
                                                <p className="text-xs font-bold text-slate-200 flex items-center gap-2"><Zap size={14} className="text-slate-600" /> {app.equipment?.toUpperCase() || 'PADRÃO'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Condição Climática</p>
                                                <p className="text-xs font-bold text-slate-200 flex items-center gap-2"><Thermometer size={14} className="text-slate-600" /> {app.weather?.temp || '--'}°C / {app.weather?.humidity || '--'} %</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {(app.appliedProducts || []).map((p: any, i: number) => (
                                                <div key={i} className="bg-slate-900 px-3 py-2 rounded-sm border border-slate-800 text-[10px] group-hover:border-cyan-500/20 transition-all">
                                                    <span className="text-slate-500 font-black uppercase mr-2">{p.productName}</span>
                                                    <span className="text-cyan-400 font-black">{p.dose} {p.doseUnit}/HA</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col justify-between items-end gap-6 min-w-[200px]">
                                        <div className="text-right">
                                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Custo de Recursos</p>
                                            <p className="text-3xl font-black text-white font-mono tracking-tighter">{formatCurrency(app.totalCost, settings.currency)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => cloneApplication(app)} className="p-3 bg-slate-900 text-slate-500 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 transition-all grayscale hover:grayscale-0" title="DUPLICAR MISSÃO"><Copy size={16} /></button>
                                            <button onClick={() => editApplication(app)} className="p-3 bg-slate-900 text-slate-500 hover:text-white border border-slate-800 hover:border-slate-700 transition-all" title="RECONFIGURAR"><Edit size={16} /></button>
                                            <button onClick={() => deleteApplication(app)} className="p-3 bg-slate-900 text-slate-500 hover:text-rose-500 border border-slate-800 hover:border-rose-500/30 transition-all font-black" title="EXPURGAR MISSÃO"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
