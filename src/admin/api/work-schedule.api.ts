import { apiApp } from "../../api";
import Cookies from "js-cookie";

const BASE_URL = "/api/v1/admin/schedules";

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getMySchedules = async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiApp.get(`${BASE_URL}/my-schedule`, { ...withAuth(), params });
    return response.data;
};

export const getSchedules = async (params?: any) => {
    const response = await apiApp.get(BASE_URL, { ...withAuth(), params });
    return response.data;
};
