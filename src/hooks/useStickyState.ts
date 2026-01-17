import { useState, useEffect } from 'react';

export function useStickyState<T>(defaultValue: T, key: string, userId: string | null = null) {
    const fullKey = userId ? `${key}_${userId}` : key;

    const [value, setValue] = useState<T>(() => {
        const stickyValue = window.localStorage.getItem(fullKey);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    });

    useEffect(() => {
        window.localStorage.setItem(fullKey, JSON.stringify(value));
    }, [fullKey, value]);

    return [value, setValue] as const;
}
