import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getBookings,
    getBookingDetail,
    createBooking as apiCreateBooking,
    updateBookingStatus,
    assignStaffToBooking,
    startBooking,
    rescheduleBooking,
    getAvailableSlots,
    getRecommendedStaff,
    getStaffTasks,
    getStaffBookingDetail,
    updateBooking
} from "../../../api/booking.api";

export const useAvailableSlots = (params: { date: string, serviceId: string, departmentId?: string }) => {
    return useQuery({
        queryKey: ["available-slots", params],
        queryFn: () => getAvailableSlots(params),
        enabled: !!params.date && !!params.serviceId,
    });
};

export const useBookings = (params?: any) => {
    return useQuery<any>({
        queryKey: ["bookings", params],
        queryFn: () => getBookings(params),
    });
};

export const useBookingDetail = (id: string) => {
    return useQuery<any>({
        queryKey: ["booking", id],
        queryFn: () => getBookingDetail(id),
        enabled: !!id,
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiCreateBooking(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
};

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
};

export const useAssignStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, staffId }: { bookingId: string; staffId: string }) =>
            assignStaffToBooking(bookingId, staffId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["booking", variables.bookingId] });
        },
    });
};


export const useStartBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => startBooking(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ["booking", id] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
};

export const useRescheduleBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => rescheduleBooking(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
};

export const useRecommendedStaff = (id: string, options?: any) => {
    return useQuery<any>({
        queryKey: ["recommended-staff", id],
        queryFn: () => getRecommendedStaff(id),
        enabled: !!id,
        ...options,
    });
};

export const useStaffTasks = (params?: any) => {
    return useQuery<any>({
        queryKey: ["staff-tasks", params],
        queryFn: () => getStaffTasks(params),
    });
};

export const useStaffBookingDetail = (id: string) => {
    return useQuery<any>({
        queryKey: ["staff-booking-detail", id],
        queryFn: () => getStaffBookingDetail(id),
        enabled: !!id,
    });
};

export const useUpdateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateBooking(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
};
