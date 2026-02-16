import Cookies from "js-cookie";
import { apiApp } from "../../api/index";

const BASE_URL = "/api/v1/admin/departments";

const withAuth = () => {
    const token = Cookies.get("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    };
};

export const getDepartments = async (params?: any) => {
    const response = await apiApp.get(`${BASE_URL}`, { params, ...withAuth() });
    return response.data;
};

export const getDepartmentDetail = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};

export const createDepartment = async (data: any) => {
    const response = await apiApp.post(`${BASE_URL}`, data, withAuth());
    return response.data;
};

export const updateDepartment = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}`, data, withAuth());
    return response.data;
};

export const deleteDepartment = async (id: string) => {
    const response = await apiApp.delete(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};
