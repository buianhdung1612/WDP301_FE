import { apiApp } from '../../api';

const BASE_URL = `/api/v1/client/product`;

/** Lấy danh sách sản phẩm */
export const getProducts = async () => {
    const response = await apiApp.get(`${BASE_URL}`);
    console.log(response.data);
    return response.data;
};

/** Lấy chi tiết sản phẩm theo slug */
export const getProductBySlug = async (slug: string) => {
    const response = await apiApp.get(`${BASE_URL}/detail/${slug}`);
    return response.data;
};
