import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, getNestedCategories, getCategoryById, deleteCategory, updateCategory } from '../../../api/product-category.api';
import { ApiResponse } from '../../../config/type';

export const useProductCategories = () => {
    return useQuery({
        queryKey: ['product-categories'],
        queryFn: getCategories,
        select: (res: ApiResponse<any>) => {
            const data = res.data;
            if (data && typeof data === 'object' && 'recordList' in data) {
                return data.recordList;
            }
            return data || [];
        },
    });
};

export const useNestedProductCategories = () => {
    return useQuery({
        queryKey: ['product-categories', 'nested'],
        queryFn: getNestedCategories,
        select: (res) => res.data,
    });
};

export const useCreateProductCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });
};

export const useUpdateProductCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => updateCategory(id, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['product-categories'] });
                queryClient.invalidateQueries({ queryKey: ['product-category'] });
            }
        },
    });
};

export const useProductCategoryDetail = (id?: string | number) => {
    return useQuery({
        queryKey: ['product-category', id],
        queryFn: () => getCategoryById(id!),
        enabled: !!id,
        select: (res: any) => res.data,
    });
};

export const useDeleteProductCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });
};
