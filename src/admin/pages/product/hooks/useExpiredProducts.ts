import { useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getExpiredProducts } from '../../../api/product.api';

export const useExpiredProducts = () => {
    const [paginationModel, setPaginationModel] = useState({
        page: 1,
        limit: 10,
    });

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['expired-products', paginationModel],
        queryFn: () => getExpiredProducts({
            page: paginationModel.page,
            limit: paginationModel.limit,
        }),
        placeholderData: keepPreviousData,
    });

    const expiredProducts = useMemo(() => {
        if (!data?.data?.recordList) return [];

        return data.data.recordList.map((item: any) => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
            discardedAt: item.discardedAt ? new Date(item.discardedAt) : new Date(),
        }));
    }, [data]);

    const pagination = data?.data?.pagination || {
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
    };

    return {
        expiredProducts,
        pagination,
        isLoading,
        error,
        refetch,
        setPage: (page: number) => setPaginationModel(prev => ({ ...prev, page })),
        setLimit: (limit: number) => setPaginationModel(prev => ({ ...prev, limit, page: 1 })),
    };
};
