import { apiApp } from '../../api';
import Cookies from 'js-cookie';

const BASE_URL = '/api/v1/admin/booking/bookings';

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getBookings = async (params?: any) => {
    const response = await apiApp.get(BASE_URL, { ...withAuth(), params });
    return response.data;
};

export const getBookingDetail = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};
export const getStaffTasks = async (params?: any) => {
    const response = await apiApp.get(`${BASE_URL}/staff-tasks`, { ...withAuth(), params });
    return response.data;
};
export const getStaffBookingDetail = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/staff-detail/${id}`, withAuth());
    return response.data;
};

export const createBooking = async (data: any) => {
    const response = await apiApp.post(`${BASE_URL}/create`, data, withAuth());
    return response.data;
};

export const updateBookingStatus = async (id: string, status: string, petId?: string) => {
    const endpoint = status === 'confirmed' ? 'confirm' : status === 'cancelled' ? 'cancel' : status === 'completed' ? 'complete' : '';
    if (!endpoint) throw new Error("Invalid status update");
    const response = await apiApp.patch(`${BASE_URL}/${id}/${endpoint}`, { petId }, withAuth());
    return response.data;
};

export const confirmBooking = (id: string) => updateBookingStatus(id, 'confirmed');
export const cancelBooking = (id: string, reason?: string) => {
    return apiApp.patch(`${BASE_URL}/${id}/cancel`, { reason }, withAuth());
};
export const completeBooking = (id: string) => updateBookingStatus(id, 'completed');

export const assignStaffToBooking = async (bookingId: string, data: { staffId?: string, staffIds?: string[] }) => {
    const response = await apiApp.patch(`${BASE_URL}/${bookingId}/assign-staff`, data, withAuth());
    return response.data;
};

export const startBooking = async (id: string, petId?: string) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}/start`, { petId }, withAuth());
    return response.data;
};

export const rescheduleBooking = async (id: string, data: { start: string, end: string, staffId?: string, staffIds?: string[] }) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}/reschedule`, data, withAuth());
    return response.data;
};

export const updateBooking = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}/update`, data, withAuth());
    return response.data;
};

export const getAvailableSlots = async (params: { date: string, serviceId: string, departmentId?: string }) => {
    const response = await apiApp.get(`${BASE_URL}/available-slots`, { ...withAuth(), params });
    return response.data;
};
export const getRecommendedStaff = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/${id}/recommend-staff`, withAuth());
    return response.data;
};
export const exportStaffSchedule = async (date: string) => {
    const response = await apiApp.get(`${BASE_URL}/export-staff-schedule`, {
        ...withAuth(),
        params: { date },
        responseType: 'blob'
    });
    return response.data;
};

export const autoAssignBookings = async (bookingId: string) => {
    const response = await apiApp.post(`${BASE_URL}/auto-assign`, { bookingId }, withAuth());
    return response.data;
};

export const suggestSmartAssignment = async (data: { date: string, startTime: string, endTime: string, serviceId: string, petIds: string[], staffIds?: string[] }) => {
    const response = await apiApp.post(`${BASE_URL}/suggest-assignment`, data, withAuth());
    return response.data;
};
