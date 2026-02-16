import Cookies from "js-cookie";
import { apiApp } from "../../api/index";

const BASE_URL = "/api/v1/admin/shifts";

const withAuth = () => {
    const token = Cookies.get("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    };
};

export const getShifts = async (params?: any) => {
    const response = await apiApp.get(`${BASE_URL}`, { params, ...withAuth() });
    return response.data;
};

export const getShiftDetail = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};

export const createShift = async (data: any) => {
    const response = await apiApp.post(`${BASE_URL}`, data, withAuth());
    return response.data;
};

export const updateShift = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}`, data, withAuth());
    return response.data;
};

export const deleteShift = async (id: string) => {
    const response = await apiApp.delete(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};
