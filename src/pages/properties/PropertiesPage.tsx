import React, { useState, useMemo } from 'react';
import {
    Map, MapPin, Plus, X, Edit, Trash2, LandPlot, User,
    Maximize2, Activity, Sprout, Loader2, FileText,
    ArrowLeft, BarChart3, Target, Layers, Info, History,
    Zap, ShieldCheck, Landmark, Clock, RefreshCw, CheckCircle2,
    AlertCircle, Search, Filter, MoreHorizontal, TrendingUp
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatNumber } from '../../utils/format';
import { Property, Plot, PropertyAttachment } from '../../types';
import { PropertyAttachments } from '../../components/properties/PropertyAttachments';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Card } from '../../components/common/Card';
import { TechnicalConfirmModal } from '../../components/ui/TechnicalConfirmModal';

export const PropertiesPage = () => {
    const {
        properties, setProperties,
        plots, setPlots,
        addActivity
    } = useApp();

    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
    const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{ type: 'property' | 'plot', id: number | null }>({ type: 'property', id: null });

    const stats = useMemo(() => {
        const total = properties.reduce((acc, p) => acc + (p.totalArea || 0), 0);
        const cultivated = properties.reduce((acc, p) => acc + (p.cultivatedArea || 0), 0);
        const plotCount = plots.length;
        const efficiency = total > 0 ? (cultivated / total) * 100 : 0;
        return { total, cultivated, plotCount, efficiency };
    }, [properties, plots]);

    const filteredProperties = useMemo(() => {
        return properties.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.manager.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [properties, searchTerm]);

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
                const { data: { publicUrl } } = supabase.storage.from('property-attachments').getPublicUrl(fileName);
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
            for (const att of attachmentsToDelete) {
                const path = att.url.split('property-attachments/')[1];
                if (path) await supabase.storage.from('property-attachments').remove([path]);
            }

            const data: any = {
                ...propertyForm,
                totalArea: parseFloat(propertyForm.totalArea) || 0,
                cultivatedArea: parseFloat(propertyForm.cultivatedArea) || 0,
                attachments: allAttachments
            };

            if (editingPropertyId) {
                setProperties(properties.map((p: any) => p.id === editingPropertyId ? { ...p, ...data } : p));
                addActivity('Retificou dados de propriedade', data.name, 'neutral');
                toast.success('Matriz de propriedade atualizada.');
            } else {
                setProperties([{ ...data, id: propertyId }, ...properties]);
                addActivity('Homologou nova propriedade', data.name, 'neutral');
                toast.success('Propriedade registrada na rede.');
            }

            setIsPropertyFormOpen(false);
            resetPropertyForm();
        } catch (error: any) {
            toast.error(' Falha na integração de dados: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const resetPropertyForm = () => {
        setEditingPropertyId(null);
        setPropertyForm({ name: '', location: '', totalArea: '', cultivatedArea: '', mainCrop: '', manager: '', status: 'active', attachments: [] });
        setPendingFiles([]);
        setAttachmentsToDelete([]);
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
            addActivity('Retificou dados do talhão', data.name, 'neutral');
        } else {
            setPlots([{ ...data, id: Date.now() }, ...plots]);
            addActivity('Homologou novo talhão', data.name, 'neutral');
        }
        setIsPlotFormOpen(false);
        setEditingPlotId(null);
        setPlotForm({ name: '', area: '', crop: '', status: 'active' });
    };

    const deleteProperty = async (id: number) => {
        setDeleteConfig({ type: 'property', id });
        setIsDeleteModalOpen(true);
    };

    const deletePlot = (id: number) => {
        setDeleteConfig({ type: 'plot', id });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        const { type, id } = deleteConfig;
        if (!id) return;

        if (type === 'property') {
            const prop = properties.find((p: any) => p.id === id);
            if (prop) {
                if (prop.attachments?.length) {
                    const paths = prop.attachments.map((a: any) => a.url.split('property-attachments/')[1]).filter(Boolean);
                    if (paths.length) await supabase.storage.from('property-attachments').remove(paths);
                }
                setProperties(properties.filter((p: any) => p.id !== id));
                setPlots(plots.filter((p: any) => p.propertyId !== id));
                addActivity('Removeu propriedade do sistema', prop.name, 'neutral');
                toast.success('Registro removido com sucesso.');
                if (selectedPropertyId === id) setSelectedPropertyId(null);
            }
        } else {
            const plot = plots.find((p: any) => p.id === id);
            if (plot) {
                setPlots(plots.filter((p: any) => p.id !== id));
                addActivity('Removeu talhão da propriedade', plot.name, 'neutral');
                toast.success('Talhão removido do registro.');
            }
        }
        setIsDeleteModalOpen(false);
    };

    const selectedProperty = useMemo(() => properties.find(p => p.id === selectedPropertyId), [properties, selectedPropertyId]);
    const propertyPlots = useMemo(() => plots.filter(p => p.propertyId === selectedPropertyId), [plots, selectedPropertyId]);

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
            {/* PROPERTY SENTINEL COMMAND CENTER */}
            {!selectedPropertyId ? (
                <>
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 z-20" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                                <Map className="text-emerald-500" size={32} />
                                Matriz de Áreas Produtivas
                            </h2>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500/50" /> Monitoramento Georeferenciado e Eficiência de Solo
                            </p>
                        </div>

                        <div className="flex gap-4 relative z-10 lg:w-auto w-full">
                            <button
                                onClick={() => { resetPropertyForm(); setIsPropertyFormOpen(true); }}
                                className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-emerald-800"
                            >
                                <Plus size={20} /> Nova Propriedade
                            </button>
                            <button
                                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                                className={`p-5 rounded-2xl border transition-all ${isFilterPanelOpen ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white group-hover:border-slate-700'}`}
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    {/* TELEMETRY MATRIX */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Área Gerenciada', value: stats.total, unit: 'HA', icon: LandPlot, color: 'emerald', code: 'AREA_TTL' },
                            { label: 'Área Plantada', value: stats.cultivated, unit: 'HA', icon: Sprout, color: 'emerald', code: 'AREA_PRD' },
                            { label: 'Total de Talhões', value: stats.plotCount, unit: 'UN', icon: Layers, color: 'blue', code: 'PLOT_TTL' },
                            { label: 'Eficiência de Uso', value: stats.efficiency.toFixed(1), unit: '%', icon: Activity, color: 'amber', code: 'EFF_SOLO' }
                        ].map((item, idx) => (
                            <Card key={idx} className="group p-6 border-slate-900 hover:border-slate-800 bg-slate-950 relative overflow-hidden rounded-[2rem]">
                                <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${item.color}-500`}>
                                    <item.icon size={48} />
                                </div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic group-hover:text-slate-400 transition-colors">{item.label}</p>
                                <h4 className="text-3xl font-black text-white italic tracking-tighter group-hover:translate-x-1 transition-transform">
                                    {item.value} <span className="text-xs font-black text-slate-600 uppercase italic">{item.unit}</span>
                                </h4>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[8px] font-black text-slate-700 tracking-widest uppercase italic">{item.code}</span>
                                    <div className={`h-1 flex-1 mx-4 bg-slate-800 rounded-full overflow-hidden`}>
                                        <div className={`h-full bg-${item.color}-500 shadow-[0_0_8px] shadow-${item.color}-500`} style={{ width: idx === 3 ? `${item.value}%` : '100%' }} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* SCANNER PANEL */}
                    {isFilterPanelOpen && (
                        <div className="bg-slate-950/80 border border-slate-900 p-8 rounded-[2.5rem] mb-6 animate-in slide-in-from-top-4 duration-500 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/50 z-20" />
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Search size={12} className="text-emerald-500" /> Scanner de Varredura Territorial
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="FILTRAR PROPRIEDADES, LOCALIZAÇÕES OU GESTORES..."
                                        className="w-full bg-slate-900/50 border border-slate-800 py-5 px-8 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-emerald-500/50 transition-all italic placeholder:text-slate-800"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                                        <Zap size={18} className="text-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PROPERTY GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                        {filteredProperties.map((prop) => (
                            <Card
                                key={prop.id}
                                variant="glass"
                                onClick={() => setSelectedPropertyId(prop.id)}
                                className="group p-0 border-slate-800/60 hover:border-emerald-500/40 transition-all duration-500 cursor-pointer overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative"
                            >
                                <div className="absolute top-0 right-0 p-8 z-10 opacity-0 group-hover:opacity-100 transition-all">
                                    <Maximize2 size={24} className="text-emerald-500" />
                                </div>
                                <div className="h-1.5 w-full bg-emerald-500/30" />
                                <div className="p-8">
                                    <div className="flex items-start gap-5 mb-8">
                                        <div className="w-16 h-16 rounded-[1.25rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all duration-500 shadow-xl">
                                            <LandPlot size={32} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-white text-lg uppercase tracking-tighter italic leading-none truncate group-hover:text-emerald-300 transition-colors uppercase">{prop.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2"><MapPin size={10} /> {prop.location}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-px bg-slate-800/40 border border-slate-800/40 rounded-2xl overflow-hidden">
                                            <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic">Área Nominal</p>
                                                <p className="text-[11px] font-black text-white italic">{formatNumber(prop.totalArea)} HA</p>
                                            </div>
                                            <div className="bg-slate-950/60 p-4 flex flex-col gap-1">
                                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic">Cultura Base</p>
                                                <p className="text-[11px] font-black text-emerald-400 italic flex items-center gap-1.5 uppercase"><Sprout size={10} /> {prop.mainCrop}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end mb-1">
                                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic">Ocupação Produtiva</p>
                                                <p className="text-[9px] font-black text-emerald-500 italic uppercase">{((prop.cultivatedArea / (prop.totalArea || 1)) * 100).toFixed(0)}% Utilizado</p>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]"
                                                    style={{ width: `${(prop.cultivatedArea / (prop.totalArea || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto bg-slate-950/50 p-6 border-t border-slate-900 flex justify-between items-center group-hover:bg-slate-900/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Layers size={14} className="text-slate-600" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{plots.filter(pl => pl.propertyId === prop.id).length} Subdivisões Ativas</span>
                                    </div>
                                    <div className="flex gap-1 h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="flex-1 bg-emerald-500/40" />
                                        <div className="flex-1 bg-emerald-500/20" />
                                        <div className="flex-1 bg-slate-900" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                /* SELECTED PROPERTY DETAIL VIEW */
                <div className="space-y-8 pb-12">
                    <div className="flex items-center justify-between bg-slate-900/60 p-8 rounded-[2rem] border border-slate-800 shadow-xl backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => setSelectedPropertyId(null)}
                                className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                <ArrowLeft size={28} />
                            </button>
                            <div>
                                <div className="flex items-center gap-4">
                                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{selectedProperty?.name}</h2>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20 rounded-lg italic">NOMINAL</span>
                                </div>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2 italic">
                                    <MapPin size={12} className="text-emerald-500/50" /> {selectedProperty?.location}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
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
                                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-500 hover:text-white transition-all"
                            >
                                <Edit size={20} />
                            </button>
                            <button
                                onClick={() => selectedProperty && deleteProperty(selectedProperty.id)}
                                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-slate-800 hover:text-rose-500 transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar: Technical Dossier */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card rounded="rounded-[2rem]" className="p-8 border-slate-900 bg-slate-950 space-y-8">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                    <Info size={14} className="text-emerald-500" /> Dossier Técnico da Unidade
                                </h4>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic mb-2">Comando Operacional</p>
                                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-4">
                                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-400"><User size={20} /></div>
                                            <p className="font-black text-white uppercase italic tracking-tight">{selectedProperty?.manager}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic mb-2">Bio-Matriz (Cultura)</p>
                                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-4">
                                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-emerald-500"><Sprout size={20} /></div>
                                            <p className="font-black text-white uppercase italic tracking-tight">{selectedProperty?.mainCrop}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-900">
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic mb-4">Arquivos & Certificações</p>
                                    <div className="space-y-3">
                                        {selectedProperty?.attachments?.map((att, idx) => (
                                            <a key={idx} href={att.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-900/10 border border-slate-900 hover:border-amber-500/20 transition-all rounded-2xl group">
                                                <div className="flex items-center gap-4">
                                                    <FileText size={18} className="text-amber-500/60 group-hover:text-amber-500 transition-colors" />
                                                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 truncate max-w-[150px] uppercase">{att.name}</span>
                                                </div>
                                                <ArrowLeft size={14} className="rotate-[135deg] text-slate-700 group-hover:text-white" />
                                            </a>
                                        ))}
                                        {(!selectedProperty?.attachments?.length) && <p className="text-[10px] text-slate-800 italic px-2">Integridade: Sem documentos anexados</p>}
                                    </div>
                                </div>
                            </Card>

                            <Card rounded="rounded-[2.5rem]" className="bg-slate-950 border-slate-900 p-8 flex flex-col items-center justify-center text-center gap-6">
                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest w-full text-left italic">Ready_Metrics</h4>
                                <div className="relative w-36 h-36 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-900" />
                                        <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={389.5} strokeDashoffset={389.5 * (1 - (selectedProperty?.cultivatedArea || 0) / (selectedProperty?.totalArea || 1))} className="text-emerald-500 shadow-[0_0_10px_#10b981]" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{((selectedProperty?.cultivatedArea || 0) / (selectedProperty?.totalArea || 1) * 100).toFixed(0)}%</p>
                                        <p className="text-[8px] font-black text-slate-600 uppercase mt-1">Status</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Main Pillar: Subdivisions / Plots */}
                        <div className="lg:col-span-8 space-y-8">
                            <Card rounded="rounded-[2.5rem]" className="p-0 border-slate-900 bg-slate-950 overflow-hidden group">
                                <div className="p-8 border-b border-slate-900 bg-slate-900/20 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-500"><BarChart3 size={24} /></div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">Subdivisões de Solo</h3>
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1.5 italic">Controle de Talhões e Produtividade</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setEditingPlotId(null); setPlotForm({ name: '', area: '', crop: selectedProperty?.mainCrop || '', status: 'active' }); setIsPlotFormOpen(true); }}
                                        className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-emerald-950 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                                    >
                                        Homologar Talhão
                                    </button>
                                </div>

                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {propertyPlots.map((plot) => (
                                        <Card key={plot.id} className="bg-slate-900/30 border-slate-800/60 p-6 group/plot relative overflow-hidden rounded-[1.5rem] hover:border-emerald-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h5 className="font-black text-white uppercase italic tracking-tighter text-base">{plot.name}</h5>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase italic"><Maximize2 size={12} className="text-emerald-500/50" /> {plot.area} HA</span>
                                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase italic"><Sprout size={12} className="text-amber-500/50" /> {plot.crop}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditingPlotId(plot.id); setPlotForm({ ...plot, area: plot.area.toString(), status: 'active' }); setIsPlotFormOpen(true); }} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-600 hover:text-white transition-colors"><Edit size={14} /></button>
                                                    <button onClick={() => deletePlot(plot.id)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-800 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                                                <div className="text-center"><p className="text-[7px] text-slate-700 font-black uppercase mb-0.5">ESTADO</p><p className="text-[9px] font-black text-emerald-500 italic">NOMINAL</p></div>
                                                <div className="text-center border-x border-slate-800"><p className="text-[7px] text-slate-700 font-black uppercase mb-0.5">INDICE</p><p className="text-[9px] font-black text-white italic">0.92</p></div>
                                                <div className="text-center"><p className="text-[7px] text-slate-700 font-black uppercase mb-0.5">ULT.APLIC</p><p className="text-[9px] font-black text-slate-500 italic">HÁ 12D</p></div>
                                            </div>
                                        </Card>
                                    ))}
                                    {propertyPlots.length === 0 && (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20 italic space-y-4">
                                            <Layers size={48} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-center">Nenhum talhão identificado nesta unidade territorial.</p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-8 rounded-[2.5rem] bg-slate-950 border-slate-900 border-l-4 border-l-emerald-500">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3 italic"><Activity size={14} className="text-emerald-500" /> Analítico de Cultivo</h4>
                                    <div className="h-40 flex items-end gap-2.5 px-2">
                                        {[40, 65, 45, 90, 75, 55, 80, 60, 40, 50].map((h, i) => (
                                            <div key={i} className="flex-1 bg-slate-900 relative group overflow-hidden rounded-t-sm">
                                                <div className="absolute bottom-0 w-full bg-emerald-500/30 group-hover:bg-emerald-500/60 transition-all shadow-[0_0_8px_#10b98120]" style={{ height: `${h}%` }} />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                                <Card className="p-8 rounded-[2.5rem] bg-slate-950 border-slate-900 border-l-4 border-l-amber-500 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3 italic"><Target size={14} className="text-amber-500" /> Meta de Safra 25/26</h4>
                                        <p className="text-3xl font-black text-white italic tracking-tighter">148.5 t/ha</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end"><span className="text-[9px] font-black text-slate-700 italic">LOG_PROD</span><span className="text-[9px] font-black text-amber-500 italic">82% COMPLETE</span></div>
                                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: '82%' }} /></div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PROTOCOL MODAL: PROPRIEDADE */}
            {isPropertyFormOpen && (
                <div className="fixed inset-0 z-[140] flex items-center justify-center p-2 md:p-4">
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={() => setIsPropertyFormOpen(false)} />
                    <Card variant="glass" className="w-full max-w-5xl relative z-10 p-0 overflow-hidden border-emerald-500/20 shadow-2xl rounded-[1.5rem] md:rounded-[3rem] !scale-100 flex flex-col h-[95vh] md:h-[90vh]">
                        <div className="h-1.5 w-full bg-slate-900">
                            <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: editingPropertyId ? '100%' : '50%' }} />
                        </div>
                        <div className="p-10 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><LandPlot size={28} /></div>
                                <div><h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{editingPropertyId ? 'Retificação Georef' : 'Homologação Territorial'}</h3><p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2"><Zap size={12} className="text-emerald-500" /> Cadastro de Ativos Imobiliários</p></div>
                            </div>
                            <button onClick={() => setIsPropertyFormOpen(false)} className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-lg active:scale-90"><X size={28} /></button>
                        </div>
                        <form onSubmit={handlePropertySubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3 italic"><FileText size={14} /> Identificação Territorial</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Nome da Propriedade / Fazenda</label><input required value={propertyForm.name} onChange={e => setPropertyForm({ ...propertyForm, name: e.target.value.toUpperCase() })} placeholder="EX: FAZENDA BELA VISTA" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all italic" /></div>
                                            <div className="space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Município / UF</label><input required value={propertyForm.location} onChange={e => setPropertyForm({ ...propertyForm, location: e.target.value.toUpperCase() })} placeholder="EX: GOIÂNIA / GO" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all italic" /></div>
                                            <div className="space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Gestor de Comando</label><input required value={propertyForm.manager} onChange={e => setPropertyForm({ ...propertyForm, manager: e.target.value.toUpperCase() })} placeholder="EX: CARLOS ALBERTO" className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all italic" /></div>
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t border-slate-800"><PropertyAttachments existingAttachments={propertyForm.attachments} pendingFiles={pendingFiles} onAddFiles={(files) => { const newPending = files.map(file => ({ file, preview: URL.createObjectURL(file), id: Math.random().toString(36).substr(2, 9) })); setPendingFiles([...pendingFiles, ...newPending]); }} onRemovePending={(id) => setPendingFiles(pendingFiles.filter(f => f.id !== id))} onRemoveExisting={(id) => { const fileToRemove = propertyForm.attachments.find(a => a.id === id); if (fileToRemove) setAttachmentsToDelete([...attachmentsToDelete, fileToRemove]); setPropertyForm({ ...propertyForm, attachments: propertyForm.attachments.filter(a => a.id !== id) }); }} onUpdatePendingFile={(id, newFile, newPreview) => setPendingFiles(prev => prev.map(f => f.id === id ? { ...f, file: newFile, preview: newPreview } : f))} onUpdateExistingFile={(id, newFile, newPreview) => { const fileToRemove = propertyForm.attachments.find(a => a.id === id); if (fileToRemove) { setAttachmentsToDelete(prev => [...prev, fileToRemove]); setPropertyForm(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== id) })); setPendingFiles(prev => [...prev, { file: newFile, preview: newPreview, id: Math.random().toString(36).substr(2, 9) }]); } }} isUploading={isUploading} /></div>
                                </div>
                                <div className="lg:col-span-4 space-y-8">
                                    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3 italic"><Landmark size={14} /> Matriz de solo</h4>
                                        <div className="space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Cultura Base</label><input required value={propertyForm.mainCrop} onChange={e => setPropertyForm({ ...propertyForm, mainCrop: e.target.value.toUpperCase() })} placeholder="EX: SOJA / MILHO / CAFÉ" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-emerald-500/50 italic" /></div>
                                        <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                            <div className="space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Área Nominal Total (HA)</label><input type="number" step="0.01" value={propertyForm.totalArea} onChange={e => setPropertyForm({ ...propertyForm, totalArea: e.target.value })} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xl font-black text-white outline-none focus:border-emerald-500/50 italic text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /></div>
                                            <div className="space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Área de Produção (HA)</label><input type="number" step="0.01" value={propertyForm.cultivatedArea} onChange={e => setPropertyForm({ ...propertyForm, cultivatedArea: e.target.value })} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xl font-black text-emerald-500 outline-none focus:border-emerald-500/50 italic text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /></div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/20 border border-slate-800/50 p-6 rounded-[1.5rem] flex items-center gap-4 text-slate-600"><ShieldCheck size={20} className="shrink-0" /><p className="text-[9px] font-bold uppercase tracking-widest italic leading-tight">Validação georeferenciada sincronizada com base de dados central.</p></div>
                                </div>
                            </div>
                        </form>
                        <div className="p-10 border-t border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4 text-slate-500 opacity-40 italic"><Map size={20} /><span className="text-[9px] font-black uppercase tracking-[0.3em]">Geo-Precision v4.2</span></div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setIsPropertyFormOpen(false)} className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all active:scale-95 italic">Abortar</button>
                                <button type="submit" onClick={handlePropertySubmit} disabled={isUploading} className="px-16 py-5 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 border-b-4 border-emerald-800 italic flex items-center gap-3"> {isUploading ? <Loader2 className="animate-spin" /> : 'Efetivar Matriz'} </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* PROTOCOL MODAL: TALHÃO */}
            {isPlotFormOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsPlotFormOpen(false)} />
                    <Card variant="glass" className="w-full max-w-md relative z-10 p-0 overflow-hidden border-emerald-500/20 shadow-2xl rounded-[2rem] !scale-100 flex flex-col">
                        <div className="p-8 border-b border-slate-800 bg-slate-950 flex justify-between items-center"><h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{editingPlotId ? 'Retificação de Talhão' : 'Homologação de Área'}</h3><button type="button" onClick={() => setIsPlotFormOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2"><X size={20} /></button></div>
                        <form onSubmit={handlePlotSubmit} className="p-8 space-y-6 bg-slate-950/40">
                            <div className="space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Identificação / Tag</label><input required value={plotForm.name} onChange={e => setPlotForm({ ...plotForm, name: e.target.value.toUpperCase() })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-emerald-500 italic" placeholder="EX: T-01 / SUL" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Área (HA)</label><input required type="number" step="0.01" value={plotForm.area} onChange={e => setPlotForm({ ...plotForm, area: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white outline-none focus:border-emerald-500 italic text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" /></div>
                                <div className="space-y-1.5"><label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Cultura</label><input required value={plotForm.crop} onChange={e => setPlotForm({ ...plotForm, crop: e.target.value.toUpperCase() })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white outline-none focus:border-emerald-500 italic" placeholder="SOJA" /></div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsPlotFormOpen(false)} className="px-6 py-3 bg-transparent text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all italic">Voltar</button>
                                <button type="submit" className="px-10 py-3 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 rounded-xl italic">Gravar Dados</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <TechnicalConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={deleteConfig.type === 'property' ? "Desativação de Matriz Territorial" : "Exclusão de Subdivisão (Talhão)"}
                description={deleteConfig.type === 'property'
                    ? "Você está prestes a remover permanentemente esta propriedade e TODOS os seus talhões associados do sistema."
                    : "Você está prestes a remover os dados técnicos e georeferenciados deste talhão."}
                criticalInfo={deleteConfig.type === 'property'
                    ? "Esta ação excluirá anexos na nuvem e dados históricos de produção vinculados a esta terra. Não há restauração parcial."
                    : "Certifique-se de que não há aplicações de campo pendentes ou estoque vinculado a este talhão antes de prosseguir."}
            />
        </div>
    );
};
