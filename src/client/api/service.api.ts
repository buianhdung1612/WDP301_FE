import { apiApp } from "../../api";

const BASE_URL = "/api/v1/client/service";

export const getServices = async (params?: any) => {
    const response = await apiApp.get(BASE_URL, { params });
    return response.data;
};
