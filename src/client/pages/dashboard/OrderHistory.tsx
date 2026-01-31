import { ProductBanner } from "../product/sections/ProductBanner";
import { Link } from "react-router-dom";
import { Sidebar } from "./sections/Sidebar";
import { useEffect, useState } from "react";
import { getOrderList } from "../../api/dashboard.api";
import { formatCurrency } from "../../helpers";
import dayjs from "dayjs";

export const OrderHistoryPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Lịch sử đơn hàng", to: "/dashboard/orders" },
    ];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getOrderList();
                if (response.success) {
                    setOrders(response.orders);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
            case "confirmed":
            case "shipping":
            case "paid":
                return "text-[#05A845]";
            case "pending":
            case "unpaid":
                return "text-[#007BFF]";
            case "cancelled":
            case "returned":
            case "refunded":
                return "text-[#ff0000]";
            default:
                return "text-[#7d7b7b]";
        }
    };

    const getStatusText = (status: string) => {
        const map: any = {
            "pending": "Chờ xác nhận",
            "confirmed": "Đã xác nhận",
            "shipping": "Đang giao hàng",
            "completed": "Giao thành công",
            "cancelled": "Đã hủy",
            "returned": "Trả hàng",
            "unpaid": "Chưa thanh toán",
            "paid": "Đã thanh toán",
            "refunded": "Đã hoàn tiền"
        };
        return map[status] || status;
    };

    const getPaymentMethodText = (method: string) => {
        const map: any = {
            "cod": "COD",
            "money": "Tiền mặt",
            "vnpay": "VNPay",
            "momo": "Momo",
            "zalopay": "ZaloPay",
            "paypal": "PayPal"
        };
        return map[method] || method;
    };

    return (
        <>
            <ProductBanner
                pageTitle="Lịch sử đơn hàng"
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
                            Lịch sử đơn hàng
                        </h3>

                        <div className="border border-[#eee] rounded-[12px] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9F9F9] border-b border-[#eee]">
                                    <tr>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Mã đơn hàng</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Ngày</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Trạng thái</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Thanh toán</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Tổng</th>
                                        <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eee]">
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-[20px] text-center text-[1.6rem]">Đang tải...</td></tr>
                                    ) : orders.length === 0 ? (
                                        <tr><td colSpan={6} className="p-[20px] text-center text-[1.6rem]">Chưa có đơn hàng nào</td></tr>
                                    ) : (
                                        orders.map((order, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-[20px] text-[1.5rem] text-[#7d7b7b]">#{order.code}</td>
                                                <td className="p-[20px] text-[1.5rem] text-[#7d7b7b]">{dayjs(order.createdAt).format("DD/MM/YYYY")}</td>
                                                <td className={`p-[20px] text-[1.5rem] font-[500] ${getStatusColor(order.orderStatus || "pending")}`}>{getStatusText(order.orderStatus || "pending")}</td>
                                                <td className={`p-[20px] text-[1.5rem] font-[500] ${getStatusColor(order.paymentStatus || "unpaid")}`}>
                                                    {getStatusText(order.paymentStatus || "unpaid")} <span className="text-[#7d7b7b] font-[400]">({getPaymentMethodText(order.paymentMethod)})</span>
                                                </td>
                                                <td className="p-[20px] text-[1.5rem] text-[#7d7b7b] font-[500]">{formatCurrency(order.total)}</td>
                                                <td className="p-[20px]">
                                                    <div className="flex flex-col gap-[8px]">
                                                        <Link
                                                            to={`/dashboard/order/detail/${order._id}`}
                                                            className="flex items-center gap-[6px] text-[1.4rem] text-[#7d7b7b] hover:text-client-primary transition-default"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[1.8rem] h-[1.8rem]">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.412 8.1 7.288 5 12 5c4.711 0 8.58 3.1 9.964 6.678a1.012 1.012 0 0 1 0 .644C20.58 15.9 16.711 19 12 19c-4.712 0-8.58-3.1-9.964-6.678Z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                            </svg>
                                                            Xem
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
