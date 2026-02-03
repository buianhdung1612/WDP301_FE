import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCategories,
    createCategory,
    getNestedCategories,
    getCategoryById,
    deleteCategory,
    updateCategory
} from '../../../api/service-category.api';
import { ApiResponse } from '../../../config/type';

export const useServiceCategories = () => {
    return useQuery({
        queryKey: ['service-categories'],
        queryFn: getCategories,
        select: (res: any) => {
            // Adjust based on backend response format
            const data = res.data;
            if (data && typeof data === 'object' && 'recordList' in data) {
                return data.recordList;
            }
            return data || [];
        },
    });
};

export const useNestedServiceCategories = () => {
    return useQuery({
        queryKey: ['service-categories', 'nested'],
        queryFn: getNestedCategories,
        select: (res) => res.data,
    });
};

export const useCreateServiceCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        },
    });
};

export const useUpdateServiceCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => updateCategory(id, data),
        onSuccess: (response: any) => {
            if (response.code === 200 || response.success) {
                queryClient.invalidateQueries({ queryKey: ['service-categories'] });
                queryClient.invalidateQueries({ queryKey: ['service-category'] });
            }
        },
    });
};

export const useServiceCategoryDetail = (id?: string | number) => {
    return useQuery({
        queryKey: ['service-category', id],
        queryFn: () => getCategoryById(id!),
        enabled: !!id,
        select: (res: any) => res.data,
    });
};

export const useDeleteServiceCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        },
    });
};
