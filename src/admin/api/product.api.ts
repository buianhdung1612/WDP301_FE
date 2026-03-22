import { apiApp } from '../../api';
import Cookies from 'js-cookie';
import { ApiResponse } from '../config/type';
import { prefixAdmin } from '../constants/routes';

const BASE_URL = `/api/v1/${prefixAdmin}/product`;

/** Header auth dùng chung */
const withAuth = () => {
    const token = Cookies.get("tokenAdmin");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// --- PRODUCT API ---

/** Lấy danh sách sản phẩm */
export const getProducts = async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/list`, {
        ...withAuth(),
        params
    });
    return response.data;
};

/** Lấy dữ liệu khởi tạo cho trang create (CategoryTree, Attributes, ProductList) */
export const getCreateProductData = async (): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/create`, withAuth());
    return response.data;
};

/** Tạo sản phẩm mới */
export const createProduct = async (data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.post(`${BASE_URL}/create`, data, withAuth());
    return response.data;
};

/** Lấy chi tiết sản phẩm cho trang Edit */
export const getProductById = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/edit/${id}`, withAuth());
    return response.data;
};

/** Cập nhật sản phẩm */
export const updateProduct = async (id: string | number, data: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, data, withAuth());
    return response.data;
};

/** Xóa sản phẩm */
export const deleteProduct = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/delete/${id}`, {}, withAuth());
    return response.data;
};

/** Khôi phục sản phẩm */
export const restoreProduct = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.patch(`${BASE_URL}/restore/${id}`, {}, withAuth());
    return response.data;
};

/** Xóa vĩnh viễn sản phẩm */
export const forceDeleteProduct = async (id: string | number): Promise<ApiResponse<any>> => {
    const response = await apiApp.delete(`${BASE_URL}/force-delete/${id}`, withAuth());
    return response.data;
};
/** Lấy danh sách sản phẩm hết hạn */
export const getExpiredProducts = async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/expired/list`, {
        ...withAuth(),
        params
    });
    return response.data;
};
/** Quét sản phẩm hết hạn thủ công */
export const scanExpiredProducts = async (): Promise<ApiResponse<any>> => {
    const response = await apiApp.post(`${BASE_URL}/expired/scan`, {}, withAuth());
    return response.data;
};
