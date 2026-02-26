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

/** Lấy thông tin API hãng vận chuyển */
export const getSettingShipping = async (): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/api-shipping`, withAuth());
    return response.data;
};

/** Cập nhật API hãng vận chuyển */
export const updateSettingShipping = async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/api-shipping`, data, withAuth());
    return response.data;
};

/** Lấy thông tin API cổng thanh toán */
export const getSettingPayment = async (): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/api-payment`, withAuth());
    return response.data;
};

/** Cập nhật API cổng thanh toán */
export const updateSettingPayment = async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/api-payment`, data, withAuth());
    return response.data;
};

/** Lấy thông tin API đăng nhập MXH */
export const getSettingLoginSocial = async (): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/api-login-social`, withAuth());
    return response.data;
};

/** Cập nhật API đăng nhập MXH */
export const updateSettingLoginSocial = async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/api-login-social`, data, withAuth());
    return response.data;
};

/** Lấy thông tin API mật khẩu ứng dụng */
export const getSettingAppPassword = async (): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/api-app-password`, withAuth());
    return response.data;
};

/** Cập nhật API mật khẩu ứng dụng */
export const updateSettingAppPassword = async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/api-app-password`, data, withAuth());
    return response.data;
};
