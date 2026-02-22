import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:3000/api/v1/admin/booking-config";

export const useBookingConfig = () => {
    return useQuery({
        queryKey: ["bookingConfig"],
        queryFn: async () => {
            const response = await axios.get(API_URL, { withCredentials: true });
            return response.data.data;
        }
    });
};

export const useUpdateBookingConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.patch(API_URL, data, { withCredentials: true });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookingConfig"] });
            toast.success("Cập nhật cấu hình đơn thành công!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật cấu hình");
        }
    });
};




