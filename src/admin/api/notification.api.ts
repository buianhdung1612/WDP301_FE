import { apiApp } from '../../api';
import Cookies from 'js-cookie';

const BASE_URL = '/api/v1/admin/notifications';

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getNotifications = async () => {
    const response = await apiApp.get(BASE_URL, withAuth());
    return response.data;
};

export const markAsRead = async (id: string) => {
    const response = await apiApp.patch(`${BASE_URL}/mark-read/${id}`, {}, withAuth());
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await apiApp.patch(`${BASE_URL}/mark-read/all`, {}, withAuth());
    return response.data;
};

export const archiveNotification = async (id: string) => {
    const response = await apiApp.patch(`${BASE_URL}/archive/${id}`, {}, withAuth());
    return response.data;
};

export const archiveAllNotifications = async () => {
    const response = await apiApp.patch(`${BASE_URL}/archive/all`, {}, withAuth());
    return response.data;
};

export const deleteNotification = async (id: string) => {
    const response = await apiApp.delete(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};

export const deleteAllNotifications = async () => {
    const response = await apiApp.delete(`${BASE_URL}/all`, withAuth());
    return response.data;
};
