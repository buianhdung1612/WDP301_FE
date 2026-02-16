import { ProductBanner } from "../product/sections/ProductBanner";
import { Link } from "react-router-dom";
import { Sidebar } from "./sections/Sidebar";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { formatCurrency } from "../../helpers";
import { getBoardingBookingList } from "../../api/dashboard.api";

export const BoardingBookingHistoryPage = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Lịch khách sạn", to: "/dashboard/boarding-bookings" },
    ];

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await getBoardingBookingList();
                if (Array.isArray(response)) {
                    setBookings(response);
                } else if (Array.isArray(response?.data)) {
                    setBookings(response.data);
                } else {
                    setBookings([]);
                }
            } catch (error) {
                console.error("Failed to fetch boarding bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
            case "checked-in":
            case "checked-out":
                return "text-[#05A845]";
            case "held":
            case "pending":
                return "text-[#007BFF]";
            case "cancelled":
                return "text-[#ff0000]";
            default:
                return "text-[#7d7b7b]";
        }
    };

    const getStatusText = (status: string) => {
        const map: Record<string, string> = {
            held: "Đang giữ",
            pending: "Chờ xử lý",
            confirmed: "Đã xác nhận",
            "checked-in": "Đã nhận phòng",
            "checked-out": "Đã trả phòng",
            cancelled: "Đã hủy",
        };
        return map[status] || status;
    };

    const getPaymentStatusText = (status: string) => {
        const map: Record<string, string> = {
            unpaid: "Chưa thanh toán",
            partial: "Thanh toán một phần",
            paid: "Đã thanh toán",
        };
        return map[status] || status;
    };

    const getPaymentMethodText = (method: string) => {
        const map: Record<string, string> = {
            pay_at_site: "Tại quầy",
            prepaid: "Thanh toán trước",
        };
        return map[method] || method || "-";
    };

    return (
        <>
            <ProductBanner
                pageTitle="Lịch khách sạn"
                breadcrumbs={breadcrumbs}
                url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
                className="bg-top"
            />

            <div className="mt-[-150px] mb-[100px] w-[1600px] mx-auto flex items-stretch">
                <div className="w-[25%] px-[12px] flex">
                    <Sidebar />
                </div>
                <div className="w-[75%] px-[12px]">
                    <div className="mt-[100px] p-[35px] bg-white shadow-[0px_8px_24px_#959da533] rounded-[12px]">
                        <h3 className="text-[2.4rem] font-[600] text-client-secondary mb-[25px]">
                            Quản lý lịch khách sạn
                        </h3>

                        <div className="border border-[#eee] rounded-[12px] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9F9F9] border-b border-[#eee]">
                                    <tr>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Mã lịch</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Ngày nhận</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Ngày trả</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Trạng thái</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Thanh toán</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Tổng tiền</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eee]">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="p-[20px] text-center text-[1.6rem]">Đang tải...</td>
                                        </tr>
                                    ) : bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-[20px] text-center text-[1.6rem]">Chưa có lịch khách sạn</td>
                                        </tr>
                                    ) : (
                                        bookings.map((booking, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-[20px] text-[1.5rem] text-[#7d7b7b]">
                                                    {booking.boardingBookingCode || booking._id}
                                                </td>
                                                <td className="p-[20px] text-[1.5rem] text-[#7d7b7b]">
                                                    {booking.checkInDate ? dayjs(booking.checkInDate).format("DD/MM/YYYY") : "-"}
                                                </td>
                                                <td className="p-[20px] text-[1.5rem] text-[#7d7b7b]">
                                                    {booking.checkOutDate ? dayjs(booking.checkOutDate).format("DD/MM/YYYY") : "-"}
                                                </td>
                                                <td className={`p-[20px] text-[1.5rem] font-[500] ${getStatusColor(booking.status)}`}>
                                                    {getStatusText(booking.status)}
                                                </td>
                                                <td className="p-[20px] text-[1.5rem] text-[#7d7b7b]">
                                                    {getPaymentStatusText(booking.paymentStatus)} ({getPaymentMethodText(booking.paymentMethod)})
                                                </td>
                                                <td className="p-[20px] text-[1.5rem] text-[#7d7b7b] font-[500]">
                                                    {formatCurrency(booking.totalPrice || 0)}
                                                </td>
                                                <td className="p-[20px]">
                                                    <div className="flex flex-col gap-[6px]">
                                                        <Link
                                                            to={`/dashboard/boarding-bookings/${booking._id}`}
                                                            className="inline-flex items-center gap-[6px] text-[1.4rem] text-[#7d7b7b] hover:text-client-primary transition-default"
                                                        >
                                                            Xem lịch
                                                        </Link>
                                                        <Link
                                                            to={`/khach-san/${booking.cageId}`}
                                                            className="inline-flex items-center gap-[6px] text-[1.3rem] text-[#9b9b9b] hover:text-client-primary transition-default"
                                                        >
                                                            Xem chuồng
                                                        </Link>
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
        </>
    );
};
