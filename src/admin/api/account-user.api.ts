import { apiApp } from "../../api";
import Cookies from "js-cookie";

const BASE_URL = "/api/v1/admin/account-user";

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getUsers = async (params?: any) => {
    const response = await apiApp.get(`${BASE_URL}/list`, { ...withAuth(), params });
    return response.data;
};

export const getUserById = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/detail/${id}`, withAuth());
    return response.data;
};

export const createUser = async (data: any) => {
    const response = await apiApp.post(`${BASE_URL}/create`, data, withAuth());
    return response.data;
};

export const updateUser = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, data, withAuth());
    return response.data;
};

export const changeUserPassword = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/change-password/${id}`, data, withAuth());
    return response.data;
};

export const deleteUser = async (id: string) => {
    const response = await apiApp.delete(`${BASE_URL}/delete/${id}`, withAuth());
    return response.data;
};
export const getUserAddresses = async (userId: string) => {
    const response = await apiApp.get(`${BASE_URL}/address/${userId}`, withAuth());
    return response.data;
};

export const deleteUserAddress = async (id: string) => {
    const response = await apiApp.delete(`${BASE_URL}/address/delete/${id}`, withAuth());
    return response.data;
};

export const setUserAddressDefault = async (id: string) => {
    const response = await apiApp.patch(`${BASE_URL}/address/set-default/${id}`, {}, withAuth());
    return response.data;
};
