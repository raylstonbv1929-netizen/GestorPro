import React, { useState } from 'react';
import {
    Map, MapPin, Plus, X, Edit, Trash2, LandPlot, User, Maximize2, Activity, Sprout, Loader2, FileText
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
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
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [editingPlotId, setEditingPlotId] = useState<number | null>(null);
    const [plotForm, setPlotForm] = useState<{
        name: string;
        area: string;
        crop: string;
        status: 'active' | 'inactive';
    }>({
        name: '', area: '', crop: '', status: 'active'
    });

    const handlePropertySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            const propertyId = editingPropertyId !== null ? editingPropertyId : Date.now();
            const uploadedAttachments: PropertyAttachment[] = [];

            // Upload pending files
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

            // Delete files from storage that were removed from the list
            // Use a Set to ensure we don't try to delete the same file twice
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
            setPropertyForm({ name: '', location: '', totalArea: '', cultivatedArea: '', mainCrop: '', manager: '', status: 'active', attachments: [] });
            setPendingFiles([]);
            setAttachmentsToDelete([]);
        } catch (error: any) {
            console.error('Erro ao salvar propriedade:', error);
            toast.error('Erro ao salvar propriedade: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const deleteProperty = async (id: number) => {
        const prop = properties.find((p: any) => p.id === id);
        if (prop && window.confirm(`Deseja realmente excluir a propriedade ${prop.name}?`)) {
            // Delete all attachments from storage
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

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col overflow-y-auto pr-2 pb-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Map className="text-emerald-400" size={28} /> Propriedades e Talhões
                    </h2>
                    <p className="text-slate-400 text-sm">Gerencie suas áreas produtivas e divisões</p>
                </div>
                <button
                    onClick={() => {
                        setIsPropertyFormOpen(true);
                        setEditingPropertyId(null);
                        setPropertyForm({ name: '', location: '', totalArea: '', cultivatedArea: '', mainCrop: '', manager: '', status: 'active', attachments: [] });
                        setPendingFiles([]);
                        setAttachmentsToDelete([]);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} /> Nova Propriedade
                </button>
            </div>

            {isPropertyFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsPropertyFormOpen(false)} />
                    <Card variant="highlight" className="w-full max-w-2xl relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100" style={{ transform: 'none' }}>
                        <form onSubmit={handlePropertySubmit} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-white">{editingPropertyId ? 'Editar Propriedade' : 'Cadastrar Propriedade'}</h3>
                                <button type="button" onClick={() => setIsPropertyFormOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Nome da Fazenda</label>
                                    <input required value={propertyForm.name} onChange={e => setPropertyForm({ ...propertyForm, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Ex: Fazenda Santa Maria" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Localização</label>
                                    <input required value={propertyForm.location} onChange={e => setPropertyForm({ ...propertyForm, location: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Ex: Rio Verde - GO" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Gerente/Responsável</label>
                                    <input required value={propertyForm.manager} onChange={e => setPropertyForm({ ...propertyForm, manager: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Nome do gerente" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Cultura Principal</label>
                                    <input required value={propertyForm.mainCrop} onChange={e => setPropertyForm({ ...propertyForm, mainCrop: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Ex: Soja" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Área Total (ha)</label>
                                    <input required type="number" step="0.01" min="0" value={propertyForm.totalArea} onChange={e => setPropertyForm({ ...propertyForm, totalArea: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Área Cultivada (ha)</label>
                                    <input required type="number" step="0.01" min="0" value={propertyForm.cultivatedArea} onChange={e => setPropertyForm({ ...propertyForm, cultivatedArea: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="0.00" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
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
                                    onRemovePending={(id) => {
                                        setPendingFiles(pendingFiles.filter(f => f.id !== id));
                                    }}
                                    onRemoveExisting={(id) => {
                                        const fileToRemove = propertyForm.attachments.find(a => a.id === id);
                                        if (fileToRemove) {
                                            setAttachmentsToDelete([...attachmentsToDelete, fileToRemove]);
                                        }
                                        setPropertyForm({
                                            ...propertyForm,
                                            attachments: propertyForm.attachments.filter(a => a.id !== id)
                                        });
                                    }}
                                    onUpdatePendingFile={(id, newFile, newPreview) => {
                                        setPendingFiles(prev => prev.map(f => {
                                            if (f.id === id) {
                                                if (f.preview.startsWith('blob:')) {
                                                    URL.revokeObjectURL(f.preview);
                                                }
                                                return { ...f, file: newFile, preview: newPreview };
                                            }
                                            return f;
                                        }));
                                    }}
                                    onUpdateExistingFile={(id, newFile, newPreview) => {
                                        const fileToRemove = propertyForm.attachments.find(a => a.id === id);
                                        if (fileToRemove) {
                                            setAttachmentsToDelete([...attachmentsToDelete, fileToRemove]);
                                            setPropertyForm({
                                                ...propertyForm,
                                                attachments: propertyForm.attachments.filter(a => a.id !== id)
                                            });
                                            setPendingFiles([...pendingFiles, {
                                                file: newFile,
                                                preview: newPreview,
                                                id: Math.random().toString(36).substr(2, 9)
                                            }]);
                                        }
                                    }}
                                    isUploading={isUploading}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsPropertyFormOpen(false)} className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all">Cancelar</button>
                                <button type="submit" disabled={isUploading} className="px-8 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            SALVANDO...
                                        </>
                                    ) : (
                                        'SALVAR PROPRIEDADE'
                                    )}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {properties.map((prop: Property) => (
                    <Card key={prop.id} className="group hover:border-emerald-500/20 transition-all">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="lg:w-1/3 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {prop.attachments && prop.attachments.find(a => a.type.startsWith('image/')) ? (
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-800 shrink-0">
                                                <img
                                                    src={prop.attachments.find(a => a.type.startsWith('image/'))?.url}
                                                    alt={prop.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                                                <MapPin size={24} />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{prop.name}</h3>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{prop.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => {
                                                setEditingPropertyId(prop.id);
                                                setPropertyForm({
                                                    ...prop,
                                                    totalArea: prop.totalArea.toString(),
                                                    cultivatedArea: prop.cultivatedArea.toString(),
                                                    attachments: prop.attachments || []
                                                });
                                                setPendingFiles([]);
                                                setAttachmentsToDelete([]);
                                                setIsPropertyFormOpen(true);
                                            }}
                                            className="p-2 bg-slate-800 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteProperty(prop.id)}
                                            className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Área Total</p>
                                        <p className="text-lg font-black text-white">{formatNumber(prop.totalArea)} <span className="text-xs text-slate-500 font-normal">ha</span></p>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Área Cultivada</p>
                                        <p className="text-lg font-black text-emerald-400">{formatNumber(prop.cultivatedArea)} <span className="text-xs text-slate-500 font-normal">ha</span></p>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Cultura</p>
                                        <p className="text-sm font-bold text-white flex items-center gap-2"><Sprout size={14} className="text-emerald-500" /> {prop.mainCrop}</p>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Gerente</p>
                                        <p className="text-sm font-bold text-white flex items-center gap-2"><User size={14} className="text-blue-500" /> {prop.manager}</p>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 col-span-2">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Anexos</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                                <FileText size={14} className="text-amber-500" />
                                                {prop.attachments?.length || 0} arquivos
                                            </p>
                                            {prop.attachments && prop.attachments.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        setEditingPropertyId(prop.id);
                                                        setPropertyForm({
                                                            ...prop,
                                                            totalArea: prop.totalArea.toString(),
                                                            cultivatedArea: prop.cultivatedArea.toString(),
                                                            attachments: prop.attachments || []
                                                        });
                                                        setPendingFiles([]);
                                                        setAttachmentsToDelete([]);
                                                        setIsPropertyFormOpen(true);
                                                    }}
                                                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase"
                                                >
                                                    Ver todos
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedPropertyId(prop.id);
                                        setIsPlotFormOpen(true);
                                        setEditingPlotId(null);
                                        setPlotForm({ name: '', area: '', crop: prop.mainCrop, status: 'active' });
                                    }}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700/50"
                                >
                                    <Plus size={18} /> Adicionar Talhão
                                </button>
                            </div>

                            <div className="flex-1 bg-slate-950/50 rounded-2xl p-6 border border-slate-800/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <LandPlot size={18} className="text-emerald-500" /> Talhões Registrados
                                    </h4>
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                        {plots.filter((p: Plot) => p.propertyId === prop.id).length} talhões
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {plots.filter((p: Plot) => p.propertyId === prop.id).map((plot: Plot) => (
                                        <div key={plot.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center group/plot hover:border-emerald-500/30 transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-white">{plot.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{plot.area} ha</span>
                                                    <span className="text-[10px] text-emerald-500 font-bold uppercase">{plot.crop}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover/plot:opacity-100 transition-all">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPropertyId(prop.id);
                                                        setEditingPlotId(plot.id);
                                                        setPlotForm({ ...plot, area: plot.area.toString(), status: (plot as any).status || 'active' });
                                                        setIsPlotFormOpen(true);
                                                    }}
                                                    className="p-1.5 hover:bg-blue-500/10 text-slate-600 hover:text-blue-400 rounded transition-all"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deletePlot(plot.id)}
                                                    className="p-1.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 rounded transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {plots.filter((p: Plot) => p.propertyId === prop.id).length === 0 && (
                                        <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                            <p className="text-xs text-slate-600 italic">Nenhum talhão cadastrado nesta propriedade.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {properties.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <Map size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Nenhuma propriedade encontrada</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Comece cadastrando sua primeira fazenda ou área produtiva para gerenciar seus talhões.</p>
                    </div>
                )}
            </div>

            {isPlotFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsPlotFormOpen(false)} />
                    <Card className="w-full max-w-md relative z-10 shadow-2xl border-emerald-500/30 !scale-100 !hover:scale-100" style={{ transform: 'none' }}>
                        <form onSubmit={handlePlotSubmit} className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-white">{editingPlotId ? 'Editar Talhão' : 'Novo Talhão'}</h3>
                                <button type="button" onClick={() => setIsPlotFormOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 font-bold ml-1">Identificação do Talhão</label>
                                    <input required value={plotForm.name} onChange={e => setPlotForm({ ...plotForm, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Ex: Talhão 01 - Sede" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-bold ml-1">Área (ha)</label>
                                        <input required type="number" step="0.01" value={plotForm.area} onChange={e => setPlotForm({ ...plotForm, area: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-bold ml-1">Cultura Atual</label>
                                        <input required value={plotForm.crop} onChange={e => setPlotForm({ ...plotForm, crop: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Ex: Soja" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsPlotFormOpen(false)} className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all">Cancelar</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-black hover:bg-emerald-400 transition-all">SALVAR TALHÃO</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
