import { useState, useEffect, useCallback } from "react";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMyBooking, exportBookingPdf, cancelBooking } from "../../api/booking.api";
import { formatCurrency } from "../../helpers";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { CancelModal } from "../../components/ui/CancelModal";

// Timer component to check overtime locally every few seconds
const OvertimeTimer = ({ startedAt, maxDuration }: { startedAt: string, maxDuration: number }) => {
    const [isOver, setIsOver] = useState(false);

    const check = useCallback(() => {
        if (!startedAt || maxDuration <= 0) return;
        const diff = dayjs().diff(dayjs(startedAt), 'minute');
        setIsOver(diff > maxDuration);
    }, [startedAt, maxDuration]);

    useEffect(() => {
        check();
        const interval = setInterval(check, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [check]);

    if (!isOver) return null;

    return (
        <div className="mt-2 text-[11px] text-[#FF5630] font-bold bg-[#FF5630]/5 p-2 rounded-lg border border-[#FF5630]/20 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#FF5630] animate-pulse"></span>
            Dịch vụ đang quá giờ tối đa - có thể phát sinh phụ thu
        </div>
    );
};

export const BookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exporting, setExporting] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const { data: bookingRes, isLoading: loading } = useQuery<any>({
        queryKey: ["booking", id],
        queryFn: () => getMyBooking(id!),
        enabled: !!id,
        refetchInterval: 5000, // Sync every 5 seconds
    });
    const booking = bookingRes?.data;

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Lịch sử dịch vụ", to: "/dashboard/bookings" },
        { label: `Chi tiết đặt lịch`, to: `/dashboard/booking/detail/${id}` },
    ];

    const handleExportPdf = async () => {
        if (!booking) return;
        setExporting(true);
        try {
            const blob = await exportBookingPdf(booking.code, booking.customerPhone);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `booking_${booking.code}.pdf`);
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            toast.success("Đã tải xuống phiếu dịch vụ!");
        } catch (error) {
            console.error("Failed to export booking pdf:", error);
            toast.error("Xuất PDF thất bại!");
        } finally {
            setExporting(false);
        }
    };

    const handleCancelBooking = () => {
        setIsCancelModalOpen(true);
    };

    const onConfirmCancel = async (reason: string) => {
        if (!booking) return;
        setIsCancelModalOpen(false);
        setIsCanceling(true);
        try {
            const res = await cancelBooking(booking._id, reason);
            if (res.code === 200) {
                toast.success(res.message || "Hủy đặt lịch thành công!");
                navigate("/dashboard/bookings");
            } else {
                toast.error(res.message || "Hủy đặt lịch thất bại!");
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra!");
        } finally {
            setIsCanceling(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "text-[#05A845]";
            case "confirmed": return "text-[#007BFF]";
            case "pending": return "text-[#f97316]";
            case "cancelled": return "text-[#ff0000]";
            case "in-progress": return "text-[#FFAB00]";
            case "delayed": return "text-[#FF5630]";
            case "request_cancel": return "text-[#f97316]";
            default: return "text-[#7d7b7b]";
        }
    };

    const getStatusText = (status: string) => {
        const map: any = {
            "pending": "Chờ xác nhận",
            "confirmed": "Đã xác nhận",
            "completed": "Hoàn thành",
            "cancelled": "Đã hủy",
            "delayed": "Trễ giờ",
            "in-progress": "Đang làm",
            "request_cancel": "Chờ duyệt hủy/hoàn tiền"
        };
        return map[status] || status;
    };

    const getPetStatusChip = (status: string, bookingStatus: string) => {
        if (bookingStatus === 'cancelled') return <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded text-[11px] font-bold border border-red-100 uppercase">Đã hủy</span>;

        switch (status) {
            case "completed":
                return <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[11px] font-bold border border-green-100 uppercase">Hoàn thành</span>;
            case "in-progress":
                return <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded text-[11px] font-bold border border-yellow-100 uppercase">Đang làm</span>;
            default:
                return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-100 uppercase">Chờ thực hiện</span>;
        }
    };

    if (loading) return <div className="p-10 text-center text-[16px]">Đang tải...</div>;
    if (!booking) return <div className="p-10 text-center text-[16px]">Không tìm thấy lịch đặt!</div>;

    return (
        <>
            <ProductBanner
                pageTitle="Chi tiết đặt lịch"
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
                        <div className="flex justify-between items-center mb-[25px]">
                            <h3 className="text-[24px] font-[600] text-client-secondary">
                                Chi tiết dịch vụ
                            </h3>
                            <Link className="relative overflow-hidden group bg-client-primary rounded-[8px] px-[25px] py-[15px] font-[500] text-[14px] text-white flex items-center gap-[8px] cursor-pointer" to={"/dashboard/bookings"}>
                                <span className="relative z-10">Trở lại</span>
                                <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                            </Link>
                        </div>

                        <div className="border border-[#eee] rounded-[12px] w-full overflow-hidden">
                            <div className="flex justify-between items-center p-[30px] border-b border-[#eee]">
                                <div className="flex items-center gap-[15px]">
                                    <img src="https://i.imgur.com/V2kwkkK.png" alt="" className="w-[150px]" />
                                </div>
                                <div className="text-right">
                                    <h2 className="uppercase text-[22px] text-client-secondary font-[700] mb-[15px]">PHIẾU DỊCH VỤ</h2>
                                    <p className="text-[#7d7b7b] text-[15px] mb-[5px]">Mã: #{booking.code}</p>
                                    <p className="text-[#7d7b7b] text-[15px] mb-[15px]">Ngày đặt: {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}</p>
                                    <button
                                        onClick={handleExportPdf}
                                        disabled={exporting}
                                        className="bg-client-primary hover:bg-client-secondary transition-default text-white font-[600] text-[14px] py-[15px] px-[25px] rounded-[6px] cursor-pointer disabled:opacity-50 flex items-center gap-2 ml-auto mb-2"
                                    >
                                        {exporting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                        Xuất hóa đơn PDF
                                    </button>
                                    {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") && (
                                        <button
                                            onClick={handleCancelBooking}
                                            disabled={isCanceling}
                                            className="bg-red-500 hover:bg-red-600 transition-default text-white font-[600] text-[14px] py-[15px] px-[25px] rounded-[6px] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ml-auto"
                                        >
                                            {isCanceling && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                            Hủy đặt lịch
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-[30px] p-[30px] border-b border-[#eee] bg-[#fdfdfd]">
                                <div>
                                    <h4 className="font-bold text-client-secondary mb-3 uppercase text-[14px] tracking-wider text-client-primary">Thông tin khách hàng</h4>
                                    <div className="space-y-2">
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Khách hàng:</span> <span className="font-semibold text-client-secondary">{booking.customerName}</span></p>
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Điện thoại:</span> <span className="font-semibold text-client-secondary">{booking.customerPhone}</span></p>
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Ghi chú:</span> <span className="italic text-[#7d7b7b]">{booking.notes || "Không có"}</span></p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-client-secondary mb-3 uppercase text-[14px] tracking-wider text-client-primary">Trạng thái & Thanh toán</h4>
                                    <div className="space-y-2">
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[140px] inline-block font-[500]">Trạng thái:</span> <span className={`font-bold ${getStatusColor(booking.bookingStatus)}`}>{getStatusText(booking.bookingStatus)}</span></p>
                                        <p className="text-[15px]">
                                            <span className="text-[#7d7b7b] w-[140px] inline-block font-[500]">Thanh toán:</span>
                                            <span className={`font-bold uppercase ${booking.paymentStatus === 'paid' ? 'text-[#05A845]' : booking.paymentStatus === 'partially_paid' ? 'text-[#007BFF]' : 'text-red-500'}`}>
                                                {booking.paymentStatus === 'paid' ? 'Đã hoàn thành' : booking.paymentStatus === 'partially_paid' ? 'Đã đặt cọc' : 'Chưa thanh toán'}
                                            </span>
                                        </p>
                                        <p className="text-[15px]">
                                            <span className="text-[#7d7b7b] w-[140px] inline-block font-[500]">Phương thức:</span>
                                            <span className="font-semibold text-client-secondary">
                                                {booking.paymentMethod === 'money' ? 'Tiền mặt tại quầy' : booking.paymentMethod === 'vnpay' ? 'Ví VNPAY' : booking.paymentMethod === 'zalopay' ? 'Ví ZaloPay' : booking.paymentMethod}
                                            </span>
                                        </p>
                                        {booking.depositAmount > 0 && (
                                            <>
                                                <p className="text-[15px]">
                                                    <span className="text-[#7d7b7b] w-[140px] inline-block font-[500]">Tiền đã cọc:</span>
                                                    <span className="font-bold text-[#05A845]">
                                                        {formatCurrency(booking.depositAmount)}
                                                        {booking.depositMethod && (
                                                            <span className="ml-2 text-[12px] font-medium text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded italic">
                                                                (Qua {booking.depositMethod})
                                                            </span>
                                                        )}
                                                    </span>
                                                </p>
                                                {booking.paymentStatus === 'partially_paid' && (
                                                    <p className="text-[15px]">
                                                        <span className="text-[#7d7b7b] w-[140px] inline-block font-[500]">Số tiền còn lại:</span>
                                                        <span className="font-bold text-[#FF5630]">{formatCurrency(booking.total - booking.depositAmount)}</span>
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9F9F9] border-b border-[#eee]">
                                    <tr>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Nội dung dịch vụ</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-center">Ngày thực hiện</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-center">Giờ hẹn</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-right">Tổng cộng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[#eee]">
                                        <td className="p-[20px]">
                                            <p className="font-[600] text-client-secondary text-[16px] mb-3">{booking.serviceId?.name}</p>
                                            <div className="space-y-2">
                                                {booking.petIds?.map((pet: any) => {
                                                    const mapping = booking.petStaffMap?.find((m: any) =>
                                                        (m.petId?._id || m.petId) === pet._id
                                                    );
                                                    const petStatus = mapping?.status || 'pending';
                                                    const surcharge = mapping?.surchargeAmount || 0;

                                                    return (
                                                        <div key={pet._id} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-8 h-8 rounded-full bg-client-primary/10 flex items-center justify-center overflow-hidden border border-client-primary/20">
                                                                        {pet.avatar ? (
                                                                            <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className="text-client-primary font-bold text-[12px]">{pet.name?.charAt(0)}</span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-bold text-client-secondary">{pet.name}</p>
                                                                        <p className="text-[10px] text-[#7d7b7b]">{pet.breed || "Giống loài"}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    {getPetStatusChip(petStatus, booking.bookingStatus)}
                                                                </div>
                                                            </div>

                                                            {petStatus === 'in-progress' && mapping?.startedAt && (
                                                                <OvertimeTimer
                                                                    startedAt={mapping.startedAt}
                                                                    maxDuration={booking.serviceId?.maxDuration || 0}
                                                                />
                                                            )}

                                                            {surcharge > 0 && (
                                                                <div className="mt-2 text-[11px] text-[#FF5630] font-bold bg-[#FF5630]/5 p-2 rounded-lg border border-[#FF5630]/20">
                                                                    Phụ thu: {formatCurrency(surcharge)} ({mapping?.surchargeNotes || "Quá giờ"})
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-[20px] text-center text-[15px] font-[500]">{dayjs(booking.start).format("DD/MM/YYYY")}</td>
                                        <td className="p-[20px] text-center text-[15px] font-[500] text-client-primary">{dayjs(booking.start).format("HH:mm")}</td>
                                        <td className="p-[20px] text-right font-[700] text-[18px] text-client-primary">
                                            {formatCurrency(booking.total || 0)}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    {booking.petStaffMap?.some((m: any) => m.surchargeAmount > 0) && (
                                        <tr>
                                            <td colSpan={3} className="p-[20px] pb-0 text-right font-[600] text-[#7d7b7b]">Phụ phí quá giờ:</td>
                                            <td className="p-[20px] pb-0 text-right font-[700] text-[16px] text-[#FF5630]">
                                                +{formatCurrency(booking.petStaffMap.reduce((sum: number, m: any) => sum + (m.surchargeAmount || 0), 0))}
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td colSpan={3} className="p-[20px] text-right font-[600] text-[#7d7b7b]">Thành tiền:</td>
                                        <td className="p-[20px] text-right font-[800] text-[22px] text-client-primary">{formatCurrency(booking.total || 0)}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            {booking.serviceId?.procedure && (
                                <div className="p-[30px] border-t border-[#eee] bg-[#f9f9f9]/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-client-primary/10 flex items-center justify-center text-client-primary">
                                            <Icon icon="solar:clipboard-list-bold-duotone" width={18} />
                                        </div>
                                        <h4 className="font-bold text-client-secondary text-[16px]">Quy trình dịch vụ</h4>
                                    </div>
                                    <div
                                        className="text-[15px] text-[#505050] leading-relaxed prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: booking.serviceId.procedure }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CancelModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={onConfirmCancel}
                title="Lý Do Hủy Lịch"
                confirmText="HỦY LỊCH ĐẶT"
                isBooking={true}
                paymentStatus={booking?.paymentStatus}
            />
        </>
    );
};
