import { useMutation, useQuery } from "@tanstack/react-query";
import { createBoardingBooking, payBoardingBooking } from "../api/boarding-booking.api";
import { getAvailableCages } from "../api/boarding-cage.api";
import { getBoardingCageDetail } from "../api/boarding-cage-detail.api";

export const useCreateBoardingBooking = () => {
  return useMutation({
    mutationFn: (data: any) => createBoardingBooking(data),
  });
};

export const usePayBoardingBooking = () => {
  return useMutation({
    mutationFn: ({ id, gateway }: { id: string; gateway: "zalopay" | "vnpay" }) =>
      payBoardingBooking(id, gateway),
  });
};

export const useAvailableCages = (
  checkInDate: string,
  checkOutDate: string,
  type?: string,
  size?: string
) => {
  return useQuery({
    queryKey: ["boarding-cages", checkInDate, checkOutDate, type, size],
    queryFn: async () => {
      const response = await getAvailableCages({
        checkInDate,
        checkOutDate,
        type,
        size,
      });
      return response.data;
    },
    enabled: !!checkInDate && !!checkOutDate,
    select: (data) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray((data as any)?.data)) return (data as any).data;
      return [];
    },
  });
};

export const useBoardingCageDetail = (id?: string) => {
  return useQuery({
    queryKey: ["boarding-cage-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getBoardingCageDetail(id);
      return response.data;
    },
    enabled: !!id,
  });
};
