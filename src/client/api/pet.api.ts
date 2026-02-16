import { apiApp } from "../../api/index";

const API_PET = "/api/v1/client/pet/my-pets";

export const getMyPets = async () => {
    try {
        const response = await apiApp.get(API_PET);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createPet = async (data: any) => {
    try {
        const response = await apiApp.post(API_PET, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPetDetail = async (id: string) => {
    try {
        const response = await apiApp.get(`${API_PET}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePet = async (id: string, data: any) => {
    try {
        const response = await apiApp.patch(`${API_PET}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePet = async (id: string) => {
    try {
        const response = await apiApp.delete(`${API_PET}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
