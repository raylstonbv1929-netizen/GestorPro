import React, { useState } from 'react';
import {
    Warehouse, Package, AlertTriangle, Scale, Search, X, Plus,
    Layout, MapPin, Edit, Trash2, History
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { formatCurrency, formatNumber, parseValue, maskNumber, maskValue } from '../../utils/format';

export const ProductsPage = () => {
    const {
        products, setProducts, stockMovements, setStockMovements,
        handleStockAdjustment, addActivity, settings
    } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' or 'movements'
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [productForm, setProductForm] = useState({
        name: '', category: 'Fertilizantes', stock: '', unit: 'kg',
        unitWeight: '', minStock: '', price: '', location: '', expiration: ''
    });

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ? true : filter === 'low' ? p.status === 'low' : p.category === filter;
        return matchesSearch && matchesFilter;
    });

    const totalItems = products.length;
    const lowStockItems = products.filter(p => p.status === 'low').length;
    const totalStockValue = products.reduce((acc, p) => acc + (parseValue(p.stock) * parseValue(p.price)), 0);

    const adjustStock = (id: number, amount: number) => {
        handleStockAdjustment({
            productId: id,
            type: amount > 0 ? 'in' : 'out',
            quantity: Math.abs(amount),
            reason: 'Ajuste manual rápido'
        });
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
            addActivity('Editou produto', productData.name);
        } else {
            const newId = Date.now();
            const newProduct = { ...productData, id: newId };
            setProducts([newProduct, ...products]);
            addActivity('Adicionou produto', productData.name);

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
                    reason: 'Estoque inicial no cadastro',
                    user: settings.userName || 'Sistema'
                };
                setStockMovements([movement, ...stockMovements]);
            }
        }
        setIsProductFormOpen(false);
        setEditingProductId(null);
        setProductForm({ name: '', category: 'Fertilizantes', stock: '', unit: 'kg', unitWeight: '', minStock: '', price: '', location: '', expiration: '' });
    };

    const deleteProduct = (id: number) => {
        const product = products.find(p => p.id === id);
        if (product) {
            addActivity('Removeu produto', product.name);
        }
        setProducts(products.filter(p => p.id !== id));
    };

    return (
        <div className="animate-fade-in space-y-6 flex flex-col h-[calc(100vh-180px)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/20 p-6 rounded-3xl border border-slate-800/50">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Warehouse size={28} />
                        </div>
                        Gestão de Estoque
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 ml-14">Controle total de insumos e materiais</p>
                </div>

                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div
                        className={`absolute top-1.5 bottom-1.5 transition-all duration-300 ease-out bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 ${activeSubTab === 'list' ? 'left-1.5 w-[110px]' : 'left-[125px] w-[150px]'}`}
                    />
                    <button
                        onClick={() => setActiveSubTab('list')}
                        className={`relative z-10 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeSubTab === 'list' ? 'text-emerald-950' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Produtos
                    </button>
                    <button
                        onClick={() => setActiveSubTab('movements')}
                        className={`relative z-10 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeSubTab === 'movements' ? 'text-emerald-950' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Movimentações
                    </button>
                </div>
            </div>

            {activeSubTab === 'list' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div onClick={() => setFilter('all')} className={`bg-slate-900/40 border p-6 rounded-3xl flex items-center gap-5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group ${filter === 'all' ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-700'}`}>
                            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform shadow-inner"><Package size={28} /></div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Total de Itens</p>
                                <p className="text-3xl font-black text-white leading-none">{totalItems}</p>
                            </div>
                        </div>
                        <div onClick={() => setFilter('low')} className={`bg-slate-900/40 border p-6 rounded-3xl flex items-center gap-5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 group ${filter === 'low' ? 'border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20' : 'border-slate-800 hover:border-slate-700'}`}>
                            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform shadow-inner"><AlertTriangle size={28} /></div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Estoque Baixo</p>
                                <p className="text-3xl font-black text-white leading-none">{lowStockItems}</p>
                            </div>
                        </div>
                        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex items-center gap-5 shadow-inner">
                            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 shadow-inner"><Scale size={28} /></div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Valor Investido</p>
                                <p className="text-3xl font-black text-white leading-none">{formatCurrency(totalStockValue, settings.currency)}</p>
                            </div>
                        </div>
                    </div>

                    <Card variant="highlight" className="p-5 border-slate-800/60 rounded-3xl shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, categoria ou localização..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
                                />
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3.5 text-xs font-black text-slate-400 outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer hover:text-white pr-12"
                                >
                                    <option value="all">Todas Categorias</option>
                                    <option value="low">Estoque Baixo</option>
                                    <option value="Fertilizantes">Fertilizantes</option>
                                    <option value="Sementes">Sementes</option>
                                    <option value="Defensivos">Defensivos</option>
                                    <option value="Herbicidas">Herbicidas</option>
                                    <option value="Fungicidas">Fungicidas</option>
                                    <option value="Inseticidas">Inseticidas</option>
                                    <option value="Corretivos">Corretivos</option>
                                    <option value="Nutrição Foliar">Nutrição Foliar</option>
                                    <option value="Peças">Peças</option>
                                    <option value="Combustível">Combustível</option>
                                    <option value="Lubrificantes">Lubrificantes</option>
                                    <option value="EPIs">EPIs</option>
                                    <option value="Ferramentas">Ferramentas</option>
                                    <option value="Embalagens">Embalagens</option>
                                    <option value="Outros">Outros</option>
                                </select>
                                <button
                                    onClick={() => { setIsProductFormOpen(true); setEditingProductId(null); setProductForm({ name: '', category: 'Fertilizantes', stock: '', unit: 'kg', unitWeight: '', minStock: '', price: '', location: '', expiration: '' }); }}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 whitespace-nowrap active:scale-95"
                                >
                                    <Plus size={20} />
                                    <span>Novo Produto</span>
                                </button>
                            </div>
                        </div>
                    </Card>

                    {isProductFormOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsProductFormOpen(false)} />
                            <Card variant="highlight" className="w-full max-w-3xl relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100" style={{ transform: 'none' }}>
                                <form onSubmit={handleProductSubmit} className="space-y-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-widest">{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h3>
                                        <button type="button" onClick={() => setIsProductFormOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="md:col-span-2 flex flex-col gap-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Nome do Produto</label>
                                            <input required placeholder="Ex: Adubo NPK 10-10-10" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Categoria</label>
                                            <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner">
                                                <option>Fertilizantes</option>
                                                <option>Sementes</option>
                                                <option>Defensivos</option>
                                                <option>Herbicidas</option>
                                                <option>Fungicidas</option>
                                                <option>Inseticidas</option>
                                                <option>Corretivos</option>
                                                <option>Nutrição Foliar</option>
                                                <option>Peças</option>
                                                <option>Combustível</option>
                                                <option>Lubrificantes</option>
                                                <option>EPIs</option>
                                                <option>Ferramentas</option>
                                                <option>Embalagens</option>
                                                <option>Outros</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Unidade</label>
                                            <select value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner">
                                                <optgroup label="Peso/Massa">
                                                    <option>kg</option>
                                                    <option>g</option>
                                                    <option>ton</option>
                                                    <option>@ (arroba)</option>
                                                </optgroup>
                                                <optgroup label="Volume/Líquidos">
                                                    <option>L</option>
                                                    <option>ml</option>
                                                    <option>galão</option>
                                                    <option>bombona</option>
                                                    <option>balde</option>
                                                </optgroup>
                                                <optgroup label="Embalagens/Unidades">
                                                    <option>un</option>
                                                    <option>sc (saco)</option>
                                                    <option>bag (big bag)</option>
                                                    <option>caixa</option>
                                                </optgroup>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Peso/Vol. Ref.</label>
                                            <input placeholder="Ex: 25,00" value={productForm.unitWeight} onChange={e => setProductForm({ ...productForm, unitWeight: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Estoque Inicial</label>
                                            <input placeholder="0,00" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Estoque Mínimo</label>
                                            <input placeholder="0,00" value={productForm.minStock} onChange={e => setProductForm({ ...productForm, minStock: maskNumber(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Preço Unitário</label>
                                            <input placeholder="0,00" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: maskValue(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                        </div>

                                        <div className="md:col-span-2 flex flex-col gap-2">
                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-1">Localização</label>
                                            <input placeholder="Ex: Galpão A, Prateleira 2" value={productForm.location} onChange={e => setProductForm({ ...productForm, location: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setIsProductFormOpen(false)} className="px-8 py-3 rounded-xl bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
                                        <button type="submit" className="px-10 py-3 rounded-xl bg-emerald-500 text-emerald-950 font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                                            {editingProductId ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
                                        </button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1 overflow-y-auto p-2 pb-20 custom-scrollbar min-h-0">
                        {filteredProducts.map(prod => (
                            <Card key={prod.id} className="group hover:border-emerald-500/30 p-0 overflow-hidden flex flex-col border-slate-800/60 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 rounded-3xl min-h-[450px]">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner group-hover:border-emerald-500/30">
                                                <Package size={26} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-base tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">{prod.name}</h4>
                                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{prod.category}</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${prod.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'}`}>
                                            {prod.status === 'ok' ? 'Normal' : 'Crítico'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 group-hover:border-emerald-500/20 transition-all relative overflow-hidden shadow-inner">
                                            <span className="text-[9px] text-slate-500 block uppercase font-black tracking-widest mb-1.5">Saldo Físico</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-2xl font-black text-white">{formatNumber(prod.stock)}</span>
                                                <span className="text-xs text-slate-500 font-black uppercase">{prod.unit}</span>
                                            </div>
                                            <div className="mt-1.5 text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                                                <Scale size={12} className="text-emerald-500/50" />
                                                ≈ {formatNumber(parseValue(prod.stock) * (parseFloat(prod.unitWeight as any) || 1))} {['L', 'ml', 'galão', 'tambor', 'bombona', 'balde', 'frasco', 'ampola', 'bisnaga'].includes(prod.unit) ? 'L' : 'kg'}
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 group-hover:border-emerald-500/20 transition-all shadow-inner">
                                            <span className="text-[9px] text-slate-500 block uppercase font-black tracking-widest mb-1.5">Valor Unitário</span>
                                            <div className="text-2xl font-black text-white leading-none mb-1.5">{formatCurrency(prod.price, settings.currency)}</div>
                                            <div className="text-[10px] text-slate-400 font-bold">
                                                Total: {formatCurrency(parseValue(prod.stock) * parseValue(prod.price), settings.currency)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/30">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> Localização</span>
                                            <span className="text-slate-200 font-black">{prod.location || 'Não definido'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-slate-500 font-black uppercase tracking-widest flex items-center gap-2"><Scale size={14} className="text-emerald-500" /> Peso Ref.</span>
                                            <span className="text-slate-200 font-black">{prod.unitWeight} Kg/L por {prod.unit}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-5 bg-slate-950/40 border-t border-slate-800/50 flex justify-between items-center">
                                    <div className="flex gap-3">
                                        <button onClick={() => { setEditingProductId(prod.id); setProductForm(prod as any); setIsProductFormOpen(true); }} className="p-2.5 bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-xl border border-slate-800 transition-all active:scale-90"><Edit size={18} /></button>
                                        <button onClick={() => deleteProduct(prod.id)} className="p-2.5 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 transition-all active:scale-90"><Trash2 size={18} /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); adjustStock(prod.id, -1); }} className="w-10 h-10 flex items-center justify-center bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 transition-all font-black text-lg active:scale-90">-</button>
                                        <button onClick={(e) => { e.stopPropagation(); adjustStock(prod.id, 1); }} className="w-10 h-10 flex items-center justify-center bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-xl border border-slate-800 transition-all font-black text-lg active:scale-90">+</button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <Card className="flex-1 overflow-hidden flex flex-col p-0 border-slate-800 rounded-3xl shadow-2xl">
                    <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shadow-inner">
                                <History size={20} />
                            </div>
                            Histórico de Movimentações
                        </h3>
                        <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-500 font-black uppercase tracking-widest shadow-inner">
                            Últimas {stockMovements.length} operações
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-950 z-10">
                                <tr className="border-b border-slate-800">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data/Hora</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Produto</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Quantidade</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Motivo/Origem</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Usuário</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {stockMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-600">
                                                <div className="p-6 bg-slate-900/50 rounded-full border border-slate-800 shadow-inner">
                                                    <History size={64} className="opacity-20" />
                                                </div>
                                                <p className="text-base font-black uppercase tracking-widest opacity-50">Nenhuma movimentação registrada</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    stockMovements.map(mov => (
                                        <tr key={mov.id} className="hover:bg-slate-900/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="text-xs font-black text-slate-300">{new Date(mov.date).toLocaleDateString('pt-BR')}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{new Date(mov.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">{mov.productName}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${mov.type === 'in' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                    {mov.type === 'in' ? 'Entrada' : 'Saída'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className={`text-xs font-black ${mov.type === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {mov.type === 'in' ? '+' : '-'}{formatNumber(mov.quantity)}
                                                    <span className="ml-1.5 text-[10px] text-slate-500 uppercase font-black">{mov.quantityUnit}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-[11px] text-slate-400 font-bold max-w-[250px] truncate">{mov.reason || 'Ajuste manual'}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-[11px] font-black text-emerald-400 border border-slate-700 shadow-inner">
                                                        {mov.user?.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs text-slate-300 font-black">{mov.user}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
