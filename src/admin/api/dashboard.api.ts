import { apiApp } from '../../api';
import Cookies from 'js-cookie';

const BASE_URL = '/api/v1/admin/dashboard';

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getEcommerceStats = async () => {
    const response = await apiApp.get(`${BASE_URL}/ecommerce-stats`, withAuth());
    return response.data;
};

export const getAnalyticsStats = async () => {
    const response = await apiApp.get(`${BASE_URL}/analytics-stats`, withAuth());
    return response.data;
};

export const getSystemStats = async () => {
    const response = await apiApp.get(`${BASE_URL}/system-stats`, withAuth());
    return response.data;
};

export const getStaffingStatus = async (date?: string) => {
    const response = await apiApp.get(`${BASE_URL}/staffing-status`, {
        ...withAuth(),
        params: { date }
    });
    return response.data;
};

export const getDetailedServiceStats = async (startDate?: string, endDate?: string) => {
    const response = await apiApp.get(`${BASE_URL}/detailed-service-stats`, {
        ...withAuth(),
        params: { startDate, endDate }
    });
    return response.data;
};

export const getDetailedOrderStats = async (startDate?: string, endDate?: string) => {
    const response = await apiApp.get(`${BASE_URL}/detailed-order-stats`, {
        ...withAuth(),
        params: { startDate, endDate }
    });
    return response.data;
};

export const getDetailedBoardingStats = async () => {
    const response = await apiApp.get(`${BASE_URL}/detailed-boarding-stats`, withAuth());
    return response.data;
};

export const getDetailedStaffStats = async (startDate?: string, endDate?: string) => {
    const response = await apiApp.get(`${BASE_URL}/detailed-staff-stats`, {
        ...withAuth(),
        params: { startDate, endDate }
    });
    return response.data;
};
