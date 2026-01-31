import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, getNestedCategories, getCategoryById, deleteCategory, updateCategory } from '../../../api/blog-category.api';
import { ApiResponse } from '../../../config/type';

export const useBlogCategories = () => {
    return useQuery({
        queryKey: ['blog-categories'],
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

export const useNestedBlogCategories = () => {
    return useQuery({
        queryKey: ['blog-categories', 'nested'],
        queryFn: getNestedCategories,
        select: (res) => res.data,
    });
};

export const useCreateBlogCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
        },
    });
};

export const useUpdateBlogCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => updateCategory(id, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
                queryClient.invalidateQueries({ queryKey: ['blog-category'] });
            }
        },
    });
};

export const useBlogCategoryDetail = (id?: string | number) => {
    return useQuery({
        queryKey: ['blog-category', id],
        queryFn: () => getCategoryById(id!),
        enabled: !!id,
        select: (res: any) => res.data,
    });
};

export const useDeleteBlogCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
        },
    });
};
