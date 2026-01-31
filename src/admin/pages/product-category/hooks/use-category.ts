import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory } from '../../../api/product-category.api';

export const useCategories = () => {
    // Hook lấy danh sách danh mục
    return useQuery({
        queryKey: ['product-categories'],
        queryFn: getCategories,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product-categories'] });
        },
    });
};