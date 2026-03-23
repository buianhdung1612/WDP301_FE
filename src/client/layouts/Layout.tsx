import { Outlet } from "react-router-dom";
import { Header } from "../components/layouts/Header";
import { ScrollToTopButton } from "../components/layouts/ScrollToTopButton";
import "../styles/index.css";
import { useEffect } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { getMe } from "../api/auth.api";

export const Layout = () => {
    const { user, login, isHydrated } = useAuthStore();

    useEffect(() => {
        // Clean up Facebook OAuth fragment
        if (window.location.hash === '#_=_') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        const fetchMe = async () => {
            if (isHydrated && !user) {
                try {
                    const response = await getMe();
                    if (response.success && response.user) {
                        // Token is already in cookie, so we just need to update user in store
                        login(response.user, "");
                    }
                } catch (error) {
                    // Cookie might be expired or missing, ignore
                }
            }
        };

        fetchMe();
    }, [isHydrated, user, login]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1">
                <Outlet />
            </div>
            <ScrollToTopButton />
        </div>
    );
};
