import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAttendanceConfig, updateAttendanceConfig } from "../../../api/attendance-config.api";
import { toast } from "react-toastify";

export const useAttendanceConfig = () => {
    const queryClient = useQueryClient();

    const { data: configRes, isLoading } = useQuery<any>({
        queryKey: ["attendance-config"],
        queryFn: getAttendanceConfig
    });

    const { mutate: update, isPending } = useMutation({
        mutationFn: updateAttendanceConfig,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance-config"] });
            toast.success("Cập nhật cấu hình chấm công thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Cập nhật thất bại");
        }
    });

    return {
        config: configRes?.data,
        isLoading,
        update,
        isPending
    };
};
