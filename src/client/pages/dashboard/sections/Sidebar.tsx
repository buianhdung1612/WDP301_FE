import { Camera, AlignJustify, ShoppingBag, User, Arcade, Heart, Star, Lock, LogOut } from "iconoir-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../stores/useAuthStore";
import { logout as logoutApi } from "../../../api/auth.api";
import { toast } from "react-toastify";
import React, { useState } from "react";
import { changeAvatar } from "../../../api/dashboard.api";
import { uploadImagesToCloudinary } from "../../../../admin/api/uploadCloudinary.api";

export const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const { user, logout, set } = useAuthStore();
    const [uploading, setUploading] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutApi();
            logout();
            toast.success("Đăng xuất thành công!");
            navigate("/auth/login");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi đăng xuất!");
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setUploading(true);
            try {
                const urls = await uploadImagesToCloudinary(Array.from(files));
                if (urls && urls.length > 0) {
                    const newAvatar = urls[0];

                    // Cập nhật giao diện ngay lập tức
                    set({ user: { ...user, avatar: newAvatar } as any });
                    setUploading(false);

                    // Gọi API backend cập nhật ngầm
                    const res = await changeAvatar({ avatar: newAvatar });

                    if (res.success) {
                        toast.success("Cập nhật ảnh đại diện thành công!");
                    } else {
                        toast.error(res.message || "Lỗi cập nhật avatar");
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Lỗi upload ảnh");
                setUploading(false);
            }
        }
    };

    if (!user) return null;

    return (
        <div className="w-full h-full">
            <div className="rounded-[10px] relative shadow-[0px_8px_24px_#959da533] z-[3] h-full bg-white min-h-[600px]">
                <div className="top-[-70px] relative rounded-t-[10px] overflow-hidden">
                    <div className="px-[40px] pt-[40px] pb-[30px] bg-white text-center">
                        <div className="mx-auto w-[150px] h-[150px] shadow-[0px_7px_29px_0px_#64646f33] border-[3px] border-white rounded-full relative group">
                            <img src={user.avatar || "https://i.imgur.com/CgtIu6c.jpeg"} alt="" className="w-full h-full object-cover rounded-full" />
                            <label htmlFor="profile_photo" className="hover:bg-client-primary hover:text-white cursor-pointer transition-default w-[30px] h-[30px] text-[1.2rem] bg-white flex justify-center items-center absolute bottom-[5px] right-[5px] text-[#333] border-[#dddddd] rounded-full z-10">
                                <Camera />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-20">
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <input
                                type="file"
                                id="profile_photo"
                                hidden
                                accept="image/*"
                                onChange={handleAvatarChange}
                                disabled={uploading}
                            />
                        </div>
                        <h3 className="text-[2.2rem] mt-[22px] mb-[5px] font-[600] text-client-secondary uppercase leading-tight">{user.fullName}</h3>
                        <p className="text-[#7d7b7b] font-[500]">{user.email}</p>
                    </div>
                    <ul className="">
                        <li className="bg-[#FFF0F0] text-[1.4rem] my-[10px] font-[500] py-[12px] px-[25px] uppercase text-client-primary border-y border-dashed border-[#dddddd]">Tổng quan</li>
                        <li>
                            <Link to={"/dashboard/overview"} className={`inline-flex items-center gap-[10px] text-[1.5rem] py-[10px] px-[25px] transition-default w-full ${pathname === "/dashboard/overview" ? "text-client-primary" : "text-[#7d7b7b] hover:text-client-primary"}`}>
                                <AlignJustify className="w-[2rem] h-[2rem]" />
                                Tổng quan
                            </Link>
                        </li>
                        <li>
                            <Link to={"/dashboard/orders"} className={`inline-flex items-center gap-[10px] text-[1.5rem] py-[10px] px-[25px] transition-default w-full ${pathname.startsWith("/dashboard/order") ? "text-client-primary" : "text-[#7d7b7b] hover:text-client-primary"}`}>
                                <ShoppingBag className="w-[2rem] h-[2rem]" />
                                Đơn hàng
                            </Link>
                        </li>
                        <li className="bg-[#FFF0F0] text-[1.4rem] my-[10px] font-[500] py-[12px] px-[25px] uppercase text-client-primary border-y border-dashed border-[#dddddd]">Cài đặt tài khoản</li>
                        <li>
                            <Link to={"/dashboard/profile"} className={`inline-flex items-center gap-[10px] text-[1.5rem] py-[10px] px-[25px] transition-default w-full ${pathname === "/dashboard/profile" || pathname === "/dashboard/profile/edit" ? "text-client-primary" : "text-[#7d7b7b] hover:text-client-primary"}`}>
                                <User className="w-[2rem] h-[2rem]" />
                                Thông tin cá nhân
                            </Link>
                        </li>
                        <li>
                            <Link to={"/dashboard/address"} className={`inline-flex items-center gap-[10px] text-[1.5rem] py-[10px] px-[25px] transition-default w-full ${pathname.startsWith("/dashboard/address") ? "text-client-primary" : "text-[#7d7b7b] hover:text-client-primary"}`}>
                                <Arcade className="w-[2rem] h-[2rem]" />
                                Địa chỉ
                            </Link>
                        </li>
                        <li>
                            <Link to={"/dashboard/wishlist"} className={`inline-flex items-center gap-[10px] text-[1.5rem] py-[10px] px-[25px] transition-default w-full ${pathname === "/dashboard/wishlist" ? "text-client-primary" : "text-[#7d7b7b] hover:text-client-primary"}`}>
                                <Heart className="w-[2rem] h-[2rem]" />
                                Yêu thích
                            </Link>
                        </li>
                        <li>
                            <Link to={"/dashboard/review"} className={`inline-flex items-center gap-[10px] text-[1.5rem] py-[10px] px-[25px] transition-default w-full ${pathname === "/dashboard/review" ? "text-client-primary" : "text-[#7d7b7b] hover:text-client-primary"}`}>
                                <Star className="w-[2rem] h-[2rem]" />
                                Đánh giá
                            </Link>
                        </li>
                        <li>
                            <Link to={"/dashboard/change-password"} className={`inline-flex items-center gap-[10px] text-[1.5rem] py-[10px] px-[25px] transition-default w-full ${pathname === "/dashboard/change-password" ? "text-client-primary" : "text-[#7d7b7b] hover:text-client-primary"}`}>
                                <Lock className="w-[2rem] h-[2rem]" />
                                Đổi mật khẩu
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-[10px] text-[1.5rem] py-[10px] px-[25px] text-[#7d7b7b] hover:text-client-primary transition-default w-full"
                            >
                                <LogOut className="w-[2rem] h-[2rem]" />
                                Đăng xuất
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
