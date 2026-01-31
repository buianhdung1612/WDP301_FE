import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductBySlug } from '../api/product.api';

export const useProducts = () => {
    return useQuery({
        queryKey: ['client-products'],
        queryFn: getProducts,
        select: (res) => res.data,
    });
};

export const useProductDetail = (slug: string) => {
    return useQuery({
        queryKey: ['client-product', slug],
        queryFn: () => getProductBySlug(slug),
        enabled: !!slug,
        select: (res) => res.data,
    });
};
