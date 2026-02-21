import Cookies from "js-cookie";
import { apiApp } from "../../api/index";

const BASE_URL = "/api/v1/admin/attendance-configs";

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
    };
};

export const getAttendanceConfig = async () => {
    const response = await apiApp.get(`${BASE_URL}`, withAuth());
    return response.data;
};

export const updateAttendanceConfig = async (data: any) => {
    const response = await apiApp.patch(`${BASE_URL}`, data, withAuth());
    return response.data;
};
