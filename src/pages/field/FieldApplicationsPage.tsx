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
import { TacticalFilterBlade } from '../../components/common/TacticalFilterBlade';
import { useTacticalFilter } from '../../hooks/useTacticalFilter';
import { formatCurrency, formatNumber } from '../../utils/format';

// --- SUB-COMPONENTS ---

const TankHUD = ({ products, area, sprayVolume = 0 }: { products: any[], area: number, sprayVolume?: number }) => {
    const areaVal = isNaN(area) ? 0 : area;
    const sprayVal = isNaN(sprayVolume) ? 0 : sprayVolume;
    const totalVolume = sprayVal * areaVal;

    return (
        <div className="flex flex-col h-full bg-slate-950/40 rounded-none border border-slate-900 p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 z-20" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-cyan-500/10 pointer-events-none" />

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2 italic">
                        <Gauge size={14} /> Monitoramento_Calda
                    </h4>
                    <p className="text-3xl font-mono font-black text-white italic tracking-tighter">
                        {totalVolume.toFixed(0)} <span className="text-xs text-slate-600 font-black uppercase not-italic ml-2 tracking-widest font-sans">Litros Totais</span>
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-none text-right">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Vazão (Volume)</p>
                    <p className="text-xs font-black text-cyan-400 italic font-mono">{sprayVolume} L/HA</p>
                </div>
            </div>

            <div className="relative flex-1 min-h-[300px] bg-slate-950/80 rounded-none border border-slate-900 overflow-hidden flex flex-col-reverse shadow-inner">
                <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-none border border-cyan-500/20 shadow-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] italic">Sistema_Pronto</span>
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
    const {
        isSidebarOpen, setIsSidebarOpen,
        searchTerm, setSearchTerm,
        dateFilter, setDateFilter,
        advancedFilters, setAdvancedFilters,
        updateAdvancedFilter,
        filteredData: filteredApplications,
        resetFilters
    } = useTacticalFilter({
        data: fieldApplications,
        searchFields: ['plotName', 'operator', 'target'],
        customFilter: (app: any, term) => {
            const appPlot = plots.find(p => p.id === app.plotId);
            const property = properties.find(prop => prop.id === appPlot?.propertyId);
            return (property?.name || '').toLowerCase().includes(term.toLowerCase());
        }
    });

    const [editingApplicationId, setEditingApplicationId] = useState<number | null>(null);

    const [formData, setFormData] = useState<any>({
        date: new Date().toISOString().split('T')[0],
        plotIds: [], // Alterado de plotId para plotIds (array)
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

    const selectedPlotItems = plots.filter(p => formData.plotIds.includes(p.id.toString()));
    const totalSelectedArea = selectedPlotItems.reduce((acc, p) => acc + p.area, 0);

    useEffect(() => {
        if (isFormOpen || isSidebarOpen) {
            document.body.style.overflow = 'hidden';
            // Auto-focus logic
            if (isFormOpen) {
                setTimeout(() => {
                    if (editingApplicationId) {
                        productSelectRef.current?.focus();
                    } else {
                        plotSelectRef.current?.focus();
                    }
                }, 100);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFormOpen, isSidebarOpen, editingApplicationId]);

    // Unified Keyboard Control Matrix
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // GLOBAL_CLOSE_PROTOCOL
            if (e.key === 'Escape') {
                if (isSidebarOpen) setIsSidebarOpen(false);
                if (isFormOpen) setIsFormOpen(false);
            }

            // FORM_SPECIFIC_CONTROLS
            if (isFormOpen) {
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
            // Auto-focus dose input for speed
            setTimeout(() => doseInputRef.current?.focus(), 50);
        }
    }, [currentProduct.productId, products]);

    useEffect(() => {
        if (!editingApplicationId && formData.plotIds.length > 0) {
            setFormData((prev: any) => ({ ...prev, areaApplied: totalSelectedArea.toString() }));
        }
    }, [formData.plotIds, totalSelectedArea, editingApplicationId]);

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

        if (formData.plotIds.length === 0 || formData.appliedProducts.length === 0) {
            alert("Selecione pelo menos um talhão e adicione pelo menos um produto à calda.");
            return;
        }

        if (editingApplicationId) {
            // EDIÇÃO TÉCNICA (SINGLE RECORD) - ATOMIC UPDATE
            const selectedPlot = plots.find(p => p.id === parseInt(formData.plotIds[0]));
            if (!selectedPlot) return;

            const applicationData = {
                ...formData,
                plotId: selectedPlot.id,
                id: editingApplicationId,
                plotName: selectedPlot.name,
                totalCost: totalApplicationCost,
                areaApplied: parseFloat(formData.areaApplied)
            };

            const oldApp = fieldApplications.find(a => a.id === editingApplicationId);
            if (oldApp) {
                let updatedProducts = [...products];
                let updatedMovements = [...stockMovements];

                // 1. REVERSE PREVIOUS IMPACT
                const oldMovs = updatedMovements.filter(m => m.appId === oldApp.id);
                if (oldMovs.length > 0) {
                    oldMovs.forEach(mov => {
                        const pIdx = updatedProducts.findIndex(p => p.id === mov.productId);
                        if (pIdx !== -1) {
                            const p = updatedProducts[pIdx];
                            const stockChange = mov.type === 'out' ? mov.realChange : -mov.realChange;
                            updatedProducts[pIdx] = { ...p, stock: p.stock + stockChange };
                        }
                    });
                    updatedMovements = updatedMovements.filter(m => m.appId !== oldApp.id);
                }

                // 2. APPLY NEW IMPACT (IF COMPLETED)
                if (formData.status === 'completed') {
                    formData.appliedProducts.forEach((ap: any) => {
                        const pIdx = updatedProducts.findIndex(p => p.id === ap.productId);
                        if (pIdx !== -1) {
                            const p = updatedProducts[pIdx];
                            updatedProducts[pIdx] = { ...p, stock: p.stock - ap.totalQuantity };

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
            // REGISTRO EM LOTE (BATCH) - ATOMIC UPDATE
            const totalBatchArea = parseFloat(formData.areaApplied) || totalSelectedArea;

            let updatedFieldApplications = [...fieldApplications];
            let updatedProducts = [...products];
            let updatedMovements = [...stockMovements];

            formData.plotIds.forEach((pId: string) => {
                const plot = plots.find(p => p.id === parseInt(pId));
                if (!plot) return;

                const areaProportion = totalSelectedArea > 0 ? (plot.area / totalSelectedArea) : (1 / formData.plotIds.length);
                const plotAreaApplied = totalBatchArea * areaProportion;

                const plotProducts = formData.appliedProducts.map((ap: any) => {
                    const plotTotalQty = plotAreaApplied * ap.normalizedDose;
                    const prod = updatedProducts.find(prod => prod.id === ap.productId);
                    return {
                        ...ap,
                        totalQuantity: plotTotalQty,
                        cost: plotTotalQty * (prod?.price || 0)
                    };
                });

                const plotTotalCost = plotProducts.reduce((acc: number, p: any) => acc + p.cost, 0);
                const appId = Date.now() + Math.random();

                const applicationData = {
                    ...formData,
                    id: appId,
                    plotId: plot.id,
                    plotName: plot.name,
                    areaApplied: plotAreaApplied,
                    appliedProducts: plotProducts,
                    totalCost: plotTotalCost
                };

                if (formData.status === 'completed') {
                    plotProducts.forEach((ap: any) => {
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
                                reason: `Execução Defesa Lote: ${plot.name}`,
                                user: formData.operator || settings.userName || 'SISTEMA',
                                appId: appId
                            };
                            updatedMovements = [newMov, ...updatedMovements];
                        }
                    });
                }
                updatedFieldApplications = [applicationData, ...updatedFieldApplications];
            });

            setProducts(updatedProducts);
            setStockMovements(updatedMovements);
            setFieldApplications(updatedFieldApplications);
            addActivity('Homologou missão de defesa em lote', `${formData.plotIds.length} talhões`, 'neutral');
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
            plotIds: [],
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
            plotIds: [app.plotId.toString()],
            appliedProducts: app.products || app.appliedProducts || []
        });
        setIsFormOpen(true);
    };

    const editApplication = (app: any) => {
        setEditingApplicationId(app.id);
        setFormData({
            ...app,
            plotIds: [app.plotId.toString()],
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


    const filterOptions = useMemo(() => {
        const apps = fieldApplications;

        const operators = [...new Set(apps
            .filter(a => advancedFilters.plotId === 'all' || a.plotId.toString() === advancedFilters.plotId)
            .map(a => a.operator))]
            .filter(Boolean)
            .sort();

        const productIds = new Set<number>();
        apps.filter(a => {
            const plotMatch = advancedFilters.plotId === 'all' || a.plotId.toString() === advancedFilters.plotId;
            const opMatch = advancedFilters.operator === 'all' || a.operator === advancedFilters.operator;
            return plotMatch && opMatch;
        }).forEach(a => {
            (a.appliedProducts || []).forEach((p: any) => productIds.add(p.productId));
        });

        const activeProducts = products.filter(p => productIds.has(p.id)).sort((a, b) => a.name.localeCompare(b.name));

        const equipments = [...new Set(apps
            .filter(a => advancedFilters.plotId === 'all' || a.plotId.toString() === advancedFilters.plotId)
            .map(a => a.equipment))]
            .filter(Boolean)
            .sort();

        return { operators, activeProducts, equipments };
    }, [fieldApplications, products, advancedFilters.plotId, advancedFilters.operator]);

    const filterMetrics = useMemo(() => {
        const count = filteredApplications.length;
        const totalArea = filteredApplications.reduce((acc, a) => acc + (parseFloat(a.areaApplied.toString()) || 0), 0);
        const totalInvestment = filteredApplications.reduce((acc, a) => acc + (a.totalCost || 0), 0);
        return { count, totalArea, totalInvestment };
    }, [filteredApplications]);



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
            <style>{`
                @keyframes scan-laser {
                    0% { transform: translateY(-100%); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(1000%); opacity: 0; }
                }
                .animate-scan-laser {
                    animation: scan-laser 4s linear infinite;
                }
                @keyframes data-stream {
                    0% { opacity: 0.3; transform: scaleY(0.98); }
                    50% { opacity: 0.8; transform: scaleY(1); }
                    100% { opacity: 0.3; transform: scaleY(0.98); }
                }
                .animate-data-stream {
                    animation: data-stream 2s ease-in-out infinite;
                }
                @keyframes glitch-skew {
                    0% { transform: skew(0deg); }
                    20% { transform: skew(2deg); }
                    40% { transform: skew(-1deg); }
                    100% { transform: skew(0deg); }
                }
                .animate-glitch-skew {
                    animation: glitch-skew 3s step-end infinite;
                }
                .tactical-border {
                    clip-path: polygon(
                        0 0, 100% 0, 100% 100%, 0 100%, 
                        0 10px, 10px 0, 0 0
                    );
                }
            `}</style>
            <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
                {/* FIELD SENTINEL COMMAND CENTER */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-none border border-slate-800/60 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 z-20" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-cyan-500/10 pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-none bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shadow-lg shadow-cyan-500/10 relative overflow-hidden group/icon">
                            <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover/icon:opacity-20 transition-opacity" />
                            <Sprout size={32} strokeWidth={2} className="relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                                Gestão de Aplicações <span className="text-slate-500 font-light not-italic text-sm tracking-[0.3em]">/ DEFESA_AGRÍCOLA</span>
                            </h2>
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                                <Activity size={12} className="text-cyan-500" /> MONITORAMENTO_DE_INSUMOS // COBERTURA_DE_SOLO
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 relative z-10 lg:w-auto w-full">
                        <button
                            onClick={() => { resetForm(); setEditingApplicationId(null); setIsFormOpen(true); }}
                            className="flex-1 lg:flex-none bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-5 rounded-none font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-cyan-800 italic"
                        >
                            <Plus size={20} /> Registrar Aplicação
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`p-5 rounded-none border transition-all ${isSidebarOpen ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white group-hover:border-slate-700'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* TELEMETRY MATRIX */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Investimento Mensal', value: formatCurrency(telemetry.monthlyInv, settings.currency), icon: DollarSign, color: 'cyan', code: 'FINANCEIRO_INTEL' },
                        { label: 'Cobertura de Defesa', value: telemetry.coveragePercent.toFixed(1), unit: '%', icon: LandPlot, color: 'emerald', code: 'GEOGRÁFICO_INTEL' },
                        { label: 'Aplicações Agendadas', value: telemetry.nextMissions.toString().padStart(2, '0'), unit: 'ITENS', icon: Clock, color: 'orange', code: 'OPERACIONAL_INTEL' }
                    ].map((item, idx) => (
                        <Card key={idx} className="group p-6 border-slate-900 hover:border-cyan-500/30 bg-slate-950/50 relative overflow-hidden rounded-none transition-all">
                            {/* Tactical Corner */}
                            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-slate-800 group-hover:border-cyan-500/50 transition-colors" />

                            <div className={`absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity text-${item.color}-500`}>
                                <item.icon size={80} />
                            </div>

                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 italic flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full bg-${item.color}-500/50`} /> {item.label}
                            </p>

                            <h4 className="text-3xl font-mono font-black text-white italic tracking-tighter group-hover:translate-x-1 transition-transform">
                                {item.value} {item.unit && <span className="text-xs font-black text-slate-600 uppercase italic not-italic font-sans">{item.unit}</span>}
                            </h4>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-[7px] font-black text-slate-700 tracking-[0.3em] uppercase italic">{item.code}</span>
                                <div className="h-1 flex-1 mx-4 bg-slate-900 overflow-hidden relative">
                                    <div
                                        className={`h-full bg-${item.color}-500 shadow-[0_0_10px] shadow-${item.color}-500/50 transition-all duration-1000`}
                                        style={{ width: idx === 1 ? `${item.value}%` : idx === 2 && item.value === '00' ? '5%' : '80%' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scan-laser opacity-20" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <TacticalFilterBlade
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onReset={resetFilters}
                    progress={(filterMetrics.count / Math.max(fieldApplications.length, 1)) * 100}
                    metrics={[
                        { label: 'APLICAÇÕES ENCONTRADAS', value: filterMetrics.count.toString().padStart(3, '0') },
                        { label: 'INVESTIMENTO TOTAL', value: filterMetrics.totalInvestment, isCurrency: true }
                    ]}
                >
                    {/* SECTOR: LOGÍSTICA */}
                    <div className="space-y-6">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 border-l-2 border-orange-500 pl-3">
                            LOCALIZAÇÃO E PERÍODO
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 block">SELECIONAR TALHÃO</label>
                                <select
                                    value={advancedFilters.plotId}
                                    onChange={e => updateAdvancedFilter('plotId', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/30 transition-all appearance-none uppercase cursor-pointer"
                                >
                                    <option value="all">TODOS OS TALHÕES</option>
                                    {plots.map(p => {
                                        const property = properties.find(prop => prop.id === p.propertyId);
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {property ? `${property.name} - ` : ''}{p.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 block">DATA_INICIAL</label>
                                    <input
                                        type="date"
                                        value={dateFilter.start}
                                        onChange={e => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/30 transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 block">DATA_FINAL</label>
                                    <input
                                        type="date"
                                        value={dateFilter.end}
                                        onChange={e => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/30 transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTOR: TÉCNICO */}
                    <div className="space-y-6">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 border-l-2 border-cyan-500 pl-3">
                            INSUMOS E ALVOS
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 block">PRODUTO APLICADO</label>
                                <select
                                    value={advancedFilters.productId}
                                    onChange={e => updateAdvancedFilter('productId', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/30 transition-all appearance-none uppercase cursor-pointer"
                                >
                                    <option value="all">TODOS OS PRODUTOS</option>
                                    {filterOptions.activeProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 block">ALVOS (PRAGAS/DOENÇAS)</label>
                                <input
                                    type="text"
                                    placeholder="BUSCAR PRAGA OU DOENÇA..."
                                    value={advancedFilters.target || ''}
                                    onChange={e => updateAdvancedFilter('target', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/30 transition-all placeholder:text-slate-800 italic"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTOR: OPERACIONAL */}
                    <div className="space-y-6">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 border-l-2 border-emerald-500 pl-3">
                            EQUIPE E MAQUINÁRIO
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 block">OPERADOR RESPONSÁVEL</label>
                                <select
                                    value={advancedFilters.operator}
                                    onChange={e => updateAdvancedFilter('operator', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/30 transition-all appearance-none uppercase"
                                >
                                    <option value="all">TODOS OS OPERADORES</option>
                                    {filterOptions.operators.map(op => <option key={op} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 block">MÁQUINA OU EQUIPAMENTO</label>
                                <select
                                    value={advancedFilters.equipment}
                                    onChange={e => updateAdvancedFilter('equipment', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/30 transition-all appearance-none uppercase cursor-pointer"
                                >
                                    <option value="all">TODOS OS EQUIPAMENTOS</option>
                                    {filterOptions.equipments.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </TacticalFilterBlade>

                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                    {useMemo(() => [...filteredApplications].sort((a, b) => {
                        const dateA = new Date(a.date).getTime();
                        const dateB = new Date(b.date).getTime();
                        if (dateB !== dateA) return dateB - dateA;
                        return (b.id || 0) - (a.id || 0);
                    }), [filteredApplications]).map(app => (
                        <Card key={app.id} variant="default" className="group p-0 border-slate-800/60 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden rounded-none flex flex-col relative shadow-xl">
                            <div className="absolute top-0 right-0 p-6 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => cloneApplication(app)} className="text-slate-700 hover:text-cyan-400 transition-colors" title="Clonar Missão"><Copy size={16} /></button>
                                <button onClick={() => deleteApplication(app)} className="text-slate-700 hover:text-rose-500 transition-colors" title="Apagar Registro"><Trash2 size={16} /></button>
                            </div>

                            <div className={`h-1 w-full ${app.status === 'planned' ? 'bg-orange-500 animate-pulse' : 'bg-cyan-500'}`} />

                            <div className="p-8">
                                <div className="flex items-start gap-5 mb-8">
                                    <div className="w-16 h-16 rounded-none bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-cyan-950 transition-all duration-500 shadow-xl font-mono text-xl font-black italic">
                                        {app.plotName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-white text-lg uppercase tracking-tighter italic leading-none truncate group-hover:text-cyan-300 transition-colors">{app.plotName}</h4>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="px-2.5 py-1 bg-slate-900 rounded-none text-[9px] text-slate-500 font-black uppercase tracking-[0.1em] border border-slate-800 italic">[{app.target || 'DEFESA GERAL'}]</span>
                                            <span className={`px-2.5 py-1 rounded-none text-[9px] font-black uppercase tracking-[0.1em] border ${app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]'}`}>
                                                {app.status === 'completed' ? 'REALIZADO' : 'PLANEJADO'}
                                            </span>
                                        </div>
                                    </div>
                                </div>


                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-px bg-slate-800/40 border border-slate-800/40 rounded-none overflow-hidden">
                                        <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic flex items-center gap-1.5"><Calendar size={10} /> Data Alvo</p>
                                            <p className="text-[11px] font-mono font-black text-white italic">{app.date.split('-').reverse().join('/')}</p>
                                        </div>
                                        <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic flex items-center gap-1.5"><User size={10} /> Operador</p>
                                            <p className="text-[11px] font-black text-white uppercase truncate italic">{app.operator || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 p-4 rounded-none border border-slate-900 group-hover:border-cyan-500/20 transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-2"><Droplets size={12} className="text-cyan-800" /> Mix Insumos ({app.appliedProducts?.length || 0})</span>
                                            <span className="text-[11px] font-mono font-black text-cyan-500 italic">{formatCurrency(app.totalCost, settings.currency)}</span>
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
                                    <Terminal size={14} /> VER DETALHES
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

            </div>

            {/* PROTOCOL MODAL: APLICAÇÃO (INDUSTRIAL DATA-TECH) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[120] flex animate-fade-in font-sans ring-inset">
                    <div className="absolute inset-0 bg-slate-950/98" onClick={() => setIsFormOpen(false)} />

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
                                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{editingApplicationId ? 'EDITAR REGISTRO DE APLICAÇÃO' : 'NOVO REGISTRO DE APLICAÇÃO'}</h3>
                                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse">Sincronizado</span>
                                    </div>
                                    <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Activity size={10} /> AGROGEST PRO v6.1 // SISTEMA OPERACIONAL
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
                                            <div className="w-1 h-1 bg-cyan-500" /> 1. LOGÍSTICA E LOCALIZAÇÃO
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-2 group/input">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>DATA DA OPERAÇÃO</span>
                                                    <Calendar size={10} className="opacity-30 group-focus-within/input:opacity-100 text-cyan-500" />
                                                </label>
                                                <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all [color-scheme:dark]" />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>TALHÕES DE DESTINO</span>
                                                    <MapPin size={10} className="opacity-30 group-focus-within/input:opacity-100 text-cyan-500" />
                                                </label>

                                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-slate-900 bg-slate-900/20 p-2 space-y-4">
                                                    {properties.map(prop => (
                                                        <div key={prop.id} className="space-y-2">
                                                            <div className="flex justify-between items-center px-2 py-1 bg-slate-900/50 border border-slate-800">
                                                                <span className="text-[8px] font-black text-slate-500 uppercase">{prop.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const propPlots = plots.filter(p => p.propertyId === prop.id).map(p => p.id.toString());
                                                                        const allSelected = propPlots.every(id => formData.plotIds.includes(id));

                                                                        if (allSelected) {
                                                                            setFormData({ ...formData, plotIds: formData.plotIds.filter((id: string) => !propPlots.includes(id)) });
                                                                        } else {
                                                                            setFormData({ ...formData, plotIds: [...new Set([...formData.plotIds, ...propPlots])] });
                                                                        }
                                                                    }}
                                                                    className="text-[7px] font-black text-cyan-500 hover:text-cyan-400 uppercase"
                                                                >
                                                                    Alternar Todos
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-1 pl-2">
                                                                {plots.filter(p => p.propertyId === prop.id).map(plot => (
                                                                    <label key={plot.id} className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all border ${formData.plotIds.includes(plot.id.toString()) ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-950/40 border-slate-900 text-slate-600 hover:border-slate-800'}`}>
                                                                        <div className="flex items-center gap-3">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="hidden"
                                                                                checked={formData.plotIds.includes(plot.id.toString())}
                                                                                onChange={() => {
                                                                                    const id = plot.id.toString();
                                                                                    if (formData.plotIds.includes(id)) {
                                                                                        setFormData({ ...formData, plotIds: formData.plotIds.filter((pid: string) => pid !== id) });
                                                                                    } else {
                                                                                        setFormData({ ...formData, plotIds: [...formData.plotIds, id] });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <span className="text-[10px] font-mono font-bold uppercase">{plot.name}</span>
                                                                        </div>
                                                                        <span className="text-[8px] font-mono opacity-50 italic">{plot.area} HA</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {formData.plotIds.length === 0 && (
                                                    <p className="text-[8px] text-rose-500 font-bold uppercase animate-pulse italic">Nenhum talhão selecionado*</p>
                                                )}
                                            </div>

                                            <div className="space-y-2 group/input">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>ÁREA APLICADA (HA)</span>
                                                    <LandPlot size={10} className="opacity-30 group-focus-within/input:opacity-100 text-cyan-500" />
                                                </label>
                                                <input type="number" step="0.01" value={formData.areaApplied} onChange={e => setFormData({ ...formData, areaApplied: e.target.value })} placeholder="0.00" className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-900 space-y-4">
                                        <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">STATUS DA APLICAÇÃO</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: 'completed', label: 'CONCLUÍDO / REALIZADO', color: 'cyan' },
                                                { id: 'planned', label: 'PLANEJADO / AGENDADO', color: 'slate' }
                                            ].map(s => (
                                                <button key={s.id} type="button" onClick={() => setFormData({ ...formData, status: s.id })} className={`py-3 px-4 text-left text-[9px] font-bold uppercase tracking-[0.2em] border transition-all flex items-center justify-between group ${formData.status === s.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900/30 border-slate-900 text-slate-600 hover:text-slate-400 hover:border-slate-800'}`}>
                                                    {s.label}
                                                    <div className={`w-1.5 h-1.5 ${formData.status === s.id ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-800 group-hover:bg-slate-600'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ZONA_02: COMPOSIÇÃO DA CALDA */}
                                <div className="lg:col-span-6 border-r border-slate-900/50 flex flex-col">
                                    <div className="h-[280px] shrink-0">
                                        <TankHUD
                                            products={formData.appliedProducts}
                                            area={parseFloat(formData.areaApplied || '0')}
                                            sprayVolume={parseFloat(formData.sprayVolume || '0')}
                                        />
                                    </div>

                                    <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                                        <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-3 italic mb-4">
                                            <div className="w-1 h-1 bg-cyan-500" /> 2. PARÂMETROS TÉCNICOS DA CALDA
                                        </h4>

                                        <div className="grid grid-cols-2 gap-6 bg-slate-950 border border-slate-900 p-6 relative">
                                            <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-cyan-500" />
                                            <div className="space-y-4">
                                                <div className="space-y-1.5 group/input">
                                                    <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                                        <Gauge size={10} className="text-cyan-500/30 group-focus-within/input:text-cyan-500" /> VAZÃO DA CALDA (L/HA)
                                                    </label>
                                                    <input type="number" value={formData.sprayVolume} onChange={e => setFormData({ ...formData, sprayVolume: e.target.value })} placeholder="0.00" className="w-full bg-slate-900 border border-slate-800 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1.5 group/input">
                                                    <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                                        <Target size={10} className="text-cyan-500/30 group-focus-within/input:text-cyan-500" /> ALVO (PRAGA/DOENÇA)
                                                    </label>
                                                    <input value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value.toUpperCase() })} placeholder="EX: FERRUGEM ASIÁTICA" className="w-full bg-slate-900 border border-slate-800 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all italic" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-slate-950 border border-slate-900 p-6 space-y-6">
                                                <div className="grid grid-cols-12 gap-3 items-end">
                                                    <div className="col-span-6 space-y-1.5">
                                                        <label className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1">PRODUTO / INSUMO</label>
                                                        <select ref={productSelectRef} value={currentProduct.productId} onChange={e => setCurrentProduct({ ...currentProduct, productId: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-none px-4 py-3 text-[10px] font-mono text-white outline-none focus:border-cyan-500/50 transition-all appearance-none uppercase">
                                                            <option value="">SELECIONAR PRODUTO</option>
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
                                                            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-500 text-center">Aguardando adição de produtos</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ZONA_03: INFORMAÇÕES DE OPERAÇÃO */}
                                    <div className="lg:col-span-3 p-8 space-y-8 bg-slate-950/50">
                                        <div className="space-y-6">
                                            <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] flex items-center gap-3 italic mb-4">
                                                <div className="w-1 h-1 bg-cyan-500" /> 3. INFORMAÇÕES DE OPERAÇÃO
                                            </h4>
                                            <div className="space-y-6">
                                                <div className="space-y-2 group/input">
                                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                        <span>OPERADOR / RESPONSÁVEL</span>
                                                        <User size={10} className="text-slate-700 group-focus-within/input:text-cyan-500" />
                                                    </label>
                                                    <select value={formData.operator} onChange={e => setFormData({ ...formData, operator: e.target.value })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all appearance-none uppercase">
                                                        <option value="">NÃO ATRIBUÍDO</option>
                                                        {collaborators.map(c => <option key={c.id} value={c.name} className="bg-slate-950 font-mono">{c.name.toUpperCase()}</option>)}
                                                    </select>
                                                </div>

                                                <div className="space-y-2 group/input">
                                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1 flex justify-between">
                                                        <span>MÁQUINA / EQUIPAMENTO</span>
                                                        <Activity size={10} className="text-slate-700 group-focus-within/input:text-cyan-500" />
                                                    </label>
                                                    <input placeholder="EX: TRATOR JD 6125J" value={formData.equipment} onChange={e => setFormData({ ...formData, equipment: e.target.value.toUpperCase() })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-3 text-xs font-mono text-white outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800" />
                                                </div>

                                                {/* INSTRUMENTOS METEOROLÓGICOS */}
                                                <div className="grid grid-cols-2 gap-px bg-slate-900 border border-slate-900 overflow-hidden">
                                                    <div className="bg-slate-950 p-4 space-y-2">
                                                        <label className="text-[7px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                            <Thermometer size={10} className="text-rose-500/50" /> TEMPERATURA
                                                        </label>
                                                        <div className="flex items-end gap-1">
                                                            <input type="number" value={formData.weather.temp} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, temp: e.target.value } })} className="w-full bg-transparent text-lg font-mono font-black text-white outline-none" placeholder="00" />
                                                            <span className="text-[9px] text-slate-700 font-bold mb-1">°C</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-950 p-4 space-y-2">
                                                        <label className="text-[7px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                            <Droplet size={10} className="text-cyan-500/50" /> UMIDADE
                                                        </label>
                                                        <div className="flex items-end gap-1">
                                                            <input type="number" value={formData.weather.humidity} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, humidity: e.target.value } })} className="w-full bg-transparent text-lg font-mono font-black text-white outline-none" placeholder="00" />
                                                            <span className="text-[9px] text-slate-700 font-bold mb-1">%</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">OBSERVAÇÕES GERAIS</label>
                                                    <textarea rows={5} value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} className="w-full bg-slate-900/50 border border-slate-900 rounded-none px-4 py-4 text-[9px] font-mono text-slate-400 outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800 custom-scrollbar resize-none" placeholder="Relatar anomalias ou observações técnicas..." />
                                                </div>
                                            </div>
                                        </div>
                                        {/* BATCH_PREVIEW: VISÃO DE DIVISÃO */}
                                        {formData.plotIds.length > 1 && (
                                            <div className="space-y-6 pt-8 border-t border-slate-900">
                                                <h4 className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                                    <div className="w-1 h-1 bg-orange-500" /> RESUMO DA DIVISÃO EM LOTE
                                                </h4>
                                                <div className="bg-slate-900/30 border border-slate-900 p-4 space-y-2">
                                                    {selectedPlotItems.map(plot => {
                                                        const totalBatchArea = parseFloat(formData.areaApplied) || totalSelectedArea;
                                                        const areaProportion = totalSelectedArea > 0 ? (plot.area / totalSelectedArea) : (1 / formData.plotIds.length);
                                                        const plotAreaApplied = totalBatchArea * areaProportion;

                                                        return (
                                                            <div key={plot.id} className="flex justify-between items-center text-[9px] font-mono border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                                                    <span className="text-slate-400 uppercase">{plot.name}</span>
                                                                </div>
                                                                <div className="flex gap-4">
                                                                    <span className="text-white font-black italic">{plotAreaApplied.toFixed(2)} HA</span>
                                                                    <span className="text-cyan-500 font-bold">{((plotAreaApplied / totalBatchArea) * 100).toFixed(0)}%</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-[8px] text-slate-600 italic uppercase">As doses e quantidades serão distribuídas proporcionalmente à área de cada talhão selecionado.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* CONTROLES_FINAIS_DE_COMANDO */}
                        <div className="px-10 py-8 border-t border-slate-900 bg-slate-950 flex justify-between items-center shrink-0">
                            <div className="flex gap-12">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">CUSTO TOTAL ESTIMADO</p>
                                    <p className="text-3xl font-mono font-black text-cyan-400 tracking-tighter">{formatCurrency(totalApplicationCost, settings.currency)}</p>
                                </div>
                                <div className="space-y-1 pr-12 border-r border-slate-900">
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">VOLUME TOTAL DE CALDA</p>
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
                                        <span className="text-[8px] text-slate-500 font-mono"><span className="text-cyan-600 font-black">[ESC]</span> CANCELAR</span>
                                        <span className="text-[8px] text-slate-500 font-mono"><span className="text-cyan-600 font-black">[ALT+S]</span> STATUS</span>
                                        <span className="text-[8px] text-slate-500 font-mono"><span className="text-cyan-600 font-black">[CTRL+ENTER]</span> SALVAR</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-5 border border-slate-900 text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-white hover:bg-slate-900 transition-all">CANCELAR</button>
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`px-16 py-5 font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] active:scale-95 flex gap-4 items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} ${hasStockIssues ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-900/20'}`}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                                        {isSubmitting ? 'PROCESSANDO...' : 'SALVAR REGISTRO'}
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
