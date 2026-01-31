import React, { useState } from 'react';
import {
    Settings, Save, Database, Shield, Bell, Globe, RefreshCw, Smartphone, MessageSquare, Wind, Layout, Maximize, Minimize, Activity, Zap, Cpu, Terminal, Mail, Clock, RotateCcw, ShieldAlert, History, Download, Upload, Server, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { TechnicalConfirmModal } from '../../components/ui/TechnicalConfirmModal';
import { toast } from 'sonner';

export const SettingsPage = () => {
    const {
        settings, setSettings,
        isFullScreen, toggleFullScreen,
        isSidebarOpen, setIsSidebarOpen,
        addActivity, snapshots, createSnapshot, restoreSnapshot,
        exportSentinelBackup, importSentinelBackup, user
    } = useApp();

    const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
    const [snapshotLabel, setSnapshotLabel] = useState('');
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [mirrorStatus, setMirrorStatus] = useState<'synced' | 'pending'>('synced');

    // Monitorar mirroring no LocalStorage
    React.useEffect(() => {
        const storageKey = `sentinel_mirror_${user?.id}`;
        const checkMirror = () => {
            const mirror = localStorage.getItem(storageKey);
            if (mirror) setMirrorStatus('synced');
        };
        checkMirror();
    }, [user?.id, snapshots]);

    const [localSettings, setLocalSettings] = useState({
        ...settings,
        isSidebarOpen: settings.isSidebarOpen ?? isSidebarOpen
    });

    const handleSave = () => {
        setSettings(localSettings);
        setIsSidebarOpen(localSettings.isSidebarOpen);
        addActivity('Alterou configurações globais do núcleo', 'Sincronização OK', 'neutral');
        toast.success('Parâmetros operacionais efetivados.');
    };

    const handleCreateSnapshot = async () => {
        if (!snapshotLabel) {
            toast.error('Designação de snapshot obrigatória.');
            return;
        }
        setIsCreatingSnapshot(true);
        try {
            await createSnapshot(snapshotLabel);
            setSnapshotLabel('');
            toast.success('Ponto de restauração selado na nuvem.');
        } finally {
            setIsCreatingSnapshot(false);
        }
    };

    const triggerRestoreSnapshot = (id: number) => {
        setSelectedSnapshotId(id);
        setIsRestoreModalOpen(true);
    };

    const confirmRestore = async () => {
        if (selectedSnapshotId) {
            await restoreSnapshot(selectedSnapshotId);
            toast.success('Estado anterior restaurado com sucesso.');
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            await importSentinelBackup(file);
            toast.success('Dossiê Sentinel importado com sucesso.');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            toast.error(' Falha na importação: ' + err.message);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col p-2 overflow-y-auto custom-scrollbar pb-10">
            {/* SETTINGS SENTINEL HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500 z-20" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Terminal className="text-slate-400" size={32} />
                        Núcleo de Comando Operacional
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 ml-1 flex items-center gap-2">
                        <Cpu size={12} className="text-slate-500/50" /> Configurações de Protocolo e Integridade do Sistema
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="relative z-10 bg-slate-100 hover:bg-white text-slate-950 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-3 border-b-4 border-slate-300"
                >
                    <Save size={20} /> Efetivar Alterações
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                {/* PRIMARY CONFIG CLUSTER */}
                <div className="lg:col-span-8 space-y-6">
                    <Card variant="glass" className="p-8 border-slate-800/60 rounded-[2rem] space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                <Globe size={20} className="text-sky-500" /> Parâmetros de Identificação
                            </h3>
                            <span className="text-[8px] font-black text-slate-700 tracking-widest uppercase italic">SYS_ID_STABLE</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic flex items-center gap-2">
                                    <Zap size={10} className="text-sky-500" /> Designação Oficial da Unidade (Fazenda)
                                </label>
                                <input
                                    value={localSettings.farmName}
                                    onChange={e => setLocalSettings({ ...localSettings, farmName: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-sky-500/50 transition-all italic placeholder:text-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 italic flex items-center gap-2">
                                    <Database size={10} className="text-sky-500" /> Vetor de Câmbio (Moeda)
                                </label>
                                <select
                                    value={localSettings.currency}
                                    onChange={e => setLocalSettings({ ...localSettings, currency: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:border-sky-500/50 transition-all appearance-none cursor-pointer italic"
                                >
                                    <option value="R$">REAL BRASILEIRO (R$)</option>
                                    <option value="US$">DÓLAR AMERICANO (US$)</option>
                                    <option value="€">EURO (EURO)</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Card variant="glass" className="p-8 border-slate-800/60 rounded-[2rem] space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                <Layout size={20} className="text-emerald-500" /> Interface e UX
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-6 bg-slate-950 rounded-2xl border border-slate-900 group hover:border-emerald-500/20 transition-all">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                        <Wind size={14} className="text-emerald-500" /> Hub Lateral
                                    </p>
                                    <p className="text-[9px] text-slate-600 font-black uppercase italic">Persistência do menu de navegação</p>
                                </div>
                                <button
                                    onClick={() => setLocalSettings({ ...localSettings, isSidebarOpen: !localSettings.isSidebarOpen })}
                                    className={`w-14 h-8 rounded-full transition-all relative border ${localSettings.isSidebarOpen ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-slate-800'}`}
                                >
                                    <div className={`absolute top-1.5 w-4 h-4 rounded-full transition-all ${localSettings.isSidebarOpen ? 'right-1.5 bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'left-1.5 bg-slate-700'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-950 rounded-2xl border border-slate-900 group hover:border-emerald-500/20 transition-all">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                        <Maximize size={14} className="text-emerald-500" /> Imersão Total
                                    </p>
                                    <p className="text-[9px] text-slate-600 font-black uppercase italic">Estado de tela cheia operacional</p>
                                </div>
                                <button
                                    onClick={toggleFullScreen}
                                    className={`w-14 h-8 rounded-full transition-all relative border ${isFullScreen ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-slate-800'}`}
                                >
                                    <div className={`absolute top-1.5 w-4 h-4 rounded-full transition-all ${isFullScreen ? 'right-1.5 bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'left-1.5 bg-slate-700'}`}></div>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* SECONDARY CONTROL CLUSTER */}
                <div className="lg:col-span-4 space-y-6">
                    <Card variant="glass" className="p-8 border-slate-800/60 rounded-[2rem] space-y-6 bg-slate-950/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <ShieldAlert size={80} className="text-emerald-500" />
                        </div>

                        <div className="flex flex-col gap-1 relative z-10">
                            <h3 className="text-xs font-black text-emerald-500 uppercase italic tracking-widest flex items-center gap-3">
                                <Shield size={16} /> Rede de Segurança Sentinel
                            </h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic ml-7">Protocolo de Redundância Ativo</p>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic ml-1 flex items-center gap-2">
                                    <Clock size={10} /> Designar Novo Ponto de Restauração
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        placeholder="EX: PÓS-AJUSTE_ESTOQUE_2026"
                                        value={snapshotLabel}
                                        onChange={e => setSnapshotLabel(e.target.value.toUpperCase())}
                                        className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-[10px] font-black text-white outline-none focus:border-emerald-500/40 transition-all italic placeholder:text-slate-800 uppercase"
                                    />
                                    <button
                                        onClick={handleCreateSnapshot}
                                        disabled={isCreatingSnapshot}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest italic border-b-4 border-emerald-700 active:translate-y-0.5 transition-all flex items-center gap-2"
                                    >
                                        {isCreatingSnapshot ? <RefreshCw className="animate-spin" size={12} /> : <Zap size={12} />}
                                        Gerar
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-900 space-y-3">
                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] italic ml-1 flex items-center gap-2">
                                    <History size={10} /> Pontos Recentes de Sincronia
                                </p>

                                {snapshots.length === 0 ? (
                                    <div className="p-6 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                                        <Database size={24} className="text-slate-800 mb-2" />
                                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest italic">Nenhum snapshot selado</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {snapshots.map(snapshot => (
                                            <div key={snapshot.id} className="flex items-center justify-between p-4 bg-slate-950/80 rounded-xl border border-slate-900 hover:border-slate-700 transition-all group">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-white uppercase italic tracking-tighter truncate max-w-[150px]">{snapshot.label}</span>
                                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                                                        {new Date(snapshot.date).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => triggerRestoreSnapshot(snapshot.id)}
                                                    className="p-2.5 rounded-lg bg-slate-900 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all border border-slate-800 hover:border-emerald-500/40 group-hover:scale-110"
                                                    title="Restaurar este estado"
                                                >
                                                    <RotateCcw size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.1em] italic">
                                    <ShieldCheck size={10} className="inline mr-1 mb-0.5" /> Blindagem Nível 5 Ativa
                                </p>
                                <span className="text-[7px] text-slate-700 font-black uppercase tracking-widest italic">{mirrorStatus === 'synced' ? 'MIRROR_LOCAL_SYNCED' : 'MIRROR_PENDING'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/10">
                                <button
                                    onClick={exportSentinelBackup}
                                    className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all active:scale-95"
                                >
                                    <Download size={14} />
                                    <span className="text-[8px] font-black uppercase tracking-widest italic">Exportar .sentinel</span>
                                </button>
                                <label className="flex items-center justify-center gap-2 p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all active:scale-95 cursor-pointer">
                                    <Upload size={14} />
                                    <span className="text-[8px] font-black uppercase tracking-widest italic">Importar Dossiê</span>
                                    <input type="file" accept=".sentinel,.json" className="hidden" onChange={handleImportFile} disabled={isImporting} />
                                </label>
                            </div>

                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.1em] text-center italic leading-relaxed pt-2">
                                Redundância total: Cloud + Local Mirror + Backup Externo.
                            </p>
                        </div>
                    </Card>

                    <Card variant="glass" className="p-8 border-slate-800/60 rounded-[2rem] space-y-6 bg-slate-950/40">
                        <h3 className="text-xs font-black text-white uppercase italic tracking-widest flex items-center gap-3">
                            <Bell size={16} className="text-amber-500" /> Fluxo de Alertas
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'email', label: 'COMUNICAÇÃO E-MAIL', icon: Mail },
                                { id: 'push', label: 'NOTIFICAÇÕES PUSH', icon: Smartphone },
                                { id: 'sms', label: 'WHATSAPP / SMS', icon: MessageSquare }
                            ].map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-900 hover:border-amber-500/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={14} className="text-slate-700" />
                                        <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase italic">{item.label}</span>
                                    </div>
                                    <button
                                        onClick={() => setLocalSettings({
                                            ...localSettings,
                                            notifications: { ...localSettings.notifications, [item.id]: !localSettings.notifications[item.id as keyof typeof localSettings.notifications] }
                                        })}
                                        className={`w-10 h-6 rounded-full transition-all relative ${localSettings.notifications[item.id as keyof typeof localSettings.notifications] ? 'bg-amber-500/10 border border-amber-500' : 'bg-slate-900 border border-slate-800'}`}
                                    >
                                        <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all ${localSettings.notifications[item.id as keyof typeof localSettings.notifications] ? 'right-1 bg-amber-500' : 'left-1 bg-slate-800'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* SYSTEM VERSION TAMP */}
            <div className="mt-auto py-6 flex justify-between items-center text-slate-800">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] italic">Versão Operacional: 5.0.0_STABLE_PRO_MAX</span>
                <span className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-500/40 px-3 py-1 rounded-full border border-emerald-500/10 italic">Core Integrity: OK</span>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-sky-500/5 text-sky-500/40 px-3 py-1 rounded-full border border-sky-500/10 italic">Sync Status: RealTime</span>
                </span>
            </div>

            <TechnicalConfirmModal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                onConfirm={confirmRestore}
                title="Bypass de Restauração Temporal"
                description="Você está prestes a rebobinar o estado do núcleo operacional para este ponto. Todos os dados criados APÓS este snapshot serão sobrescritos permanentemente."
                criticalInfo="Esta ação não pode ser desfeita. O sistema será reiniciado automaticamente após a sincronização final."
            />
        </div>
    );
};
