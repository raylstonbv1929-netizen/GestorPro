import React from 'react';

interface MiniChartProps {
    data: number[];
    color?: string;
}

export const MiniChart = ({ data, color = "#10b981" }: MiniChartProps) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="h-12 w-32 flex items-center">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <path
                    d={`M0,${100 - ((data[0] - min) / range) * 100} ${points.split(' ').map(p => `L${p}`).join(' ')}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="100" cy={100 - ((data[data.length - 1] - min) / range) * 100} r="4" fill={color} />
            </svg>
        </div>
    );
};
