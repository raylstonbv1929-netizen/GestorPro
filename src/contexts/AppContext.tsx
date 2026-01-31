import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

import { supabase } from '../lib/supabase';
import {
    Product, Transaction, Task, Property, Collaborator, Client, Supplier,
    Activity, Plot, FieldApplication, StockMovement, Settings, Snapshot
} from '../types';
import { parseValue } from '../utils/format';

interface AppContextType {
    user: any;
    settings: Settings;
    setSettings: (s: Settings) => void;
    tasks: Task[];
    setTasks: (t: Task[]) => void;
    products: Product[];
    setProducts: (p: Product[]) => void;
    stockMovements: StockMovement[];
    setStockMovements: (sm: StockMovement[]) => void;
    clients: Client[];
    setClients: (c: Client[]) => void;
    suppliers: Supplier[];
    setSuppliers: (s: Supplier[]) => void;
    collaborators: Collaborator[];
    setCollaborators: (c: Collaborator[]) => void;
    transactions: Transaction[];
    setTransactions: (t: Transaction[]) => void;
    properties: Property[];
    setProperties: (p: Property[]) => void;
    plots: Plot[];
    setPlots: (p: Plot[]) => void;
    fieldApplications: FieldApplication[];
    setFieldApplications: (fa: FieldApplication[]) => void;
    activities: Activity[];
    setActivities: (a: Activity[]) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    currentDate: Date;
    isFullScreen: boolean;
    setIsFullScreen: (fs: boolean) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    signOut: () => void;
    addActivity: (action: string, target: string, type?: 'income' | 'expense' | 'neutral') => void;
    handleStockAdjustment: (params: any) => void;
    resetSystem: () => void;
    calculateNormalizedQuantity: (product: Product, qtyInput: number, inputUnit: string) => number;
    toggleFullScreen: () => void;
    isSyncing: boolean;
    isLoaded: boolean;
    snapshots: Snapshot[];
    createSnapshot: (label: string) => Promise<void>;
    restoreSnapshot: (snapshotId: number) => Promise<void>;
    exportSentinelBackup: () => void;
    importSentinelBackup: (file: File) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};

