import React, { useState } from 'react';
import {
    Settings, Save, Database, Shield, Bell, Globe, RefreshCw, Smartphone, MessageSquare, Wind, Layout, Maximize, Minimize, Activity, Zap, Cpu, Terminal, Mail
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';
import { toast } from 'sonner';

export const SettingsPage = () => {
    const {
        settings, setSettings,
        isFullScreen, toggleFullScreen,
        isSidebarOpen, setIsSidebarOpen,
        addActivity
    } = useApp();

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
        </div>
    );
};
