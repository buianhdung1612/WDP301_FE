import axios from "axios";

const API_URL = "http://localhost:3000/api/v1/admin/breed";

export const getBreeds = async (type?: string) => {
    const response = await axios.get(API_URL, {
        params: { type },
        withCredentials: true
    });
    return response.data;
};

export const createBreed = async (data: { name: string, type: string }) => {
    const response = await axios.post(`${API_URL}/create`, data, {
        withCredentials: true
    });
    return response.data;
};

export const updateBreed = async (id: string, data: any) => {
    const response = await axios.patch(`${API_URL}/${id}`, data, {
        withCredentials: true
    });
    return response.data;
};

export const deleteBreed = async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
    });
    return response.data;
};
