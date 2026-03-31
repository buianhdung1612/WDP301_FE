import { useMutation } from "@tanstack/react-query";
import { login, LoginResponse } from "../../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Cookies from "js-cookie";

import { useAuthStore } from "../../../../stores/useAuthStore";

export const useLogin = () => {
    const navigate = useNavigate();
    const loginStore = useAuthStore(state => state.login);

    return useMutation({
        mutationFn: login,
        onSuccess: (response: LoginResponse) => {
            if (response.code === 200 && response.data?.token) {
                const { token, ...userInfo } = response.data;

                // Store in AuthStore
                loginStore(userInfo, token);

                Cookies.set("tokenAdmin", token, {
                    expires: 1,        // 1 ngày
                    secure: false,
                    sameSite: "lax"
                });

                toast.success(response.message);
                setTimeout(() => {
                    const isStaff = userInfo.roles?.some((role: any) => role.isStaff);
                    if (isStaff) {
                        navigate("/admin/staff/tasks");
                    } else {
                        navigate("/admin/dashboard/system");
                    }
                }, 1000);
            } else {
                toast.error(response.message || "Đăng nhập thất bại!");
            }
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "Đăng nhập thất bại!";
            toast.error(errorMessage);
        }
    });
};




