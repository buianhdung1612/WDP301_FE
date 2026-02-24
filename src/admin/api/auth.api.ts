import { LoginFormValues } from "../schemas/login.schema";
import { apiApp } from "../../api";

export interface LoginResponse {
    code: number;
    message: string;
    data?: {
        id: string;
        fullName: string;
        email: string;
        token: string;
        avatar?: string;
        permissions: string[];
        roles?: any[];
    };
}

export const login = async (data: LoginFormValues): Promise<LoginResponse> => {
    const response = await apiApp.post("/api/v1/admin/auth/login", {
        email: data.usernameOrEmail,
        password: data.password
    });
    return response.data;
};

export const getMe = async (): Promise<LoginResponse> => {
    const response = await apiApp.get("/api/v1/admin/auth/me");
    return response.data;
};

export const logout = async (): Promise<{ code: number; message: string }> => {
    const response = await apiApp.post("/api/v1/admin/auth/logout");
    return response.data;
};
