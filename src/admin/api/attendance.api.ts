import Cookies from "js-cookie";
import { apiApp } from "../../api/index";

const BASE_URL = "/api/v1/admin/attendance";

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    };
};

export const getAttendances = async (params?: any) => {
    const response = await apiApp.get(`${BASE_URL}`, { params, ...withAuth() });
    return response.data;
};

export const getAttendanceDetail = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};

export const generateAttendance = async (data: any) => {
    const response = await apiApp.post(`${BASE_URL}/generate`, data, withAuth());
    return response.data;
};

export const updateAttendance = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}`, data, withAuth());
    return response.data;
};

export const approveAttendance = async (id: string) => {
    const response = await apiApp.post(`${BASE_URL}/${id}/approve`, {}, withAuth());
    return response.data;
};

export const deleteAttendance = async (id: string) => {
    const response = await apiApp.delete(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};
