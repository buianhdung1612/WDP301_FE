import { apiApp } from "../../api";
import Cookies from "js-cookie";

const BASE_URL = "/api/v1/admin/pet";

const withAuth = () => {
    const token = Cookies.get("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getPets = async (params?: any) => {
    const response = await apiApp.get(`${BASE_URL}/`, { ...withAuth(), params });
    return response.data;
};

export const getPetById = async (id: string) => {
    const response = await apiApp.get(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};

export const createPet = async (data: any) => {
    const response = await apiApp.post(`${BASE_URL}/create`, data, withAuth());
    return response.data;
};

export const updatePet = async (id: string, data: any) => {
    const response = await apiApp.patch(`${BASE_URL}/${id}`, data, withAuth());
    return response.data;
};

export const deletePet = async (id: string) => {
    const response = await apiApp.delete(`${BASE_URL}/${id}`, withAuth());
    return response.data;
};
