import { apiApp } from '../../api';
import Cookies from 'js-cookie';
import { ApiResponse } from '../config/type';
import { prefixAdmin } from '../constants/routes';

const BASE_URL = `/api/v1/${prefixAdmin}/product/attribute`;

/** Header auth dùng chung */
const withAuth = () => {
    const token = Cookies.get("tokenAdmin");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/** Lấy danh sách thuộc tính */
export const getProductAttributes = async (params?: any): Promise<ApiResponse<any>> => {
    const config = {
        ...withAuth(),
        params
    };
    const response = await apiApp.get(`${BASE_URL}/list`, config);
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

/** Xóa thuộc tính (mềm) */
export const deleteProductAttribute = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/delete/${id}`, {}, withAuth());
    return response.data;
};

/** Khôi phục thuộc tính */
export const restoreProductAttribute = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/restore/${id}`, {}, withAuth());
    return response.data;
};

/** Xóa vĩnh viễn thuộc tính */
export const forceDeleteProductAttribute = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.delete(`${BASE_URL}/force-delete/${id}`, withAuth());
    return response.data;
};
