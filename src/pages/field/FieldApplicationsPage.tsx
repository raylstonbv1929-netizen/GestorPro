import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Sprout, X, Edit, Plus, LandPlot, Activity, DollarSign, Search,
    Calendar, Filter, MapPin, Droplets, AlertCircle, Trash2, Copy,
    Clock, User, Wind, Thermometer, Droplet, ClipboardList, Gauge,
    ShieldCheck, ShieldAlert, Zap, Info, ArrowRight, CheckCircle2,
    TrendingUp, Star, RefreshCw, MessageSquare, Layers, Terminal, Loader2, Target
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatCurrency, formatNumber } from '../../utils/format';

// --- SUB-COMPONENTS ---

const TankHUD = ({ products, area, sprayVolume = 0 }: { products: any[], area: number, sprayVolume?: number }) => {
    const areaVal = isNaN(area) ? 0 : area;
    const sprayVal = isNaN(sprayVolume) ? 0 : sprayVolume;
    const totalVolume = sprayVal * areaVal;

    return (
        <div className="flex flex-col h-full bg-slate-950/40 rounded-[2rem] border border-slate-900 p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 z-20" />

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2 italic">
                        <Gauge size={14} /> Monitoramento de Calda
                    </h4>
                    <p className="text-3xl font-black text-white italic tracking-tighter">
                        {totalVolume.toFixed(0)} <span className="text-xs text-slate-600 font-black uppercase not-italic ml-2 tracking-widest">Litros Totais</span>
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-right">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Vazão (Volume)</p>
                    <p className="text-xs font-black text-cyan-400 italic font-mono">{sprayVolume} L/HA</p>
                </div>
            </div>

            <div className="relative flex-1 min-h-[300px] bg-slate-950/80 rounded-[1.5rem] border border-slate-900 overflow-hidden flex flex-col-reverse shadow-inner">
                <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/20 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] italic">Sistema Pronto</span>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 italic">
                        <Droplets size={48} className="text-cyan-500 mb-4 animate-bounce" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Aguardando Insumos...</span>
                    </div>
                ) : (
                    products.map((p: any, idx: number) => {
                        const height = Math.max(10, 100 / products.length);
                        const colors = [
                            'from-cyan-500/30 to-cyan-700/10',
                            'from-emerald-500/30 to-emerald-700/10',
                            'from-blue-500/30 to-blue-700/10',
                            'from-sky-500/30 to-sky-700/10'
                        ];
                        const color = colors[idx % colors.length];

                        return (
                            <div
                                key={idx}
                                className={`w-full bg-gradient-to-t ${color} border-t border-slate-800 transition-all duration-1000 relative group/layer`}
                                style={{ height: `${height}%` }}
                            >
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/layer:opacity-100 transition-opacity" />
                                <div className="flex justify-between w-full h-full items-center px-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic truncate max-w-[150px]">{p.productName}</span>
                                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{p.dose} {p.doseUnit}/HA</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-white font-mono italic">{p.totalQuantity.toFixed(2)}</span>
                                        <span className="text-[9px] text-slate-500 font-black ml-1 uppercase">{p.unit}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Tactical Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="h-full w-full grid grid-rows-10">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className={`border-t border-slate-400 ${i === 5 ? 'border-t-2 opacity-40' : ''}`} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 items-center justify-center">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Extensão Territorial</p>
                    <p className="text-lg font-black text-white italic tracking-tighter">{area || 0} <span className="text-[10px] text-slate-600 uppercase not-italic">HA</span></p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 items-center justify-center">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Matriz de Insumos</p>
                    <p className="text-lg font-black text-white italic tracking-tighter">{products.length} <span className="text-[10px] text-slate-600 uppercase not-italic">ITENS</span></p>
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const productSelectRef = useRef<HTMLSelectElement>(null);
    const doseInputRef = useRef<HTMLInputElement>(null);
    const plotSelectRef = useRef<HTMLSelectElement>(null);

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
        if (isFormOpen) {
            document.body.style.overflow = 'hidden';
            // Auto-focus logic
            setTimeout(() => {
                if (editingApplicationId) {
                    productSelectRef.current?.focus();
                } else {
                    plotSelectRef.current?.focus();
                }
            }, 100);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFormOpen, editingApplicationId]);

    // Shortcuts Logic
    useEffect(() => {
        if (!isFormOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFormOpen(false);
            }
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
            }
            if (e.altKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                setFormData((prev: any) => ({
                    ...prev,
                    status: prev.status === 'completed' ? 'planned' : 'completed'
                }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFormOpen, formData, editingApplicationId]);

    // Auto-unit filling
    useEffect(() => {
        if (currentProduct.productId) {
            const product = products.find(p => p.id === parseInt(currentProduct.productId));
            if (product && !currentProduct.unit) {
                setCurrentProduct(prev => ({ ...prev, unit: product.unit }));
            }
        }
    }, [currentProduct.productId, products]);

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

        // Return focus to product selection for next item
        setTimeout(() => productSelectRef.current?.focus(), 50);
    };

    const removeProductFromMix = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            appliedProducts: prev.appliedProducts.filter((_: any, i: number) => i !== index)
        }));
    };

    const totalApplicationCost = formData.appliedProducts.reduce((acc: number, p: any) => acc + p.cost, 0);

    const handleSubmit = (e: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isSubmitting) return;

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
                            updatedProducts[pIdx] = { ...p, stock: newStock };
                        }
                    });
                    updatedMovements = updatedMovements.filter(m => m.appId !== oldApp.id);
                }

                if (formData.status === 'completed') {
                    formData.appliedProducts.forEach((ap: any) => {
                        const pIdx = updatedProducts.findIndex(p => p.id === ap.productId);
                        if (pIdx !== -1) {
                            const p = updatedProducts[pIdx];
                            const newStock = p.stock - ap.totalQuantity;
                            updatedProducts[pIdx] = { ...p, stock: newStock };
                            const newMov: any = {
                                id: Date.now() + Math.random(),
                                productId: p.id,
                                productName: p.name,
                                type: 'out',
                                quantity: ap.dose,
                                quantityUnit: ap.doseUnit,
                                realChange: ap.totalQuantity,
                                date: formData.date + 'T' + new Date().toTimeString().split(' ')[0],
                                reason: `Retificação Técnica: ${selectedPlot.name}`,
                                user: formData.operator || settings.userName || 'SISTEMA',
                                appId: applicationData.id
                            };
                            updatedMovements = [newMov, ...updatedMovements];
                        }
                    });
                }

                setProducts(updatedProducts);
                setStockMovements(updatedMovements);
                setFieldApplications(fieldApplications.map(a => a.id === editingApplicationId ? applicationData : a));
                addActivity('Retificou missão de defesa', `${selectedPlot.name}`, 'neutral');
            }
        } else {
            if (formData.status === 'completed') {
                formData.appliedProducts.forEach((ap: any) => {
                    handleStockAdjustment({
                        productId: ap.productId,
                        type: 'out',
                        quantity: ap.totalQuantity,
                        reason: `Execução Defesa: ${selectedPlot.name}`,
                        unit: ap.unit,
                        date: formData.date,
                        customUser: formData.operator,
                        appId: applicationData.id
                    });
                });
            }
            setFieldApplications([applicationData, ...fieldApplications]);
            addActivity('Homologou missão de defesa', `${selectedPlot.name}`, 'neutral');
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsFormOpen(false);
            resetForm();
            setIsSubmitting(false);
        }, 500);
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
        setIsSubmitting(false);
    };

    const cloneApplication = (app: any) => {
        setEditingApplicationId(null);
        setFormData({
            ...app,
            id: undefined,
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
        if (confirm('DESATIVAR MISSÃO: Deseja apagar registro e repor estoque técnico?')) {
            const oldMovements = stockMovements.filter(m => m.appId === app.id);
            if (oldMovements.length > 0) {
                const updatedProducts = products.map(p => {
                    const pMovs = oldMovements.filter(m => m.productId === p.id);
                    if (pMovs.length === 0) return p;
                    let newStock = p.stock;
                    pMovs.forEach(mov => { newStock += mov.realChange; });
                    return { ...p, stock: newStock };
                });
                setProducts(updatedProducts);
                setStockMovements(stockMovements.filter(m => m.appId !== app.id));
            }
            setFieldApplications(fieldApplications.filter(a => a.id !== app.id));
            addActivity('Desativou missão de defesa', `${app.plotName}`, 'neutral');
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

    const telemetry = useMemo(() => {
        const now = new Date();
        const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyInv = fieldApplications
            .filter(app => new Date(app.date) >= firstDayMonth && app.status === 'completed')
            .reduce((acc, app) => acc + (app.totalCost || 0), 0);
        const uniquePlotsThisMonth = new Set(fieldApplications.filter(app => new Date(app.date) >= firstDayMonth && app.status === 'completed').map(app => app.plotId));
        const totalFarmArea = properties.reduce((acc, p) => acc + (p.totalArea || 0), 0);
        const coveredArea = plots.filter(p => uniquePlotsThisMonth.has(p.id)).reduce((acc, p) => acc + (p.area || 0), 0);
        const coveragePercent = totalFarmArea > 0 ? (coveredArea / totalFarmArea) * 100 : 0;
        const nextMissions = fieldApplications.filter(app => {
            const appDate = new Date(app.date);
            const diff = appDate.getTime() - now.getTime();
            return app.status === 'planned' && diff > 0 && diff <= 48 * 60 * 60 * 1000;
        }).length;
        return { monthlyInv, coveragePercent, nextMissions };
    }, [fieldApplications, properties, plots]);

    return (
        <>
            <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
                {/* FIELD SENTINEL COMMAND CENTER */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500 z-20" />

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shadow-lg shadow-cyan-500/10 relative overflow-hidden group/icon">
                            <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover/icon:opacity-20 transition-opacity" />
                            <Sprout size={32} strokeWidth={2.5} className="relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                                Controle de Missão <span className="text-slate-500 font-light">| Defesa</span>
                            </h2>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                                Integridade Operacional e Vetores de Cultivo
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 relative z-10 lg:w-auto w-full">
                        <button
                            onClick={() => { resetForm(); setEditingApplicationId(null); setIsFormOpen(true); }}
                            className="flex-1 lg:flex-none bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-cyan-800 italic"
                        >
                            <Plus size={20} /> Iniciar Protocolo
                        </button>
                        <button
                            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            className={`p-5 rounded-2xl border transition-all ${isFilterPanelOpen ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white group-hover:border-slate-700'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* TELEMETRY MATRIX */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Investimento Mensal', value: formatCurrency(telemetry.monthlyInv, settings.currency), icon: DollarSign, color: 'sky', code: 'FIN_DEF' },
                        { label: 'Cobertura de Defesa', value: telemetry.coveragePercent.toFixed(1), unit: '%', icon: LandPlot, color: 'emerald', code: 'GEO_DEF' },
                        { label: 'Missões em Standby', value: telemetry.nextMissions.toString().padStart(2, '0'), unit: 'ALVOS', icon: Clock, color: 'orange', code: 'OP_DEF' }
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
                                    <div className={`h-full bg-${item.color}-500 shadow-[0_0_8px] shadow-${item.color}-500`} style={{ width: idx === 1 ? `${item.value}%` : idx === 2 && item.value === '00' ? '5%' : '80%' }} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* SCANNER PANEL */}
                {isFilterPanelOpen && (
                    <div className="bg-slate-950/80 border border-slate-900 p-8 rounded-[2.5rem] mb-6 animate-in slide-in-from-top-4 duration-500 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/50 z-20" />

                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                <Search size={12} className="text-cyan-500" /> Scanner de Varredura Operacional
                            </label>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                                <div className="lg:col-span-8">
                                    <div className="relative group h-full">
                                        <input
                                            type="text"
                                            placeholder="FILTRAR POR TALHÃO, OPERADOR OU INSUMO..."
                                            className="w-full h-full bg-slate-900/50 border border-slate-800 py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-cyan-500/50 transition-all italic placeholder:text-slate-800 shadow-inner"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                                            <Zap size={16} className="text-cyan-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 flex gap-2 h-full">
                                    {['all', 'completed', 'planned'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setAdvancedFilters(prev => ({ ...prev, status: s }))}
                                            className={`flex-1 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex items-center justify-center ${advancedFilters.status === s ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200'}`}
                                        >
                                            {s === 'all' ? 'Ver Tudo' : s === 'completed' ? 'Executed' : 'Planned'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* APPLICATION GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                    {filteredApplications.map(app => (
                        <Card key={app.id} variant="glass" className="group p-0 border-slate-800/60 hover:border-cyan-500/40 transition-all duration-500 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative shadow-xl">
                            <div className="absolute top-0 right-0 p-6 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => cloneApplication(app)} className="text-slate-700 hover:text-cyan-400 transition-colors" title="Clonar Missão"><Copy size={16} /></button>
                                <button onClick={() => deleteApplication(app)} className="text-slate-700 hover:text-rose-500 transition-colors" title="Abortar Registro"><Trash2 size={16} /></button>
                            </div>

                            <div className={`h-1.5 w-full ${app.status === 'planned' ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />

                            <div className="p-8">
                                <div className="flex items-start gap-5 mb-8">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-cyan-950 transition-all duration-500 shadow-xl font-black italic">
                                        {app.plotName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-white text-lg uppercase tracking-tighter italic leading-none truncate group-hover:text-cyan-300 transition-colors">{app.plotName}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2.5 py-1 bg-slate-900 rounded-lg text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] border border-slate-800 italic">{app.target || 'DEFESA_GERAL'}</span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]'}`}>
                                                {app.status === 'completed' ? 'MISSÃO_CUMPRIDA' : 'EM_STANDBY'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-px bg-slate-800/40 border border-slate-800/40 rounded-2xl overflow-hidden">
                                        <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic flex items-center gap-1.5"><Calendar size={10} /> Data Alvo</p>
                                            <p className="text-[11px] font-black text-white italic">{app.date.split('-').reverse().join('/')}</p>
                                        </div>
                                        <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic flex items-center gap-1.5"><User size={10} /> Operador</p>
                                            <p className="text-[11px] font-black text-white uppercase truncate italic">{app.operator || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 p-4 rounded-[1.25rem] border border-slate-900 group-hover:border-cyan-500/20 transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-2"><Droplets size={12} className="text-cyan-800" /> Mix Insumos ({app.appliedProducts?.length || 0})</span>
                                            <span className="text-[11px] font-black text-cyan-500 italic font-mono">{formatCurrency(app.totalCost, settings.currency)}</span>
                                        </div>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {(app.appliedProducts || []).slice(0, 3).map((p: any, i: number) => (
                                                <span key={i} className="px-2 py-0.5 bg-slate-900 text-[8px] text-slate-400 font-black rounded border border-slate-800 uppercase italic transition-colors hover:text-white">{p.productName}</span>
                                            ))}
                                            {(app.appliedProducts?.length || 0) > 3 && <span className="px-2 py-0.5 bg-slate-900 text-[8px] text-slate-600 font-black rounded border border-slate-800 italic">+{app.appliedProducts.length - 3}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto bg-slate-950/50 p-6 border-t border-slate-900 flex justify-between items-center group-hover:bg-slate-900/60 transition-colors">
                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-2">
                                    <Activity size={12} className="text-cyan-800" /> AREA: {app.areaApplied} HA
                                </span>
                                <button
                                    onClick={() => editApplication(app)}
                                    className="px-8 py-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 italic"
                                >
                                    <Terminal size={14} /> DETALHAR_PROTOCOL
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

            </div>

            {/* PROTOCOL MODAL: APLICAÇÃO (INDUSTRIAL DATA-TECH) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[120] flex animate-fade-in font-sans ring-inset">
                    <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />

                    <div className="w-full h-full relative z-10 p-0 overflow-hidden border-0 bg-slate-950 shadow-none flex flex-col">
                        {/* BARRA DE INTEGRIDADE */}
                        <div className="h-1 w-full bg-slate-900 relative">
                            <div className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4] transition-all duration-700" style={{ width: formData.plotId && formData.appliedProducts.length > 0 ? '100%' : '20%' }} />
                        </div>

                        {/* CABEÇALHO DE COMANDO */}
                        <div className="px-8 py-6 border-b border-slate-900 bg-slate-950 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 flex items-center justify-center border transition-all ${hasStockIssues ? 'border-rose-500 text-rose-500 bg-rose-500/5' : 'border-cyan-500/50 text-cyan-400 bg-cyan-500/5'}`}>
                                    <Terminal size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{editingApplicationId ? 'RETIFICAR_PROTOCOLO' : 'NOVA_MISSÃO_OPERACIONAL'}</h3>
                                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse">Sinc_Ativo</span>
                                    </div>
                                    <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Activity size={10} /> SPEEDGRID_KERNEL_V6.1 // SISTEMA_OK
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-700 transition-all active:scale-95"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-1 bg-[#020617] custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">

                                {/* ZONA_01: LOGÍSTICA (VETOR_CRONO) */}
                                <div className="lg:col-span-3 border-r border-slate-900/50 p-8 space-y-8 bg-slate-950/50">
                                    <div className="space-y-6">
                                        <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-3 italic mb-4">
                                            <div className="w-1 h-1 bg-cyan-500" /> SEÇÃO_01: LOGÍSTICA
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-2 group/input">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>DATA_DA_OPERAÇÃO</span>
                                                    <Calendar size={10} className="opacity-30 group-focus-within/input:opacity-100 text-cyan-500" />
                                                </label>
                                                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all [color-scheme:dark]" />
                                            </div>

                                            <div className="space-y-2 group/input">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>TALHÃO_ALVO</span>
                                                    <MapPin size={10} className="opacity-30 group-focus-within/input:opacity-100 text-cyan-500" />
                                                </label>
                                                <select required ref={plotSelectRef} value={formData.plotId} onChange={e => setFormData({ ...formData, plotId: e.target.value })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all appearance-none cursor-pointer uppercase">
                                                    <option value="">SELECIONAR_ALVO</option>
                                                    {properties.map(prop => (
                                                        <optgroup key={prop.id} label={prop.name.toUpperCase()} className="bg-slate-950">
                                                            {plots.filter(p => p.propertyId === prop.id).map(plot => (
                                                                <option key={plot.id} value={plot.id} className="font-mono">{plot.name} [{plot.area}HA]</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2 group/input">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>ÁREA_EFETIVA (HA)</span>
                                                    <LandPlot size={10} className="opacity-30 group-focus-within/input:opacity-100 text-cyan-500" />
                                                </label>
                                                <input type="number" step="0.01" value={formData.areaApplied} onChange={e => setFormData({ ...formData, areaApplied: e.target.value })} placeholder="0.00" className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-900 space-y-4">
                                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">STATUS_DA_MISSÃO</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: 'completed', label: 'EXECUÇÃO_CONCLUÍDA', color: 'cyan' },
                                                { id: 'planned', label: 'FILA_EM_ESPERA', color: 'slate' }
                                            ].map(s => (
                                                <button key={s.id} type="button" onClick={() => setFormData({ ...formData, status: s.id })} className={`py-3 px-4 text-left text-[9px] font-bold uppercase tracking-[0.2em] border transition-all flex items-center justify-between group ${formData.status === s.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900/30 border-slate-900 text-slate-600 hover:text-slate-400 hover:border-slate-800'}`}>
                                                    {s.label}
                                                    <div className={`w-1.5 h-1.5 ${formData.status === s.id ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-800 group-hover:bg-slate-600'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ZONA_02: NÚCLEO_DE_CALDA (SISTEMA_CARGA) */}
                                <div className="lg:col-span-6 p-8 space-y-8 border-r border-slate-900/50">
                                    <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-3 italic mb-4">
                                        <div className="w-1 h-1 bg-cyan-500" /> SEÇÃO_02: MATRIZ_DE_CALDA
                                    </h4>

                                    <div className="grid grid-cols-2 gap-6 bg-slate-950 border border-slate-900 p-6 relative">
                                        <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-cyan-500" />
                                        <div className="space-y-4">
                                            <div className="space-y-1.5 group/input">
                                                <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <Gauge size={10} className="text-cyan-500/30 group-focus-within/input:text-cyan-500" /> VAZÃO (L/HA)
                                                </label>
                                                <input type="number" value={formData.sprayVolume} onChange={e => setFormData({ ...formData, sprayVolume: e.target.value })} placeholder="0.00" className="w-full bg-slate-900 border border-slate-800 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5 group/input">
                                                <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                                    <Target size={10} className="text-cyan-500/30 group-focus-within/input:text-cyan-500" /> ALVO_BIOLÓGICO
                                                </label>
                                                <input value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value.toUpperCase() })} placeholder="EX: FERRUGEM_A" className="w-full bg-slate-900 border border-slate-800 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all italic" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-slate-950 border border-slate-900 p-6 space-y-6">
                                            <div className="grid grid-cols-12 gap-3 items-end">
                                                <div className="col-span-6 space-y-1.5">
                                                    <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1">COMPONENTE_INSUMO</label>
                                                    <select ref={productSelectRef} value={currentProduct.productId} onChange={e => setCurrentProduct({ ...currentProduct, productId: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-none px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/50 transition-all appearance-none uppercase">
                                                        <option value="">SELECIONAR_INSUMO</option>
                                                        {products.map(p => <option key={p.id} value={p.id} className="bg-slate-950 font-mono">{p.name.toUpperCase()} [ESTOQUE:{formatNumber(p.stock)}]</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-3 space-y-1.5">
                                                    <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1">DOSE</label>
                                                    <input
                                                        ref={doseInputRef}
                                                        type="number"
                                                        step="0.001"
                                                        value={currentProduct.dose}
                                                        onChange={e => setCurrentProduct({ ...currentProduct, dose: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddProductToMix();
                                                            }
                                                        }}
                                                        placeholder="0.000"
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <select className="w-full bg-slate-900 border border-slate-800 rounded-none px-3 py-3 text-[9px] font-mono text-white outline-none focus:border-cyan-500/50 appearance-none uppercase" value={currentProduct.unit || (products.find(p => p.id === parseInt(currentProduct.productId))?.unit || '')} onChange={e => setCurrentProduct({ ...currentProduct, unit: e.target.value })}>
                                                        <option value="L">L</option><option value="ml">ML</option><option value="kg">KG</option><option value="g">G</option><option value="un">UN</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-1">
                                                    <button type="button" onClick={handleAddProductToMix} className="w-full aspect-square bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white transition-all flex items-center justify-center active:scale-95 group/btn">
                                                        <Plus size={18} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-950/20 border border-slate-900/50 min-h-[220px] max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                            <div className="space-y-1">
                                                {formData.appliedProducts.map((p: any, i: number) => {
                                                    const pAlert = stockAlerts.find((a: any) => a.id === p.productId);
                                                    return (
                                                        <div key={i} className={`flex items-center justify-between p-3 border-l-2 transition-all ${pAlert ? 'bg-rose-500/5 border-rose-500/50' : 'bg-slate-900/30 border-slate-800 hover:bg-slate-900/60 hover:border-cyan-500/50'}`}>
                                                            <div className="min-w-0 flex-1 grid grid-cols-12 gap-4 items-center">
                                                                <div className="col-span-6 flex items-center gap-3">
                                                                    <div className={`w-1.5 h-1.5 ${pAlert ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-cyan-500/40'}`} />
                                                                    <p className="text-[10px] font-bold text-slate-300 uppercase italic truncate">{p.productName}</p>
                                                                </div>
                                                                <div className="col-span-3 text-right">
                                                                    <p className="text-[9px] font-mono text-slate-500 uppercase">{p.dose} {p.doseUnit}/HA</p>
                                                                </div>
                                                                <div className="col-span-3 text-right">
                                                                    <p className="text-[9px] font-mono text-cyan-400 font-bold uppercase">∑ {p.totalQuantity.toFixed(2)} {p.unit}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-4">
                                                                {pAlert && <ShieldAlert size={12} className="text-rose-500 animate-pulse" />}
                                                                <button type="button" onClick={() => removeProductFromMix(i)} className="p-2 text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={12} /></button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {formData.appliedProducts.length === 0 && (
                                                    <div className="h-[200px] flex flex-col items-center justify-center opacity-20 italic">
                                                        <Layers size={24} className="mb-3 text-slate-600" />
                                                        <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-500 text-center">AGUARDANDO_CARGA_DE_INSUMOS</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ZONA_03: RADAR_DE_INTELIGÊNCIA (COMANDO_METEO) */}
                                <div className="lg:col-span-3 p-8 space-y-8 bg-slate-950/50">
                                    <div className="space-y-6">
                                        <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-3 italic mb-4">
                                            <div className="w-1 h-1 bg-cyan-500" /> SEÇÃO_03: UNIDADE_DE_INTELIGÊNCIA
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-2 group/input">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>OPERADOR_DA_UNIDADE</span>
                                                    <User size={10} className="text-slate-700 group-focus-within/input:text-cyan-500" />
                                                </label>
                                                <select value={formData.operator} onChange={e => setFormData({ ...formData, operator: e.target.value })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all appearance-none uppercase">
                                                    <option value="">ID_NÃO_ATRIBUÍDO</option>
                                                    {collaborators.map(c => <option key={c.id} value={c.name} className="bg-slate-950 font-mono">{c.name.toUpperCase()}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-2 group/input">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>TAG_DO_EQUIPAMENTO</span>
                                                    <Activity size={10} className="text-slate-700 group-focus-within/input:text-cyan-500" />
                                                </label>
                                                <input placeholder="EX: JD_4020_TX" value={formData.equipment} onChange={e => setFormData({ ...formData, equipment: e.target.value.toUpperCase() })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800" />
                                            </div>

                                            {/* INSTRUMENTOS METEOROLÓGICOS */}
                                            <div className="grid grid-cols-2 gap-px bg-slate-900 border border-slate-900 overflow-hidden">
                                                <div className="bg-slate-950 p-4 space-y-2">
                                                    <label className="text-[7px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <Thermometer size={10} className="text-rose-500/50" /> ÍNDICE_CALOR
                                                    </label>
                                                    <div className="flex items-end gap-1">
                                                        <input type="number" value={formData.weather.temp} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, temp: e.target.value } })} className="w-full bg-transparent text-lg font-mono font-black text-white outline-none" placeholder="00" />
                                                        <span className="text-[9px] text-slate-700 font-bold mb-1">°C</span>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-950 p-4 space-y-2">
                                                    <label className="text-[7px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <Droplet size={10} className="text-cyan-500/50" /> ÍNDICE_UMID
                                                    </label>
                                                    <div className="flex items-end gap-1">
                                                        <input type="number" value={formData.weather.humidity} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, humidity: e.target.value } })} className="w-full bg-transparent text-lg font-mono font-black text-white outline-none" placeholder="00" />
                                                        <span className="text-[9px] text-slate-700 font-bold mb-1">%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">LOG_DE_OBSERVAÇÕES</label>
                                                <textarea rows={5} value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-4 text-[9px] font-mono text-slate-400 outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800 custom-scrollbar resize-none" placeholder="RESUMO_REMARCAS_OU_ANOMALIAS..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* CONTROLES_FINAIS_DE_COMANDO */}
                        <div className="px-10 py-8 border-t border-slate-900 bg-slate-950 flex justify-between items-center shrink-0">
                            <div className="flex gap-12">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">VALOR_ESTIMADO_LÍQUIDO</p>
                                    <p className="text-3xl font-mono font-black text-cyan-400 tracking-tighter">{formatCurrency(totalApplicationCost, settings.currency)}</p>
                                </div>
                                <div className="space-y-1 pr-12 border-r border-slate-900">
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">VOLUME_DE_CARGA</p>
                                    <p className="text-3xl font-mono font-black text-white tracking-tighter">
                                        {(parseFloat(formData.areaApplied || '0') * parseFloat(formData.sprayVolume || '0')).toFixed(0)}
                                        <span className="text-[10px] text-slate-700 ml-2">L_TOT</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden xl:flex flex-col gap-1 items-end mr-4 border-r border-slate-900 pr-6">
                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Atalhos de Sistema</p>
                                    <div className="flex gap-3">
                                        <span className="text-[8px] text-slate-500 font-mono"><span className="text-cyan-600 font-black">[ESC]</span> ABORTAR</span>
                                        <span className="text-[8px] text-slate-500 font-mono"><span className="text-cyan-600 font-black">[ALT+S]</span> STATUS</span>
                                        <span className="text-[8px] text-slate-500 font-mono"><span className="text-cyan-600 font-black">[CTRL+ENTER]</span> EFETIVAR</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-5 border border-slate-900 text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-white hover:bg-slate-900 transition-all">ABORTAR_MISSÃO</button>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`px-16 py-5 font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] active:scale-95 flex gap-4 items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} ${hasStockIssues ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-900/20'}`}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                                        {isSubmitting ? 'PROCESSANDO...' : 'EFETIVAR_PROTOCOLO'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
