import { apiApp } from '../../api';
import Cookies from 'js-cookie';
import { ApiResponse } from '../config/type';

const BASE_URL = '/api/v1/admin/brand';

/** Header auth dùng chung */
const withAuth = () => {
    const token = Cookies.get('token');

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/** Lấy tất cả thương hiệu sản phẩm */
export const getBrands = async (): Promise<ApiResponse<any[]>> => {
    const response = await apiApp.get(BASE_URL, withAuth());
    return response.data;
};

/** Lấy thương hiệu sản phẩm theo ID */
export const getBrandById = async (id: string | number): Promise<any> => {
    const response = await apiApp.get(`${BASE_URL}/detail/${id}`, withAuth());
    return response.data;
};

/** Tạo thương hiệu sản phẩm */
export const createBrand = async (data: any): Promise<any> => {
    // Map data từ FE sang BE format
    const payload = {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        description: data.description || '',
        avatar: data.avatar || '',
        status: data.status || 'active',
    };
    const response = await apiApp.post(BASE_URL, payload, withAuth());
    return response.data;
};

/** Cập nhật thương hiệu sản phẩm */
export const updateBrand = async (id: string | number, data: any): Promise<any> => {
    // Map data từ FE sang BE format
    const payload = {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        description: data.description || '',
        avatar: data.avatar || '',
        status: data.status || 'active',
    };
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, payload, withAuth());
    return response.data;
};

/** Xóa thương hiệu sản phẩm */
export const deleteBrand = async (id: string | number): Promise<any> => {
    const response = await apiApp.patch(`${BASE_URL}/delete/${id}`, {}, withAuth());
    return response.data;
};

// --- Helper functions ---

/** Generate slug từ name */
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};
