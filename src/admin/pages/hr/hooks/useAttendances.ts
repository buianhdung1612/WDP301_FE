import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../../api/attendance.api";

export const useAttendances = (params?: any) => {
    return useQuery({
        queryKey: ["attendances", params],
        queryFn: () => api.getAttendances(params),
        select: (res: any) => res.data || []
    });
};

export const useAttendanceDetail = (id: string) => {
    return useQuery({
        queryKey: ["attendance", id],
        queryFn: () => api.getAttendanceDetail(id),
        enabled: !!id,
    });
};

export const useGenerateAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.generateAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendances"] });
        },
    });
};

export const useUpdateAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            api.updateAttendance(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendances"] });
        },
    });
};

export const useApproveAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.approveAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendances"] });
        },
    });
};

export const useDeleteAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.deleteAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendances"] });
        },
    });
};




