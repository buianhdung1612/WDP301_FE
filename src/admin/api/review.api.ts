import { apiApp } from "../../api";

export const getReviews = async (params: any) => {
    const response = await apiApp.get("/api/v1/admin/review", { params });
    return response.data;
};

export const changeReviewStatus = async (id: string, status: string) => {
    const response = await apiApp.patch(`/api/v1/admin/review/change-status/${id}`, { status });
    return response.data;
};

export const deleteReview = async (id: string) => {
    const response = await apiApp.delete(`/api/v1/admin/review/delete/${id}`);
    return response.data;
};
