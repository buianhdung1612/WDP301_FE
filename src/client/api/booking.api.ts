import axios from "axios";

export interface CreateBookingPayload {
  serviceId: string;
  slotId: string; // hoặc time + date nếu BE xử lý
  petIds: string[]; // tạm thời có thể []
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

export const createBooking = (data: CreateBookingPayload) => {
  return axios.post("/api/v1/client/booking/bookings", data, {
    withCredentials: true // để gửi cookie nếu user đã login
  });
};

export const getTimeSlots = (date: string, serviceId: string) => {
  return axios.get("/api/v1/client/time-slots", {
    params: { date, serviceId }
  });
};
