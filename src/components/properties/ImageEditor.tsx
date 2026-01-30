import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import {
    X, RotateCw, FlipHorizontal, Sun, Contrast,
    Maximize, ZoomIn, ZoomOut, Undo2, Redo2, Save, RotateCcw, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorProps {
    image: string;
    onSave: (editedImageBlob: Blob) => void;
    onCancel: () => void;
}

interface EditorState {
    brightness: number;
    contrast: number;
    saturation: number;
    rotation: number;
    flip: { horizontal: boolean; vertical: boolean };
    zoom: number;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, onSave, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // History for Undo/Redo
    const [history, setHistory] = useState<EditorState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const currentState: EditorState = {
        brightness, contrast, saturation, rotation, flip, zoom
    };

    const saveToHistory = useCallback((state: EditorState) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            return [...newHistory, JSON.parse(JSON.stringify(state))];
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            applyState(prevState);
            setHistoryIndex(prev => prev - 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            applyState(nextState);
            setHistoryIndex(prev => prev + 1);
        }
    };

    const applyState = (state: EditorState) => {
        setBrightness(state.brightness);
        setContrast(state.contrast);
        setSaturation(state.saturation);
        setRotation(state.rotation);
        setFlip(state.flip);
        setZoom(state.zoom);
    };

    useEffect(() => {
        if (history.length === 0) {
            setHistory([currentState]);
            setHistoryIndex(0);
        }
    }, []);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async () => {
        try {
            const img = await createImage(image);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            const rotRad = (rotation * Math.PI) / 180;
            const { width: imgW, height: imgH } = img;

            const bBoxW = Math.abs(Math.cos(rotRad) * imgW) + Math.abs(Math.sin(rotRad) * imgH);
            const bBoxH = Math.abs(Math.sin(rotRad) * imgW) + Math.abs(Math.cos(rotRad) * imgH);

            canvas.width = bBoxW;
            canvas.height = bBoxH;

            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

            ctx.translate(bBoxW / 2, bBoxH / 2);
            ctx.rotate(rotRad);
            ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
            ctx.translate(-imgW / 2, -imgH / 2);
            ctx.drawImage(img, 0, 0);

            const cropCanvas = document.createElement('canvas');
            const cropCtx = cropCanvas.getContext('2d');

            if (!cropCtx) return;

            cropCanvas.width = croppedAreaPixels.width;
            cropCanvas.height = croppedAreaPixels.height;

            cropCtx.drawImage(
                canvas,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            return new Promise<Blob>((resolve) => {
                cropCanvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/jpeg', 0.95);
            });
        } catch (e) {
            console.error('Error cropping image:', e);
            throw e;
        }
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) {
            toast.error('Aguarde o carregamento da imagem');
            return;
        }
        setIsProcessing(true);
        try {
            const blob = await getCroppedImg();
            if (blob) onSave(blob);
        } catch (error) {
            toast.error('Erro ao processar imagem');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetFilters = () => {
        const resetState = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            rotation: 0,
            flip: { horizontal: false, vertical: false },
            zoom: 1
        };
        applyState(resetState);
        setCrop({ x: 0, y: 0 });
        saveToHistory(resetState);
    };

    const handleSliderChange = (type: string, value: number) => {
        switch (type) {
            case 'brightness': setBrightness(value); break;
            case 'contrast': setContrast(value); break;
            case 'saturation': setSaturation(value); break;
        }
    };

    const handleSliderRelease = () => {
        saveToHistory(currentState);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-12 overflow-auto bg-slate-950/80 backdrop-blur-md">
            <div
                className="bg-slate-900 w-full max-w-[1100px] min-h-[500px] h-full max-h-[850px] flex flex-col border border-slate-800 relative isolate"
                style={{ transform: 'translateZ(0)' }}
            >
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-950 shrink-0 z-10">
                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                <Maximize size={18} className="text-emerald-500" />
                                PROCESSAMENTO DE IMAGEM
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Ajustes e Transformações Técnicas</p>
                        </div>

                        <div className="h-8 w-px bg-slate-800" />

                        <div className="flex items-center gap-1.5 bg-slate-900 p-1 border border-slate-800">
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={historyIndex <= 0 || isProcessing}
                                className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-10 transition-all"
                                title="Desfazer"
                            >
                                <Undo2 size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1 || isProcessing}
                                className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-10 transition-all"
                                title="Refazer"
                            >
                                <Redo2 size={18} />
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="p-3 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-all border border-slate-700"
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* Body Content */}
                <div className="flex-1 flex min-h-0 overflow-hidden">
                    {/* Left Side: Image Editor Area */}
                    <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center p-8">
                        <div className="w-full h-full border border-slate-800/30 bg-[#020617] relative">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                onCropComplete={onCropComplete}
                                style={{
                                    containerStyle: {
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#020617'
                                    },
                                    mediaStyle: {
                                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                                        transform: `scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`
                                    },
                                    cropAreaStyle: {
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.85)'
                                    }
                                }}
                            />
                        </div>

                        {isProcessing && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100]">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="animate-spin text-emerald-500" size={48} />
                                    <p className="text-emerald-400 font-black text-xs tracking-widest uppercase">Processando Metadados</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Sidebar Controls */}
                    <aside className="w-[320px] bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto flex flex-col gap-8 shrink-0 z-10 custom-scrollbar">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Transformação</p>
                            <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextRot = (rotation + 90) % 360;
                                        setRotation(nextRot);
                                        saveToHistory({ ...currentState, rotation: nextRot });
                                    }}
                                    className="p-4 bg-slate-950 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <RotateCw size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Girar</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFlip(prev => {
                                            const nextFlip = { ...prev, horizontal: !prev.horizontal };
                                            saveToHistory({ ...currentState, flip: nextFlip });
                                            return nextFlip;
                                        });
                                    }}
                                    className="p-4 bg-slate-950 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 flex flex-col items-center gap-2 transition-all"
                                >
                                    <FlipHorizontal size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Espelhar</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextZoom = Math.max(1, zoom - 0.2);
                                        setZoom(nextZoom);
                                        saveToHistory({ ...currentState, zoom: nextZoom });
                                    }}
                                    className="p-4 bg-slate-950 hover:bg-slate-800 text-slate-400 flex flex-col items-center gap-2 transition-all"
                                >
                                    <ZoomOut size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Reduzir</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextZoom = Math.min(3, zoom + 0.2);
                                        setZoom(nextZoom);
                                        saveToHistory({ ...currentState, zoom: nextZoom });
                                    }}
                                    className="p-4 bg-slate-950 hover:bg-slate-800 text-slate-400 flex flex-col items-center gap-2 transition-all"
                                >
                                    <ZoomIn size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Ampliaria</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ajustes Analíticos</p>
                            {[
                                { label: 'Brilho', icon: Sun, value: brightness, type: 'brightness', color: 'text-emerald-500', accent: 'accent-emerald-500' },
                                { label: 'Contraste', icon: Contrast, value: contrast, type: 'contrast', color: 'text-amber-500', accent: 'accent-amber-500' },
                                { label: 'Saturação', icon: Maximize, value: saturation, type: 'saturation', color: 'text-blue-500', accent: 'accent-blue-500' }
                            ].map((adj) => (
                                <div key={adj.type} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2.5">
                                            <adj.icon size={14} className={adj.color} />
                                            {adj.label}
                                        </label>
                                        <span className="font-mono text-[10px] text-white font-bold">{adj.value}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="200" value={adj.value}
                                        onChange={e => handleSliderChange(adj.type, parseInt(e.target.value))}
                                        onMouseUp={handleSliderRelease}
                                        onTouchEnd={handleSliderRelease}
                                        className={`w-full h-1 bg-slate-800 rounded-none appearance-none cursor-pointer ${adj.accent} transition-all`}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="w-full py-4 mt-auto bg-slate-950 border border-slate-800 text-slate-500 text-[10px] font-black tracking-[0.2em] hover:text-rose-500 hover:border-rose-500/30 transition-all uppercase flex items-center justify-center gap-3"
                        >
                            <RotateCcw size={14} /> Restaurar Perfil Original
                        </button>
                    </aside>
                </div>

                {/* Footer Actions */}
                <footer className="h-24 flex items-center justify-end px-8 gap-px bg-slate-800 border-t border-slate-800 shrink-0 z-10">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-10 h-full bg-slate-950 text-slate-500 font-black text-[10px] tracking-[0.2em] hover:text-white transition-all uppercase"
                    >
                        Descartar Operação
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="flex-1 max-w-[300px] h-full bg-emerald-500 text-emerald-950 font-black text-xs tracking-[0.1em] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 uppercase"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isProcessing ? 'Gravando Alterações...' : 'Confirmar e Salvar'}
                    </button>
                </footer>
            </div>
        </div>
    );
};
