import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBreeds, createBreed, updateBreed, deleteBreed } from "../../../api/breed.api";

export const useBreeds = (type?: string) => {
    return useQuery({
        queryKey: ["breeds", type],
        queryFn: () => getBreeds(type),
        select: (res) => res.data || [],
    });
};

export const useCreateBreed = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBreed,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["breeds"] });
        },
    });
};

export const useUpdateBreed = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateBreed(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["breeds"] });
        },
    });
};

export const useDeleteBreed = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBreed,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["breeds"] });
        },
    });
};
