import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getServices,
    createService,
    getServiceById,
    deleteService,
    updateService
} from '../../../api/service.api';

export const useServices = (params?: any) => {
    return useQuery({
        queryKey: ['services', params],
        queryFn: () => getServices(params),
        select: (res: any) => {
            const data = res.data;
            if (data && typeof data === 'object' && 'recordList' in data) {
                return data.recordList;
            }
            return data || [];
        },
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => updateService(id, data),
        onSuccess: (response: any) => {
            if (response.code === 200 || response.success) {
                queryClient.invalidateQueries({ queryKey: ['services'] });
                queryClient.invalidateQueries({ queryKey: ['service'] });
            }
        },
    });
};

export const useServiceDetail = (id?: string | number) => {
    return useQuery({
        queryKey: ['service', id],
        queryFn: () => getServiceById(id!),
        enabled: !!id,
        select: (res: any) => res.data,
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};
