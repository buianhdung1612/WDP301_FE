import { ReactNode } from "react";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Navigate } from "react-router-dom";

interface Props {
    permission?: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export const PermissionGuard = ({ permission, children, fallback }: Props) => {
    const { user, isHydrated } = useAuthStore();

    if (!isHydrated) return null; // Or a loader

    if (!user) {
        return <Navigate to="/admin/auth/login" replace />;
    }

    if (permission) {
        const userPermissions = user.permissions || [];
        const hasPermission = userPermissions.some((p: string) => p.trim() === permission.trim());

        if (!hasPermission) {
            return (fallback as any) || (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h2 className="text-2xl font-bold text-red-500">Không có quyền truy cập</h2>
                    <p className="text-gray-600">Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên.</p>
                </div>
            );
        }
    }

    return <>{children}</>;
};
