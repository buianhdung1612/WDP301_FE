import { apiApp } from '../../api';
import Cookies from 'js-cookie';
import { CategoryNode } from '../components/ui/CategoryTreeSelect';
import { ApiResponse } from '../config/type';

const BASE_URL = '/api/v1/admin/product/category';

/** Header auth dùng chung cho product-categories */
const withAuth = () => {
    const token = Cookies.get('token');

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/** Danh sách (flat) */
export const getCategories = async (): Promise<ApiResponse<any[]>> => {
    const response = await apiApp.get(`${BASE_URL}/list`, withAuth());
    return response.data;
};

/** Danh sách dạng cây */
export const getNestedCategories = async (): Promise<ApiResponse<CategoryNode[]>> => {
    const response = await apiApp.get(`${BASE_URL}/tree`, withAuth());
    return response.data;
};

/** Tạo danh mục */
export const createCategory = async (data: any): Promise<any> => {
    // Map data từ FE sang BE format
    const payload = {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        parent: data.parent || '',
        description: data.description || '',
        avatar: data.avatar || '',
        status: data.status || 'active',
    };
    const response = await apiApp.post(`${BASE_URL}/create`, payload, withAuth());
    return response.data;
};

/** Chi tiết */
export const getCategoryById = async (id: string | number): Promise<any> => {
    const response = await apiApp.get(`${BASE_URL}/detail/${id}`, withAuth());
    return response.data;
};

/** Cập nhật danh mục */
export const updateCategory = async (id: string | number, data: any): Promise<any> => {
    // Map data từ FE sang BE format
    const payload = {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        parent: data.parent || '',
        description: data.description || '',
        avatar: data.avatar || '',
        status: data.status || 'active',
    };
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, payload, withAuth());
    return response.data;
};

/** Xóa */
export const deleteCategory = async (id: string | number): Promise<any> => {
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