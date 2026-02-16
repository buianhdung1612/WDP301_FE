import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPets, getPetById, createPet, updatePet, deletePet } from "../../../api/pet.api";

export const usePets = (params?: any) => {
    return useQuery({
        queryKey: ["pets", params],
        queryFn: () => getPets(params),
        select: (res: any) => res.data || [],
    });
};

export const usePetDetail = (id?: string) => {
    return useQuery({
        queryKey: ["pet", id],
        queryFn: () => getPetById(id!),
        enabled: !!id,
        select: (res: any) => res.data,
    });
};

export const useCreatePet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createPet(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pets"] });
            queryClient.invalidateQueries({ queryKey: ["accounts-user"] });
        },
    });
};

export const useUpdatePet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updatePet(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pets"] });
            queryClient.invalidateQueries({ queryKey: ["pet"] });
        },
    });
};

export const useDeletePet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deletePet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pets"] });
        },
    });
};
