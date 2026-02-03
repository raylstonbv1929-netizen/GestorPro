import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Camera, Upload, X, Zap, Check, AlertCircle, Loader2, Search } from 'lucide-react';
import { Card } from '../common/Card';
import { parseOCRText, ExtractedData } from '../../utils/ocr-parser';

interface ReceiptScannerProps {
    onCancel: () => void;
    onConfirm: (data: ExtractedData) => void;
}

export const ReceiptScanner = ({ onCancel, onConfirm }: ReceiptScannerProps) => {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [results, setResults] = useState<ExtractedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limpa estados anteriores
        setError(null);
        setResults(null);
        setProgress(0);

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        await processImage(file);
    };

    const processImage = async (file: File) => {
        setIsScanning(true);
        try {
            const worker = await createWorker('por', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });

            const { data: { text } } = await worker.recognize(file);
            console.log('OCR Text:', text);

            const parsed = parseOCRText(text);
            setResults(parsed);

            await worker.terminate();
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Falha na varredura. Verifique a qualidade da imagem e tente novamente.');
        } finally {
            setIsScanning(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">SENTINEL VISION: SCANNER</h3>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
                        <Zap size={12} className="text-amber-500" /> Analisador de Comprovantes via OCR
                    </p>
                </div>
                <button onClick={onCancel} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                {/* Left: Interactive Capture Area */}
                <div className="relative group overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 flex flex-col">
                    {!previewUrl ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-600 group-hover:border-amber-500/50 group-hover:text-amber-500 transition-all duration-500">
                                <Camera size={40} />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-xs uppercase tracking-widest italic">Captura de Documento</h4>
                                <p className="text-[9px] text-slate-600 font-bold uppercase mt-2 tracking-widest leading-relaxed">
                                    Insira um comprovante (Foto ou PDF) para análise imediata pela IA Sentinel
                                </p>
                            </div>
                            <button
                                onClick={triggerFileInput}
                                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-lg shadow-amber-900/20"
                            >
                                <Upload size={16} /> Selecionar Arquivo
                            </button>
                        </div>
                    ) : (
                        <div className="relative flex-1 bg-black/40 overflow-hidden">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain opacity-60" />

                            {isScanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm">
                                    <div className="w-full max-w-[200px] h-1 bg-slate-900 rounded-full overflow-hidden mb-4">
                                        <div
                                            className="h-full bg-amber-500 shadow-[0_0_15px_#f59e0b] transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] animate-pulse">
                                        Varredura em Curso: {progress}%
                                    </p>
                                    {/* Scanning Line Animation */}
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500/50 shadow-[0_0_15px_#f59e0b] animate-scan" />
                                </div>
                            )}

                            {!isScanning && (
                                <button
                                    onClick={() => { setPreviewUrl(null); setResults(null); }}
                                    className="absolute top-6 right-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-all backdrop-blur-md"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                    />
                </div>

                {/* Right: Analysis Result HUD */}
                <div className="flex flex-col space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3 italic">
                        <Search size={14} className="text-amber-500" /> Relatório de Extração Biométrica
                    </h4>

                    {isScanning ? (
                        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-[2rem] bg-slate-950/20 opacity-40">
                            <Loader2 size={32} className="text-slate-700 animate-spin mb-4" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-700">Decodificando Matriz de Dados...</p>
                        </div>
                    ) : results ? (
                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            <div className="space-y-1.5 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                <label className="text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-between pointer-events-none">
                                    Descrição Identificada
                                    <Check size={12} className="text-emerald-500" />
                                </label>
                                <input
                                    className="w-full bg-transparent border-none p-0 text-sm font-bold text-white outline-none italic uppercase"
                                    value={results.description}
                                    onChange={e => setResults({ ...results, description: e.target.value.toUpperCase() })}
                                />
                                <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/20 w-full" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl relative group hover:border-amber-500/30 transition-all">
                                    <label className="text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-between">
                                        Data
                                        <Check size={12} className="text-amber-500/50" />
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full bg-transparent border-none p-0 text-sm font-bold text-white outline-none italic"
                                        value={results.date}
                                        onChange={e => setResults({ ...results, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl relative group hover:border-emerald-500/30 transition-all">
                                    <label className="text-[9px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-between">
                                        Valor Extraído
                                        <Check size={12} className="text-emerald-500" />
                                    </label>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[10px] font-black text-slate-700">R$</span>
                                        <input
                                            className="w-full bg-transparent border-none p-0 text-xl font-bold text-white outline-none italic"
                                            value={results.amount}
                                            onChange={e => setResults({ ...results, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[1.5rem] flex gap-4 items-start">
                                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                    <strong className="text-amber-500 uppercase mr-1">Aviso:</strong>
                                    A IA Sentinel extraiu os dados acima com base na varredura visual. Por favor, ratifique os campos antes de efetivar o lançamento na matriz financeira.
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center border border-rose-500/20 rounded-[2rem] bg-rose-500/5 p-8 text-center space-y-4">
                            <AlertCircle size={32} className="text-rose-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{error}</p>
                            <button onClick={triggerFileInput} className="text-[10px] font-black text-white bg-rose-600 px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-rose-500 transition-all">Tentar Outro Arquivo</button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-900 rounded-[2rem] bg-slate-950/20 opacity-30 italic">
                            <Search size={32} className="text-slate-800 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Coleta de Amostra</p>
                        </div>
                    )}

                    <div className="pt-6 flex gap-4">
                        <button
                            disabled={!results || isScanning}
                            onClick={() => results && onConfirm(results)}
                            className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 border-b-4 ${results && !isScanning ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 shadow-emerald-500/20' : 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed opacity-50'}`}
                        >
                            <Check size={20} /> Efetivar Dados
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
};
