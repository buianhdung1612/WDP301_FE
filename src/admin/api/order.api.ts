import { apiApp } from '../../api';
import Cookies from 'js-cookie';

const BASE_URL = '/api/v1/admin/order';

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getOrders = async (params?: any) => {
    const response = await apiApp.get(`${BASE_URL}/list`, { ...withAuth(), params });
    return response.data;
};

export const getOrderDetail = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/detail/${id}`, withAuth());
    return response.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}/status`, { status }, withAuth());
    return response.data;
};

export const createOrder = async (data: any) => {
    const response = await apiApp.post(`${BASE_URL}/create`, data, withAuth());
    return response.data;
};

export const updateOrder = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, data, withAuth());
    return response.data;
};

export const exportInvoicePdf = async (orderCode: string, phone: string) => {
    const response = await apiApp.get(`/api/v1/client/order/export-pdf`, {
        ...withAuth(),
        params: { orderCode, phone },
        responseType: 'blob'
    });
    return response.data;
};
