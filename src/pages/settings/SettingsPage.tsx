import React, { useState } from 'react';
import {
    Settings, Save, Database, Shield, Bell, Globe, RefreshCw, UploadCloud, DownloadCloud, Trash2, Smartphone, MessageSquare, Wind, Layout, Maximize, Minimize
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../../components/common/Card';

export const SettingsPage = () => {
    const {
        settings, setSettings, resetSystem,
        isFullScreen, toggleFullScreen,
        isSidebarOpen, setIsSidebarOpen
    } = useApp();

    const [localSettings, setLocalSettings] = useState({
        ...settings,
        isSidebarOpen: settings.isSidebarOpen ?? isSidebarOpen
    });

    const handleSave = () => {
        setSettings(localSettings);
        setIsSidebarOpen(localSettings.isSidebarOpen);
        alert('Configurações salvas com sucesso!');
    };

    const handleExportData = () => {
        const data = {
            settings,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agrogest_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.settings) {
                    setSettings(data.settings);
                    alert('Dados importados com sucesso! A página será recarregada.');
                    window.location.reload();
                }
            } catch (err) {
                alert('Erro ao importar arquivo. Verifique o formato.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="animate-fade-in space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Settings className="text-emerald-400" size={28} /> Configurações do Sistema
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-6">
                    <Card className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Globe size={16} className="text-blue-400" /> Geral
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 font-bold ml-1">Nome da Fazenda</label>
                                <input
                                    value={localSettings.farmName}
                                    onChange={e => setLocalSettings({ ...localSettings, farmName: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 font-bold ml-1">Moeda</label>
                                <select
                                    value={localSettings.currency}
                                    onChange={e => setLocalSettings({ ...localSettings, currency: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500"
                                >
                                    <option value="R$">Real (R$)</option>
                                    <option value="US$">Dólar (US$)</option>
                                    <option value="€">Euro (€)</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Card className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Layout size={16} className="text-purple-400" /> Aparência
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <Wind size={18} className="text-slate-400" />
                                    <span className="text-sm text-slate-200">Menu Lateral Aberto</span>
                                </div>
                                <button
                                    onClick={() => setLocalSettings({ ...localSettings, isSidebarOpen: !localSettings.isSidebarOpen })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${localSettings.isSidebarOpen ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.isSidebarOpen ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-3">
                                    {isFullScreen ? <Minimize size={18} className="text-slate-400" /> : <Maximize size={18} className="text-slate-400" />}
                                    <span className="text-sm text-slate-200">Tela Cheia</span>
                                </div>
                                <button
                                    onClick={toggleFullScreen}
                                    className={`w-12 h-6 rounded-full transition-all relative ${isFullScreen ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isFullScreen ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Bell size={16} className="text-amber-400" /> Notificações
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'email', label: 'E-mail', icon: <UploadCloud size={16} /> },
                                { id: 'push', label: 'Push (Navegador)', icon: <Smartphone size={16} /> },
                                { id: 'sms', label: 'SMS / WhatsApp', icon: <MessageSquare size={16} /> }
                            ].map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">{item.icon}</span>
                                        <span className="text-sm text-slate-200">{item.label}</span>
                                    </div>
                                    <button
                                        onClick={() => setLocalSettings({
                                            ...localSettings,
                                            notifications: { ...localSettings.notifications, [item.id]: !localSettings.notifications[item.id as keyof typeof localSettings.notifications] }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${localSettings.notifications[item.id as keyof typeof localSettings.notifications] ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.notifications[item.id as keyof typeof localSettings.notifications] ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Shield size={16} className="text-rose-400" /> Segurança
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                <p className="text-xs text-slate-400 mb-2">Sua conta está protegida por criptografia de ponta a ponta.</p>
                                <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Alterar Senha</button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                            <Database size={16} className="text-emerald-400" /> Dados e Backup
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleExportData}
                                className="w-full flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-900 rounded-xl border border-slate-800 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <DownloadCloud size={18} className="text-slate-400 group-hover:text-emerald-400" />
                                    <span className="text-sm text-slate-200">Exportar Backup</span>
                                </div>
                                <Save size={14} className="text-slate-600" />
                            </button>

                            <label className="w-full flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-900 rounded-xl border border-slate-800 transition-all group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <UploadCloud size={18} className="text-slate-400 group-hover:text-blue-400" />
                                    <span className="text-sm text-slate-200">Importar Dados</span>
                                </div>
                                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                                <RefreshCw size={14} className="text-slate-600" />
                            </label>

                            <div className="pt-4 mt-4 border-t border-slate-800">
                                <button
                                    onClick={resetSystem}
                                    className="w-full flex items-center gap-3 p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 text-rose-400 transition-all group"
                                >
                                    <Trash2 size={18} />
                                    <span className="text-sm font-bold">Resetar Sistema</span>
                                </button>
                                <p className="text-[10px] text-slate-600 mt-2 px-1 italic">Atenção: Isso apagará todos os seus dados permanentemente.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                    Versão do Sistema: <span className="text-slate-400 font-bold">1.0.0-stable</span>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95"
                >
                    <Save size={18} /> Salvar Alterações
                </button>
            </div>
        </div>
    );
};
