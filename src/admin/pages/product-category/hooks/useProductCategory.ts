import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getCategories, createCategory, getNestedCategories, getCategoryById, deleteCategory, updateCategory, restoreCategory, forceDeleteCategory } from '../../../api/product-category.api';
import { useState, useMemo } from 'react';


export const useProductCategories = (params?: any) => {
    return useQuery({
        queryKey: ['product-categories', params],
        queryFn: () => getCategories(params),
        placeholderData: keepPreviousData
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

export const useRestoreProductCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: restoreCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });
};

export const useForceDeleteProductCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: forceDeleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });
};

export const useProductCategoryData = () => {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string[]>([]);
    const [isTrash, setIsTrash] = useState(false);

    const queryParams = useMemo(() => ({
        page: page + 1,
        limit: pageSize,
        keyword: search,
        is_trash: isTrash,
        status: status.length > 0 ? status.join(',') : undefined
    }), [page, pageSize, search, isTrash, status]);

    const { data: res, isLoading } = useProductCategories(queryParams);
    const { mutate: deleteCategory } = useDeleteProductCategory();
    const { mutate: restoreCategory } = useRestoreProductCategory();
    const { mutate: forceDeleteCategory } = useForceDeleteProductCategory();

    const categories = res?.data?.recordList || [];
    const pagination = res?.data?.pagination || { totalRecords: 0, deletedCount: 0 };

    return {
        categories,
        pagination,
        isLoading,
        page,
        setPage,
        pageSize,
        setPageSize,
        search,
        setSearch,
        status,
        setStatus,
        isTrash,
        setIsTrash,
        deleteCategory,
        restoreCategory,
        forceDeleteCategory
    };
};




