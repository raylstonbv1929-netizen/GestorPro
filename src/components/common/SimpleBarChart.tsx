import React from 'react';

interface SimpleBarChartProps {
    data: {
        label: string;
        value: number;
        type: 'income' | 'expense' | 'neutral';
    }[];
}

export const SimpleBarChart = ({ data }: SimpleBarChartProps) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => d.value));

    return (
        <div className="flex items-end justify-between h-32 w-full gap-2 pt-4">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="w-full relative flex items-end h-full">
                        <div
                            className={`w-full rounded-t-sm transition-all duration-500 ${d.type === 'income' ? 'bg-emerald-500/50 group-hover:bg-emerald-400' :
                                    d.type === 'neutral' ? 'bg-blue-500/50 group-hover:bg-blue-400' :
                                        'bg-rose-500/50 group-hover:bg-rose-400'
                                }`}
                            style={{ height: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold text-center leading-tight">{d.label}</span>
                </div>
            ))}
        </div>
    );
};
