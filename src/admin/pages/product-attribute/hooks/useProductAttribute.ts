import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getProductAttributes,
    getProductAttributeDetail,
    deleteProductAttribute,
    updateProductAttribute,
    createProductAttribute,
    restoreProductAttribute,
    forceDeleteProductAttribute
} from '../../../api/product-attribute.api';


export const useProductAttributes = (params?: any) => {
    return useQuery({
        queryKey: ['product-attributes', params],
        queryFn: () => getProductAttributes(params),
    });
};

export const useProductAttributeDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: ['product-attribute-detail', id],
        queryFn: () => getProductAttributeDetail(id!),
        enabled: !!id,
        select: (res: any) => res.data,
    });
};

export const useCreateProductAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProductAttribute,
        onSuccess: (response: any) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            }
        },
    });
};

export const useUpdateProductAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: any }) => updateProductAttribute(id, data),
        onSuccess: (response: any) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
                queryClient.invalidateQueries({ queryKey: ['product-attribute-detail'] });
            }
        },
    });
};

export const useDeleteProductAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProductAttribute,
        onSuccess: (response: any) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            }
        },
    });
};

export const useRestoreProductAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: restoreProductAttribute,
        onSuccess: (response: any) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            }
        },
    });
};

export const useForceDeleteProductAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: forceDeleteProductAttribute,
        onSuccess: (response: any) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
            }
        },
    });
};




