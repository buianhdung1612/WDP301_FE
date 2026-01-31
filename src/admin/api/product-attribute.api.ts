import { apiApp } from '../../api';
import Cookies from 'js-cookie';
import { ApiResponse } from '../config/type';
import { prefixAdmin } from '../constants/routes';

const BASE_URL = `/api/v1/${prefixAdmin}/product/attribute`;

/** Header auth dùng chung */
const withAuth = () => {
    const token = Cookies.get('token');

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/** Lấy danh sách thuộc tính */
export const getProductAttributes = async (): Promise<ApiResponse<any[]>> => {
    const response = await apiApp.get(`${BASE_URL}/list`, withAuth());
    return response.data;
};

/** Lấy chi tiết thuộc tính */
export const getProductAttributeDetail = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/detail/${id}`, withAuth());
    return response.data;
};

/** Tạo thuộc tính mới */
export const createProductAttribute = async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.post(`${BASE_URL}/create`, data, withAuth());
    return response.data;
};

/** Cập nhật thuộc tính */
export const updateProductAttribute = async (id: string | number, data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, data, withAuth());
    return response.data;
};

/** Xóa thuộc tính */
export const deleteProductAttribute = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.delete(`${BASE_URL}/delete/${id}`, withAuth());
    return response.data;
};
