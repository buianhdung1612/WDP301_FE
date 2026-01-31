import { useCallback } from 'react';
import { useProducts } from './useProducts';

/**
 * Hook để kết nối filter UI với data filtering logic
 * Giúp decoupling UI components khỏi data management
 */
export const useProductFilters = () => {
    const {
        filters,
        setStatusFilter,
        setStockFilter,
        setSearchFilter,
        clearFilters,
    } = useProducts();

    // Memoize callback functions để tránh unnecessary re-renders
    const handleStatusFilterChange = useCallback(
        (values: string[]) => {
            setStatusFilter(values);
        },
        [setStatusFilter]
    );

    const handleStockFilterChange = useCallback(
        (values: string[]) => {
            setStockFilter(values);
        },
        [setStockFilter]
    );

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchFilter(value);
        },
        [setSearchFilter]
    );

    const handleClearFilters = useCallback(() => {
        clearFilters();
    }, [clearFilters]);

    return {
        filters,
        onStatusFilterChange: handleStatusFilterChange,
        onStockFilterChange: handleStockFilterChange,
        onSearchChange: handleSearchChange,
        onClearFilters: handleClearFilters,
    };
};
