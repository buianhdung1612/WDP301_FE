import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, createBooking } from '../../../api/booking.api';

export const useBookings = (params?: any) => {
    return useQuery({
        queryKey: ['bookings', params],
        queryFn: () => getBookings(params),
        select: (res: any) => res.data || [],
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createBooking(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
};




