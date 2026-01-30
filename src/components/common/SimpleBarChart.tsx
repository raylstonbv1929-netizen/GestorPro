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
        <div className="flex items-end justify-between h-32 w-full gap-3 pt-6">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 group relative">
                    <div className="w-full relative flex items-end h-full bg-slate-800/20 rounded-t-[1px] overflow-hidden">
                        <div
                            className={`w-full transition-all duration-700 ease-out relative ${d.type === 'income' ? 'bg-gradient-to-t from-emerald-600/40 to-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.2)]' :
                                    d.type === 'neutral' ? 'bg-gradient-to-t from-blue-600/40 to-blue-400/80 shadow-[0_0_10px_rgba(96,165,250,0.2)]' :
                                        'bg-gradient-to-t from-rose-600/40 to-rose-400/80 shadow-[0_0_10px_rgba(248,113,113,0.2)]'
                                }`}
                            style={{ height: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%` }}
                        >
                            {/* Scanning line effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-scan opacity-20"></div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter leading-none group-hover:text-slate-300 transition-colors">{d.label}</span>
                        <span className="text-[10px] text-slate-300 font-bold mt-1 tabular-nums">
                            {d.value > 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
