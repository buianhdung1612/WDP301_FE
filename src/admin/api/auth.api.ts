import { LoginFormValues } from "../schemas/login.schema";
import { apiApp } from "../../api";

export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        expiresAt: string;
    };
    timestamp: string;
    statusCode?: number;
}

export const login = async (data: LoginFormValues): Promise<LoginResponse> => {
    const response = await apiApp.post("/api/auth/login", data);
    return response.data;
};
