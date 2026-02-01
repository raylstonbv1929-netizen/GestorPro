import React, { useState, useMemo } from 'react';
import {
    Plus, Search, History as HistoryIcon, Box, Settings2, Database, SlidersHorizontal, X as CloseIcon, Table,
    Activity, Zap, Filter, LayoutGrid, List, Layers, Package
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatNumber, parseValue, maskNumber, maskValue } from '../../utils/format';
import { Product } from '../../types';
import { TechnicalConfirmModal } from '../../components/ui/TechnicalConfirmModal';

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
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [activeFormZone, setActiveFormZone] = useState(1);
    const [quickAdjustProduct, setQuickAdjustProduct] = useState<Product | null>(null);
    const [quickAdjustType, setQuickAdjustType] = useState<'in' | 'out'>('in');
    const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productIdToDelete, setProductIdToDelete] = useState<number | null>(null);

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
        capacityUnit: '',
        unitWeight: '', minStock: '', price: '', location: '', batch: '', expirationDate: ''
    });

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
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
    }, [products, searchTerm, advancedFilters]);

    const stats = useMemo(() => {
        const totalItems = products.length;
        const lowStockItems = products.filter(p => p.status !== 'ok').length;
        const totalStockValue = products.reduce((acc, p) => acc + (Number(p.stock) * Number(p.price)), 0);
        return { totalItems, lowStockItems, totalStockValue };
    }, [products]);

    const handleQuickAdjust = (payload: any) => {
        handleStockAdjustment({
            ...payload,
            customUser: payload.operator
        });
        addActivity(payload.type === 'in' ? 'Entrada (Ajuste Rápido)' : 'Saída (Ajuste Rápido)', `Produto ID: ${payload.productId}`, 'neutral');
    };

    const handleProductSubmit = (e?: React.FormEvent, stayOpen = false) => {
        if (e) e.preventDefault();
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
            addActivity('Atualizou registro técnico', productData.name, 'neutral');
        } else {
            const newId = Date.now();
            const newProduct = { ...productData, id: newId };
            setProducts([newProduct, ...products]);
            addActivity('Cadastrou novo insumo', productData.name, 'neutral');

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
        if (!stayOpen) setIsProductFormOpen(false);
        resetProductForm();
    };

    const resetProductForm = () => {
        setEditingProductId(null);
        setActiveFormZone(1);
        setProductForm({ name: '', category: 'Fertilizantes', stock: '', unit: 'kg', capacityUnit: '', unitWeight: '', minStock: '', price: '', location: '', batch: '', expirationDate: '' });
    };

    const handleBulkSubmit = (newProducts: any[]) => {
        const productsWithIds = newProducts.map((p, index) => ({ ...p, id: Date.now() + index }));
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
        addActivity('Implantação Massiva Concluída', `${newProducts.length} novos insumos registrados`, 'neutral');
        setIsBulkEntryOpen(false);
    };

    const deleteProduct = (id: number) => {
        setProductIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProduct = () => {
        if (productIdToDelete) {
            const product = products.find(p => p.id === productIdToDelete);
            if (product) {
                addActivity('Removeu do inventário', product.name, 'neutral');
            }
            setProducts(products.filter(p => p.id !== productIdToDelete));
            setProductIdToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const openEdit = (product: Product) => {
        setEditingProductId(product.id);
        setProductForm({
            name: product.name,
            category: product.category,
            stock: maskNumber(product.stock),
            unit: product.unit,
            capacityUnit: product.capacityUnit || '',
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

    const handleDuplicate = (product: Product) => {
        setEditingProductId(null); // It's a new product
        setProductForm({
            name: `${product.name} (CÓPIA)`,
            category: product.category,
            stock: '', // Usually reset stock for new entry, but can keep others
            unit: product.unit,
            capacityUnit: product.capacityUnit || '',
            unitWeight: maskNumber(product.unitWeight || 1),
            minStock: maskNumber(product.minStock),
            price: maskValue(product.price),
            location: product.location || '',
            batch: '',
            expirationDate: ''
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

        if (agricolas.includes(category)) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
        if (logistica.includes(category)) return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
        if (infra.includes(category)) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (op.includes(category)) return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
        if (pecuaria.includes(category)) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
            {/* PRODUCT SENTINEL COMMAND CENTER */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 z-20" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                        <Database size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                            Console de Inventário
                        </h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                            Auditoria Logística e Controle de Insumos
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner relative z-10 w-full lg:w-auto">
                    <button
                        onClick={() => setActiveSubTab('list')}
                        className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden group ${activeSubTab === 'list' ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Box size={14} /> Ativos
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveSubTab('movements')}
                        className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden group ${activeSubTab === 'movements' ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <HistoryIcon size={14} /> Log Movimentações
                        </span>
                    </button>
                </div>
            </div>

            {activeSubTab === 'list' ? (
                <>
                    <StockStats
                        totalItems={stats.totalItems}
                        lowStockItems={stats.lowStockItems}
                        totalStockValue={stats.totalStockValue}
                        currency={settings.currency}
                    />

                    {/* ACTION PANEL */}
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                placeholder="VARREDURA DE INVENTÁRIO (NOME/LOTE/LOCAL)..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-white focus:border-emerald-500/50 outline-none transition-all shadow-inner tracking-widest uppercase italic"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsAdvancedFiltersOpen(true)}
                                className={`px-6 rounded-2xl border transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${Object.values(advancedFilters).some(v => Array.isArray(v) ? v.length > 0 : v !== '' && v !== null) ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                            >
                                <SlidersHorizontal size={18} /> FILTROS
                            </button>
                            <button
                                onClick={() => setIsBulkEntryOpen(true)}
                                className="px-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 hover:text-white transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                            >
                                <Table size={18} /> LOTE
                            </button>
                            <button
                                onClick={() => { resetProductForm(); setIsProductFormOpen(true); }}
                                className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3 border-b-4 border-emerald-800"
                            >
                                <Plus size={18} /> REGISTRAR
                            </button>
                        </div>
                    </div>

                    {/* Filter Chips */}
                    {Object.values(advancedFilters).some(v => Array.isArray(v) ? v.length > 0 : v !== '' && v !== null) && (
                        <div className="flex flex-wrap gap-2 animate-fade-in px-2">
                            {advancedFilters.categories.map(cat => (
                                <span key={cat} className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 italic">
                                    {cat} <CloseIcon size={10} className="cursor-pointer hover:text-white" onClick={() => setAdvancedFilters({ ...advancedFilters, categories: advancedFilters.categories.filter(c => c !== cat) })} />
                                </span>
                            ))}
                            <button onClick={() => setAdvancedFilters(initialFilters)} className="text-[9px] font-black text-slate-600 hover:text-rose-500 uppercase tracking-widest transition-colors ml-2 italic underline underline-offset-4">Resetar Filtros</button>
                        </div>
                    )}

                    {/* PRODUCT GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8 pb-20">
                        {filteredProducts.map(prod => (
                            <ProductCard
                                key={prod.id}
                                prod={prod}
                                settings={settings}
                                onEdit={openEdit}
                                onDelete={deleteProduct}
                                onAdjustStock={(id, amount) => {
                                    const p = products.find(prod => prod.id === id);
                                    if (p) {
                                        setQuickAdjustProduct(p);
                                        setQuickAdjustType(amount > 0 ? 'in' : 'out');
                                    }
                                }}
                                onViewHistory={(p) => { setHistoryProduct(p); setIsHistoryDrawerOpen(true); }}
                                onDuplicate={handleDuplicate}
                                getCategoryStyles={getCategoryStyles}
                            />
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-10 italic space-y-6 grayscale grayscale-0">
                                <Package size={80} className="text-emerald-500/20" />
                                <p className="text-xs font-black uppercase tracking-[0.5em] text-center">Nenhum insumo detectado na varredura.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="min-h-0 h-full flex flex-col">
                    <MovementsLedger stockMovements={stockMovements} products={products} />
                </div>
            )}

            {/* MODALS */}
            <AuditForm
                isOpen={isProductFormOpen}
                editingProductId={editingProductId}
                productForm={productForm}
                setProductForm={setProductForm}
                activeFormZone={activeFormZone}
                setActiveFormZone={setActiveFormZone}
                onClose={() => setIsProductFormOpen(false)}
                onSubmit={handleProductSubmit}
                onSaveAndContinue={() => handleProductSubmit(undefined, true)}
                settings={settings}
            />

            {quickAdjustProduct && (
                <QuickAdjustPopover
                    product={quickAdjustProduct}
                    initialType={quickAdjustType}
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

            <TechnicalConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteProduct}
                title="Desativação Permanentemente de Insumo"
                description={`Você está prestes a remover o registro técnico deste item. Isso restringe o acesso ao histórico rápido e remove o item da contagem de balanço ativa.`}
                criticalInfo="Embora o log de movimentações seja preservado, o produto não poderá mais ser utilizado em novas aplicações de campo até ser recadastrado."
            />
        </div>
    );
};
