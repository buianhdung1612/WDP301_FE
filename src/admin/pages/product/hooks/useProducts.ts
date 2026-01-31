import { useMemo, useState } from 'react';
import { IProduct } from '../configs/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProduct } from '../../../api/product.api';

interface IProductFilters {
    status?: string[];
    stock?: string[];
    search?: string;
}

export const useProducts = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<IProductFilters>({
        status: [],
        stock: [],
        search: '',
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => getProducts({
            keyword: filters.search,
            status: filters.status?.[0], // Backend supports one status filter at a time usually, or we can adjust BE
        }),
    });

    const products = useMemo(() => {
        if (!data?.data?.recordList) return [];

        return data.data.recordList.map((item: any) => ({
            id: item._id,
            product: item.name,
            category: (item.categoryInfo || []).map((c: any) => c.name).join(', ') || 'Uncategorized',
            image: item.images?.[0] || '',
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            stock: item.stock || 0,
            price: item.priceNew || item.priceOld || 0,
            status: item.status || 'draft',
        }));
    }, [data]);

    // Filter by stock is handled locally for now as BE might not support all stock filters yet
    const filteredProducts = useMemo(() => {
        return products.filter((product: IProduct) => {
            // Filter by stock
            if (filters.stock && filters.stock.length > 0) {
                const isInStock = product.stock > 20;
                const isLowStock = product.stock > 0 && product.stock <= 20;
                const isOutOfStock = product.stock === 0;

                const matchesStock = filters.stock.some((stock) => {
                    if (stock === 'instock') return isInStock;
                    if (stock === 'lowstock') return isLowStock;
                    if (stock === 'outofstock') return isOutOfStock;
                    return false;
                });

                if (!matchesStock) {
                    return false;
                }
            }

            return true;
        });
    }, [products, filters.stock]);

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });

    const setStatusFilter = (status: string[]) => {
        setFilters((prev) => ({ ...prev, status }));
    };

    const setStockFilter = (stock: string[]) => {
        setFilters((prev) => ({ ...prev, stock }));
    };

    const setSearchFilter = (search: string) => {
        setFilters((prev) => ({ ...prev, search }));
    };

    const clearFilters = () => {
        setFilters({
            status: [],
            stock: [],
            search: '',
        });
    };

    return {
        products: filteredProducts,
        isLoading,
        error,
        filters,
        setStatusFilter,
        setStockFilter,
        setSearchFilter,
        clearFilters,
        deleteProduct: deleteMutation.mutate
    };
};

