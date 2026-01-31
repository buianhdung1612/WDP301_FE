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

