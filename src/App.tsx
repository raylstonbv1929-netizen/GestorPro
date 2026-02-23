import React, { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginPage from './pages/LoginPage';
import {
  LayoutDashboard, ClipboardList, Truck, Package, Wallet, Bell, Search,
  Menu, X, MoreHorizontal, TrendingUp, TrendingDown, DollarSign,
  ChevronRight, Calendar, CheckSquare, Clock, AlertCircle, FileText,
  Maximize, Minimize, User, ArrowUpRight, Trash2, Plus, Filter, CheckCircle2,
  Users, Phone, Mail, MapPin, BadgeCheck, Ban, Star, Edit, Save, XCircle, CreditCard,
  AlertTriangle, Archive, Sprout, Droplets, Wrench, Warehouse, Tag, Handshake, Factory,
  PieChart, ArrowDown, BarChart3, Receipt, Map, Tractor, LandPlot, Briefcase, UserCheck, HardHat,
  ClipboardCheck, History, ArrowRightLeft, Scale, Ruler, Calculator, ScanBarcode, Activity,
  FileBarChart, Printer, Download, DownloadCloud, FileSpreadsheet, Percent, Target, Settings, Globe, Shield, Database, RefreshCw, UploadCloud, LogOut, Layout, Wind, Smartphone, MessageSquare
} from 'lucide-react';

import { RouteLoader } from './components/common/RouteLoader';

// Lazy Load Pages
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const FieldApplicationsPage = lazy(() => import('./pages/field/FieldApplicationsPage').then(m => ({ default: m.FieldApplicationsPage })));
const PropertiesPage = lazy(() => import('./pages/properties/PropertiesPage').then(m => ({ default: m.PropertiesPage })));
const TasksPage = lazy(() => import('./pages/tasks/TasksPage').then(m => ({ default: m.TasksPage })));
const CollaboratorsPage = lazy(() => import('./pages/collaborators/CollaboratorsPage').then(m => ({ default: m.CollaboratorsPage })));
const ClientsPage = lazy(() => import('./pages/clients/ClientsPage').then(m => ({ default: m.ClientsPage })));
const SuppliersPage = lazy(() => import('./pages/suppliers/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage').then(m => ({ default: m.ProductsPage })));
const FinancePage = lazy(() => import('./pages/finance/FinancePage').then(m => ({ default: m.FinancePage })));
const CashFlowPage = lazy(() => import('./pages/finance/CashFlowPage').then(m => ({ default: m.CashFlowPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

// --- ESTILOS GLOBAIS ---
const GlobalStyles = () => (
  <style>{`
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #10b981; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
    
    .checkbox-wrapper input:checked + div {
      background-color: #10b981;
      border-color: #10b981;
    }
    .checkbox-wrapper input:checked + div svg {
      display: block;
    }
    
    @media print {
      .no-print { display: none !important; }
      .printable-area { 
        position: absolute; 
        left: 0; 
        top: 0; 
        width: 100%; 
        margin: 0; 
        padding: 0;
        background: white !important;
        color: black !important;
      }
      body { background: white !important; }
      .card-white { 
        box-shadow: none !important; 
        border: 1px solid #e2e8f0 !important;
        border-radius: 0 !important;
      }
      table { width: 100% !important; border-collapse: collapse !important; }
      th, td { border: 1px solid #e2e8f0 !important; padding: 8px !important; font-size: 10pt !important; }
      thead { display: table-header-group !important; }
      tr { page-break-inside: avoid !important; }
      @page { margin: 1.5cm; }
    }
  `}</style>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainContent />;
}

function MainContent() {
  const {
    user, settings, activeTab, setActiveTab, currentDate,
    isFullScreen, toggleFullScreen, isSidebarOpen, setIsSidebarOpen, signOut,
    isSyncing, isLoaded
  } = useApp();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent animate-pulse"></div>
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <RefreshCw size={48} className="animate-spin duration-[4000ms]" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
        </div>
        <div className="text-center space-y-3 relative z-10">
          <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] italic">Sincronização Nativa</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] animate-pulse">Acessando Núcleo Cloud Supabase...</p>
        </div>
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { width: 0%; left: 0%; }
            50% { width: 100%; left: 0%; }
            100% { width: 0%; left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, category: 'Geral' },
    { id: 'properties', label: 'Propriedades', icon: <Map size={20} />, category: 'Geral' },
    { id: 'tasks', label: 'Tarefas', icon: <ClipboardList size={20} />, category: 'Geral' },
    { id: 'collaborators', label: 'Equipe', icon: <Briefcase size={20} />, category: 'Geral' },

    { id: 'field_applications', label: 'Aplicações', icon: <Tractor size={20} />, category: 'Operacional' },
    { id: 'products', label: 'Produtos', icon: <Package size={20} />, category: 'Operacional' },
    { id: 'suppliers', label: 'Fornecedores', icon: <Truck size={20} />, category: 'Operacional' },
    { id: 'clients', label: 'Clientes', icon: <Users size={20} />, category: 'Operacional' },

    { id: 'finance', label: 'Financeiro', icon: <Wallet size={20} />, category: 'Financeiro' },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: <TrendingUp size={20} />, category: 'Financeiro' },

    { id: 'settings', label: 'Configurações', icon: <Settings size={20} />, category: 'Sistema' },
  ];

  const categories = ['Geral', 'Operacional', 'Financeiro', 'Sistema'];

  return (
    <div className="flex h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans selection:bg-emerald-500/30 overflow-hidden">
      <GlobalStyles />

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-slate-950/50 backdrop-blur-2xl border-r border-slate-800/60 flex flex-col transition-all duration-300 ease-in-out z-20 no-print relative`}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Sprout className="text-slate-950" size={24} strokeWidth={2.5} />
          </div>
          {isSidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">AgroGest</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Pro Edition</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 custom-scrollbar">
          {categories.map(cat => (
            <div key={cat} className="mb-6">
              {isSidebarOpen && <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4 ml-4">{cat}</p>}
              <div className="space-y-1.5">
                {menuItems.filter(item => item.category === cat).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${activeTab === item.id ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                  >
                    <div className={`${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    {isSidebarOpen && <span className="text-sm tracking-tight">{item.label}</span>}
                    {activeTab === item.id && !isSidebarOpen && (
                      <div className="absolute left-0 w-1 h-6 bg-emerald-950 rounded-r-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto border-t border-slate-800/60">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-bold">Sair do Sistema</span>}
          </button>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mx-auto mb-6 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white transition-colors mt-2"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-grid-slate-900/[0.04]">
        <header className="h-20 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-sm flex items-center justify-between px-8 z-10 no-print">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {activeTab === 'dashboard' ? 'Visão Geral' :
                menuItems.find(m => m.id === activeTab)?.label || 'Sistema'}
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync Sentinel Indicator */}
            <div className={`flex items-center gap-3 px-4 py-2 border transition-all duration-700 ${isSyncing ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-800 bg-slate-900/50 opacity-60'}`}>
              <div className="relative">
                <RefreshCw size={14} className={`text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-white leading-none">
                  {isSyncing ? 'Sincronizando' : 'Nativo Online'}
                </span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Supabase Cloud Protocol</span>
              </div>
            </div>

            <button
              onClick={toggleFullScreen}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <div className="h-8 w-px bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{user?.email?.split('@')[0] || settings.userName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Administrador</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20 cursor-pointer hover:scale-105 transition-transform">
                {(user?.email?.substring(0, 2) || settings.userName.substring(0, 2)).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-8 relative">
          <Suspense fallback={<RouteLoader />}>
            {activeTab === 'dashboard' && <DashboardPage />}
            {activeTab === 'field_applications' && <FieldApplicationsPage />}
            {activeTab === 'properties' && <PropertiesPage />}
            {activeTab === 'tasks' && <TasksPage />}
            {activeTab === 'collaborators' && <CollaboratorsPage />}
            {activeTab === 'clients' && <ClientsPage />}
            {activeTab === 'suppliers' && <SuppliersPage />}
            {activeTab === 'products' && <ProductsPage />}
            {activeTab === 'finance' && <FinancePage />}
            {activeTab === 'cashflow' && <CashFlowPage />}
            {activeTab === 'settings' && <SettingsPage />}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  );
}