import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getProducts,
    getCreateProductData,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
} from '../../../api/product.api';
import { ApiResponse } from '../../../config/type';

// --- PRODUCTS ---
export const useProductList = (params?: any) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => getProducts(params),
    });
};

export const useCreateProductData = () => {
    return useQuery({
        queryKey: ['product-create-data'],
        queryFn: getCreateProductData,
        select: (res: ApiResponse<any>) => res.data,
    });
};

export const useProductDetail = (id?: string | number) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id!),
        enabled: !!id,
        select: (res: ApiResponse<any>) => res.data,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => updateProduct(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};


// --- AGE RANGES (Placeholders to fix compilation errors) ---
export const useProductAgeRanges = () => {
    return useQuery({
        queryKey: ['product-age-ranges'],
        queryFn: async () => ({ data: [] }),
        select: (res: any) => res.data || [],
    });
};

export const useProductAgeRangeDetail = (id?: string | number) => {
    return useQuery({
        queryKey: ['product-age-range', id],
        queryFn: async () => ({ data: null }),
        enabled: !!id,
        select: (res: any) => res.data,
    });
};

export const useCreateProductAgeRange = () => {
    return useMutation({
        mutationFn: async (data: any) => ({ success: true, data, message: "Success" }),
    });
};

export const useUpdateProductAgeRange = () => {
    return useMutation({
        mutationFn: async ({ id, data }: { id: string | number; data: any }) => ({ success: true, id, data, message: "Success" }),
    });
};

export const useDeleteProductAgeRange = () => {
    return useMutation({
        mutationFn: async (id: string | number) => ({ success: true, id, message: "Success" }),
    });
};
