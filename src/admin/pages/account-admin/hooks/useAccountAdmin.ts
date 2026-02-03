import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccounts, getAccountById, createAccount, updateAccount, deleteAccount, changeAccountPassword } from "../../../api/account-admin.api";

export const useAccounts = (params?: any) => {
    return useQuery({
        queryKey: ["accounts-admin", params],
        queryFn: () => getAccounts(params),
        select: (res: any) => res.data || [],
    });
};

export const useAccountDetail = (id?: string) => {
    return useQuery({
        queryKey: ["account-admin", id],
        queryFn: () => getAccountById(id!),
        enabled: !!id,
        select: (res: any) => res.data,
    });
};

export const useCreateAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts-admin"] });
        },
    });
};

export const useUpdateAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateAccount(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts-admin"] });
            queryClient.invalidateQueries({ queryKey: ["account-admin"] });
        },
    });
};

export const useChangeAccountPassword = () => {
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => changeAccountPassword(id, data),
    });
};

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts-admin"] });
        },
    });
};
