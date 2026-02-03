import { apiApp } from '../../api';
import Cookies from 'js-cookie';
import { ApiResponse } from '../config/type';

const BASE_URL = '/api/v1/admin/service';

const withAuth = () => {
    const token = Cookies.get('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getServices = async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(BASE_URL, { ...withAuth(), params });
    return response.data;
};

export const getServiceById = async (id: string | number): Promise<any> => {
    const response = await apiApp.get(`${BASE_URL}/detail/${id}`, withAuth());
    return response.data;
};

export const createService = async (data: any): Promise<any> => {
    const response = await apiApp.post(`${BASE_URL}/create`, data, withAuth());
    return response.data;
};

export const updateService = async (id: string | number, data: any): Promise<any> => {
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, data, withAuth());
    return response.data;
};

export const deleteService = async (id: string | number): Promise<any> => {
    const response = await apiApp.delete(`${BASE_URL}/delete/${id}`, withAuth());
    return response.data;
};

// Deprecated object export for backward compatibility if needed, 
// but we'll move towards direct function imports.
export const serviceApi = {
    serviceList: getServices,
    serviceDetail: getServiceById,
    serviceCreate: createService,
    serviceEdit: updateService,
    serviceDelete: deleteService,
};
