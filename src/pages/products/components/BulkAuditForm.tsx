import React, { useState, useCallback, useRef } from 'react';
import { X, Plus, Trash2, Save, Info, Table, ChevronRight, AlertCircle, Layers, Keyboard, Settings2, RotateCcw, Calendar, Database, FileCode, Upload, Eraser, Copy } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { maskNumber, maskValue, parseValue, formatCurrency } from '../../../utils/format';

interface BulkProductEntry {
    tempId: number;
    name: string;
    category: string;
    unit: string;
    capacityUnit: string;
    unitWeight: string;
    stock: string;
    price: string;
    minStock: string;
    batch: string;
    expirationDate: string;
    location: string;
}

interface BulkAuditFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (products: any[]) => void;
    settings: any;
    existingProducts: any[];
}

const SMART_MAP: Record<string, { category: string; unit: string; capacityUnit: string; unitWeight: string }> = {
    'FERTILIZANTE': { category: 'Fertilizantes', unit: 'kg', capacityUnit: 'kg', unitWeight: '1,00' },
    'NPK': { category: 'Fertilizantes', unit: 'kg', capacityUnit: 'kg', unitWeight: '1,00' },
    'UREIA': { category: 'Fertilizantes', unit: 'kg', capacityUnit: 'kg', unitWeight: '1,00' },
    'SEMENTE': { category: 'Sementes', unit: 'sc (saco)', capacityUnit: 'kg', unitWeight: '50,00' },
    'MILHO': { category: 'Sementes', unit: 'sc (saco)', capacityUnit: 'kg', unitWeight: '50,00' },
    'SOJA': { category: 'Sementes', unit: 'sc (saco)', capacityUnit: 'kg', unitWeight: '50,00' },
    'GLIFOSATO': { category: 'Defensivos', unit: 'L', capacityUnit: 'L', unitWeight: '1,00' },
    'HERBICIDA': { category: 'Defensivos', unit: 'L', capacityUnit: 'L', unitWeight: '1,00' },
    'DIESEL': { category: 'Combustível', unit: 'L', capacityUnit: 'L', unitWeight: '1,00' },
    'ÓLEO': { category: 'Combustível', unit: 'L', capacityUnit: 'L', unitWeight: '1,00' },
    'PEÇA': { category: 'Peças', unit: 'un', capacityUnit: 'un', unitWeight: '1,00' },
    'FILTRO': { category: 'Peças', unit: 'un', capacityUnit: 'un', unitWeight: '1,00' },
};

