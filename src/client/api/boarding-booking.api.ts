import { apiApp } from "../../api";

export interface CreateBoardingBookingPayload {
  cageId: string;
  checkInDate: string;
  checkOutDate: string;
  petIds: string[];
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  specialCare?: string;
  discountAmount?: number;
  appliedCoupon?: string;
  paymentMethod?: string;
  paymentGateway?: "zalopay" | "vnpay";
}

export const createBoardingBooking = (data: CreateBoardingBookingPayload) => {
  return apiApp.post("/api/v1/client/boarding/boarding-bookings", data);
};

export const payBoardingBooking = (id: string, gateway: "zalopay" | "vnpay") => {
  return apiApp.post(`/api/v1/client/boarding/boarding-bookings/${id}/pay`, { gateway });
};
