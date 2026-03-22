import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBrands, createBrand, getBrandById, updateBrand, deleteBrand, restoreBrand, forceDeleteBrand } from '../../../api/brand.api';


export const useBrands = (params?: any) => {
    return useQuery({
        queryKey: ['brands', params],
        queryFn: () => getBrands(params),
    });
};

export const useCreateBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};

export const useUpdateBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => updateBrand(id, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['brands'] });
                queryClient.invalidateQueries({ queryKey: ['brand'] });
            }
        },
    });
};

export const useBrandDetail = (id?: string | number) => {
    return useQuery({
        queryKey: ['brand', id],
        queryFn: () => getBrandById(id!),
        enabled: !!id,
        select: (res: any) => {
            const data = res.data || res;
            if (data) {
                return {
                    ...data,
                    id: data._id,
                };
            }
            return null;
        },
    });
};

export const useDeleteBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};

export const useRestoreBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: restoreBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};

export const useDeletePermanentBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: forceDeleteBrand,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
        },
    });
};




