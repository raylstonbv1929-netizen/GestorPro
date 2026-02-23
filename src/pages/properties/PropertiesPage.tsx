import React, { useState, useMemo } from 'react';
import {
    Plus, Map, Search, Trash2, Edit, ChevronRight, Layers, LandPlot, Sprout, Activity,
    TrendingUp, ArrowUpRight, Clock, FileText, Upload, X, MapPin, Ruler, User, Filter,
    SlidersHorizontal, Zap, Landmark, ShieldCheck, Target, Info, BarChart3, ArrowLeft,
    Globe, Download
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatNumber } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { TacticalFilterBlade } from '../../components/common/TacticalFilterBlade';
import { TechnicalConfirmModal } from '../../components/ui/TechnicalConfirmModal';
import { Property, Plot, PropertyAttachment } from '../../types';

export const PropertiesPage = () => {
    const { properties, setProperties, plots, setPlots, addActivity } = useApp();
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false);
    const [isPlotFormOpen, setIsPlotFormOpen] = useState(false);
    const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
    const [editingPlotId, setEditingPlotId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [attachmentsToDelete, setAttachmentsToDelete] = useState<string[]>([]);

    const [propertyForm, setPropertyForm] = useState({
        name: '',
        location: '',
        totalArea: '',
        cultivatedArea: '',
        mainCrop: '',
        manager: '',
        status: 'active' as 'active' | 'inactive',
        attachments: [] as PropertyAttachment[]
    });

    const [plotForm, setPlotForm] = useState({
        name: '',
        area: '',
        crop: '',
        status: 'active' as 'active' | 'inactive'
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{ type: 'property' | 'plot', id: number | null }>({ type: 'property', id: null });

    const filteredProperties = useMemo(() => {
        return properties.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.manager.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [properties, searchTerm]);

    const stats = useMemo(() => {
        const total = properties.reduce((acc, p) => acc + (parseFloat(p.totalArea.toString()) || 0), 0);
        const cultivated = properties.reduce((acc, p) => acc + (parseFloat(p.cultivatedArea.toString()) || 0), 0);
        const plotCount = plots.length;
        const efficiency = total > 0 ? (cultivated / total) * 100 : 0;

        return { total, cultivated, plotCount, efficiency };
    }, [properties, plots]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPendingFiles([...pendingFiles, ...Array.from(e.target.files)]);
        }
    };

    const removePendingFile = (index: number) => {
        setPendingFiles(pendingFiles.filter((_, i) => i !== index));
    };

    const markAttachmentForDeletion = (url: string) => {
        setAttachmentsToDelete([...attachmentsToDelete, url]);
        setPropertyForm({
            ...propertyForm,
            attachments: propertyForm.attachments.filter(a => a.url !== url)
        });
    };

    const uploadFiles = async (propertyId: number): Promise<PropertyAttachment[]> => {
        const uploadedAttachments: PropertyAttachment[] = [];

        for (const file of pendingFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('property-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('property-attachments')
                .getPublicUrl(filePath);

            uploadedAttachments.push({ 
                id: Math.random().toString(36).substring(7),
                name: file.name, 
                url: publicUrl 
            });
        }

        return uploadedAttachments;
    };

    const handlePropertySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            const propertyId = editingPropertyId || Date.now();
            const newUploadedAttachments = await uploadFiles(propertyId);

            if (attachmentsToDelete.length > 0) {
                const paths = attachmentsToDelete.map(url => url.split('property-attachments/')[1]).filter(Boolean);
                if (paths.length > 0) {
                    await supabase.storage.from('property-attachments').remove(paths);
                }
            }

            const data: Property = {
                id: propertyId,
                name: propertyForm.name,
                location: propertyForm.location,
                totalArea: parseFloat(propertyForm.totalArea) || 0,
                cultivatedArea: parseFloat(propertyForm.cultivatedArea) || 0,
                mainCrop: propertyForm.mainCrop,
                manager: propertyForm.manager,
                status: propertyForm.status,
                attachments: [...propertyForm.attachments, ...newUploadedAttachments]
            };

            if (editingPropertyId) {
                setProperties(properties.map(p => p.id === editingPropertyId ? data : p));
                addActivity('Retificou registro de matriz', data.name, 'neutral');
                toast.success('Matriz de propriedade atualizada.');
            } else {
                setProperties([data, ...properties]);
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
        if (!selectedPropertyId) return;

        const data: Plot = {
            id: editingPlotId || Date.now(),
            name: plotForm.name,
            area: parseFloat(plotForm.area) || 0,
            crop: plotForm.crop,
            status: plotForm.status,
            propertyId: selectedPropertyId
        };

        if (editingPlotId) {
            setPlots(plots.map(p => p.id === editingPlotId ? data : p));
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
            const prop = properties.find(p => p.id === id);
            if (prop) {
                if (prop.attachments?.length) {
                    const paths = prop.attachments.map(a => a.url.split('property-attachments/')[1]).filter(Boolean);
                    if (paths.length) await supabase.storage.from('property-attachments').remove(paths);
                }
                setProperties(properties.filter(p => p.id !== id));
                setPlots(plots.filter(p => p.propertyId !== id));
                addActivity('Removeu propriedade do sistema', prop.name, 'neutral');
                toast.success('Registro removido com sucesso.');
                if (selectedPropertyId === id) setSelectedPropertyId(null);
            }
        } else {
            const plot = plots.find(p => p.id === id);
            if (plot) {
                setPlots(plots.filter(p => p.id !== id));
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
                                onClick={() => setIsFilterPanelOpen(true)}
                                className={`px-6 py-5 rounded-2xl border transition-all flex items-center gap-3 font-black text-[10px] tracking-widest uppercase italic group ${isFilterPanelOpen ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
                            >
                                <SlidersHorizontal size={20} className="group-hover:rotate-180 transition-transform duration-500" /> Advanced_Filters
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

                    {/* TACTICAL FILTER BLADE */}
                    <TacticalFilterBlade
                        isOpen={isFilterPanelOpen}
                        onClose={() => setIsFilterPanelOpen(false)}
                        title="Scanner de Varredura Territorial"
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onReset={() => setSearchTerm('')}
                        progress={(filteredProperties.length / Math.max(properties.length, 1)) * 100}
                        metrics={[
                            { label: 'MATRIZES IDENTIFICADAS', value: filteredProperties.length.toString().padStart(3, '0') },
                            { label: 'ÁREA SOB GESTÃO', value: `${stats.total.toString()} HA` }
                        ]}
                    >
                        <div className="space-y-8">
                            <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-3">
                                <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest italic flex items-center gap-2">
                                    <Activity size={12} /> Inteligência Geográfica
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic leading-relaxed">
                                    Utilize o HUD de varredura acima para localizar propriedades por nome, localização ou gestor responsável. 
                                    A eficiência de solo é calculada em tempo real com base nos talhões homologados.
                                </p>
                            </div>
                        </div>
                    </TacticalFilterBlade>

                    {/* PROPERTY GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                        {filteredProperties.map(property => (
                            <Card key={property.id} variant="glass" className="group p-0 border-slate-800/60 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col relative">
                                <div className="absolute top-0 right-0 p-6 z-10 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingPropertyId(property.id);
                                            setPropertyForm({
                                                ...property,
                                                totalArea: property.totalArea.toString(),
                                                cultivatedArea: property.cultivatedArea.toString(),
                                                attachments: property.attachments || []
                                            });
                                            setIsPropertyFormOpen(true);
                                        }}
                                        className="text-slate-700 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => deleteProperty(property.id)} className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className={`h-1.5 w-full ${property.status === 'inactive' ? 'bg-rose-500' : 'bg-emerald-500/30'}`} />

                                <div className="p-8">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-[1.25rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all duration-500 shadow-xl">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-lg uppercase tracking-tighter italic leading-none">{property.name}</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 italic flex items-center gap-2">
                                                    <Globe size={10} className="text-emerald-500/50" /> {property.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 group-hover:border-slate-800 transition-colors">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1 italic">Área Total</p>
                                            <p className="text-sm font-black text-white italic">{property.totalArea} HA</p>
                                        </div>
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 group-hover:border-slate-800 transition-colors">
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1 italic">Cultura Principal</p>
                                            <p className="text-sm font-black text-emerald-500 italic">{property.mainCrop}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedPropertyId(property.id)}
                                        className="w-full py-4 bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 rounded-2xl text-[9px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-[0.2em] transition-all italic flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        Acessar Central de Operações <ChevronRight size={14} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                /* Detalhes da Propriedade Selecionada */
                <div className="animate-in slide-in-from-right-4 duration-500 space-y-6 flex flex-col h-full">
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 z-20" />

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setSelectedPropertyId(null)}
                                className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-700 transition-all active:scale-90"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                    {selectedProperty?.name}
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 not-italic tracking-widest">ESTADO_NOMINAL</span>
                                </h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
                                    <MapPin size={12} className="text-blue-500/50" /> {selectedProperty?.location} • GESTOR: {selectedProperty?.manager}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsPlotFormOpen(true)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 border-b-4 border-blue-800 flex items-center gap-3"
                            >
                                <Plus size={20} /> Homologar Talhão
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden h-full">
                        {/* List de Talhões */}
                        <div className="lg:col-span-8 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {propertyPlots.map(plot => (
                                    <Card key={plot.id} variant="glass" className="p-8 border-slate-900 group hover:border-blue-500/20 transition-all rounded-[2rem] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingPlotId(plot.id);
                                                    setPlotForm({
                                                        name: plot.name,
                                                        area: plot.area.toString(),
                                                        crop: plot.crop,
                                                        status: plot.status
                                                    });
                                                    setIsPlotFormOpen(true);
                                                }}
                                                className="text-slate-800 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button onClick={() => deletePlot(plot.id)} className="text-slate-800 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-blue-500/60 font-black italic shadow-2xl">
                                                <BarChart3 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-lg uppercase tracking-tighter italic leading-none">{plot.name}</h4>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1.5 italic">Cultura: <span className="text-blue-400">{plot.crop}</span></p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest italic">Área do Talhão</p>
                                                <p className="text-2xl font-black text-white italic tracking-tighter">{plot.area} <span className="text-[10px] text-slate-600 font-normal">HA</span></p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border ${plot.status === 'active' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/5 text-rose-500 border-rose-500/20'}`}>
                                                {plot.status === 'active' ? 'PRODUZINDO' : 'EM REPOUSO'}
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                {propertyPlots.length === 0 && (
                                    <div className="md:col-span-2 h-64 flex flex-col items-center justify-center bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800 opacity-30">
                                        <Layers size={48} className="text-slate-500 mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Nenhum talhão homologado para esta matriz</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar de Informações */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="p-8 border-slate-900 bg-slate-950/40 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl h-full flex flex-col">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Target size={48} className="text-blue-500" />
                                </div>

                                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-10 italic flex items-center gap-2">
                                    <Info size={14} className="text-blue-500" /> Metadata da Integridade
                                </h3>

                                <div className="space-y-8 flex-1">
                                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] text-slate-600 font-black uppercase italic tracking-widest">Ocupação de Solo</p>
                                            <p className="text-[10px] text-blue-400 font-black italic">
                                                {((propertyPlots.reduce((acc, p) => acc + p.area, 0) / (parseFloat(selectedProperty?.totalArea?.toString() || '1') || 1)) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                                                style={{ width: `${(propertyPlots.reduce((acc, p) => acc + p.area, 0) / (parseFloat(selectedProperty?.totalArea?.toString() || '1') || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[9px] text-slate-600 font-black uppercase italic tracking-widest ml-1">Documentação e Anexos</p>
                                        <div className="space-y-2">
                                            {selectedProperty?.attachments?.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-900 hover:border-blue-500/20 transition-all group/file"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={14} className="text-slate-700 group-hover/file:text-blue-500 transition-colors" />
                                                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[180px] group-hover/file:text-white transition-colors uppercase tracking-tight italic">{file.name}</span>
                                                    </div>
                                                    <Download size={14} className="text-slate-800" />
                                                </a>
                                            ))}
                                            {(!selectedProperty?.attachments || selectedProperty.attachments.length === 0) && (
                                                <div className="p-10 border border-dashed border-slate-900 rounded-2xl text-center opacity-20">
                                                    <Upload size={24} className="mx-auto mb-2 text-slate-500" />
                                                    <p className="text-[9px] font-black uppercase tracking-widest italic">Nenhuma documentação selada</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col gap-4">
                                     <div className="flex items-center gap-3 px-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest italic">Sync Local_Node OK</p>
                                     </div>
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
                                        className="w-full py-4 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black text-slate-500 hover:text-white hover:border-slate-700 uppercase tracking-widest transition-all italic flex items-center justify-center gap-2"
                                    >
                                        <Edit size={14} /> Editar Configurações da Matriz
                                    </button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Cadastro de Propriedade */}
            <Modal isOpen={isPropertyFormOpen} onClose={() => setIsPropertyFormOpen(false)}>
                <Card variant="glass" className="w-[1000px] max-w-[95vw] p-0 border-slate-800/60 overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col bg-slate-950/95 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                    <div className="px-10 py-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                                <LandPlot className="text-emerald-500" size={32} />
                                {editingPropertyId ? 'Retificar Matriz Territorial' : 'Homologar Nova Matriz'}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2 ml-1">
                                <Ruler size={12} className="text-emerald-500/50" /> Parametrização de Áreas Sob Gestão
                            </p>
                        </div>
                        <button onClick={() => setIsPropertyFormOpen(false)} className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-all active:scale-95"><X size={24} /></button>
                    </div>

                    <form onSubmit={handlePropertySubmit} className="flex-1 overflow-y-auto custom-scrollbar p-10">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                            {/* Identificação Setor */}
                            <div className="md:col-span-12">
                                <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-emerald-500/10 space-y-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Landmark size={64} className="text-emerald-500" /></div>
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-3 mb-6"><div className="w-10 h-px bg-emerald-500/30"></div> Identificação do Ativo <div className="w-10 h-px bg-emerald-500/30"></div></h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Nomenclatura da Propriedade (HUB)</label>
                                            <input required value={propertyForm.name} onChange={e => setPropertyForm({ ...propertyForm, name: e.target.value.toUpperCase() })} placeholder="EX: FAZENDA SERRA DO CÉU" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-emerald-500/50 transition-all italic placeholder:text-slate-800" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic flex items-center gap-2"><MapPin size={10} /> Localização / Cidade (UF)</label>
                                            <input required value={propertyForm.location} onChange={e => setPropertyForm({ ...propertyForm, location: e.target.value.toUpperCase() })} placeholder="EX: SORRISO - MT" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-emerald-500/50 transition-all italic placeholder:text-slate-800" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Eficiência & Solo */}
                            <div className="md:col-span-8">
                                <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-emerald-500/10 space-y-8 relative overflow-hidden h-full">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic flex items-center gap-3 mb-6"><div className="w-10 h-px bg-emerald-500/30"></div> Capacidade Produtiva <div className="w-10 h-px bg-emerald-500/30"></div></h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Área Total Escriturada (HA)</label>
                                            <input required type="number" step="0.01" value={propertyForm.totalArea} onChange={e => setPropertyForm({ ...propertyForm, totalArea: e.target.value })} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-emerald-500 outline-none focus:border-emerald-500/50 transition-all italic placeholder:text-slate-800" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Área Cultivável / Útil (HA)</label>
                                            <input required type="number" step="0.01" value={propertyForm.cultivatedArea} onChange={e => setPropertyForm({ ...propertyForm, cultivatedArea: e.target.value })} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-emerald-500 outline-none focus:border-emerald-500/50 transition-all italic placeholder:text-slate-800" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Cultura Primária (Foco)</label>
                                            <input value={propertyForm.mainCrop} onChange={e => setPropertyForm({ ...propertyForm, mainCrop: e.target.value.toUpperCase() })} placeholder="EX: SOJA / MILHO / ALGODÃO" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-emerald-500/50 transition-all italic placeholder:text-slate-800" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic flex items-center gap-2"><User size={10} /> Gestor / Gerente Responsável</label>
                                            <input value={propertyForm.manager} onChange={e => setPropertyForm({ ...propertyForm, manager: e.target.value.toUpperCase() })} placeholder="NOME DO RESPONSÁVEL TÉCNICO" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-emerald-500/50 transition-all italic placeholder:text-slate-800" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="md:col-span-4">
                                <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-blue-500/10 space-y-6 flex flex-col h-full min-h-[350px]">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic flex items-center gap-2"><Upload size={14} /> Dossiê Matriz</h4>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-4 h-[200px]">
                                        {/* Existing Attachments */}
                                        {propertyForm.attachments.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-900 group/file">
                                                <span className="text-[9px] font-bold text-slate-500 truncate max-w-[120px] uppercase italic">{file.name}</span>
                                                <button type="button" onClick={() => markAttachmentForDeletion(file.url)} className="text-slate-800 hover:text-rose-500 transition-colors"><X size={14} /></button>
                                            </div>
                                        ))}

                                        {/* Pending Files */}
                                        {pendingFiles.map((file, idx) => (
                                            <div key={`pending-${idx}`} className="flex items-center justify-between p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 group/file animate-pulse">
                                                <span className="text-[9px] font-bold text-blue-400 truncate max-w-[120px] uppercase italic">NOVO: {file.name}</span>
                                                <button type="button" onClick={() => removePendingFile(idx)} className="text-blue-500 hover:text-rose-500 transition-colors"><X size={14} /></button>
                                            </div>
                                        ))}

                                        {propertyForm.attachments.length === 0 && pendingFiles.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 border-2 border-dashed border-slate-800 rounded-2xl">
                                                <FileText size={32} className="mb-2" />
                                                <p className="text-[8px] font-black uppercase tracking-widest">Aguardando Dossiê</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <label className="w-full flex items-center justify-center gap-3 py-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/30 rounded-2xl cursor-pointer transition-all group active:scale-95 shadow-xl">
                                            <Plus size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] font-black text-slate-500 group-hover:text-blue-400 uppercase tracking-widest italic">Anexar Documentação</span>
                                            <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="px-10 py-8 border-t border-slate-800 bg-slate-950 backdrop-blur-3xl flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4 text-slate-500 opacity-40">
                            <ShieldCheck size={20} className="text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Protocolo de Integridade Territorial v5.0</span>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" disabled={isUploading} onClick={() => setIsPropertyFormOpen(false)} className="px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50">ABORTAR</button>
                            <button
                                type="submit"
                                onClick={(e) => {
                                    handlePropertySubmit(e as any);
                                }}
                                disabled={isUploading}
                                className="px-16 py-5 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.4em] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 border-b-4 border-emerald-800 flex items-center gap-3 disabled:opacity-50"
                            >
                                {isUploading ? 'SINCRONIZANDO...' : 'EXECUTAR HOMOLOGAÇÃO'}
                            </button>
                        </div>
                    </div>
                </Card>
            </Modal>

            {/* Modal: Cadastro de Talhão */}
            <Modal isOpen={isPlotFormOpen} onClose={() => setIsPlotFormOpen(false)}>
                <Card variant="glass" className="w-[600px] max-w-[95vw] p-0 border-slate-800/60 overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col bg-slate-950/95 backdrop-blur-3xl animate-in zoom-in-95 duration-500">
                    <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                                <Plus className="text-blue-500" size={24} />
                                {editingPlotId ? 'Retificar Talhão' : 'Homologar Talhão'}
                            </h3>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2 ml-1">
                                <Landmark size={12} className="text-blue-500/50" /> Unidade de Gestão Setorial
                            </p>
                        </div>
                        <button onClick={() => setIsPlotFormOpen(false)} className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-all active:scale-95"><X size={20} /></button>
                    </div>

                    <form onSubmit={handlePlotSubmit} className="p-10 space-y-8">
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Nomenclatura do Talhão</label>
                            <input required value={plotForm.name} onChange={e => setPlotForm({ ...plotForm, name: e.target.value.toUpperCase() })} placeholder="EX: QUADRA 05 - NORTE" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-blue-500/50 transition-all italic placeholder:text-slate-800" />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Área do Talhão (HA)</label>
                                <input required type="number" step="0.01" value={plotForm.area} onChange={e => setPlotForm({ ...plotForm, area: e.target.value })} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-blue-500 outline-none focus:border-blue-500/50 transition-all italic placeholder:text-slate-800" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Cultura Instalada</label>
                                <input value={plotForm.crop} onChange={e => setPlotForm({ ...plotForm, crop: e.target.value.toUpperCase() })} placeholder="EX: SOJA CICLO CURTO" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-blue-500/50 transition-all italic placeholder:text-slate-800" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic">Status de Produção</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setPlotForm({ ...plotForm, status: 'active' })} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${plotForm.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-950 border-slate-900 text-slate-700'}`}>Produzindo</button>
                                <button type="button" onClick={() => setPlotForm({ ...plotForm, status: 'inactive' })} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${plotForm.status === 'inactive' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-950 border-slate-900 text-slate-700'}`}>Repouso</button>
                            </div>
                        </div>
                    </form>

                    <div className="p-8 border-t border-slate-800 bg-slate-950 flex justify-end gap-4 rounded-b-[2.5rem]">
                        <button type="button" onClick={() => setIsPlotFormOpen(false)} className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-black text-[9px] uppercase tracking-widest hover:text-white transition-all">CANCELAR</button>
                        <button type="submit" onClick={handlePlotSubmit} className="px-12 py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-500 transition-all border-b-4 border-blue-800">SALVAR PROTOCOLO</button>
                    </div>
                </Card>
            </Modal>

            <TechnicalConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={deleteConfig.type === 'property' ? 'Purgar Matriz Operacional' : 'Expurgar Talhão'}
                description={deleteConfig.type === 'property'
                    ? "Esta ação removerá permanentemente a propriedade, todos os seus talhões e documentações anexas da rede Sentinel."
                    : "Esta ação removerá permanentemente o talhão e seus registros históricos da estrutura da matriz."
                }
                criticalInfo="Ação irreversível. O bypass de recuperação técnica não estará disponível após a execução."
            />
        </div>
    );
};
