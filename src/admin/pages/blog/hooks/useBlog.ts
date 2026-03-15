import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBlogs, createBlog, getBlogById, updateBlog, deleteBlog } from '../../../api/blog.api';
import { ApiResponse } from '../../../config/type';

export const useBlogs = (params?: any) => {
    return useQuery({
        queryKey: ['blogs', params],
        queryFn: () => getBlogs(params),
        select: (res: ApiResponse<any>) => {
            const data = res.data;
            let records: any[] = [];
            let pagination = { totalRecords: 0 };

            if (data && typeof data === 'object' && 'recordList' in data) {
                records = data.recordList || [];
                pagination = data.pagination || { totalRecords: 0 };
            } else if (Array.isArray(data)) {
                records = data;
            }

            return {
                recordList: records.map((item: any) => ({
                    ...item,
                    id: item._id,
                    title: item.name,
                    excerpt: item.description,
                    featuredImage: item.avatar,
                    viewCount: item.view || 0,
                    status: (item.status || 'draft').toLowerCase(),
                })),
                pagination
            };
        },
    });
};

export const useCreateBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBlog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });
};

export const useUpdateBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) => updateBlog(id, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['blogs'] });
                queryClient.invalidateQueries({ queryKey: ['blog'] });
            }
        },
    });
};

export const useBlogDetail = (id?: string | number) => {
    return useQuery({
        queryKey: ['blog', id],
        queryFn: () => getBlogById(id!),
        enabled: !!id,
        select: (res: any) => {
            const data = res.data || res;
            if (data) {
                return {
                    ...data,
                    id: data._id,
                    title: data.name,
                    excerpt: data.description,
                    featuredImage: data.avatar,
                    status: (data.status || 'draft').toLowerCase(),
                    category: data.category || [],
                };
            }
            return null;
        },
    });
};

export const useDeleteBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBlog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });
};






