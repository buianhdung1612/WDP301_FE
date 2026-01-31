import { useState, useEffect } from "react";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { useParams, Link } from "react-router-dom";
import { MessageText, Star, Xmark, NavArrowRight, MediaImage } from "iconoir-react";
import { getOrderDetail } from "../../api/dashboard.api";
import { formatCurrency } from "../../helpers";
import dayjs from "dayjs";

import { exportInvoicePdf } from "../../api/order.api";
import { toast } from "react-toastify";

export const OrderDetailPage = () => {
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: `Chi tiết đơn hàng`, to: `/dashboard/order/detail/${id}` },
    ];

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                const response = await getOrderDetail(id);
                if (response.success) {
                    setOrder(response.order);
                }
            } catch (error) {
                console.error("Failed to fetch order detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handleExportInvoice = async () => {
        if (!order) return;
        setExporting(true);
        try {
            const blob = await exportInvoicePdf(order.code, order.phone);

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${order.code}.pdf`);

            // Append to html link element page and click
            document.body.appendChild(link);
            link.click();

            // Clean up and remove the link
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            toast.success("Đã tải xuống hóa đơn!");
        } catch (error) {
            console.error("Failed to export invoice:", error);
            toast.error("Xuất hóa đơn thất bại!");
        } finally {
            setExporting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
            case "confirmed":
            case "shipping":
                return "text-[#05A845]";
            case "pending":
            case "unpaid":
                return "text-[#007BFF]";
            case "cancelled":
            case "returned":
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

    if (loading) return <div className="p-10 text-center text-[1.6rem]">Đang tải...</div>;
    if (!order) return <div className="p-10 text-center text-[1.6rem]">Không tìm thấy đơn hàng!</div>;

    return (
        <>
            <ProductBanner
                pageTitle={`Chi tiết đơn hàng`}
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
                        <div className="flex justify-between items-center mb-[25px]">
                            <h3 className="text-[2.4rem] font-[600] text-client-secondary">
                                Chi tiết đơn hàng
                            </h3>
                            <Link className="relative overflow-hidden group bg-client-primary rounded-[8px] px-[25px] py-[15px] font-[500] text-[1.4rem] text-white flex items-center gap-[8px] cursor-pointer" to={"/dashboard/orders"}>
                                <span className="relative z-10">Trở lại</span>
                                <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                            </Link>
                        </div>

                        <div className="">
                            <div className="border border-[#eee] rounded-[12px] w-full">
                                <div className="flex justify-between items-center p-[30px] mb-[40px]">
                                    <div className="flex items-center gap-[15px]">
                                        <img src="https://i.imgur.com/V2kwkkK.png" alt="" className="w-[150px]" />
                                    </div>
                                    <div className="">
                                        <h2 className="uppercase text-[2.2rem] text-client-secondary font-[700] mb-[15px]">Hóa đơn</h2>
                                        <p className="text-[#7d7b7b] text-[1.5rem] mb-[5px]">Mã đơn hàng: #{order.code}</p>
                                        <p className="text-[#7d7b7b] text-[1.5rem] mb-[5px]">Ngày: {dayjs(order.createdAt).format("DD-MM-YYYY HH:mm")}</p>
                                        <div className="flex flex-col gap-[5px] mb-[20px]">
                                            <p className="text-[1.5rem] flex items-center gap-[5px]">
                                                <span className="text-[#7d7b7b]">Trạng thái đơn: </span>
                                                <span className={`font-[500] ${getStatusColor(order.orderStatus)}`}>{getStatusText(order.orderStatus)}</span>
                                            </p>
                                            <p className="text-[1.5rem] flex items-center gap-[5px]">
                                                <span className="text-[#7d7b7b]">Thanh toán: </span>
                                                <span className={`font-[500] ${getStatusColor(order.paymentStatus)}`}>{getStatusText(order.paymentStatus)}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleExportInvoice}
                                            disabled={exporting}
                                            className="bg-client-primary hover:bg-client-secondary transition-default text-white font-[600] text-[1.4rem] py-[15px] px-[25px] rounded-[6px] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {exporting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                            Xuất hóa đơn
                                        </button>
                                    </div>
                                </div>

                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F9F9F9] border-y border-[#eee]">
                                            <th className="py-[15px] px-[20px] text-[1.6rem] font-[600] text-client-secondary border-r border-[#eee]">Tên sản phẩm</th>
                                            <th className="py-[15px] px-[20px] text-[1.6rem] font-[600] text-client-secondary border-r border-[#eee]">Giá</th>
                                            <th className="py-[15px] px-[20px] text-[1.6rem] font-[600] text-client-secondary border-r border-[#eee] text-center">Số lượng</th>
                                            <th className="py-[15px] px-[20px] text-[1.6rem] font-[600] text-client-secondary">Tổng cộng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#eee] border-b border-[#eee]">
                                        {order.items?.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="py-[15px] px-[20px] text-[1.5rem] text-[#7d7b7b] border-r border-[#eee] underline cursor-pointer hover:text-client-primary transition-colors">{item.product_id || item.productName || "Sản phẩm"}</td>
                                                <td className="py-[15px] px-[20px] text-[1.5rem] text-[#7d7b7b] border-r border-[#eee]">{formatCurrency(item.price)}</td>
                                                <td className="py-[15px] px-[20px] text-[1.5rem] text-[#7d7b7b] border-r border-[#eee] text-center">{item.quantity}</td>
                                                <td className="py-[15px] px-[20px] text-[1.5rem] text-[#7d7b7b]">
                                                    <div className="flex items-center justify-between">
                                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                                        <button
                                                            onClick={() => setIsModalOpen(true)}
                                                            className="flex items-center gap-[5px] transition-colors font-[500] group cursor-pointer"
                                                        >
                                                            <MessageText className="w-[1.6rem] h-[1.6rem] text-client-primary" />
                                                            <span className="text-client-secondary group-hover:text-client-primary transition-colors">Viết đánh giá</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="pt-[60px] px-[30px] pb-[30px]">
                                    <h3 className="text-[1.8rem] font-[700] text-client-secondary mb-[15px]">Thông tin thanh toán</h3>
                                    <div className="space-y-[8px]">
                                        <p className="text-[1.5rem] text-[#7d7b7b] flex gap-[10px]"><span className="text-client-secondary font-[600] min-w-[100px]">Họ tên:</span> {order.fullName}</p>
                                        <p className="text-[1.5rem] text-[#7d7b7b] flex gap-[10px]"><span className="text-client-secondary font-[600] min-w-[100px]">Địa chỉ:</span> {order.address}</p>
                                        <p className="text-[1.5rem] text-[#7d7b7b] flex gap-[10px]"><span className="text-client-secondary font-[600] min-w-[100px]">SĐT:</span> {order.phone}</p>
                                        <p className="text-[1.5rem] text-[#7d7b7b] flex gap-[10px]"><span className="text-client-secondary font-[600] min-w-[100px]">Phương thức:</span> {order.paymentMethod === "cod" || order.paymentMethod === "money" ? "Thanh toán khi nhận hàng" : order.paymentMethod}</p>
                                        <p className="text-[1.5rem] text-[#7d7b7b] flex gap-[10px]"><span className="text-client-secondary font-[600] min-w-[100px]">Tổng tiền:</span> {formatCurrency(order.total)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-[20px] bg-black/50 backdrop-blur-[2px]">
                    <div className="bg-white w-full max-w-[800px] rounded-[15px] shadow-[0px_20px_60px_rgba(0,0,0,0.15)] relative overflow-visible flex flex-col items-center">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute -top-[15px] -right-[15px] w-[30px] h-[30px] bg-[#E1554E] text-white flex items-center justify-center rounded-[4px] hover:bg-[#c94b45] transition-colors shadow-lg z-10 cursor-pointer"
                        >
                            <Xmark strokeWidth={3} className="w-[1.8rem] h-[1.8rem]" />
                        </button>

                        <div className="w-full p-[40px]">
                            <h2 className="text-[2.8rem] font-[700] text-[#333] mb-[25px]">Đánh giá sản phẩm</h2>

                            {/* Star Rating */}
                            <div className="flex items-center gap-[15px] mb-[30px]">
                                <span className="text-[1.6rem] text-[#777] font-[500]">Đánh giá của bạn:</span>
                                <div className="flex gap-[5px]">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="transition-transform active:scale-90 cursor-pointer"
                                        >
                                            <Star
                                                className={`w-[2.2rem] h-[2.2rem] ${star <= rating ? "fill-orange-400 text-orange-400" : "text-gray-300"}`}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment Textarea */}
                            <div className="relative mb-[30px]">
                                <textarea
                                    placeholder="Viết đánh giá của bạn tại đây"
                                    className="w-full h-[200px] p-[20px] border border-[#ddd] rounded-[8px] text-[1.5rem] text-[#333] outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Image Upload Placeholder */}
                            <div className="mb-[40px]">
                                <div className="w-[70px] h-[70px] border-[2px] border-dashed border-[#ddd] rounded-[8px] flex items-center justify-center text-[#999] cursor-pointer hover:border-client-primary hover:text-client-primary transition-all">
                                    <MediaImage className="w-[2.4rem] h-[2.4rem]" strokeWidth={1.5} />
                                </div>
                            </div>

                            {/* Nút Gửi */}
                            <button className="relative overflow-hidden group bg-client-primary rounded-[8px] px-[25px] py-[15px] font-[600] text-[1.6rem] text-white flex items-center gap-[10px] cursor-pointer transition-all">
                                <span className="relative z-10">Gửi đánh giá</span>
                                <NavArrowRight strokeWidth={3} className="relative z-10 w-[1.8rem] h-[1.8rem] transition-transform duration-300 rotate-[-45deg] group-hover:rotate-0" />
                                <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
