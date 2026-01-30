import React, { useState } from 'react';
import {
    Plus, Search, History as HistoryIcon, Box, Settings2, Database, SlidersHorizontal, X as CloseIcon, Table
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatNumber, parseValue, maskNumber, maskValue } from '../../utils/format';
import { Product } from '../../types';

// Modular Components
import { ProductCard } from './components/ProductCard';
import { AuditForm } from './components/AuditForm';
import { StockStats } from './components/StockStats';
import { MovementsLedger } from './components/MovementsLedger';
import { QuickAdjustPopover } from './components/QuickAdjustPopover';
import { AdvancedFilters, FilterCriteria } from './components/AdvancedFilters';
import { ProductHistoryDrawer } from './components/ProductHistoryDrawer';
import { BulkAuditForm } from './components/BulkAuditForm';

export const ProductsPage = () => {
    const {
        products, setProducts, stockMovements, setStockMovements,
        handleStockAdjustment, addActivity, settings,
        collaborators, properties, plots
    } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' or 'movements'
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [activeFormZone, setActiveFormZone] = useState(1);
    const [quickAdjustProduct, setQuickAdjustProduct] = useState<Product | null>(null);
    const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);

    const initialFilters: FilterCriteria = {
        categories: [],
        status: [],
        minPrice: '',
        maxPrice: '',
        minStock: '',
        maxStock: '',
        expirationWindow: null
    };

    const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria>(initialFilters);

    const [productForm, setProductForm] = useState({
        name: '', category: 'Fertilizantes', stock: '', unit: 'kg',
        unitWeight: '', minStock: '', price: '', location: '', batch: '', expirationDate: ''
    });

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.batch && p.batch.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = advancedFilters.categories.length === 0 || advancedFilters.categories.includes(p.category);

        const matchesStatus = advancedFilters.status.length === 0 || advancedFilters.status.some(s => {
            if (s === 'ok') return p.status === 'ok';
            if (s === 'low') return p.status === 'low';
            if (s === 'critical') return p.status === 'critical';
            if (s === 'expiring') {
                if (!p.expirationDate) return false;
                const daysToExpiration = (new Date(p.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                return daysToExpiration > 0 && daysToExpiration <= 30;
            }
            return true;
        });

        const matchesPrice = (advancedFilters.minPrice === '' || p.price >= parseValue(advancedFilters.minPrice)) &&
            (advancedFilters.maxPrice === '' || p.price <= parseValue(advancedFilters.maxPrice));

        const matchesStock = (advancedFilters.minStock === '' || p.stock >= parseValue(advancedFilters.minStock)) &&
            (advancedFilters.maxStock === '' || p.stock <= parseValue(advancedFilters.maxStock));

        const matchesExpirationWindow = advancedFilters.expirationWindow === null || (() => {
            if (!p.expirationDate) return false;
            const daysToExpiration = (new Date(p.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            return daysToExpiration > 0 && daysToExpiration <= advancedFilters.expirationWindow;
        })();

        return matchesSearch && matchesCategory && matchesStatus && matchesPrice && matchesStock && matchesExpirationWindow;
    });

    const totalItems = products.length;
    const lowStockItems = products.filter(p => p.status !== 'ok').length;
    const totalStockValue = products.reduce((acc, p) => acc + (Number(p.stock) * Number(p.price)), 0);

    const handleQuickAdjust = (payload: any) => {
        handleStockAdjustment({
            ...payload,
            customUser: payload.operator
        });
        addActivity(payload.type === 'in' ? 'Entrada (Ajuste Rápido)' : 'Saída (Ajuste Rápido)', `Produto ID: ${payload.productId}`);
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData: any = {
            ...productForm,
            stock: parseValue(productForm.stock),
            minStock: parseValue(productForm.minStock),
            price: parseValue(productForm.price),
            unitWeight: parseValue(productForm.unitWeight) || 1,
            status: parseValue(productForm.stock) <= parseValue(productForm.minStock) ? 'low' : 'ok'
        };

        if (editingProductId) {
            setProducts(products.map(p => p.id === editingProductId ? { ...p, ...productData } : p));
            addActivity('Atualizou registro técnico', productData.name);
        } else {
            const newId = Date.now();
            const newProduct = { ...productData, id: newId };
            setProducts([newProduct, ...products]);
            addActivity('Cadastrou novo insumo', productData.name);

            if (productData.stock > 0) {
                const movement: any = {
                    id: Date.now() + 1,
                    productId: newId,
                    productName: productData.name,
                    type: 'in',
                    quantity: productData.stock,
                    quantityUnit: productData.unit,
                    realChange: productData.stock,
                    date: new Date().toISOString(),
                    reason: 'Saldo inicial de implantação',
                    user: settings.userName || 'Sistema',
                    batch: productData.batch
                };
                setStockMovements([movement, ...stockMovements]);
            }
        }
        setIsProductFormOpen(false);
        setEditingProductId(null);
        setActiveFormZone(1);
        setProductForm({ name: '', category: 'Fertilizantes', stock: '', unit: 'kg', unitWeight: '', minStock: '', price: '', location: '', batch: '', expirationDate: '' });
    };

    const handleBulkSubmit = (newProducts: any[]) => {
        const productsWithIds = newProducts.map((p, index) => ({
            ...p,
            id: Date.now() + index
        }));

        setProducts([...productsWithIds, ...products]);

        const newMovements = productsWithIds.map((p, index) => ({
            id: Date.now() + 100 + index,
            productId: p.id,
            productName: p.name,
            type: 'in' as const,
            quantity: p.stock,
            quantityUnit: p.unit,
            realChange: p.stock,
            date: new Date().toISOString(),
            reason: 'Implantação Massiva SpeedGrid™',
            user: settings.userName || 'Sistema',
            batch: ''
        }));

        setStockMovements([...newMovements, ...stockMovements]);
        addActivity('Implantação Massiva Concluída', `${newProducts.length} novos insumos registrados`);
        setIsBulkEntryOpen(false);
    };

    const deleteProduct = (id: number) => {
        if (confirm('Deseja realmente remover este item do inventário? Esta ação é irreversível.')) {
            const product = products.find(p => p.id === id);
            if (product) {
                addActivity('Removeu do inventário', product.name);
            }
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const openEdit = (product: Product) => {
        setEditingProductId(product.id);
        setProductForm({
            name: product.name,
            category: product.category,
            stock: maskNumber(product.stock),
            unit: product.unit,
            unitWeight: maskNumber(product.unitWeight || 1),
            minStock: maskNumber(product.minStock),
            price: maskValue(product.price),
            location: product.location || '',
            batch: product.batch || '',
            expirationDate: product.expirationDate || ''
        });
        setIsProductFormOpen(true);
        setActiveFormZone(1);
    };

    const getCategoryStyles = (category: string) => {
        const agricolas = ['Fertilizantes', 'Sementes', 'Defensivos', 'Herbicidas', 'Fungicidas', 'Inseticidas', 'Adjuvantes', 'Corretivos', 'Nutrição Foliar'];
        const logistica = ['Combustível', 'Lubrificantes', 'Peças', 'Pneus', 'Filtros'];
        const infra = ['Ferramentas', 'Materiais de Construção', 'Elétrica', 'Hidráulica', 'Ferragens'];
        const op = ['EPIs', 'Embalagens', 'Limpeza'];
        const pecuaria = ['Medicamentos Veterinários', 'Suplementos & Nutrição', 'Vacinas'];

        if (agricolas.includes(category)) return 'text-emerald-500 bg-emerald-500/10';
        if (logistica.includes(category)) return 'text-blue-500 bg-blue-500/10';
        if (infra.includes(category)) return 'text-amber-500 bg-amber-500/10';
        if (op.includes(category)) return 'text-cyan-500 bg-cyan-500/10';
        if (pecuaria.includes(category)) return 'text-rose-500 bg-rose-500/10';
        return 'text-slate-500 bg-slate-500/10';
    };

    return (
        <div className="animate-fade-in space-y-6 flex flex-col min-h-0 h-full p-1">
            {/* HEADER TÁTICO */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10 relative group">
                        <Database size={36} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-emerald-950 text-[10px] font-black rounded-lg flex items-center justify-center border-4 border-slate-900 shadow-xl">
                            {totalItems}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Console de Inventário</h2>
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-500 font-black uppercase tracking-widest">PRO MAX v4</span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 italic">
                            <Settings2 size={12} className="text-emerald-500" /> Auditoria Logística de Precisão
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner relative z-10 w-full xl:w-auto">
                    <button
                        onClick={() => setActiveSubTab('list')}
                        className={`flex-1 xl:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden group ${activeSubTab === 'list' ? 'text-emerald-950' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {activeSubTab === 'list' && <div className="absolute inset-0 bg-emerald-500 transition-all duration-500" />}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Box size={14} /> Produtos
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveSubTab('movements')}
                        className={`flex-1 xl:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden group ${activeSubTab === 'movements' ? 'text-emerald-950' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {activeSubTab === 'movements' && <div className="absolute inset-0 bg-emerald-500 transition-all duration-500" />}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <HistoryIcon size={14} /> Movimentações
                        </span>
                    </button>
                </div>
            </div>

            {activeSubTab === 'list' ? (
                <>
                    <StockStats
                        totalItems={totalItems}
                        lowStockItems={lowStockItems}
                        totalStockValue={totalStockValue}
                        currency={settings.currency}
                    />

                    {/* BARRA DE COMANDO */}
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/60 backdrop-blur-xl flex flex-col xl:flex-row justify-between items-center gap-6 shadow-xl">
                        <div className="relative w-full xl:w-[500px] group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                placeholder="LOCALIZAR INSUMO OU LOTE..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner tracking-widest uppercase italic"
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full xl:w-auto">
                            <button
                                onClick={() => setIsAdvancedFiltersOpen(true)}
                                className={`px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all border ${Object.values(advancedFilters).some(v => Array.isArray(v) ? v.length > 0 : v !== '' && v !== null)
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                    }`}
                            >
                                <SlidersHorizontal size={18} />
                                Filtros Avançados
                            </button>

                            <button
                                onClick={() => setIsBulkEntryOpen(true)}
                                className="bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all border border-slate-800 hover:border-slate-700 active:scale-95"
                            >
                                <Table size={18} />
                                LOTE MASSIVO
                            </button>

                            <button
                                onClick={() => { setIsProductFormOpen(true); setEditingProductId(null); setActiveFormZone(1); setProductForm({ name: '', category: 'Fertilizantes', stock: '', unit: 'kg', unitWeight: '', minStock: '', price: '', location: '', batch: '', expirationDate: '' }); }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={18} strokeWidth={3} />
                                REGISTRAR INSUMO
                            </button>
                        </div>
                    </div>

                    {/* Filter Chips Area */}
                    {Object.values(advancedFilters).some(v => Array.isArray(v) ? v.length > 0 : v !== '' && v !== null) && (
                        <div className="flex flex-wrap gap-2 px-2 animate-fade-in">
                            {advancedFilters.categories.map(cat => (
                                <span key={cat} className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                    {cat} <CloseIcon size={10} className="cursor-pointer hover:text-white" onClick={() => setAdvancedFilters({ ...advancedFilters, categories: advancedFilters.categories.filter(c => c !== cat) })} />
                                </span>
                            ))}
                            {advancedFilters.status.map(s => (
                                <span key={s} className="px-3 py-1.5 bg-orange-500/5 border border-orange-500/20 rounded-lg text-[8px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                                    STATUS: {s.toUpperCase()} <CloseIcon size={10} className="cursor-pointer hover:text-white" onClick={() => setAdvancedFilters({ ...advancedFilters, status: advancedFilters.status.filter(st => st !== s) })} />
                                </span>
                            ))}
                            {(advancedFilters.minPrice || advancedFilters.maxPrice) && (
                                <span className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-lg text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    FAIXA PREÇO <CloseIcon size={10} className="cursor-pointer hover:text-white" onClick={() => setAdvancedFilters({ ...advancedFilters, minPrice: '', maxPrice: '' })} />
                                </span>
                            )}
                            {advancedFilters.expirationWindow && (
                                <span className="px-3 py-1.5 bg-rose-500/5 border border-rose-500/20 rounded-lg text-[8px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                    VENCE EM {advancedFilters.expirationWindow} DIAS <CloseIcon size={10} className="cursor-pointer hover:text-white" onClick={() => setAdvancedFilters({ ...advancedFilters, expirationWindow: null })} />
                                </span>
                            )}
                            <button onClick={() => setAdvancedFilters(initialFilters)} className="px-3 py-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Limpar Tudo</button>
                        </div>
                    )}

                    {/* GRID DE AUDITORIA */}
                    <div className="flex-1 min-h-[400px] grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
                        {filteredProducts.map(prod => (
                            <ProductCard
                                key={prod.id}
                                prod={prod}
                                settings={settings}
                                onEdit={openEdit}
                                onDelete={deleteProduct}
                                onAdjustStock={(id) => setQuickAdjustProduct(products.find(p => p.id === id) || null)}
                                onViewHistory={(p) => { setHistoryProduct(p); setIsHistoryDrawerOpen(true); }}
                                getCategoryStyles={getCategoryStyles}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <MovementsLedger stockMovements={stockMovements} />
            )}

            <AuditForm
                isOpen={isProductFormOpen}
                editingProductId={editingProductId}
                productForm={productForm}
                setProductForm={setProductForm}
                activeFormZone={activeFormZone}
                setActiveFormZone={setActiveFormZone}
                onClose={() => setIsProductFormOpen(false)}
                onSubmit={handleProductSubmit}
                settings={settings}
            />

            {quickAdjustProduct && (
                <QuickAdjustPopover
                    product={quickAdjustProduct}
                    onClose={() => setQuickAdjustProduct(null)}
                    onAdjust={handleQuickAdjust}
                    collaborators={collaborators}
                    properties={properties}
                    plots={plots}
                    settings={settings}
                />
            )}

            <AdvancedFilters
                isOpen={isAdvancedFiltersOpen}
                onClose={() => setIsAdvancedFiltersOpen(false)}
                filters={advancedFilters}
                setFilters={setAdvancedFilters}
                onClear={() => setAdvancedFilters(initialFilters)}
            />

            {historyProduct && (
                <ProductHistoryDrawer
                    isOpen={isHistoryDrawerOpen}
                    onClose={() => setIsHistoryDrawerOpen(false)}
                    product={historyProduct}
                    movements={stockMovements}
                />
            )}

            <BulkAuditForm
                isOpen={isBulkEntryOpen}
                onClose={() => setIsBulkEntryOpen(false)}
                onSubmit={handleBulkSubmit}
                settings={settings}
                existingProducts={products}
            />
        </div>
    );
};
