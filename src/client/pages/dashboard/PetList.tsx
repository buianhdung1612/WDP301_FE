import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { useAuthStore } from "../../../stores/useAuthStore";
import { getMyPets, deletePet } from "../../api/pet.api";
import { Trash2, Edit3, Info, Camera } from "lucide-react";

export const PetListPage = () => {
    const { user, isHydrated } = useAuthStore();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/overview" },
        { label: "Danh sách thú cưng", to: `/dashboard/pet` },
    ];

    const fetchPets = async () => {
        try {
            const response = await getMyPets();
            if (response.code === 200) {
                setPets(response.data);
            }
        } catch (error) {
            console.error("Error fetching pets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPets();
        }
    }, [user]);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bé ${name}?`)) {
            try {
                const response = await deletePet(id);
                if (response.code === 200) {
                    toast.success(response.message || "Đã xóa thú cưng");
                    setPets(pets.filter(item => item._id !== id));
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                toast.error("Đã có lỗi xảy ra!");
            }
        }
    }

    if (!isHydrated) return null;

    if (!user) {
        return (
            <>
                <ProductBanner
                    pageTitle="Tài khoản"
                    breadcrumbs={breadcrumbs}
                    url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
                    className="bg-top"
                />
                <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 bg-[#f9f9f9]">
                    <p className="text-[18px] text-client-secondary">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
                    <Link to="/auth/login" className="bg-client-secondary text-white px-8 py-3 rounded-full text-[16px] hover:bg-client-primary transition-all">Đăng nhập ngay</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <ProductBanner
                pageTitle="Danh sách thú cưng"
                breadcrumbs={breadcrumbs}
                url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
                className="bg-top"
            />

            <div className="mt-[-150px] mb-[100px] app-container flex items-stretch">
                <div className="w-[25%] px-[12px] flex">
                    <Sidebar />
                </div>
                <div className="w-[75%] px-[12px]">
                    <div className="mt-[100px] p-[35px] bg-white shadow-[0px_8px_24px_#959da533] rounded-[12px]">
                        <div className="flex items-center justify-between mb-[30px]">
                            <div>
                                <h3 className="text-[26px] font-[700] text-client-secondary uppercase leading-tight">Thú cưng của tôi</h3>
                                <p className="text-[15px] text-[#7d7b7b] mt-[5px]">Quản lý thông tin các bé cưng để đặt lịch nhanh hơn.</p>
                            </div>
                            <Link
                                className="relative overflow-hidden group bg-client-primary rounded-[50px] px-[30px] py-[14px] font-[600] text-[15px] text-white flex items-center gap-[10px] shadow-sm hover:shadow-md transition-all active:scale-95"
                                to={"/dashboard/pet/create"}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Thêm bé mới
                                </span>
                                <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="py-[100px] text-center">
                                <div className="inline-block w-12 h-12 border-4 border-client-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-[16px] text-gray-500 font-medium">Đang tải danh sách bé cưng...</p>
                            </div>
                        ) : pets.length > 0 ? (
                            <div className="grid grid-cols-2 gap-[25px] mt-[10px]">
                                {pets.map((item) => (
                                    <div key={item._id} className="group relative bg-[#fcfcfc] border border-[#eee] rounded-[24px] p-[25px] transition-all duration-300 hover:shadow-[0px_12px_32px_rgba(0,0,0,0.06)] hover:border-client-primary/20 hover:-translate-y-1">
                                        <div className="flex gap-[25px]">
                                            <div className="w-[100px] h-[100px] rounded-[20px] overflow-hidden bg-white border border-[#eee] shadow-sm">
                                                {item.avatar ? (
                                                    <img
                                                        src={item.avatar}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
                                                        <Camera className="w-8 h-8 opacity-50" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-[20px] font-[700] text-client-secondary leading-tight">{item.name}</h4>
                                                    <div className="px-[12px] py-[4px] rounded-full bg-client-primary/10 text-client-primary text-[12px] font-[700] uppercase">
                                                        {item.type === 'dog' ? 'Chó' : 'Mèo'}
                                                    </div>
                                                </div>
                                                <div className="mt-[10px] space-y-[6px]">
                                                    <div className="flex items-center gap-2 text-[14px] text-[#637381]">
                                                        <span className="font-semibold text-client-secondary">Giống:</span> {item.breed || "Không rõ"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[14px] text-[#637381]">
                                                        <span className="font-semibold text-client-secondary">Cân nặng:</span> {item.weight || "?"} kg
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-[20px] pt-[20px] border-t border-dashed border-[#ddd] flex items-center justify-end gap-[15px] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to={`/dashboard/pet/edit/${item._id}`}
                                                className="flex items-center gap-1.5 text-[14px] font-[600] text-client-secondary hover:text-client-primary transition-colors"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                                Chỉnh sửa
                                            </Link>
                                            <div className="w-[1px] h-[14px] bg-gray-300"></div>
                                            <button
                                                onClick={() => handleDelete(item._id, item.name)}
                                                className="flex items-center gap-1.5 text-[14px] font-[600] text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                Xóa bé
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-[100px] text-center bg-[#fcfcfc] rounded-[24px] border-2 border-dashed border-[#eee]">
                                <div className="w-[80px] h-[80px] bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                    <Info className="w-12 h-12" />
                                </div>
                                <h4 className="text-[18px] font-[600] text-client-secondary">Chưa có bé cưng nào</h4>
                                <p className="text-[15px] text-[#7d7b7b] mt-2 mb-8">Hãy thêm thông tin bé cưng của bạn để chúng mình tiện chăm sóc nhé!</p>
                                <Link
                                    className="bg-client-primary text-white px-10 py-4 rounded-full text-[16px] font-[700] hover:bg-client-secondary transition-all shadow-sm"
                                    to={"/dashboard/pet/create"}
                                >
                                    Thêm ngay bây giờ
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
