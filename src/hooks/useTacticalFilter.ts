import { useState, useMemo } from 'react';

interface UseTacticalFilterProps<T> {
    data: T[];
    searchFields: (keyof T)[];
    customFilter?: (item: T, searchTerm: string) => boolean;
    metricsConfig?: {
        sumField?: keyof T;
        countField?: keyof T;
    };
}

export function useTacticalFilter<T>({ data, searchFields, customFilter }: UseTacticalFilterProps<T>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [advancedFilters, setAdvancedFilters] = useState<Record<string, string>>({
        status: 'all',
        plotId: 'all',
        productId: 'all',
        operator: 'all',
        equipment: 'all'
    });

    const filteredData = useMemo(() => {
        return data.filter((item: any) => {
            // Search logic (Omnibox)
            const matchesBasicSearch = searchTerm === '' || searchFields.some(field => {
                const value = item[field];
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });

            const matchesCustomSearch = customFilter ? customFilter(item, searchTerm) : false;
            const matchesSearch = matchesBasicSearch || matchesCustomSearch;

            // Date logic
            const itemDate = item.date ? new Date(item.date) : null;
            const matchesStart = !dateFilter.start || (itemDate && itemDate >= new Date(dateFilter.start));
            const matchesEnd = !dateFilter.end || (itemDate && itemDate <= new Date(dateFilter.end));

            // Advanced Filters logic
            const matchesAdvanced = Object.entries(advancedFilters).every(([key, value]) => {
                if (value === 'all' || value === 'Todas' || !value || (Array.isArray(value) && value.length === 0)) return true;

                // Multi-select handling
                if (Array.isArray(value)) {
                    return value.includes(item[key]?.toString());
                }

                // Range handling (Expected key format: field_min or field_max)
                if (key.endsWith('_min') || key.endsWith('_max')) {
                    const field = key.split('_')[0];
                    const numValue = parseFloat(item[field]);
                    const filterValue = parseFloat(value);
                    if (isNaN(numValue) || isNaN(filterValue)) return true;
                    return key.endsWith('_min') ? numValue >= filterValue : numValue <= filterValue;
                }

                const itemValue = item[key]?.toString();
                return itemValue === value;
            });

            return matchesSearch && matchesStart && matchesEnd && matchesAdvanced;
        });
    }, [data, searchTerm, dateFilter, advancedFilters, searchFields, customFilter]);

    const resetFilters = () => {
        setSearchTerm('');
        setDateFilter({ start: '', end: '' });
        setAdvancedFilters({});
    };

    const updateAdvancedFilter = (key: string, value: string) => {
        setAdvancedFilters(prev => ({ ...prev, [key]: value }));
    };

    return {
        isSidebarOpen,
        setIsSidebarOpen,
        searchTerm,
        setSearchTerm,
        dateFilter,
        setDateFilter,
        advancedFilters,
        setAdvancedFilters,
        updateAdvancedFilter,
        filteredData,
        resetFilters
    };
}
