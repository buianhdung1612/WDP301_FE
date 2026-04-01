import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { useParams, Link } from "react-router-dom";
import { getBoardingBookingDetail } from "../../api/dashboard.api";
import { formatCurrency } from "../../helpers";
import { ClientBoardingPetDiary } from "./ClientBoardingPetDiary";
import dayjs from "dayjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelBoardingBooking } from "../../api/boarding-booking.api";
import { toast } from "react-toastify";
import { Clock3, PawPrint, ShieldCheck } from "lucide-react";

export const BoardingBookingDetailPage = () => {
    const { id } = useParams();

    const { data: res, isLoading: loading } = useQuery<any>({
        queryKey: ["boarding-booking", id],
        queryFn: () => getBoardingBookingDetail(id!),
        enabled: !!id,
    });

    // The API returns { booking: {...}, pets: [...], cage: {...}, timeline: [...]  }
    const booking = res?.booking;
    const pets = res?.pets || [];
    const cage = res?.cage;
    const queryClient = useQueryClient();

    const cancelMutation = useMutation({
        mutationFn: (reason: string) => cancelBoardingBooking(id!, reason),
        onSuccess: () => {
            toast.success("Đã hủy đơn hàng thành công!");
            queryClient.invalidateQueries({ queryKey: ["boarding-booking", id] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Lỗi khi hủy đơn hàng");
        }
    });

    const handleCancel = () => {
        if (!booking) return;
        const msg = "Khi hủy đơn đặt khách sạn, bạn sẽ mất hoàn toàn số tiền đặt cọc (tương đương 20% tổng giá trị đơn hàng). Bạn vẫn muốn tiếp tục?";

        if (window.confirm(msg)) {
            cancelMutation.mutate("Khách hàng tự hủy qua dashboard");
        }
    };

    const isCancellable = booking && ["pending", "confirmed"].includes(booking.boardingStatus || booking.status) && booking.boardingStatus !== "cancelled";

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Giao dịch", to: "/dashboard/transactions" },
        { label: `Chi tiết khách sạn`, to: `/dashboard/boarding/detail/${id}` },
    ];

    const getStatusColor = (status: string) => {
        const normalized = String(status || "").toLowerCase();
        switch (normalized) {
            case "completed":
            case "checked-out": return "text-emerald-600 bg-emerald-50 border-emerald-100";
            case "confirmed": return "text-blue-600 bg-blue-50 border-blue-100";
            case "pending": return "text-[#f97316] bg-orange-50 border-orange-100";
            case "cancelled": return "text-red-600 bg-red-50 border-red-100";
            case "checked-in": return "text-indigo-600 bg-indigo-50 border-indigo-100";
            default: return "text-[#7d7b7b] bg-gray-50 border-gray-100";
        }
    };

    const getStatusText = (status: string) => {
        const map: any = {
            "pending": "Chờ xác nhận",
            "confirmed": "Đã xác nhận",
            "completed": "Hoàn thành",
            "checked-out": "Đã trả phòng",
            "cancelled": "Đã hủy",
            "checked-in": "Đang lưu trú"
        };
        return map[String(status || "").toLowerCase()] || status;
    };

    if (loading) return <div className="p-10 text-center text-[16px] font-medium text-[#7d7b7b]">Đang tải...</div>;
    if (!booking) return <div className="p-10 text-center text-[16px] font-medium text-red-500">Không tìm thấy lịch đặt!</div>;

    const checkIn = booking.checkInDate;
    const checkOut = booking.checkOutDate;
    const days = booking.numberOfDays || dayjs(checkOut).diff(dayjs(checkIn), 'day') || 1;

    return (
        <>
            <ProductBanner
                pageTitle="Chi tiết khách sạn"
                breadcrumbs={breadcrumbs}
                url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-details.jpg"
                className="bg-top shadow-inner"
            />

            <div className="mt-[-150px] mb-[100px] app-container flex items-stretch">
                <div className="w-[25%] px-[12px] flex">
                    <Sidebar />
                </div>
                <div className="w-[75%] px-[12px]">
                    <div className="mt-[100px] p-[35px] bg-white shadow-[0px_8px_24px_#959da51a] rounded-[24px] border border-[#eee]">
                        <div className="flex justify-between items-center mb-[30px] border-b border-[#f8f9fa] pb-[20px]">
                            <div>
                                <h3 className="text-[28px] font-secondary font-bold text-client-secondary">
                                    Chi tiết dịch vụ khách sạn
                                </h3>
                                <p className="text-[15px] text-[#7d7b7b] mt-[5px]">Mã đơn: <span className="font-bold text-client-primary">#{id?.slice(-8).toUpperCase()}</span></p>
                            </div>
                            <div className="flex items-center gap-[15px]">
                                {isCancellable && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelMutation.isPending}
                                        className="px-[25px] py-[12px] rounded-[14px] border border-red-200 bg-red-50 text-red-600 font-bold text-[15px] hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        {cancelMutation.isPending ? "Đang xử lý..." : "Hủy đặt chuồng"}
                                    </button>
                                )}
                                <Link
                                    className="px-[25px] py-[12px] rounded-[14px] bg-client-primary text-white font-bold text-[15px] hover:shadow-[0_8px_24px_rgba(249,115,22,0.4)] transition-all shadow-md active:scale-[0.98]"
                                    to={"/dashboard/transactions"}
                                >
                                    Trở lại
                                </Link>
                            </div>
                        </div>

                        {/* Boarding Stepper */}
                        {["pending", "confirmed", "checked-in", "checked-out", "completed"].includes(booking.boardingStatus || booking.status) && (
                            <div className="mb-[60px] p-[40px] bg-white border border-[#eee] rounded-[24px] shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-client-primary opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <div className="flex justify-between relative z-10 w-full max-w-[800px] mx-auto">
                                    {[
                                        { key: "pending", label: "Chờ xác nhận", icon: <Clock3 className="w-[20px] h-[20px]" /> },
                                        { key: "confirmed", label: "Đã xác nhận", icon: <ShieldCheck className="w-[20px] h-[20px]" /> },
                                        { key: "checked-in", label: "Đang lưu trú", icon: <PawPrint className="w-[20px] h-[20px]" /> },
                                        { key: "checked-out", label: "Hoàn thành", icon: <ShieldCheck className="w-[20px] h-[20px]" /> },
                                    ].map((step, index, arr) => {
                                        const successFlow = ["pending", "confirmed", "checked-in", "checked-out"];
                                        const currentStatus = String(booking.boardingStatus || booking.status || "").toLowerCase();
                                        const normalizedCurrent = currentStatus === "completed" ? "checked-out" : currentStatus;
                                        const currentIndex = successFlow.indexOf(normalizedCurrent);
                                        const isPast = index < currentIndex;
                                        const isCurrent = index === currentIndex;
                                        const isLast = index === arr.length - 1;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center flex-1 relative">
                                                {!isLast && (
                                                    <div className="absolute top-[30px] left-[50%] w-full h-[3px] bg-[#eee] -z-10">
                                                        <div
                                                            className="h-full bg-client-primary transition-all duration-700 ease-in-out"
                                                            style={{ width: isPast ? "100%" : "0%" }}
                                                        />
                                                    </div>
                                                )}

                                                <div
                                                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${isCurrent || isPast
                                                        ? "bg-client-primary text-white ring-[6px] ring-orange-50"
                                                        : "bg-white text-gray-400 border-[2px] border-[#eee]"
                                                        }`}
                                                >
                                                    {step.icon}
                                                </div>

                                                <div className="mt-[15px] flex flex-col items-center">
                                                    <span
                                                        className={`text-[13px] font-bold uppercase tracking-wider transition-colors duration-500 text-center ${isCurrent || isPast ? "text-client-secondary" : "text-gray-400"
                                                            }`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="text-[11px] text-client-primary font-bold animate-pulse mt-1">Đang xử lý</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="border border-[#eee] rounded-[24px] w-full overflow-hidden shadow-sm bg-white">
                            <div className="flex justify-between items-center p-[35px] bg-[#fcfdff] border-b border-[#eee]">
                                <div className="flex items-center gap-[15px]">
                                    <img src="https://i.imgur.com/V2kwkkK.png" alt="Logo" className="w-[180px]" />
                                </div>
                                <div className="text-right">
                                    <h2 className="uppercase text-[24px] text-client-secondary font-secondary font-bold mb-[10px]">PHIẾU DỊCH VỤ NỘI TRÚ</h2>
                                    <p className="text-[#7d7b7b] text-[15px] font-medium">Mã: <span className="text-client-secondary font-bold">#{booking.code || booking._id?.slice(-8).toUpperCase()}</span></p>
                                    <p className="text-[#7d7b7b] text-[15px] font-medium mt-[5px]">Ngày đặt: {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-[30px] p-[35px] border-b border-[#eee]">
                                <div className="rounded-[20px] bg-[#f8fbff] p-[25px] border border-[#dbeafe]">
                                    <h4 className="font-bold mb-[15px] uppercase text-[12px] tracking-[1.5px] text-client-primary">Thông tin khách hàng</h4>
                                    <div className="space-y-[10px]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#7d7b7b] text-[15px] font-medium">Khách hàng:</span>
                                            <span className="font-bold text-client-secondary text-[15px]">{booking.fullName || "Khách hàng"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#7d7b7b] text-[15px] font-medium">Số điện thoại:</span>
                                            <span className="font-bold text-client-secondary text-[15px]">{booking.phone || "N/A"}</span>
                                        </div>
                                        <div className="pt-[10px] border-t border-[#dbeafe] mt-[10px]">
                                            <span className="text-[#7d7b7b] text-[14px] font-medium block mb-[5px]">Ghi chú kèm theo:</span>
                                            <p className="italic text-[#4b5563] text-[14px] leading-relaxed">{booking.notes || "Không có ghi chú thêm."}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-[20px] border border-[#eee] p-[25px] bg-white">
                                    <h4 className="font-bold mb-[15px] uppercase text-[12px] tracking-[1.5px] text-client-primary">Trạng thái phiếu</h4>
                                    <div className="space-y-[12px]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#7d7b7b] text-[15px] font-medium">Trạng thái:</span>
                                            <span className={`px-[12px] py-[4px] rounded-full text-[13px] font-bold border ${getStatusColor(booking.boardingStatus || booking.status)}`}>
                                                {getStatusText(booking.boardingStatus || booking.status)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#7d7b7b] text-[15px] font-medium">Thanh toán:</span>
                                            <span className={`px-[12px] py-[4px] rounded-full text-[13px] font-bold border ${booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : booking.paymentStatus === 'partial' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                {booking.paymentStatus === 'paid' ? 'Đã hoàn tất' : booking.paymentStatus === 'partial' ? 'Đã cọc' : 'Chưa thanh toán'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#7d7b7b] text-[15px] font-medium">Tiền cọc ({booking.depositPercent || 20}%):</span>
                                            <span className="text-[15px] font-bold text-client-secondary">
                                                {formatCurrency(booking.depositAmount || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#7d7b7b] text-[15px] font-medium">Tổng tiền:</span>
                                            <span className="text-[15px] font-bold text-client-primary">
                                                {formatCurrency(booking.total || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#7d7b7b] text-[15px] font-medium">Phương thức:</span>
                                            <span className="text-[15px] font-bold text-client-secondary uppercase">
                                                {booking.paymentMethod === 'pay_at_site' ? 'Tại quầy' : booking.paymentMethod || "ZaloPay"}
                                            </span>
                                        </div>

                                        {(booking.boardingStatus === "cancelled" || booking.status === "cancelled") && (
                                            <div className="mt-[15px] pt-[15px] border-t border-red-100 bg-red-50/30 -mx-[25px] px-[25px] pb-[10px]">
                                                <span className="text-[#ef4444] text-[14px] font-bold block mb-[5px] uppercase tracking-wider">Lý do hủy:</span>
                                                <p className="text-[#ef4444] text-[14px] font-medium leading-relaxed italic border-l-4 border-red-500 pl-3">
                                                    {booking.cancelledReason || "Admin cập nhật hoặc Khách hàng tự hủy."}
                                                </p>
                                                {booking.cancelledAt && (
                                                    <span className="block text-[11px] text-red-400 mt-2 font-bold italic text-right">
                                                        Thời gian: {dayjs(booking.cancelledAt).format("DD/MM/YYYY HH:mm")}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-[35px]">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-[#eee]">
                                            <th className="pb-[20px] text-[15px] font-bold text-client-secondary uppercase tracking-[1px]">Dịch vụ lưu trú</th>
                                            <th className="pb-[20px] text-[15px] font-bold text-client-secondary uppercase tracking-[1px] text-center">Thời gian</th>
                                            <th className="pb-[20px] text-[15px] font-bold text-client-secondary uppercase tracking-[1px] text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f8f9fa]">
                                        <tr>
                                            <td className="py-[30px]">
                                                <div className="flex flex-col gap-[10px]">
                                                    <h5 className="text-[18px] font-secondary font-bold text-client-secondary">
                                                        {cage?.cageCode || "Chuồng nội trú tiêu chuẩn"}
                                                    </h5>
                                                    <div className="flex items-center gap-[15px] text-[14px]">
                                                        <span className="px-[10px] py-[4px] bg-slate-100 text-slate-600 rounded-[8px] font-bold text-[12px]">LOẠI: {String(cage?.type || "Standard").toUpperCase()}</span>
                                                        <span className="font-medium text-[#7d7b7b]">Thời gian: <span className="text-client-secondary font-bold">{days} ngày</span></span>
                                                    </div>
                                                    {pets.length > 0 && (
                                                        <div className="mt-[15px] flex flex-wrap gap-[10px]">
                                                            {pets.map((pet: any, idx: number) => (
                                                                <div key={idx} className="inline-flex items-center gap-[8px] px-[12px] py-[6px] bg-white border border-[#eee] rounded-[12px] shadow-sm">
                                                                    <div className="w-[24px] h-[24px] rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                                                                        {pet.avatar ? <img src={pet.avatar} className="w-full h-full object-cover" /> : <PawPrint className="w-[14px] h-[14px] text-client-primary" />}
                                                                    </div>
                                                                    <span className="text-[13px] font-bold text-client-secondary">{pet.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-[30px] text-center">
                                                <div className="inline-flex flex-col items-center gap-[5px] p-[15px] bg-[#f8fbff] border border-[#dbeafe] rounded-[18px]">
                                                    <div className="text-[13px] font-bold text-blue-600 flex items-center gap-[5px]">
                                                        <Clock3 className="w-[14px] h-[14px]" /> NHẬN PHÒNG
                                                    </div>
                                                    <span className="text-[15px] font-bold text-client-secondary">{dayjs(checkIn).format("HH:mm DD/MM/YYYY")}</span>
                                                    <div className="w-full h-[1px] bg-blue-100 my-[5px]"></div>
                                                    <div className="text-[13px] font-bold text-emerald-600 flex items-center gap-[5px]">
                                                        <Clock3 className="w-[14px] h-[14px]" /> TRẢ PHÒNG
                                                    </div>
                                                    <span className="text-[15px] font-bold text-client-secondary">{dayjs(checkOut).format("HH:mm DD/MM/YYYY")}</span>
                                                </div>
                                            </td>
                                            <td className="py-[30px] text-right">
                                                <span className="text-[24px] font-secondary font-bold text-client-primary">
                                                    {formatCurrency(booking.total || 0)}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-[35px] py-[40px] bg-slate-50 border-t border-[#eee]">
                                <div className="flex flex-col gap-[20px]">
                                    <div className="flex items-center gap-[15px]">
                                        <div className="w-[8px] h-[24px] bg-client-primary rounded-full"></div>
                                        <h4 className="text-[18px] font-secondary font-bold text-client-secondary">Quy chuẩn nội trú & Cam kết</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-[40px] lg:grid-cols-1">
                                        <ul className="space-y-[12px]">
                                            {[
                                                "Thời gian nhận phòng từ 09:00 và trả phòng trước 09:00 sáng hôm sau.",
                                                "Vui lòng cung cấp sổ tiêm phòng định kỳ cho bé khi nhận phòng.",
                                                "Chế độ dinh dưỡng và vận động được thực hiện theo yêu cầu riêng.",
                                                "Cập nhật hình ảnh/video hàng ngày qua diary trong dashboard."
                                            ].map((txt, i) => (
                                                <li key={i} className="flex gap-[10px] text-[14px] text-[#4b5563] font-medium leading-relaxed">
                                                    <div className="mt-[6px] min-w-[6px] h-[6px] rounded-full bg-client-primary/60"></div>
                                                    {txt}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex flex-col justify-end items-end gap-[10px]">
                                            <p className="text-[15px] font-medium text-[#7d7b7b]">Tổng cộng tiền dịch vụ:</p>
                                            <p className="text-[36px] font-secondary font-bold text-client-secondary">{formatCurrency(booking.total || 0)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nhật ký thú cưng */}
                            <ClientBoardingPetDiary bookingId={booking._id} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
