import { apiApp } from "../../api";
import Cookies from "js-cookie";

const withAuth = () => {
    const token = Cookies.get("tokenAdmin");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getBoardingPetDiaries = async (params: { bookingId?: string; petId?: string; date?: string }) => {
    return apiApp.get('/api/v1/admin/boarding-pet-diary', { ...withAuth(), params });
};

export const upsertBoardingPetDiary = async (payload: any) => {
    return apiApp.post('/api/v1/admin/boarding-pet-diary/upsert', payload, withAuth());
};
