export const formatCurrency = (value: number | string, currency = 'R$') => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return `${currency} 0,00`;
    return `${currency} ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (value: number | string, decimals = 2) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '0,00';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const parseValue = (value: any) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    // Remove pontos de milhar e troca vírgula por ponto
    const cleanValue = value.toString().replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
};

export const maskValue = (value: any) => {
    if (!value && value !== 0) return '';
    let v = value.toString().replace(/\D/g, '');
    if (v === '') return '';
    let n = (parseInt(v) / 100).toFixed(2);
    let [int, dec] = n.split('.');
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${int},${dec}`;
};

export const maskNumber = (value: any) => {
    if (!value && value !== 0) return '';
    // Permite apenas números e uma vírgula ou ponto
    let v = value.toString().replace(/[^\d,.]/g, '');
    // Se houver ponto, substitui por vírgula para manter padrão visual
    v = v.replace(/\./g, ',');
    // Garante que haja apenas uma vírgula
    const parts = v.split(',');
    if (parts.length > 2) {
        v = parts[0] + ',' + parts.slice(1).join('');
    }
    return v;
};
