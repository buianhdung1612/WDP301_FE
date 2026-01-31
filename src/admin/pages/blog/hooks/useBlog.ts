import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBlogs, createBlog, getBlogById, updateBlog, deleteBlog, mapStatusToFrontend } from '../../../api/blog.api';
import { ApiResponse } from '../../../config/type';

export const useBlogs = () => {
    return useQuery({
        queryKey: ['blogs'],
        queryFn: getBlogs,
        select: (res: ApiResponse<any>) => {
            const data = res.data;
            let records: any[] = [];

            // BE mới trả về { recordList, pagination }
            if (data && typeof data === 'object' && 'recordList' in data && Array.isArray(data.recordList)) {
                records = data.recordList;
            } else if (Array.isArray(data)) {
                records = data;
            }

            return records.map((item: any) => ({
                ...item,
                id: item._id,
                title: item.name,
                excerpt: item.description,
                featuredImage: item.avatar,
                viewCount: item.view || 0,
                status: item.status || 'draft',
            }));
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
                    status: data.status || 'draft',
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

// --- TAGS HOOKS ---
// Note: BE mới chưa có API cho blog tags, tạm thời return empty
export const useBlogTags = () => {
    return useQuery({
        queryKey: ['blog-tags'],
        queryFn: async () => ({ success: true, message: 'Success', timestamp: new Date().toISOString(), data: [] }),
        select: (res: ApiResponse<any>) => res.data || [],
    });
};

export const useCreateBlogTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string }) => {
            // TODO: Implement when BE API is ready
            console.log('Creating blog tag:', data);
            return { success: true, message: 'Tag created' };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
        },
    });
};

export const useDeleteBlogTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string | number) => {
            // TODO: Implement when BE API is ready
            console.log('Deleting blog tag:', id);
            return { success: true, message: 'Tag deleted' };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
        },
    });
};
