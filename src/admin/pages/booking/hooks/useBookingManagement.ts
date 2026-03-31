import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
    getBookings,
    getBookingDetail,
    createBooking as apiCreateBooking,
    updateBookingStatus,
    assignStaffToBooking,
    startBooking,
    rescheduleBooking,
    extendBooking,
    getAvailableSlots,
    getRecommendedStaff,
    getStaffTasks,
    getStaffBookingDetail,
    updateBooking,
    autoAssignBookings,
    reassignPetStaff,
    applyOptimization as apiApplyOptimization,
    suggestSmartAssignment as apiSuggestSmartAssignment
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
        placeholderData: keepPreviousData,
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
        mutationFn: ({ id, status, petId, reason }: { id: string; status: string; petId?: string; reason?: string }) =>
            updateBookingStatus(id, status, petId, reason),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["staff-tasks"] });
        },
    });
};

export const useAssignStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, ...data }: { bookingId: string; staffId?: string; staffIds?: string[] }) =>
            assignStaffToBooking(bookingId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["booking", variables.bookingId] });
        },
    });
};


export const useStartBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, petId }: { id: string; petId?: string }) => startBooking(id, petId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["staff-tasks"] });
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

export const useExtendBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, minutes }: { id: string; minutes: number }) => extendBooking(id, minutes),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["staff-tasks"] });
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
        placeholderData: keepPreviousData,
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
export const useAutoAssignBookings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (bookingId: string) => autoAssignBookings(bookingId),
        onSuccess: (_data, bookingId) => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
        },
    });
};

export const useSuggestAssignment = () => {
    return useMutation({
        mutationFn: (data: { date: string, startTime: string, endTime: string, serviceId: string, petIds: string[], staffIds?: string[], bookingId?: string }) =>
            apiSuggestSmartAssignment(data),
    });
};

export const useApplyOptimization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => apiApplyOptimization(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useReassignPetStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { petId: string, staffId: string } }) => reassignPetStaff(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
    });
};




