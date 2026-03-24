import { apiApp } from "../../api";
import Cookies from "js-cookie";

const withAuth = () => {
    const token = Cookies.get("token") || Cookies.get("tokenUser");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getClientBoardingPetDiaries = async (bookingId: string) => {
    const response = await apiApp.get('/api/v1/client/boarding-pet-diary', {
        ...withAuth(),
        params: { bookingId }
    });
    return response.data;
};