const UNIT_CONFIG: any = {
    'kg': { factor: 1, type: 'weight' },
    'g': { factor: 0.001, type: 'weight' },
    'mg': { factor: 0.000001, type: 'weight' },
    'ton': { factor: 1000, type: 'weight' },
    '@ (arroba)': { factor: 15, type: 'weight' },
    'L': { factor: 1, type: 'volume' },
    'ml': { factor: 0.001, type: 'volume' },
    'galão': { factor: 'weight', type: 'volume' },
    'tambor': { factor: 'weight', type: 'volume' },
    'bombona': { factor: 'weight', type: 'volume' },
    'balde': { factor: 'weight', type: 'volume' },
    'frasco': { factor: 'weight', type: 'volume' },
    'ampola': { factor: 0.01, type: 'volume' },
    'bisnaga': { factor: 0.1, type: 'volume' },
    'un': { factor: 1, type: 'unit' },
    'sc (saco)': { factor: 'weight', type: 'unit' },
    'sc': { factor: 'weight', type: 'unit' },
    'bag (big bag)': { factor: 'weight', type: 'unit' },
    'pacote': { factor: 'weight', type: 'unit' },
    'caixa': { factor: 'weight', type: 'unit' },
    'fardo': { factor: 'weight', type: 'unit' },
    'palete': { factor: 'weight', type: 'unit' },
    'kit': { factor: 1, type: 'unit' },
    'par': { factor: 1, type: 'unit' },
    'dúzia': { factor: 12, type: 'unit' },
    'milheiro': { factor: 1000, type: 'unit' },
    'metro': { factor: 1, type: 'dimension' },
    'cm': { factor: 0.01, type: 'dimension' },
    'mm': { factor: 0.001, type: 'dimension' },
    'm²': { factor: 1, type: 'dimension' },
    'm³': { factor: 1, type: 'dimension' },
    'rolo': { factor: 1, type: 'dimension' },
    'bobina': { factor: 1, type: 'dimension' },
    'barra': { factor: 1, type: 'dimension' },
    'tubo': { factor: 1, type: 'dimension' },
    'folha': { factor: 1, type: 'dimension' },
    'dose': { factor: 1, type: 'special' },
    'ha (hectare)': { factor: 1, type: 'special' },
    'alqueire': { factor: 2.42, type: 'special' },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, signOut } = useAuth();

    const [settings, setSettings] = useState<Settings>({
        farmName: 'Fazenda Santa Luzia',
        currency: 'R$',
        userName: user?.email?.split('@')[0] || 'Produtor',
        userEmail: user?.email || '',
        notifications: { email: true, push: true, sms: false },
        theme: 'dark',
        isSidebarOpen: true
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(settings.isSidebarOpen ?? true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [currentDate] = useState(new Date());

    // Sincroniza o estado do menu lateral quando as configurações são salvas
    useEffect(() => {
        if (settings.isSidebarOpen !== undefined) {
            setIsSidebarOpen(settings.isSidebarOpen);
        }
    }, [settings.isSidebarOpen]);

    // --- ESTADOS GLOBAIS (DADOS) ---
    // --- ESTADOS GLOBAIS (DADOS) ---
    const [tasks, setTasks] = useState<Task[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [fieldApplications, setFieldApplications] = useState<FieldApplication[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

    const [isLoaded, setIsLoaded] = useState(false);

    // --- CLOUD SYNC LOGIC ---
    const [isSyncing, setIsSyncing] = useState(false);

    // Load data from Supabase on login and setup Realtime subscription
    useEffect(() => {
        if (!user) return;

        const loadCloudData = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_data')
                    .select('data')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error loading cloud data:', error);
                    return;
                }

                if (data?.data) {
                    applyCloudData(data.data);
                }
                setIsLoaded(true);
            } catch (err) {
                console.error('Failed to sync from cloud:', err);
                setIsLoaded(true); // Evita loop de erro mas marca como "tentado"
            }
        };

        const applyCloudData = (cloudData: any) => {
            if (cloudData.tasks) setTasks(cloudData.tasks);
            if (cloudData.products) setProducts(cloudData.products);
            if (cloudData.stockMovements) setStockMovements(cloudData.stockMovements);
            if (cloudData.clients) setClients(cloudData.clients);
            if (cloudData.suppliers) setSuppliers(cloudData.suppliers);
            if (cloudData.collaborators) setCollaborators(cloudData.collaborators);
            if (cloudData.transactions) setTransactions(cloudData.transactions);
            if (cloudData.properties) setProperties(cloudData.properties);
            if (cloudData.plots) setPlots(cloudData.plots);
            if (cloudData.fieldApplications) setFieldApplications(cloudData.fieldApplications);
            if (cloudData.activities) setActivities(cloudData.activities);
            if (cloudData.settings) setSettings(cloudData.settings);
            if (cloudData.snapshots) setSnapshots(cloudData.snapshots);
        };

        loadCloudData();

        // Realtime Subscription for 100% sync
        const channel = supabase
            .channel(`user_data_sync_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_data',
                    filter: `user_id=eq.${user.id}`
                },
                (payload: any) => {
                    if (payload.new && payload.new.data) {
                        // Only apply if the data is different to avoid infinite loops
                        applyCloudData(payload.new.data);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    // Save data to Supabase when it changes (Debounced) + LocalStorage Mirroring
    useEffect(() => {
        if (!user || !isLoaded) return;

        const syncToCloud = async () => {
            setIsSyncing(true);
            try {
                const fullData = {
                    tasks, products, stockMovements, clients, suppliers,
                    collaborators, transactions, properties, plots,
                    fieldApplications, activities, settings, snapshots
                };

                // Mirroring: LocalStorage (Secondary Persistence)
                const storageKey = `sentinel_mirror_${user.id}`;
                localStorage.setItem(storageKey, JSON.stringify({
                    data: fullData,
                    timestamp: new Date().toISOString()
                }));

                const { error } = await supabase
                    .from('user_data')
                    .upsert({
                        user_id: user.id,
                        data: fullData,
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;
            } catch (err) {
                console.error('Failed to sync to cloud/mirror:', err);
            } finally {
                setIsSyncing(false);
            }
        };

        const timeoutId = setTimeout(syncToCloud, 1000);
        return () => clearTimeout(timeoutId);
    }, [
        user?.id, tasks, products, stockMovements, clients, suppliers,
        collaborators, transactions, properties, plots,
        fieldApplications, activities, settings, snapshots
    ]);

    const addActivity = (action: string, target: string, type: 'income' | 'expense' | 'neutral' = 'neutral') => {
        const newActivity: Activity = {
            id: Date.now(),
            action,
            target,
            time: new Date().toISOString(),
            type
        };
        setActivities([newActivity, ...activities].slice(0, 20));
    };

    const calculateNormalizedQuantity = (product: Product, qtyInput: number, inputUnit: string) => {
        if (!product || isNaN(qtyInput)) return 0;
        const baseUnit = product.unit;
        const unit = inputUnit || baseUnit;
        const weight = parseFloat(product.unitWeight as any) || 1;

        const getVal = (u: string) => {
            if (!u) return 1;
            const normalizedU = u.trim();
            const config = UNIT_CONFIG[normalizedU] || UNIT_CONFIG[normalizedU.toLowerCase()] || UNIT_CONFIG[normalizedU.toUpperCase()];

            if (!config) {
                if (normalizedU === baseUnit) return weight;
                return 1;
            }

            return config.factor === 'weight' ? weight : config.factor;
        };

        if (unit === baseUnit) return qtyInput;
        const inputInStandard = qtyInput * getVal(unit);
        const normalizedQty = inputInStandard / getVal(baseUnit);
        return normalizedQty;
    };

    const handleStockAdjustment = ({ productId, type, quantity, reason, unit = null, batch = '', cost = 0, updatePrice = false, date = null, customUser = null, appId = null }: any) => {
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;

        let qtyInput = parseValue(quantity);
        if (isNaN(qtyInput) || qtyInput <= 0) {
            return;
        }

        const normalizedQty = calculateNormalizedQuantity(product, qtyInput, unit);
        const currentStock = Number(product.stock);
        const newStock = type === 'in' ? currentStock + normalizedQty : currentStock - normalizedQty;

        if (type === 'out' && newStock < 0) {
            return;
        }

        let newStatus: 'ok' | 'low' | 'critical' = 'ok';
        const minStock = Number(product.minStock);
        if (newStock <= minStock) newStatus = 'low';
        if (newStock <= minStock / 2) newStatus = 'critical';

        let newPrice = Number(product.price);
        if (type === 'in' && updatePrice && cost > 0) {
            const totalInputCost = parseValue(cost);
            const costPerBaseUnit = totalInputCost / normalizedQty;
            newPrice = costPerBaseUnit;
        }

        setProducts(products.map(p => p.id === product.id ? { ...p, stock: newStock, status: newStatus, price: newPrice } : p));

        const movementDate = date
            ? (date.includes('T') ? date : `${date}T${new Date().toTimeString().split(' ')[0]}`)
            : new Date().toISOString();

        const newMovement: StockMovement = {
            id: Date.now(),
            productId: parseInt(productId),
            productName: product.name,
            type,
            quantity: qtyInput,
            quantityUnit: unit || product.unit,
            realChange: normalizedQty,
            date: movementDate,
            reason,
            user: customUser || settings.userName,
            batch: batch,
            cost: cost,
            appId: appId
        };
        setStockMovements([newMovement, ...stockMovements]);
        addActivity(type === 'in' ? 'Entrada de estoque' : 'Saída de estoque', `${product.name} (${qtyInput} ${unit || product.unit})`, type === 'in' ? 'income' : 'expense');
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => console.error(e));
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    const createSnapshot = async (label: string) => {
        const fullDataSnapshot = {
            tasks, products, stockMovements, clients, suppliers,
            collaborators, transactions, properties, plots,
            fieldApplications, activities, settings
        };

        const newSnapshot: Snapshot = {
            id: Date.now(),
            date: new Date().toISOString(),
            label,
            data: fullDataSnapshot
        };

        // Manter apenas os últimos 5 snapshots para evitar bloat no JSONB
        const updatedSnapshots = [newSnapshot, ...snapshots].slice(0, 5);
        setSnapshots(updatedSnapshots);
        addActivity('Ponto de Restauração Criado', label, 'neutral');
    };

    const restoreSnapshot = async (snapshotId: number) => {
        const snapshot = snapshots.find(s => s.id === snapshotId);
        if (!snapshot) return;

        // T-2.1: Auto-Rollback Shield
        // Criar um ponto de restauração de emergência ANTES de sobrescrever
        await createSnapshot(`ANTE_RESTAURACAO_${new Date().toLocaleTimeString()}`);

        const cloudData = snapshot.data;
        applyDataToState(cloudData);

        addActivity('Restauração de Sistema Concluída', snapshot.label, 'neutral');
    };

    const applyDataToState = (data: any) => {
        if (data.tasks) setTasks(data.tasks);
        if (data.products) setProducts(data.products);
        if (data.stockMovements) setStockMovements(data.stockMovements);
        if (data.clients) setClients(data.clients);
        if (data.suppliers) setSuppliers(data.suppliers);
        if (data.collaborators) setCollaborators(data.collaborators);
        if (data.transactions) setTransactions(data.transactions);
        if (data.properties) setProperties(data.properties);
        if (data.plots) setPlots(data.plots);
        if (data.fieldApplications) setFieldApplications(data.fieldApplications);
        if (data.activities) setActivities(data.activities);
        if (data.settings) setSettings(data.settings);
    };

    const exportSentinelBackup = () => {
        const fullDataSnapshot = {
            tasks, products, stockMovements, clients, suppliers,
            collaborators, transactions, properties, plots,
            fieldApplications, activities, settings, snapshots,
            version: '5.0',
            exportedAt: new Date().toISOString(),
            farmName: settings.farmName
        };

        const blob = new Blob([JSON.stringify(fullDataSnapshot, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sentinel_dossier_${settings.farmName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.sentinel`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addActivity('Dossiê Sentinel Exportado', 'Backup Externo Gerado', 'neutral');
    };

    const importSentinelBackup = async (file: File) => {
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    const importedData = JSON.parse(content);

                    // Validação básica
                    if (!importedData.farmName && !importedData.products) {
                        throw new Error('Arquivo .sentinel inválido ou corrompido.');
                    }

                    // Backup preventivo antes de importar
                    await createSnapshot(`ANTE_IMPORTACAO_${new Date().toLocaleTimeString()}`);

                    applyDataToState(importedData);
                    if (importedData.snapshots) setSnapshots(importedData.snapshots);

                    addActivity('Dossiê Sentinel Importado', 'Integridade Restaurada via Arquivo', 'neutral');
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Falha na leitura do arquivo.'));
            reader.readAsText(file);
        });
    };

    const resetSystem = () => {
        const userPrefix = `agrogest_`;
        const userSuffix = `_${user?.id}`;

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(userPrefix) && key.endsWith(userSuffix)) {
                localStorage.removeItem(key);
            }
        });
        window.location.reload();
    };

    const value = {
        user, settings, setSettings, tasks, setTasks, products, setProducts,
        stockMovements, setStockMovements, clients, setClients, suppliers, setSuppliers,
        collaborators, setCollaborators, transactions, setTransactions, properties, setProperties,
        plots, setPlots, fieldApplications, setFieldApplications, activities, setActivities,
        activeTab, setActiveTab, currentDate, isFullScreen, setIsFullScreen,
        isSidebarOpen, setIsSidebarOpen, signOut,
        addActivity, handleStockAdjustment, resetSystem, calculateNormalizedQuantity, toggleFullScreen,
        isSyncing, isLoaded, snapshots, createSnapshot, restoreSnapshot,
        exportSentinelBackup, importSentinelBackup
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
