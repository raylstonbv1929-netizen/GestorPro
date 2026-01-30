import React from 'react';
import { Layers, Package, AlertTriangle, TrendingDown, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { formatCurrency } from '../../../utils/format';

interface StockStatsProps {
    totalItems: number;
    lowStockItems: number;
    totalStockValue: number;
    currency: string;
}

export const StockStats: React.FC<StockStatsProps> = ({
    totalItems,
    lowStockItems,
    totalStockValue,
    currency
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" className="p-0 border-slate-800/40 hover:border-emerald-500/40 overflow-hidden group">
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1 flex items-center gap-2">
                            <Layers size={10} className="text-emerald-500" /> Itens Ativos
                        </p>
                        <p className="text-2xl font-black text-white">{totalItems}</p>
                    </div>
                    <div className="p-3 bg-emerald-500/5 rounded-xl text-emerald-500 border border-emerald-500/10 group-hover:bg-emerald-500/10 transition-all">
                        <Package size={24} />
                    </div>
                </div>
                <div className="h-0.5 bg-slate-800 w-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[70%]" />
                </div>
            </Card>

            <Card variant="glass" className="p-0 border-slate-800/40 hover:border-orange-500/40 overflow-hidden group">
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1 flex items-center gap-2">
                            <AlertTriangle size={10} className="text-orange-500" /> Alertas de Recompra
                        </p>
                        <p className="text-2xl font-black text-white">{lowStockItems}</p>
                    </div>
                    <div className="p-3 bg-orange-500/5 rounded-xl text-orange-400 border border-orange-500/10 group-hover:bg-orange-500/10 transition-all">
                        <TrendingDown size={24} />
                    </div>
                </div>
                <div className="h-0.5 bg-slate-800 w-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[40%] animate-pulse" />
                </div>
            </Card>

            <Card variant="glass" className="p-0 border-slate-800/40 hover:border-blue-500/40 overflow-hidden group">
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mb-1 flex items-center gap-2">
                            <DollarSign size={10} className="text-blue-500" /> Capital em Estoque
                        </p>
                        <p className="text-2xl font-black text-white">{formatCurrency(totalStockValue, currency)}</p>
                    </div>
                    <div className="p-3 bg-blue-500/5 rounded-xl text-blue-400 border border-blue-500/10 group-hover:bg-blue-500/10 transition-all">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="h-0.5 bg-slate-800 w-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[90%]" />
                </div>
            </Card>
        </div>
    );
};
