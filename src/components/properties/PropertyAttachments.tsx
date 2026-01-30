import React, { useState, useRef, useEffect } from 'react';
import {
    Upload, X, FileText, Image as ImageIcon, Loader2,
    File as FileIcon, ExternalLink, Download, Edit2
} from 'lucide-react';
import { PropertyAttachment } from '../../types';
import { toast } from 'sonner';
import { ImageEditor } from './ImageEditor';

interface PropertyAttachmentsProps {
    existingAttachments: PropertyAttachment[];
    pendingFiles: { file: File; preview: string; id: string }[];
    onAddFiles: (files: File[]) => void;
    onRemovePending: (id: string) => void;
    onRemoveExisting: (id: string) => void;
    onUpdatePendingFile: (id: string, newFile: File, newPreview: string) => void;
    onUpdateExistingFile: (id: string, newFile: File, newPreview: string) => void;
    isUploading?: boolean;
}

export const PropertyAttachments: React.FC<PropertyAttachmentsProps> = ({
    existingAttachments,
    pendingFiles,
    onAddFiles,
    onRemovePending,
    onRemoveExisting,
    onUpdatePendingFile,
    onUpdateExistingFile,
    isUploading = false
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [editingImage, setEditingImage] = useState<{ id: string, url: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            pendingFiles.forEach(item => {
                if (item.preview.startsWith('blob:')) {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
    }, [pendingFiles]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        validateAndAddFiles(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            validateAndAddFiles(files);
        }
    };

    const validateAndAddFiles = (files: File[]) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        const validFiles = files.filter(file => {
            if (!validTypes.includes(file.type)) {
                toast.error(`Arquivo ${file.name} tem um tipo inválido.`);
                return false;
            }
            if (file.size > maxSize) {
                toast.error(`Arquivo ${file.name} excede o limite de 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            onAddFiles(validFiles);
        }

        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Anexos da Propriedade
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                    {existingAttachments.length + pendingFiles.length} arquivos
                </span>
            </div>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    border-px border-dashed rounded-none p-8 transition-all cursor-pointer
                    flex flex-col items-center justify-center gap-3
                    ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-950'}
                `}
            >
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                />
                <div className="p-4 bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-emerald-500 transition-colors">
                    {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                </div>
                <div className="text-center">
                    <p className="text-white font-bold">Arraste arquivos ou clique para adicionar</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP ou PDF (Máx. 10MB)</p>
                </div>
            </div>

            {(existingAttachments.length > 0 || pendingFiles.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Existing Attachments */}
                    {existingAttachments.map((file) => (
                        <div key={file.id} className="group relative bg-slate-950 border border-slate-800 rounded-none overflow-hidden aspect-square">
                            {file.type.startsWith('image/') ? (
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-400">
                                    <FileText size={32} />
                                    <p className="text-[10px] mt-2 text-center truncate w-full px-2">{file.name}</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 p-2">
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-emerald-500 text-emerald-950 rounded-none hover:bg-emerald-400 transition-all shrink-0"
                                    title="Visualizar"
                                >
                                    <ExternalLink size={14} />
                                </a>
                                {file.type.startsWith('image/') && (
                                    <button
                                        type="button"
                                        onClick={() => setEditingImage({ id: file.id, url: file.url })}
                                        className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-all shrink-0"
                                        title="Editar"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                                <a
                                    href={file.url}
                                    download={file.name}
                                    className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-all shrink-0"
                                    title="Baixar"
                                >
                                    <Download size={14} />
                                </a>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveExisting(file.id);
                                    }}
                                    className="p-1.5 bg-rose-500 text-white rounded-none hover:bg-rose-600 transition-all shrink-0"
                                    title="Remover"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Pending Files */}
                    {pendingFiles.map((item) => (
                        <div key={item.id} className="group relative bg-slate-950 border border-emerald-500/30 rounded-none overflow-hidden aspect-square">
                            {item.file.type.startsWith('image/') ? (
                                <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover opacity-60" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-400 opacity-60">
                                    <FileText size={32} />
                                    <p className="text-[10px] mt-2 text-center truncate w-full px-2">{item.file.name}</p>
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase px-2 py-1 rounded-full border border-emerald-500/30">
                                    Pendente
                                </span>
                            </div>
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 p-2">
                                <a
                                    href={item.preview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-emerald-500 text-emerald-950 rounded-lg hover:bg-emerald-400 transition-all shrink-0"
                                    title="Visualizar"
                                >
                                    <ExternalLink size={14} />
                                </a>
                                {item.file.type.startsWith('image/') && (
                                    <button
                                        type="button"
                                        onClick={() => setEditingImage({ id: item.id, url: item.preview })}
                                        className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-all shrink-0"
                                        title="Editar"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemovePending(item.id);
                                    }}
                                    className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shrink-0"
                                    title="Remover"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingImage && (
                <ImageEditor
                    image={editingImage.url}
                    onCancel={() => setEditingImage(null)}
                    onSave={(blob) => {
                        const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        const preview = URL.createObjectURL(file);

                        // Check if it's an existing attachment or a pending file
                        const isExisting = existingAttachments.some(a => a.id === editingImage.id);
                        if (isExisting) {
                            onUpdateExistingFile(editingImage.id, file, preview);
                        } else {
                            onUpdatePendingFile(editingImage.id, file, preview);
                        }

                        setEditingImage(null);
                        toast.success('Imagem editada com sucesso!');
                    }}
                />
            )}
        </div>
    );
};