export const BulkAuditForm: React.FC<BulkAuditFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    settings,
    existingProducts = []
}) => {
    const initialEntry = { tempId: Date.now(), name: '', category: 'Fertilizantes', unit: 'kg', capacityUnit: 'kg', unitWeight: '1,00', stock: '', price: '', minStock: '', batch: '', expirationDate: '', location: '' };
    const [entries, setEntries] = useState<BulkProductEntry[]>([initialEntry]);
    const [globalCategory, setGlobalCategory] = useState('Fertilizantes');
    const [globalUnit, setGlobalUnit] = useState('kg');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const detectSmartFields = (name: string) => {
        const upper = name.toUpperCase();
        for (const [key, value] of Object.entries(SMART_MAP)) {
            if (upper.includes(key)) return value;
        }
        return null;
    };

    const addRow = useCallback(() => {
        setEntries(prev => [
            ...prev,
            { tempId: Date.now(), name: '', category: globalCategory, unit: globalUnit, capacityUnit: globalUnit === 'L' ? 'L' : 'kg', unitWeight: '1,00', stock: '', price: '', minStock: '', batch: '', expirationDate: '', location: '' }
        ]);
    }, [globalCategory, globalUnit]);

    const removeRow = (id: number) => {
        if (entries.length > 1) {
            setEntries(entries.filter(e => e.tempId !== id));
        }
    };

    const clearGrid = () => {
        if (window.confirm('Deseja realmente limpar todos os campos do terminal?')) {
            setEntries([{ ...initialEntry, tempId: Date.now() }]);
        }
    };

    const updateEntry = (id: number, field: keyof BulkProductEntry, value: string) => {
        setEntries(prev => prev.map(e => {
            if (e.tempId === id) {
                const updated = { ...e, [field]: value };
                if (field === 'name') {
                    const smart = detectSmartFields(value);
                    if (smart) {
                        updated.category = smart.category;
                        updated.unit = smart.unit;
                        updated.capacityUnit = smart.capacityUnit;
                        updated.unitWeight = smart.unitWeight;
                    }
                }
                return updated;
            }
            return e;
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, idx: number, field: keyof BulkProductEntry) => {
        if (e.ctrlKey && e.key === 'd' && idx > 0) {
            e.preventDefault();
            const prevValue = entries[idx - 1][field];
            updateEntry(entries[idx].tempId, field, String(prevValue));
        }
        if (e.key === 'Enter' && idx === entries.length - 1 && field === 'location') {
            e.preventDefault();
            addRow();
        }
    };

    const applyGlobals = () => {
        setEntries(entries.map(e => ({ ...e, category: globalCategory, unit: globalUnit })));
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasteData = e.clipboardData.getData('text');
        const lines = pasteData.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length > 0) {
            const newEntries = lines.map((line, index) => {
                const cols = line.split('\t');
                const name = cols[0] || '';
                const smart = detectSmartFields(name);
                return {
                    tempId: Date.now() + index,
                    name: (cols[0] || '').toUpperCase(),
                    category: cols[1] || smart?.category || globalCategory,
                    unit: cols[2] || smart?.unit || globalUnit,
                    capacityUnit: smart?.capacityUnit || (cols[2] === 'L' ? 'L' : 'kg'),
                    unitWeight: cols[3] || smart?.unitWeight || '1,00',
                    stock: cols[4] ? maskNumber(cols[4]) : '',
                    price: cols[5] ? maskValue(cols[5]) : '',
                    minStock: cols[6] ? maskNumber(cols[6]) : '',
                    batch: (cols[7] || '').toUpperCase(),
                    expirationDate: cols[8] || '',
                    location: (cols[9] || '').toUpperCase()
                };
            });
            setEntries(newEntries);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const xmlText = event.target?.result as string;
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                const details = xmlDoc.getElementsByTagName("det");

                if (details.length === 0) {
                    alert("Nenhum item de produto (tag <det>) encontrado no XML.");
                    return;
                }

                const newEntries: BulkProductEntry[] = [];
                for (let i = 0; i < details.length; i++) {
                    const det = details[i];
                    const prod = det.getElementsByTagName("prod")[0];
                    if (!prod) continue;

                    const name = prod.getElementsByTagName("xProd")[0]?.textContent || "";
                    const unit = prod.getElementsByTagName("uCom")[0]?.textContent || "";
                    const qCom = prod.getElementsByTagName("qCom")[0]?.textContent || "0";
                    const vUnCom = prod.getElementsByTagName("vUnCom")[0]?.textContent || "0";

                    // Rastro (Lote/Validade)
                    const rastro = det.getElementsByTagName("rastro")[0];
                    const batch = rastro?.getElementsByTagName("nLote")[0]?.textContent || "";
                    const dVal = rastro?.getElementsByTagName("dVal")[0]?.textContent || "";

                    const smart = detectSmartFields(name);

                    newEntries.push({
                        tempId: Date.now() + i,
                        name: name.toUpperCase(),
                        category: smart?.category || globalCategory,
                        unit: unit || smart?.unit || globalUnit,
                        capacityUnit: smart?.capacityUnit || (unit.includes('L') ? 'L' : 'kg'),
                        unitWeight: smart?.unitWeight || "1,00",
                        stock: maskNumber(qCom),
                        price: maskValue(vUnCom),
                        minStock: "",
                        batch: batch.toUpperCase(),
                        expirationDate: dVal,
                        location: ""
                    });
                }
                setEntries(newEntries);
                alert(`${newEntries.length} produtos importados da NFe com sucesso!`);
            } catch (err) {
                console.error(err);
                alert("Erro ao processar o XML da NFe. Verifique se o arquivo é um XML legítimo.");
            }
        };
        reader.readAsText(file);
    };

    const removeEmptyRows = () => {
        const filtered = entries.filter(e => e.name.trim() !== '');
        if (filtered.length === 0) {
            setEntries([initialEntry]);
        } else {
            setEntries(filtered);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validProducts = entries
            .filter(e => e.name.trim() !== '')
            .map(e => ({
                name: e.name,
                category: e.category,
                unit: e.unit,
                capacityUnit: e.capacityUnit,
                unitWeight: parseValue(e.unitWeight) || 1,
                stock: parseValue(e.stock),
                price: parseValue(e.price),
                minStock: parseValue(e.minStock) || 0,
                batch: e.batch,
                expirationDate: e.expirationDate,
                location: e.location,
                status: (parseValue(e.stock) <= (parseValue(e.minStock) || 0)) ? 'low' : 'ok'
            }));

        if (validProducts.length > 0) {
            onSubmit(validProducts);
            onClose();
        }
    };

    const totalValue = entries.reduce((acc, e) => acc + (parseValue(e.stock) * parseValue(e.price)), 0);
    const namesArray = entries.map(e => e.name.trim().toUpperCase()).filter(n => n !== '');
    const hasDuplicates = namesArray.length !== new Set(namesArray).size;

    // 2. Detector de Conflitos no Banco de Dados
    const checkNameExists = (name: string) => {
        if (!name.trim()) return false;
        return existingProducts.some(p => p.name.trim().toUpperCase() === name.trim().toUpperCase());
    };

    // 3. Validade Inteligente
    const isExpired = (dateStr: string) => {
        if (!dateStr) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(dateStr);
        return expDate < today;
    };

    if (!isOpen) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            maxWidth="max-w-[98vw]"
        >
            <Card variant="glass" className="h-[92vh] relative z-10 p-0 overflow-hidden border-emerald-500/20 shadow-2xl rounded-[2.5rem] flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Terminal de Implantação Massiva</h3>
                            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-1 pr-3 border-r border-slate-800 inline-block mr-3 leading-none">SpeedGrid™ v4.0 (Intelligence)</p>
                            <span className="text-xs text-emerald-500/60 font-black uppercase tracking-widest leading-none">Audit Engine Ativado</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <button
                            onClick={clearGrid}
                            className="px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-black uppercase tracking-widest transition-all hover:bg-orange-500/20 flex items-center gap-2"
                        >
                            <RotateCcw size={14} /> RESET DE DECK
                        </button>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${showAdvanced ? 'bg-blue-500 text-blue-950 border-blue-400' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'}`}
                        >
                            <Settings2 size={14} /> {showAdvanced ? 'OCULTAR LOGÍSTICA' : 'CAMPOS LOGÍSTICOS'}
                        </button>
                        {(hasDuplicates || entries.some(e => checkNameExists(e.name))) && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-pulse">
                                <AlertCircle size={14} className="text-rose-500" />
                                <span className="text-xs text-rose-400 font-black uppercase tracking-widest">Conflitos de Integridade</span>
                            </div>
                        )}
                        <div className="text-right">
                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Ativo Total Estimado</p>
                            <p className="text-2xl font-black text-emerald-500 italic leading-none mt-1">{formatCurrency(totalValue, settings.currency)}</p>
                        </div>
                        <input
                            type="file"
                            id="xml-upload"
                            accept=".xml"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => document.getElementById('xml-upload')?.click()}
                            className="w-12 h-12 flex items-center justify-center bg-emerald-600 rounded-2xl text-white hover:bg-emerald-500 border border-emerald-400/30 transition-all shadow-lg active:scale-95"
                            title="Importar XML de NFe"
                        >
                            <FileCode size={24} />
                        </button>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-900 rounded-2xl text-slate-500 hover:text-white border border-slate-800 transition-all shadow-lg active:scale-95"><X size={24} /></button>
                    </div>
                </div>

                {/* Global Controls */}
                <div className="p-6 bg-slate-900/30 border-b border-slate-800/60 flex flex-wrap gap-6 items-end shrink-0">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 uppercase font-black tracking-widest ml-1">Preset Categoria</label>
                        <select value={globalCategory} onChange={e => setGlobalCategory(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500/50 appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_auto] bg-[position:right_1rem_center] bg-no-repeat">
                            <optgroup label="AGRÍCOLAS" className="bg-slate-900">
                                <option>Fertilizantes</option><option>Sementes</option><option>Defensivos</option><option>Herbicidas</option>
                                <option>Fungicidas</option><option>Inseticidas</option><option>Adjuvantes</option><option>Corretivos</option><option>Nutrição Foliar</option>
                            </optgroup>
                            <optgroup label="LOGÍSTICA & FROTA" className="bg-slate-900">
                                <option>Combustível</option><option>Lubrificantes</option><option>Peças</option><option>Pneus</option><option>Filtros</option>
                            </optgroup>
                            <optgroup label="MANUTENÇÃO & INFRA" className="bg-slate-900">
                                <option>Ferramentas</option><option>Materiais de Construção</option><option>Elétrica</option><option>Hidráulica</option><option>Ferragens</option>
                            </optgroup>
                            <optgroup label="OPERACIONAL & SEGURANÇA" className="bg-slate-900">
                                <option>EPIs</option><option>Embalagens</option><option>Limpeza</option>
                            </optgroup>
                            <optgroup label="PECUÁRIA" className="bg-slate-900">
                                <option>Medicamentos Veterinários</option><option>Suplementos & Nutrição</option><option>Vacinas</option>
                            </optgroup>
                            <option>Outros</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 uppercase font-black tracking-widest ml-1">Preset Unidade</label>
                        <select value={globalUnit} onChange={e => setGlobalUnit(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500/50 appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_auto] bg-[position:right_1rem_center] bg-no-repeat">
                            <optgroup label="PESO / MASSA" className="bg-slate-900">
                                <option>kg</option><option>g</option><option>ton</option><option value="@ (arroba)">@ ARROBA</option>
                            </optgroup>
                            <optgroup label="VOLUME / LÍQUIDOS" className="bg-slate-900">
                                <option>L</option><option>ml</option><option>bombona</option><option>balde</option><option>galão</option><option>tambor</option><option>frasco</option>
                            </optgroup>
                            <optgroup label="UNIDADES / LOGÍSTICA" className="bg-slate-900">
                                <option>un</option><option value="sc (saco)">sc (SACO)</option><option value="bag (big bag)">BAG (BIG BAG)</option><option>caixa</option><option>pacote</option><option>dose</option>
                            </optgroup>
                            <optgroup label="MEDIDAS TÉCNICAS" className="bg-slate-900">
                                <option>metro</option><option>m²</option><option>m³</option>
                            </optgroup>
                        </select>
                    </div>
                    <button onClick={applyGlobals} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center gap-3 active:scale-95 shadow-lg group">
                        <Info size={14} className="group-hover:rotate-12 transition-transform" /> Aplicar Presets a Tudo
                    </button>
                    <button onClick={removeEmptyRows} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center gap-3 active:scale-95 shadow-lg group">
                        <Eraser size={14} className="group-hover:rotate-12 transition-transform" /> Limpar Slots Vazios
                    </button>
                    <div className="flex-1" />
                    <div className="bg-slate-950/80 border border-slate-800 px-6 py-4 rounded-3xl flex items-center gap-5 shadow-inner">
                        <div className="flex items-center gap-2">
                            <Keyboard size={18} className="text-emerald-500" />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white mr-1">CTRL+V</kbd> Importar |
                                <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white mx-1">CTRL+D</kbd> Replicar Acima
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Grid Area */}
                <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-slate-950/20" onPaste={handlePaste}>
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md">
                            <tr className="border-b border-slate-800 text-left">
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest w-12 text-center sticky left-0 bg-slate-950 z-30">#</th>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest min-w-[300px] sticky left-12 bg-slate-950 z-30">Nomenclatura Técnica</th>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest w-40">Categoria</th>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest w-32">Logística</th>
                                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest w-24">Saída</th>
                                <th className="p-5 text-right text-xs font-black text-emerald-400 uppercase tracking-widest w-36 text-right">Conversor Ref. (KG/L)</th>
                                <th className="p-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest w-32">Saldo</th>
                                <th className="p-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest w-36">Custo ({settings.currency})</th>
                                <th className="p-5 text-right text-xs font-black text-orange-400 uppercase tracking-widest w-32">Mínimo</th>
                                {showAdvanced && (
                                    <>
                                        <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest w-40">Protocolo Lote</th>
                                        <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest w-40">Vencimento</th>
                                        <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-widest w-48">Galpão / Local</th>
                                    </>
                                )}
                                <th className="p-5 text-center text-xs font-black text-slate-500 uppercase tracking-widest w-16 sticky right-0 bg-slate-950 z-30"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {entries.map((entry, idx) => {
                                const namesInTerm = namesArray.filter(n => n === entry.name.trim().toUpperCase()).length;
                                const existsInDB = checkNameExists(entry.name);
                                const isExpiredDate = isExpired(entry.expirationDate);

                                return (
                                    <tr key={entry.tempId} className={`hover:bg-slate-800/40 transition-colors group ${namesInTerm > 1 || existsInDB ? 'bg-rose-500/5' : ''}`}>
                                        <td className="p-5 text-center text-xs font-black text-slate-600 italic group-hover:text-emerald-500 transition-colors sticky left-0 bg-slate-950/40 backdrop-blur-md z-10">{idx + 1}</td>
                                        <td className="p-2 sticky left-12 bg-slate-950/40 backdrop-blur-md z-10">
                                            <div className="relative group/name">
                                                <input
                                                    value={entry.name}
                                                    onChange={e => updateEntry(entry.tempId, 'name', e.target.value.toUpperCase())}
                                                    onKeyDown={e => handleKeyDown(e, idx, 'name')}
                                                    placeholder="SCANNING PRODUCT..."
                                                    className={`w-full bg-transparent border-none px-4 py-3 text-sm font-black text-white outline-none focus:bg-slate-900/80 rounded-xl placeholder:text-slate-800 italic transition-all ${namesInTerm > 1 ? 'text-rose-400' : existsInDB ? 'text-amber-400' : ''}`}
                                                />
                                                {existsInDB && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                        <Database size={10} className="text-amber-500" />
                                                        <span className="text-[8px] text-amber-500 font-black uppercase">Já em Estoque</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <select
                                                value={entry.category}
                                                onChange={e => updateEntry(entry.tempId, 'category', e.target.value)}
                                                onKeyDown={e => handleKeyDown(e, idx, 'category')}
                                                className="w-full bg-transparent border-none px-4 py-3 text-xs font-black text-slate-400 outline-none focus:bg-slate-900/80 rounded-xl cursor-pointer hover:text-white transition-all appearance-none"
                                            >
                                                <optgroup label="AGRÍCOLAS" className="bg-slate-900">
                                                    <option>Fertilizantes</option><option>Sementes</option><option>Defensivos</option><option>Herbicidas</option>
                                                    <option>Fungicidas</option><option>Inseticidas</option><option>Adjuvantes</option><option>Corretivos</option><option>Nutrição Foliar</option>
                                                </optgroup>
                                                <optgroup label="LOGÍSTICA & FROTA" className="bg-slate-900">
                                                    <option>Combustível</option><option>Lubrificantes</option><option>Peças</option><option>Pneus</option><option>Filtros</option>
                                                </optgroup>
                                                <optgroup label="MANUTENÇÃO & INFRA" className="bg-slate-900">
                                                    <option>Ferramentas</option><option>Materiais de Construção</option><option>Elétrica</option><option>Hidráulica</option><option>Ferragens</option>
                                                </optgroup>
                                                <optgroup label="OPERACIONAL & SEGURANÇA" className="bg-slate-900">
                                                    <option>EPIs</option><option>Embalagens</option><option>Limpeza</option>
                                                </optgroup>
                                                <optgroup label="PECUÁRIA" className="bg-slate-900">
                                                    <option>Medicamentos Veterinários</option><option>Suplementos & Nutrição</option><option>Vacinas</option>
                                                </optgroup>
                                                <option>Outros</option>
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <select
                                                value={entry.unit}
                                                onChange={e => updateEntry(entry.tempId, 'unit', e.target.value)}
                                                onKeyDown={e => handleKeyDown(e, idx, 'unit')}
                                                className="w-full bg-transparent border-none px-4 py-3 text-xs font-black text-slate-400 outline-none focus:bg-slate-900/80 rounded-xl cursor-pointer hover:text-white transition-all appearance-none"
                                            >
                                                <optgroup label="PESO / MASSA" className="bg-slate-900">
                                                    <option>kg</option><option>g</option><option>ton</option><option value="@ (arroba)">@ ARROBA</option>
                                                </optgroup>
                                                <optgroup label="VOLUME / LÍQUIDOS" className="bg-slate-900">
                                                    <option>L</option><option>ml</option><option>bombona</option><option>balde</option><option>galão</option><option>tambor</option><option>frasco</option>
                                                </optgroup>
                                                <optgroup label="UNIDADES / LOGÍSTICA" className="bg-slate-900">
                                                    <option>un</option><option value="sc (saco)">sc (SACO)</option><option value="bag (big bag)">BAG (BIG BAG)</option><option>caixa</option><option>pacote</option><option>dose</option>
                                                </optgroup>
                                                <optgroup label="MEDIDAS TÉCNICAS" className="bg-slate-900">
                                                    <option>metro</option><option>m²</option><option>m³</option>
                                                </optgroup>
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <select
                                                value={entry.capacityUnit}
                                                onChange={e => updateEntry(entry.tempId, 'capacityUnit', e.target.value)}
                                                onKeyDown={e => handleKeyDown(e, idx, 'capacityUnit')}
                                                className="w-full bg-transparent border-none px-4 py-3 text-xs font-black text-blue-400 outline-none focus:bg-slate-900/80 rounded-xl cursor-pointer hover:text-white transition-all appearance-none"
                                            >
                                                <option value="kg">KG</option>
                                                <option value="L">L</option>
                                                <option value="un">UN</option>
                                                <option value="dose">DS</option>
                                                <option value="m">M</option>
                                            </select>
                                        </td>
                                        <td className="p-2 text-right">
                                            <input
                                                value={entry.unitWeight}
                                                onChange={e => updateEntry(entry.tempId, 'unitWeight', maskNumber(e.target.value))}
                                                onKeyDown={e => handleKeyDown(e, idx, 'unitWeight')}
                                                placeholder="1,00"
                                                className="w-full bg-transparent border-none px-4 py-3 text-sm font-black text-emerald-400 text-right outline-none focus:bg-slate-900/80 rounded-xl transition-all"
                                            />
                                        </td>
                                        <td className="p-2 text-right">
                                            <input
                                                value={entry.stock}
                                                onChange={e => updateEntry(entry.tempId, 'stock', maskNumber(e.target.value))}
                                                onKeyDown={e => handleKeyDown(e, idx, 'stock')}
                                                placeholder="0,00"
                                                className={`w-full bg-transparent border-none px-4 py-3 text-sm font-black text-right outline-none focus:bg-slate-900/80 rounded-xl transition-all ${parseValue(entry.stock) > 0 && parseValue(entry.stock) <= parseValue(entry.minStock) ? 'text-orange-400' : 'text-white'}`}
                                            />
                                        </td>
                                        <td className="p-2 text-right">
                                            <input
                                                value={entry.price}
                                                onChange={e => updateEntry(entry.tempId, 'price', maskValue(e.target.value))}
                                                onKeyDown={e => handleKeyDown(e, idx, 'price')}
                                                placeholder="0,00"
                                                className="w-full bg-transparent border-none px-4 py-3 text-sm font-black text-emerald-400 text-right outline-none focus:bg-slate-900/80 rounded-xl transition-all italic"
                                            />
                                        </td>
                                        <td className="p-2 text-right">
                                            <input
                                                value={entry.minStock}
                                                onChange={e => updateEntry(entry.tempId, 'minStock', maskNumber(e.target.value))}
                                                onKeyDown={e => handleKeyDown(e, idx, 'minStock')}
                                                placeholder="0,00"
                                                className="w-full bg-transparent border-none px-4 py-3 text-sm font-black text-orange-500 text-right outline-none focus:bg-slate-900/80 rounded-xl transition-all"
                                            />
                                        </td>
                                        {showAdvanced && (
                                            <>
                                                <td className="p-2">
                                                    <input
                                                        value={entry.batch}
                                                        onChange={e => updateEntry(entry.tempId, 'batch', e.target.value.toUpperCase())}
                                                        onKeyDown={e => handleKeyDown(e, idx, 'batch')}
                                                        placeholder="LOTE-000"
                                                        className="w-full bg-transparent border-none px-4 py-3 text-sm font-black text-white outline-none focus:bg-slate-900/80 rounded-xl"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={entry.expirationDate}
                                                            onChange={e => updateEntry(entry.tempId, 'expirationDate', e.target.value)}
                                                            onKeyDown={e => handleKeyDown(e, idx, 'expirationDate')}
                                                            className={`w-full bg-transparent border-none px-4 py-3 text-sm font-black outline-none focus:bg-slate-900/80 rounded-xl uppercase transition-all ${isExpiredDate ? 'text-rose-500 bg-rose-500/5' : 'text-blue-400'}`}
                                                        />
                                                        {isExpiredDate && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                                <Calendar size={12} className="text-rose-500 animate-pulse" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        value={entry.location}
                                                        onChange={e => updateEntry(entry.tempId, 'location', e.target.value.toUpperCase())}
                                                        onKeyDown={e => handleKeyDown(e, idx, 'location')}
                                                        placeholder="GALPÃO A..."
                                                        className="w-full bg-transparent border-none px-4 py-3 text-sm font-black text-slate-400 outline-none focus:bg-slate-900/80 rounded-xl italic"
                                                    />
                                                </td>
                                            </>
                                        )}
                                        <td className="p-2 text-center sticky right-0 bg-slate-950/40 backdrop-blur-md z-10">
                                            <div className="flex gap-1 justify-center">
                                                <button
                                                    onClick={() => {
                                                        const newEntry = { ...entry, tempId: Date.now() };
                                                        const newEntries = [...entries];
                                                        newEntries.splice(idx + 1, 0, newEntry);
                                                        setEntries(newEntries);
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100 bg-slate-900/40 rounded-lg hover:bg-amber-500/10"
                                                    title="Duplicar Linha"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button onClick={() => removeRow(entry.tempId)} className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 bg-slate-900/40 rounded-lg hover:bg-rose-500/10" title="Remover Linha">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    <button
                        onClick={addRow}
                        className="w-full py-12 text-slate-600 hover:text-emerald-500 transition-all flex flex-col items-center gap-4 border-t border-slate-800/50 hover:bg-emerald-500/5 group"
                    >
                        <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-800 flex items-center justify-center group-hover:border-emerald-500/50 group-hover:scale-110 transition-all bg-slate-900/20">
                            <Plus size={28} />
                        </div>
                        <div className="text-center">
                            <span className="text-[11px] font-black uppercase tracking-[0.5em]">Acoplar Registro Estratégico</span>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">(ENTER NO ÚLTIMO CAMPO PARA NOVO SLOT)</p>
                        </div>
                    </button>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-slate-800 bg-slate-950/80 backdrop-blur-3xl flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-inner">
                            <Table size={18} className="text-emerald-500" />
                            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                                <span className="text-white text-lg">{entries.filter(e => e.name).length}</span> ATIVOS DETECTADOS EM LOTE
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-slate-300 transition-all active:scale-95 shadow-lg">ABORTAR MISSÃO</button>
                        <button
                            onClick={handleSubmit}
                            disabled={entries.some(e => e.name.trim() === '') || hasDuplicates}
                            className={`px-16 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 flex items-center gap-4 disabled:opacity-30 disabled:grayscale disabled:scale-100 ${hasDuplicates ? 'bg-rose-500 text-rose-950 shadow-rose-500/20' : 'bg-emerald-500 text-emerald-950 shadow-emerald-500/20 hover:bg-emerald-400'}`}
                        >
                            <Save size={24} /> AUTHORIZE BULK IMPLANTATION
                        </button>
                    </div>
                </div>
            </Card>
        </Modal>
    );
};
