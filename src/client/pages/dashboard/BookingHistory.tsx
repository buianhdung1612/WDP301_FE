import { ProductBanner } from "../product/sections/ProductBanner";
import { Link } from "react-router-dom";
import { Sidebar } from "./sections/Sidebar";
import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../../api/booking.api";
import { formatCurrency } from "../../helpers";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { CancelModal } from "../../components/ui/CancelModal";


export const BookingHistoryPage = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCanceling, setIsCanceling] = useState(false);
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; booking: any }>({ isOpen: false, booking: null });

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Lịch sử dịch vụ", to: "/dashboard/bookings" },
    ];

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await getMyBookings();
            if (response.code === 200) {
                setBookings(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = (booking: any) => {
        setCancelModal({ isOpen: true, booking });
    };

    const onConfirmCancel = async (reason: string) => {
        const booking = cancelModal.booking;
        if (!booking) return;
        setIsCanceling(true);
        setCancelModal({ isOpen: false, booking: null });
        try {
            const res = await cancelBooking(booking._id, reason);
            if (res.code === 200) {
                toast.success(res.message || "Hủy lịch đặt thành công!");
                fetchBookings();
            } else {
                toast.error(res.message || "Hủy lịch đặt thất bại!");
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra!");
        } finally {
            setIsCanceling(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700";
            case "confirmed":
                return "bg-blue-100 text-blue-700";
            case "pending":
                return "bg-orange-100 text-orange-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            case "in-progress":
                return "bg-yellow-100 text-yellow-700";
            case "delayed":
                return "bg-purple-100 text-purple-700";
            case "no-show":
                return "bg-gray-100 text-gray-700";
            case "request_cancel":
                return "bg-orange-100 text-orange-700 border border-orange-200";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusText = (status: string) => {
        const map: any = {
            "pending": "Đang chờ",
            "confirmed": "Đã xác nhận",
            "completed": "Hoàn thành",
            "cancelled": "Đã hủy",
            "no-show": "Không đến",
            "in-progress": "Đang thực hiện",
            "delayed": "Trễ hẹn",
            "request_cancel": "Chờ duyệt hủy/hoàn tiền"
        };
        return map[status] || status;
    };

    return (
        <>
            <ProductBanner
                pageTitle="Lịch sử dịch vụ"
                breadcrumbs={breadcrumbs}
                url="https://pawsitive.bold-themes.com/coco/wp-content/uploads/sites/3/2019/07/blog_standard_05.jpg"
                className="bg-center"
            />

            <div className="mt-[-150px] mb-[100px] app-container flex items-stretch">
                <div className="w-[25%] px-[12px] flex">
                    <Sidebar />
                </div>
                <div className="w-[75%] px-[12px]">
                    <div className="mt-[100px] p-[35px] bg-white shadow-[0px_8px_24px_#959da533] rounded-[12px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[24px] font-black text-[#181818]">
                                Lịch sử đặt lịch
                            </h3>
                            <Link
                                to="/services"
                                className="bg-client-primary text-white px-6 py-2.5 rounded-full font-bold text-[14px] hover:scale-105 transition-all shadow-lg shadow-orange-100"
                            >
                                + Đặt lịch mới
                            </Link>
                        </div>

                        <div className="border border-[#eee] rounded-[12px] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9F9F9] border-b border-[#eee]">
                                    <tr>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Mã đặt lịch</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Dịch vụ</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Ngày giờ</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Bé cưng</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Trạng thái</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Tổng tiền</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eee]">
                                    {loading ? (
                                        <tr><td colSpan={7} className="p-[20px] text-center text-[16px]">Đang tải...</td></tr>
                                    ) : bookings.length === 0 ? (
                                        <tr><td colSpan={7} className="p-[20px] text-center text-[16px]">Chưa có lịch đặt nào</td></tr>
                                    ) : (
                                        bookings.map((booking, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-[20px] text-[15px] text-[#7d7b7b]">#{booking.code}</td>
                                                <td className="p-[20px] text-[15px] font-[500] text-client-secondary">
                                                    {booking.serviceId?.name || "N/A"}
                                                </td>
                                                <td className="p-[20px] text-[15px] text-[#7d7b7b]">
                                                    <div className="font-[500]">{dayjs(booking.start).format("DD/MM/YYYY")}</div>
                                                    <div className="text-[13px]">{dayjs(booking.start).format("HH:mm")}</div>
                                                </td>
                                                <td className="p-[20px] text-[15px] text-[#7d7b7b]">
                                                    {booking.petIds?.map((pet: any) => pet.name).join(", ") || "N/A"}
                                                </td>
                                                <td className="p-[20px]">
                                                    <span className={`px-3 py-1 rounded-full text-[12px] font-[600] ${getStatusColor(booking.bookingStatus)}`}>
                                                        {getStatusText(booking.bookingStatus)}
                                                    </span>
                                                </td>
                                                <td className="p-[20px] text-[15px] text-client-primary font-[600]">
                                                    {formatCurrency(booking.total || 0)}
                                                </td>
                                                <td className="p-[20px]">
                                                    <div className="flex flex-col gap-2">
                                                        <Link
                                                            to={`/dashboard/booking/detail/${booking._id}`}
                                                            className="text-[14px] text-client-primary hover:underline font-[500]"
                                                        >
                                                            Chi tiết
                                                        </Link>
                                                        {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") && (
                                                            <button
                                                                onClick={() => handleCancelBooking(booking)}
                                                                disabled={isCanceling}
                                                                className="text-[14px] text-red-500 hover:underline font-[500] cursor-pointer text-left disabled:opacity-50"
                                                            >
                                                                Hủy lịch
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <CancelModal
                isOpen={cancelModal.isOpen}
                onClose={() => setCancelModal({ isOpen: false, booking: null })}
                onConfirm={onConfirmCancel}
                title="Lý Do Hủy Lịch"
                confirmText="HỦY LỊCH ĐẶT"
                isBooking={true}
                paymentStatus={cancelModal.booking?.paymentStatus}
            />
        </>
    );
};
