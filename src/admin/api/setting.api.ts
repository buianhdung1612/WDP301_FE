import { apiApp } from '../../api';
import Cookies from 'js-cookie';
import { ApiResponse } from '../config/type';
import { prefixAdmin } from '../constants/routes';

const BASE_URL = `/api/v1/${prefixAdmin}/setting`;

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/** Lấy thông tin cài đặt chung */
export const getSettingGeneral = async (): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/general`, withAuth());
    return response.data;
};

/** Cập nhật cài đặt chung */
export const updateSettingGeneral = async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/general`, data, withAuth());
    return response.data;
};
