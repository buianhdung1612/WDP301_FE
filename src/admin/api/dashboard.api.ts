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
