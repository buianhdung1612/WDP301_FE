import { apiApp } from "../../api";
import Cookies from "js-cookie";

const BASE_URL = "/api/v1/admin/boarding-booking";

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getBoardingBookings = async (params?: any) => {
    const response = await apiApp.get(BASE_URL, { ...withAuth(), params });
    return response.data;
};

export const createBoardingBooking = async (payload: any) => {
    const response = await apiApp.post(`${BASE_URL}/create`, payload, withAuth());
    return response.data;
};

export const getBoardingBookingDetail = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};

export const getBoardingHotelStaffs = async (date?: string) => {
    const response = await apiApp.get(`${BASE_URL}/hotel-staffs`, {
        ...withAuth(),
        params: date ? { date } : undefined,
    });
    return response.data;
};

export const updateBoardingBookingStatus = async (id: string, boardingStatus: string) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}/status`, { boardingStatus }, withAuth());
    return response.data;
};

export const updateBoardingPaymentStatus = async (id: string, paymentStatus: string) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}/payment-status`, { paymentStatus }, withAuth());
    return response.data;
};

export interface BoardingFeedingItem {
    time?: string;
    food?: string;
    amount?: string;
    note?: string;
    staffId?: string | { _id?: string; fullName?: string } | null;
    staffName?: string;
    status?: "pending" | "done" | "skipped";
    doneAt?: string | null;
}

export interface BoardingExerciseItem {
    time?: string;
    activity?: string;
    durationMinutes?: number;
    note?: string;
    staffId?: string | { _id?: string; fullName?: string } | null;
    staffName?: string;
    status?: "pending" | "done" | "skipped";
    doneAt?: string | null;
}

export const updateBoardingCareSchedule = async (
    id: string,
    payload: {
        feedingSchedule?: BoardingFeedingItem[];
        exerciseSchedule?: BoardingExerciseItem[];
        careDate?: string;
    }
) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}/care-schedule`, payload, withAuth());
    return response.data;
};
