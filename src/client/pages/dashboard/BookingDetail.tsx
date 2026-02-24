import { useState, useEffect, useCallback } from "react";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { useParams, Link } from "react-router-dom";
import { getMyBooking, exportBookingPdf } from "../../api/booking.api";
import { formatCurrency } from "../../helpers";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

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
    const [exporting, setExporting] = useState(false);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "text-[#05A845]";
            case "confirmed": return "text-[#007BFF]";
            case "pending": return "text-[#f97316]";
            case "cancelled": return "text-[#ff0000]";
            case "in-progress": return "text-[#FFAB00]";
            case "delayed": return "text-[#FF5630]";
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
            "in-progress": "Đang làm"
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
                                        className="bg-client-primary hover:bg-client-secondary transition-default text-white font-[600] text-[14px] py-[15px] px-[25px] rounded-[6px] cursor-pointer disabled:opacity-50 flex items-center gap-2 ml-auto"
                                    >
                                        {exporting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                        Xuất hóa đơn PDF
                                    </button>
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
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Trạng thái:</span> <span className={`font-bold ${getStatusColor(booking.bookingStatus)}`}>{getStatusText(booking.bookingStatus)}</span></p>
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Thanh toán:</span> <span className="font-bold text-[#05A845] uppercase">{booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></p>
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Phương thức:</span> <span className="font-semibold text-client-secondary">{booking.paymentMethod === 'money' ? 'Tiền mặt' : booking.paymentMethod}</span></p>
                                    </div>
                                </div>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9F9F9] border-b border-[#eee]">
                                    <tr>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Dịch vụ</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-center">Ngày thực hiện</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-center">Giờ hẹn</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-right">Tổng cộng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[#eee]">
                                        <td className="p-[20px]">
                                            <p className="font-[600] text-client-secondary text-[16px] mb-3">{booking.serviceId?.name}</p>
                                            <div className="space-y-3">
                                                {booking.petIds?.map((pet: any) => {
                                                    const mapping = booking.petStaffMap?.find((m: any) =>
                                                        (m.petId?._id || m.petId) === pet._id
                                                    );
                                                    const petStatus = mapping?.status || 'pending';
                                                    const surcharge = mapping?.surchargeAmount || 0;

                                                    return (
                                                        <div key={pet._id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-client-primary/10 flex items-center justify-center overflow-hidden border border-client-primary/20">
                                                                        {pet.avatar ? (
                                                                            <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className="text-client-primary font-bold">{pet.name?.charAt(0)}</span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[14px] font-bold text-client-secondary">{pet.name}</p>
                                                                        <p className="text-[11px] text-[#7d7b7b]">{pet.breed || "Giống loài"}</p>
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
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
