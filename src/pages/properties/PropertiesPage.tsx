import React, { useState, useMemo } from 'react';
import {
    Map, MapPin, Plus, X, Edit, Trash2, LandPlot, User,
    Maximize2, Activity, Sprout, Loader2, FileText,
    ArrowLeft, BarChart3, Target, Layers, Info, History
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatNumber } from '../../utils/format';
import { Property, Plot, PropertyAttachment } from '../../types';
import { PropertyAttachments } from '../../components/properties/PropertyAttachments';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const PropertiesPage = () => {
    const {
        properties, setProperties,
        plots, setPlots,
        addActivity
    } = useApp();

    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
    const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
    const [propertyForm, setPropertyForm] = useState<{
        name: string;
        location: string;
        totalArea: string;
        cultivatedArea: string;
        mainCrop: string;
        manager: string;
        status: 'active' | 'inactive';
        attachments: PropertyAttachment[];
    }>({
        name: '', location: '', totalArea: '', cultivatedArea: '', mainCrop: '', manager: '', status: 'active', attachments: []
    });

    const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string; id: string }[]>([]);
    const [attachmentsToDelete, setAttachmentsToDelete] = useState<PropertyAttachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const [isPlotFormOpen, setIsPlotFormOpen] = useState(false);
    const [editingPlotId, setEditingPlotId] = useState<number | null>(null);
    const [plotForm, setPlotForm] = useState<{
        name: string;
        area: string;
        crop: string;
        status: 'active' | 'inactive';
    }>({
        name: '', area: '', crop: '', status: 'active'
    });

    // Metrics for the Technical Header
    const stats = useMemo(() => {
        const total = properties.reduce((acc, p) => acc + (p.totalArea || 0), 0);
        const cultivated = properties.reduce((acc, p) => acc + (p.cultivatedArea || 0), 0);
        const plotCount = plots.length;
        const efficiency = total > 0 ? (cultivated / total) * 100 : 0;

        return { total, cultivated, plotCount, efficiency };
    }, [properties, plots]);

    const handlePropertySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            const propertyId = editingPropertyId !== null ? editingPropertyId : Date.now();
            const uploadedAttachments: PropertyAttachment[] = [];

            for (const item of pendingFiles) {
                const fileName = `${propertyId}/${Date.now()}-${item.file.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('property-attachments')
                    .upload(fileName, item.file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('property-attachments')
                    .getPublicUrl(fileName);

                uploadedAttachments.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: item.file.name,
                    url: publicUrl,
                    type: item.file.type,
                    size: item.file.size,
                    createdAt: new Date().toISOString()
                });
            }

            const allAttachments = [...propertyForm.attachments, ...uploadedAttachments];
            const uniquePathsToDelete = Array.from(new Set(
                attachmentsToDelete.map(file => file.url.split('property-attachments/')[1]).filter(Boolean)
            ));

            for (const path of uniquePathsToDelete) {
                await supabase.storage.from('property-attachments').remove([path]);
            }

            const data: any = {
                ...propertyForm,
                totalArea: parseFloat(propertyForm.totalArea) || 0,
                cultivatedArea: parseFloat(propertyForm.cultivatedArea) || 0,
                attachments: allAttachments
            };

            if (editingPropertyId) {
                setProperties(properties.map((p: any) => p.id === editingPropertyId ? { ...p, ...data } : p));
                addActivity('Editou propriedade', data.name);
                toast.success('Propriedade atualizada com sucesso!');
            } else {
                setProperties([{ ...data, id: propertyId }, ...properties]);
                addActivity('Adicionou propriedade', data.name);
                toast.success('Propriedade cadastrada com sucesso!');
            }

            setIsPropertyFormOpen(false);
            setEditingPropertyId(null);
            resetPropertyForm();
        } catch (error: any) {
            console.error('Erro ao salvar propriedade:', error);
            toast.error('Erro ao salvar propriedade: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const resetPropertyForm = () => {
        setPropertyForm({ name: '', location: '', totalArea: '', cultivatedArea: '', mainCrop: '', manager: '', status: 'active', attachments: [] });
        setPendingFiles([]);
        setAttachmentsToDelete([]);
    };

    const deleteProperty = async (id: number) => {
        const prop = properties.find((p: any) => p.id === id);
        if (prop && window.confirm(`Deseja realmente excluir a propriedade ${prop.name}?`)) {
            if (prop.attachments && prop.attachments.length > 0) {
                const paths = prop.attachments.map((a: any) => a.url.split('property-attachments/')[1]).filter(Boolean);
                if (paths.length > 0) {
                    await supabase.storage.from('property-attachments').remove(paths);
                }
            }

            setProperties(properties.filter((p: any) => p.id !== id));
            setPlots(plots.filter((p: any) => p.propertyId !== id));
            addActivity('Removeu propriedade', prop.name);
            toast.success('Propriedade excluída com sucesso!');
            if (selectedPropertyId === id) setSelectedPropertyId(null);
        }
    };

    const handlePlotSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: any = {
            ...plotForm,
            area: parseFloat(plotForm.area) || 0,
            propertyId: selectedPropertyId
        };

        if (editingPlotId) {
            setPlots(plots.map((p: any) => p.id === editingPlotId ? { ...p, ...data } : p));
            addActivity('Editou talhão', data.name);
        } else {
            setPlots([{ ...data, id: Date.now() }, ...plots]);
            addActivity('Adicionou talhão', data.name);
        }
        setIsPlotFormOpen(false);
        setEditingPlotId(null);
        setPlotForm({ name: '', area: '', crop: '', status: 'active' });
    };

    const deletePlot = (id: number) => {
        const plot = plots.find((p: any) => p.id === id);
        if (plot && window.confirm(`Deseja realmente excluir o talhão ${plot.name}?`)) {
            setPlots(plots.filter((p: any) => p.id !== id));
            addActivity('Removeu talhão', plot.name);
        }
    };

    const selectedProperty = useMemo(() =>
        properties.find(p => p.id === selectedPropertyId),
        [properties, selectedPropertyId]);

    const propertyPlots = useMemo(() =>
        plots.filter(p => p.propertyId === selectedPropertyId),
        [plots, selectedPropertyId]);

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden">
            {/* INDUSTRIAL HEADER - DATA TECH */}
            {!selectedPropertyId ? (
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                                <Map className="text-emerald-500" size={32} />
                                SISTEMA DE ÁREAS PRODUTIVAS
                            </h2>
                            <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">
                                Central de Comando de Propriedades e Talhões
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingPropertyId(null);
                                resetPropertyForm();
                                setIsPropertyFormOpen(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-6 py-3 rounded-[2px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]"
                        >
                            <Plus size={20} strokeWidth={3} /> Nova Propriedade
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-slate-800 border border-slate-800">
                        <div className="bg-slate-900 p-4">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Área Total Gerenciada</p>
                            <p className="text-2xl font-mono font-bold text-white">{formatNumber(stats.total)} <span className="text-xs text-slate-500">ha</span></p>
                        </div>
                        <div className="bg-slate-900 p-4">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Área em Produção</p>
                            <p className="text-2xl font-mono font-bold text-emerald-500">{formatNumber(stats.cultivated)} <span className="text-xs text-slate-500">ha</span></p>
                        </div>
                        <div className="bg-slate-900 p-4">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Talhões Registrados</p>
                            <p className="text-2xl font-mono font-bold text-white">{stats.plotCount} <span className="text-xs text-slate-500">unids</span></p>
                        </div>
                        <div className="bg-slate-900 p-4">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Eficiência de Uso</p>
                            <div className="flex items-end gap-2">
                                <p className="text-2xl font-mono font-bold text-amber-500">{stats.efficiency.toFixed(1)}%</p>
                                <div className="flex-1 h-2 bg-slate-800 mb-2 rounded-none overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${stats.efficiency}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSelectedPropertyId(null)}
                            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-[2px] transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedProperty?.name}</h2>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 rounded-[2px]">ATIVO</span>
                            </div>
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={12} /> {selectedProperty?.location}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                if (selectedProperty) {
                                    setEditingPropertyId(selectedProperty.id);
                                    setPropertyForm({
                                        ...selectedProperty,
                                        totalArea: selectedProperty.totalArea.toString(),
                                        cultivatedArea: selectedProperty.cultivatedArea.toString(),
                                        attachments: selectedProperty.attachments || []
                                    });
                                    setIsPropertyFormOpen(true);
                                }
                            }}
                            className="p-3 bg-slate-800 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-[2px] transition-all border border-slate-700"
                        >
                            <Edit size={20} />
                        </button>
                        <button
                            onClick={() => selectedProperty && deleteProperty(selectedProperty.id)}
                            className="p-3 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-[2px] transition-all border border-slate-700"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {!selectedPropertyId ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((prop) => (
                            <div
                                key={prop.id}
                                onClick={() => setSelectedPropertyId(prop.id)}
                                className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all relative overflow-hidden flex flex-col"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 size={24} className="text-emerald-500" />
                                </div>

                                <div className="p-6 flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-colors">
                                            <LandPlot size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{prop.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{prop.location}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Área Total</p>
                                            <p className="font-mono text-white">{formatNumber(prop.totalArea)} <span className="text-[10px] text-slate-500">ha</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Cultura</p>
                                            <p className="font-bold text-white flex items-center gap-1.5"><Sprout size={12} className="text-emerald-500" /> {prop.mainCrop}</p>
                                        </div>
                                    </div>

                                    <div className="h-1.5 bg-slate-800 rounded-none mb-2 mt-auto">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${(prop.cultivatedArea / prop.totalArea) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-mono uppercase italic">
                                        Utilização: {((prop.cultivatedArea / prop.totalArea) * 100).toFixed(0)}% da área total
                                    </p>
                                </div>

                                <div className="bg-slate-800/50 p-3 border-t border-slate-800 flex justify-between items-center group-hover:bg-emerald-500/5 transition-colors">
                                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest">
                                        <Layers size={12} /> {plots.filter(pl => pl.propertyId === prop.id).length} Talhões
                                    </p>
                                    <div className="flex -space-x-1">
                                        {[1, 2, 3].map(i => <div key={i} className="w-4 h-1 bg-emerald-500/20" />)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {properties.length === 0 && (
                            <div className="col-span-full py-20 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600">
                                <div className="w-16 h-16 bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                                    <Map size={32} />
                                </div>
                                <p className="font-mono text-xs uppercase tracking-widest">Nenhuma propriedade operacional detectada</p>
                                <button
                                    onClick={() => {
                                        setEditingPropertyId(null);
                                        resetPropertyForm();
                                        setIsPropertyFormOpen(true);
                                    }}
                                    className="mt-6 text-emerald-500 border-b border-emerald-500/30 hover:text-emerald-400 transition-colors uppercase font-black text-xs tracking-widest pb-1"
                                >
                                    Iniciar Novo Cadastro
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto pb-12">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* SIDEBAR METRICS */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-slate-900 border border-slate-800 p-6 space-y-6">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-slate-800">
                                        <Info size={14} className="text-emerald-500" /> Detalhes Técnicos
                                    </h4>

                                    <div>
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-2 group">Gerente Responsável</p>
                                        <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800">
                                            <div className="w-8 h-8 bg-slate-800 flex items-center justify-center text-slate-400">
                                                <User size={16} />
                                            </div>
                                            <p className="font-bold text-white text-sm">{selectedProperty?.manager}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Cultura Principal</p>
                                        <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800">
                                            <div className="w-8 h-8 bg-slate-800 flex items-center justify-center text-emerald-500">
                                                <Sprout size={16} />
                                            </div>
                                            <p className="font-bold text-white text-sm uppercase tracking-tight">{selectedProperty?.mainCrop}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-4">Anexos e Documentos</p>
                                        <div className="space-y-2">
                                            {selectedProperty?.attachments?.map((att, idx) => (
                                                <a
                                                    key={idx}
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/30 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={16} className="text-amber-500" />
                                                        <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{att.name}</span>
                                                    </div>
                                                    <Maximize2 size={12} className="text-slate-600 group-hover:text-white" />
                                                </a>
                                            ))}
                                            {(!selectedProperty?.attachments || selectedProperty.attachments.length === 0) && (
                                                <p className="text-[10px] text-slate-600 italic px-2">Nenhum anexo encontrado</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MAIN CONTENT AREA */}
                            <div className="lg:col-span-3 space-y-8">
                                <div className="bg-slate-900 border border-slate-800 overflow-hidden">
                                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                                        <div>
                                            <h4 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                                <BarChart3 className="text-emerald-500" /> GESTÃO DE TALHÕES
                                            </h4>
                                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Divisão operacional por área</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingPlotId(null);
                                                setPlotForm({ name: '', area: '', crop: selectedProperty?.mainCrop || '', status: 'active' });
                                                setIsPlotFormOpen(true);
                                            }}
                                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-emerald-950 border border-emerald-500/30 px-4 py-2 rounded-[2px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <Plus size={16} strokeWidth={3} /> Adicionar Talhão
                                        </button>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {propertyPlots.map((plot) => (
                                            <div
                                                key={plot.id}
                                                className="bg-slate-950 border border-slate-800 p-4 relative group hover:border-emerald-500/30 transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h5 className="font-black text-white uppercase tracking-tight">{plot.name}</h5>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1.5">
                                                                <Maximize2 size={10} className="text-emerald-500" /> {plot.area} ha
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1.5">
                                                                <Sprout size={10} className="text-amber-500" /> {plot.crop}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setEditingPlotId(plot.id);
                                                                setPlotForm({ ...plot, area: plot.area.toString(), status: 'active' });
                                                                setIsPlotFormOpen(true);
                                                            }}
                                                            className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => deletePlot(plot.id)}
                                                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-px bg-slate-800/50 border border-slate-800/50">
                                                    <div className="p-2 text-center bg-slate-900/50">
                                                        <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Status</p>
                                                        <p className="text-[10px] font-bold text-emerald-500 uppercase">Estável</p>
                                                    </div>
                                                    <div className="p-2 text-center bg-slate-900/50 border-x border-slate-800/50">
                                                        <p className="text-[8px] text-slate-600 font-black uppercase mb-1">KPI</p>
                                                        <p className="text-[10px] font-bold text-white uppercase">9.2</p>
                                                    </div>
                                                    <div className="p-2 text-center bg-slate-900/50">
                                                        <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Alerta</p>
                                                        <p className="text-[10px] font-bold text-slate-600 uppercase">Zero</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-900 border border-slate-800 p-6">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Activity size={14} className="text-emerald-500" /> Analítico de Cultivo
                                        </h4>
                                        <div className="h-40 flex items-end gap-2 px-2">
                                            {[40, 65, 45, 90, 75, 55, 80, 60].map((h, i) => (
                                                <div key={i} className="flex-1 bg-slate-800 relative group">
                                                    <div
                                                        className="absolute bottom-0 w-full bg-emerald-500/40 group-hover:bg-emerald-500 transition-all"
                                                        style={{ height: `${h}%` }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 w-full text-left flex items-center gap-2">
                                            <Target size={14} className="text-amber-500" /> Meta de Produção
                                        </h4>
                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * 0.25} className="text-emerald-500" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <p className="text-2xl font-black text-white tracking-tighter">75%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {isPropertyFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm" onClick={() => setIsPropertyFormOpen(false)} />
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-none">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                    {editingPropertyId ? 'CONFIGURAÇÃO OPERACIONAL' : 'CADASTRO DE NOVA UNIDADE'}
                                </h3>
                            </div>
                            <button onClick={() => setIsPropertyFormOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2"><X size={20} /></button>
                        </div>

                        <form onSubmit={handlePropertySubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Identificação da Propriedade</label>
                                    <input required value={propertyForm.name} onChange={e => setPropertyForm({ ...propertyForm, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold placeholder:text-slate-800 transition-all" placeholder="EX: FAZENDA SANTA MARIA" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Geolocalização / Município</label>
                                    <input required value={propertyForm.location} onChange={e => setPropertyForm({ ...propertyForm, location: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold placeholder:text-slate-800 transition-all" placeholder="EX: RIO VERDE - GO" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Cultura Técnico-Agro</label>
                                    <input required value={propertyForm.mainCrop} onChange={e => setPropertyForm({ ...propertyForm, mainCrop: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold placeholder:text-slate-800 transition-all" placeholder="EX: SOJA / MILHO" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Gestor Operacional</label>
                                    <input required value={propertyForm.manager} onChange={e => setPropertyForm({ ...propertyForm, manager: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold placeholder:text-slate-800 transition-all" placeholder="EX: JOÃO SILVA" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Área Nominal (ha)</label>
                                    <input required type="number" step="0.01" value={propertyForm.totalArea} onChange={e => setPropertyForm({ ...propertyForm, totalArea: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-mono font-bold placeholder:text-slate-800 transition-all" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Área Produtiva (ha)</label>
                                    <input required type="number" step="0.01" value={propertyForm.cultivatedArea} onChange={e => setPropertyForm({ ...propertyForm, cultivatedArea: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-mono font-bold placeholder:text-slate-800 transition-all" placeholder="0.00" />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-800">
                                <PropertyAttachments
                                    existingAttachments={propertyForm.attachments}
                                    pendingFiles={pendingFiles}
                                    onAddFiles={(files) => {
                                        const newPending = files.map(file => ({
                                            file,
                                            preview: URL.createObjectURL(file),
                                            id: Math.random().toString(36).substr(2, 9)
                                        }));
                                        setPendingFiles([...pendingFiles, ...newPending]);
                                    }}
                                    onRemovePending={(id) => setPendingFiles(pendingFiles.filter(f => f.id !== id))}
                                    onRemoveExisting={(id) => {
                                        const fileToRemove = propertyForm.attachments.find(a => a.id === id);
                                        if (fileToRemove) setAttachmentsToDelete([...attachmentsToDelete, fileToRemove]);
                                        setPropertyForm({ ...propertyForm, attachments: propertyForm.attachments.filter(a => a.id !== id) });
                                    }}
                                    onUpdatePendingFile={(id, newFile, newPreview) => {
                                        setPendingFiles(prev => prev.map(f => f.id === id ? { ...f, file: newFile, preview: newPreview } : f));
                                    }}
                                    onUpdateExistingFile={(id, newFile, newPreview) => {
                                        const fileToRemove = propertyForm.attachments.find(a => a.id === id);
                                        if (fileToRemove) {
                                            setAttachmentsToDelete(prev => [...prev, fileToRemove]);
                                            setPropertyForm(prev => ({
                                                ...prev,
                                                attachments: prev.attachments.filter(a => a.id !== id)
                                            }));
                                            setPendingFiles(prev => [...prev, {
                                                file: newFile,
                                                preview: newPreview,
                                                id: Math.random().toString(36).substr(2, 9)
                                            }]);
                                        }
                                    }}
                                    isUploading={isUploading}
                                />
                            </div>

                            <div className="flex justify-end gap-1 pt-4">
                                <button type="button" onClick={() => setIsPropertyFormOpen(false)} className="px-8 py-3 bg-slate-950 border border-slate-800 text-slate-500 font-black uppercase tracking-widest hover:text-white hover:bg-slate-800 transition-all rounded-none">Descartar</button>
                                <button type="submit" disabled={isUploading} className="px-12 py-3 bg-emerald-500 text-emerald-950 font-black uppercase tracking-tighter hover:bg-emerald-400 transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)] disabled:opacity-30 rounded-none flex items-center gap-3">
                                    {isUploading ? <Loader2 className="animate-spin" /> : 'Confirmar e Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPlotFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm" onClick={() => setIsPlotFormOpen(false)} />
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-none">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                {editingPlotId ? 'EDITAR TALHÃO' : 'NOVA SUBDIVISÃO'}
                            </h3>
                            <button type="button" onClick={() => setIsPlotFormOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2"><X size={20} /></button>
                        </div>

                        <form onSubmit={handlePlotSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Identificação / Tag</label>
                                <input required value={plotForm.name} onChange={e => setPlotForm({ ...plotForm, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold transition-all" placeholder="EX: TALHÃO 01" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Área (ha)</label>
                                    <input required type="number" step="0.01" value={plotForm.area} onChange={e => setPlotForm({ ...plotForm, area: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-mono font-bold transition-all" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Cultura Interna</label>
                                    <input required value={plotForm.crop} onChange={e => setPlotForm({ ...plotForm, crop: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-none px-4 py-3 text-white outline-none focus:border-emerald-500 font-bold transition-all" placeholder="EX: SOJA" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-1 pt-6">
                                <button type="button" onClick={() => setIsPlotFormOpen(false)} className="px-6 py-3 bg-slate-950 border border-slate-800 text-slate-500 font-black uppercase tracking-widest hover:text-white transition-all rounded-none">Voltar</button>
                                <button type="submit" className="px-10 py-3 bg-emerald-500 text-emerald-950 font-black uppercase tracking-tighter hover:bg-emerald-400 transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)] rounded-none">Gravar Dados</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
