import { apiApp } from '../../api';
import Cookies from 'js-cookie';
import { ApiResponse } from '../config/type';

const BASE_URL = '/api/v1/admin/article';

/** Header auth dùng chung */
const withAuth = () => {
    const token = Cookies.get('token');

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

/** Lấy tất cả bài viết */
export const getBlogs = async (): Promise<ApiResponse<any>> => {
    const response = await apiApp.get(`${BASE_URL}/list`, withAuth());
    return response.data;
};

/** Lấy bài viết theo ID */
export const getBlogById = async (id: string | number): Promise<any> => {
    const response = await apiApp.get(`${BASE_URL}/detail/${id}`, withAuth());
    return response.data;
};

/** Tạo bài viết */
export const createBlog = async (data: any): Promise<any> => {
    // Data đã được format đúng từ FE (BlogCreatePage)
    // Chỉ cần đảm bảo slug
    const payload = {
        ...data,
        slug: data.slug || generateSlug(data.name || ''),
        // category và status đã được xử lý ở form/hook
    };
    const response = await apiApp.post(BASE_URL, payload, withAuth());
    return response.data;
};

/** Cập nhật bài viết */
export const updateBlog = async (id: string | number, data: any): Promise<any> => {
    const payload = {
        ...data,
        slug: data.slug || generateSlug(data.name || ''),
    };
    const response = await apiApp.patch(`${BASE_URL}/edit/${id}`, payload, withAuth());
    return response.data;
};

/** Xóa bài viết */
export const deleteBlog = async (id: string | number): Promise<any> => {
    const response = await apiApp.patch(`${BASE_URL}/delete/${id}`, {}, withAuth());
    return response.data;
};

// --- Helper functions ---

/** Generate slug từ title */
const generateSlug = (title: string): string => {
    return title
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

/** Map status từ FE (uppercase) sang BE (lowercase) */
const mapStatusToBackend = (status: string): string => {
    const statusMap: Record<string, string> = {
        'DRAFT': 'draft',
        'PUBLISHED': 'published',
        'ARCHIVED': 'archived',
    };
    return statusMap[status] || 'draft';
};

/** Map status từ BE (lowercase) sang FE (uppercase) */
export const mapStatusToFrontend = (status: string): string => {
    const statusMap: Record<string, string> = {
        'draft': 'DRAFT',
        'published': 'PUBLISHED',
        'archived': 'ARCHIVED',
    };
    return statusMap[status] || 'DRAFT';
};
