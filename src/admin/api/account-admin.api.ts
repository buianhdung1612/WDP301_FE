import { apiApp } from "../../api";
import Cookies from "js-cookie";

const BASE_URL = "/api/v1/admin/account-admin";

const withAuth = () => {
    const token = Cookies.get("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getAccounts = async (params?: any) => {
    const response = await apiApp.get(`${BASE_URL}/list`, { ...withAuth(), params });
    return response.data;
};

export const getAccountById = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/detail/${id}`, withAuth());
    return response.data;
};

export const createAccount = async (data: any) => {
    const response = await apiApp.post(`${BASE_URL}/create`, data, withAuth());
    return response.data;
};

export const updateAccount = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, data, withAuth());
    return response.data;
};

export const changeAccountPassword = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/change-password/${id}`, data, withAuth());
    return response.data;
};

export const deleteAccount = async (id: string) => {
    const response = await apiApp.delete(`${BASE_URL}/delete/${id}`, withAuth());
    return response.data;
};
