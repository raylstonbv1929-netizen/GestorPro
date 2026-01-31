import React from 'react';
import { Layers, Package, AlertTriangle, TrendingDown, DollarSign, TrendingUp, Activity, Zap } from 'lucide-react';
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
            {[
                { label: 'Matriz de Insumos', value: totalItems, unit: 'UNID', icon: Package, color: 'emerald', code: 'STK_MAT' },
                { label: 'Estado de Atenção', value: lowStockItems, unit: 'ALRT', icon: AlertTriangle, color: 'amber', code: 'STK_WRN' },
                { label: 'Patrimônio Imobilizado', value: formatCurrency(totalStockValue, currency), icon: DollarSign, color: 'sky', code: 'STK_VAL' }
            ].map((item, idx) => (
                <Card key={idx} className="group p-6 border-slate-900 hover:border-slate-800 bg-slate-950 relative overflow-hidden rounded-[2rem]">
                    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-${item.color}-500`}>
                        <item.icon size={48} />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 italic group-hover:text-slate-400 transition-colors uppercase">{item.label}</p>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter group-hover:translate-x-1 transition-transform">
                        {item.value} {item.unit && <span className="text-xs font-black text-slate-600 uppercase italic">{item.unit}</span>}
                    </h4>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-[8px] font-black text-slate-700 tracking-widest uppercase italic">{item.code}</span>
                        <div className={`h-1 flex-1 mx-4 bg-slate-800 rounded-full overflow-hidden`}>
                            <div className={`h-full bg-${item.color}-500 shadow-[0_0_8px] shadow-${item.color}-500`} style={{ width: idx === 0 ? '100%' : idx === 1 ? (item.value > 0 ? '40%' : '5%') : '85%' }} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
