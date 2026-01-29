import React, { useState, useEffect } from 'react';
import {
    Sprout, X, Edit, Plus, LandPlot, Activity, DollarSign, Search,
    Calendar, Filter, MapPin, Droplets, AlertCircle, Trash2, Copy,
    Clock, User, Wind, Thermometer, Droplet, ClipboardList
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatCurrency } from '../../utils/format';

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
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [editingApplicationId, setEditingApplicationId] = useState<number | null>(null);

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
                const contextChanged = oldApp.date !== formData.date || oldApp.operator !== formData.operator || oldApp.plotId !== formData.plotId;
                const otherFieldsChanged = oldApp.observations !== formData.observations || oldApp.target !== formData.target || oldApp.sprayVolume !== formData.sprayVolume || oldApp.equipment !== formData.equipment;

                const hasChanged = productsChanged || statusChanged || contextChanged || otherFieldsChanged;

                if (hasChanged) {
                    if (productsChanged || statusChanged || contextChanged) {
                        const oldMovements = stockMovements.filter(m => m.appId === oldApp.id);

                        if (oldMovements.length > 0) {
                            const updatedProducts = [...products];
                            oldMovements.forEach(mov => {
                                const pIdx = updatedProducts.findIndex(p => p.id === mov.productId);
                                if (pIdx !== -1) {
                                    const p = updatedProducts[pIdx];
                                    const stockChange = mov.type === 'out' ? mov.realChange : -mov.realChange;
                                    updatedProducts[pIdx] = { ...p, stock: p.stock + stockChange };
                                }
                            });
                            setProducts(updatedProducts);
                            setStockMovements(stockMovements.filter(m => m.appId !== oldApp.id));
                        }

                        if (formData.status === 'completed') {
                            formData.appliedProducts.forEach((ap: any) => {
                                handleStockAdjustment({
                                    productId: ap.productId,
                                    type: 'out',
                                    quantity: ap.totalQuantity,
                                    reason: `Aplicação: ${selectedPlot.name}`,
                                    unit: ap.unit,
                                    batch: '',
                                    cost: 0,
                                    updatePrice: false,
                                    date: formData.date,
                                    customUser: formData.operator,
                                    appId: applicationData.id
                                });
                            });
                        }
                    }

                    setFieldApplications(fieldApplications.map(a => a.id === editingApplicationId ? applicationData : a));
                    addActivity('Editou aplicação', `${formData.appliedProducts.length} produtos no ${selectedPlot.name}`);
                }
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
                        batch: '',
                        cost: 0,
                        updatePrice: false,
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const editApplication = (app: any) => {
        setEditingApplicationId(app.id);
        setFormData({
            ...app,
            appliedProducts: app.products || app.appliedProducts || []
        });
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteApplication = (app: any) => {
        if (confirm('Deseja realmente excluir esta aplicação?')) {
            const movementsToDelete = stockMovements.filter(m => m.appId === app.id);

            if (movementsToDelete.length > 0) {
                const updatedProducts = [...products];
                movementsToDelete.forEach(mov => {
                    const pIdx = updatedProducts.findIndex(p => p.id === mov.productId);
                    if (pIdx !== -1) {
                        const p = updatedProducts[pIdx];
                        const stockChange = mov.type === 'out' ? mov.realChange : -mov.realChange;
                        updatedProducts[pIdx] = { ...p, stock: p.stock + stockChange };
                    }
                });
                setProducts(updatedProducts);
                setStockMovements(stockMovements.filter(m => m.appId !== app.id));
            }

            setFieldApplications(fieldApplications.filter(a => a.id !== app.id));
            addActivity('Excluiu aplicação', `Aplicação no ${app.plotName} removida`);
        }
    };

    const stats = {
        totalArea: fieldApplications.reduce((acc, curr) => acc + (curr.areaApplied || 0), 0),
        totalApplications: fieldApplications.length,
        totalInvested: fieldApplications.reduce((acc, curr) => acc + (curr.totalCost || 0), 0)
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

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col overflow-y-auto pr-2 pb-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Sprout className="text-emerald-400" /> Controle de Aplicações
                </h2>
                <button
                    onClick={() => {
                        setIsFormOpen(true);
                        setEditingApplicationId(null);
                        resetForm();
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Nova Aplicação</span>
                </button>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                    <Card variant="highlight" className="w-full max-w-6xl relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100 max-h-[90vh] overflow-y-auto" style={{ transform: 'none' }}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-white uppercase tracking-widest">{editingApplicationId ? 'Editar Aplicação' : 'Nova Aplicação'}</h3>
                                <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                                        <MapPin size={16} /> Localização e Status
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs text-slate-500 font-bold ml-1">Data</label>
                                            <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs text-slate-500 font-bold ml-1">Talhão</label>
                                            <select
                                                required
                                                value={formData.plotId}
                                                onChange={e => setFormData({ ...formData, plotId: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500"
                                            >
                                                <option value="">Selecione o talhão...</option>
                                                {properties.map(prop => (
                                                    <optgroup key={prop.id} label={prop.name}>
                                                        {plots.filter(p => p.propertyId === prop.id).map(plot => (
                                                            <option key={plot.id} value={plot.id}>{plot.name} ({plot.area} ha)</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs text-slate-500 font-bold ml-1">Alvo da Aplicação</label>
                                            <input placeholder="Ex: Lagarta, Ferrugem, Dessecação" value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500 font-bold ml-1">Área Aplicada (ha)</label>
                                            <input type="number" step="0.01" required placeholder="Ex: 50" value={formData.areaApplied} onChange={e => setFormData({ ...formData, areaApplied: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500 font-bold ml-1">Status</label>
                                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500">
                                                <option value="completed">Concluída</option>
                                                <option value="planned">Planejada</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                                        <Droplets size={16} /> Composição e Volume
                                    </h3>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase">Volume de Calda (L/ha)</label>
                                            <input type="number" placeholder="Ex: 100" value={formData.sprayVolume} onChange={e => setFormData({ ...formData, sprayVolume: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="pt-2 border-t border-slate-800">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase">Adicionar Produto</label>
                                            <select value={currentProduct.productId} onChange={e => setCurrentProduct({ ...currentProduct, productId: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 mt-1">
                                                <option value="">Selecione...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Saldo: {p.stock.toFixed(2)} {p.unit})</option>)}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-[2] space-y-1">
                                                <label className="text-[10px] text-slate-500 font-bold uppercase">Dose/ha</label>
                                                <input type="number" step="0.001" placeholder="Dose" value={currentProduct.dose} onChange={e => setCurrentProduct({ ...currentProduct, dose: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <label className="text-[10px] text-slate-500 font-bold uppercase">Unidade</label>
                                                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-[10px] text-white outline-none focus:border-blue-500" value={currentProduct.unit || (products.find(p => p.id === parseInt(currentProduct.productId))?.unit || '')} onChange={e => setCurrentProduct({ ...currentProduct, unit: e.target.value })}>
                                                    <option value="L">L</option>
                                                    <option value="ml">ml</option>
                                                    <option value="kg">kg</option>
                                                    <option value="g">g</option>
                                                    <option value="dose">dose</option>
                                                    <option value="un">un</option>
                                                </select>
                                            </div>
                                            <button type="button" onClick={handleAddProductToMix} disabled={!currentProduct.productId || !currentProduct.dose} className="mt-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-2 rounded-lg transition-colors"><Plus size={20} /></button>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            {formData.appliedProducts.map((p: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{p.productName}</p>
                                                        <p className="text-[10px] text-slate-500">{p.dose} {p.doseUnit}/ha • Total: {p.totalQuantity.toFixed(2)} {p.unit}</p>
                                                    </div>
                                                    <button type="button" onClick={() => removeProductFromMix(i)} className="text-rose-500 hover:text-rose-400 p-1"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center gap-2">
                                        <ClipboardList size={16} /> Operação e Clima
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs text-slate-500 font-bold ml-1">Operador</label>
                                            <select value={formData.operator} onChange={e => setFormData({ ...formData, operator: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500">
                                                <option value="">Selecione...</option>
                                                {collaborators.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs text-slate-500 font-bold ml-1">Equipamento</label>
                                            <input placeholder="Ex: Trator JD 6125J + Pulv. 2000L" value={formData.equipment} onChange={e => setFormData({ ...formData, equipment: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1"><Thermometer size={10} /> Temp (°C)</label>
                                            <input type="number" value={formData.weather.temp} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, temp: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1"><Droplet size={10} /> Umid (%)</label>
                                            <input type="number" value={formData.weather.humidity} onChange={e => setFormData({ ...formData, weather: { ...formData.weather, humidity: e.target.value } })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs text-slate-500 font-bold ml-1">Observações</label>
                                            <textarea rows={3} value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500 text-sm" placeholder="Condições do solo, vento, etc..." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Custo Estimado da Aplicação</p>
                                    <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalApplicationCost, settings.currency)}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-3 rounded-xl bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
                                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
                                        {editingApplicationId ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR APLICAÇÃO'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                        <Sprout size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                        <p className="text-slate-500 font-bold">Nenhuma aplicação encontrada.</p>
                    </div>
                ) : (
                    filteredApplications.map((app, idx) => (
                        <div key={app.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all animate-fade-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                            {app.status === 'completed' ? 'Concluída' : 'Planejada'}
                                        </span>
                                        <h4 className="font-bold text-white text-lg">{app.plotName}</h4>
                                        <span className="text-slate-500 text-xs font-medium flex items-center gap-1"><Calendar size={12} /> {new Date(app.date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 mb-4">
                                        <span className="flex items-center gap-1"><LandPlot size={14} /> {app.areaApplied} ha</span>
                                        <span className="flex items-center gap-1"><User size={14} /> {app.operator || 'N/A'}</span>
                                        <span className="flex items-center gap-1"><Droplets size={14} /> {app.target || 'Alvo não definido'}</span>
                                        {app.weather?.temp && <span className="flex items-center gap-1"><Thermometer size={14} /> {app.weather.temp}°C</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(app.appliedProducts || []).map((p: any, i: number) => (
                                            <span key={i} className="bg-slate-900/80 px-2 py-1 rounded-lg text-[10px] text-slate-300 border border-slate-700/50">
                                                {p.productName}: <span className="text-white font-bold">{p.dose} {p.doseUnit}/ha</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-row lg:flex-col justify-between items-end gap-4 min-w-[150px]">
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Custo Total</p>
                                        <p className="text-xl font-black text-white">{formatCurrency(app.totalCost, settings.currency)}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => cloneApplication(app)} className="p-2 hover:bg-blue-500/10 rounded-xl text-slate-400 hover:text-blue-400 transition-all" title="Clonar Aplicação"><Copy size={18} /></button>
                                        <button onClick={() => editApplication(app)} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"><Edit size={18} /></button>
                                        <button onClick={() => deleteApplication(app)} className="p-2 hover:bg-rose-500/10 rounded-xl text-slate-600 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
