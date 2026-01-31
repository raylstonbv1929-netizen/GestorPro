export interface Product {
    id: number;
    name: string;
    category: string;
    stock: number;
    unit: string;
    unitWeight: number;
    minStock: number;
    price: number;
    status: 'ok' | 'low' | 'critical';
    location: string;
    batch?: string;
    expirationDate?: string;
}

export interface Transaction {
    id: number;
    description: string;
    category: string;
    amount: number;
    date: string;
    status: 'paid' | 'pending';
    type: 'income' | 'expense';
    entity: string;
}

export interface Task {
    id: number;
    text: string;
    priority: 'high' | 'medium' | 'low';
    due: string;
    done: boolean;
    assignee: string;
}

export interface PropertyAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: string;
}

export interface Property {
    id: number;
    name: string;
    location: string;
    totalArea: number;
    cultivatedArea: number;
    mainCrop: string;
    manager: string;
    status: 'active' | 'inactive';
    attachments?: PropertyAttachment[];
}

export interface Collaborator {
    id: number;
    name: string;
    role: string;
    department: string;
    phone: string;
    email: string;
    status: 'active' | 'vacation' | 'inactive';
    salary: number;
    hireDate: string;
}

export interface Client {
    id: number;
    name: string;
    type: string;
    contact: string;
    email: string;
    phone: string;
    cnpj?: string;
    address?: string;
    city: string;
    rating: number;
    status: 'active' | 'inactive';
    creditLimit?: number;
    usedCredit?: number;
}

export interface Supplier {
    id: number;
    name: string;
    category: string;
    contact: string;
    email: string;
    phone: string;
    cnpj?: string;
    address?: string;
    leadTime?: string;
    rating: number;
    status: 'active' | 'inactive';
}

export interface Activity {
    id: number;
    action: string;
    target: string;
    time: string;
    type: 'income' | 'expense' | 'neutral';
}

export interface Plot {
    id: number;
    propertyId: number;
    name: string;
    area: number;
    crop: string;
}

export interface FieldApplication {
    id: number;
    date: string;
    plotId: number;
    plotName: string;
    target: string;
    status: 'planned' | 'completed';
    areaApplied: number;
    totalCost: number;
    sprayVolume?: number;
    operator?: string;
    equipment?: string;
    weather?: {
        temp?: string;
        humidity?: string;
        wind?: string;
    };
    appliedProducts: {
        productId: number;
        productName: string;
        dose: number;
        doseUnit: string;
        normalizedDose: number;
        unit: string;
        totalQuantity: number;
    }[];
    observations?: string;
}

export interface StockMovement {
    id: number;
    productId: number;
    productName: string;
    type: 'in' | 'out';
    quantity: number;
    quantityUnit: string;
    realChange: number;
    date: string;
    reason: string;
    user: string;
    batch?: string;
    cost?: number;
    appId?: number;
}

export interface Settings {
    farmName: string;
    currency: string;
    userName: string;
    userEmail: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    theme: 'dark' | 'light';
    isSidebarOpen: boolean;
}
