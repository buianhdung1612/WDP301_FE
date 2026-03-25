import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { useParams, Link } from "react-router-dom";
import { getBoardingBookingDetail } from "../../api/dashboard.api";
import { formatCurrency } from "../../helpers";
import { ClientBoardingPetDiary } from "./ClientBoardingPetDiary";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";

export const BoardingBookingDetailPage = () => {
    const { id } = useParams();

    const { data: res, isLoading: loading } = useQuery<any>({
        queryKey: ["boarding-booking", id],
        queryFn: () => getBoardingBookingDetail(id!),
        enabled: !!id,
    });

    // The API returns { booking: {...}, pets: [...], cage: {...}, timeline: [...] }
    const booking = res?.booking;
    const pets = res?.pets || [];
    const cage = res?.cage;

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
            case "checked-out": return "text-[#05A845]";
            case "confirmed": return "text-[#007BFF]";
            case "pending": return "text-[#f97316]";
            case "cancelled": return "text-[#ff0000]";
            case "checked-in": return "text-[#AB9774]";
            default: return "text-[#7d7b7b]";
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

    if (loading) return <div className="p-10 text-center text-[16px]">Đang tải...</div>;
    if (!booking) return <div className="p-10 text-center text-[16px]">Không tìm thấy lịch đặt!</div>;

    const checkIn = booking.checkInDate;
    const checkOut = booking.checkOutDate;
    const days = booking.numberOfDays || dayjs(checkOut).diff(dayjs(checkIn), 'day') || 1;

    return (
        <>
            <ProductBanner
                pageTitle="Chi tiết khách sạn"
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
                                Chi tiết dịch vụ khách sạn
                            </h3>
                            <Link className="relative overflow-hidden group bg-client-primary rounded-[8px] px-[25px] py-[15px] font-[500] text-[14px] text-white flex items-center gap-[8px] cursor-pointer" to={"/dashboard/transactions"}>
                                <span className="relative z-10">Trở lại</span>
                                <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                            </Link>
                        </div>

                        {/* Boarding Stepper */}
                        {["pending", "confirmed", "checked-in", "checked-out", "completed"].includes(booking.boardingStatus || booking.status) && (
                            <div className="mb-[60px] pt-[20px] pb-[40px] px-[20px] bg-[#fdfdfd] border border-[#f5f5f5] rounded-[20px] relative">
                                <div className="flex justify-between relative z-10 w-full max-w-[800px] mx-auto">
                                    {[
                                        { key: "pending", label: "Chờ xác nhận", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[20px] h-[20px]"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5H6a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 6 18.75h.75m11.25-3V3.75m-11.25 15V6.75M12 9V3.75m-6 0h12" /></svg> },
                                        { key: "confirmed", label: "Đã xác nhận", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[20px] h-[20px]"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" /></svg> },
                                        { key: "checked-in", label: "Đang lưu trú", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[20px] h-[20px]"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg> },
                                        { key: "checked-out", label: "Hoàn thành", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[20px] h-[20px]"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg> },
                                    ].map((step, index, arr) => {
                                        const successFlow = ["pending", "confirmed", "checked-in", "checked-out"];
                                        const currentStatus = String(booking.boardingStatus || booking.status || "").toLowerCase();
                                        // Map 'completed' to 'checked-out' index
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
                                                            style={{ width: isPast ? "100%" : isCurrent ? "0%" : "0%" }}
                                                        />
                                                    </div>
                                                )}

                                                <div
                                                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${isCurrent || isPast
                                                        ? "bg-gradient-to-br from-[#ff7e67] to-[#e1554e] text-white ring-4 ring-red-100"
                                                        : "bg-white text-gray-400 border-[2px] border-[#eee]"
                                                        }`}
                                                >
                                                    {step.icon}
                                                </div>

                                                <div className="mt-[15px] flex flex-col items-center">
                                                    <span
                                                        className={`text-[13px] font-[700] uppercase tracking-wider transition-colors duration-500 text-center ${isCurrent || isPast ? "text-client-secondary" : "text-gray-400"
                                                            }`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="text-[10px] text-red-400 font-[500] animate-pulse mt-1">Đang thực hiện</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="border border-[#eee] rounded-[12px] w-full overflow-hidden">
                            <div className="flex justify-between items-center p-[30px] border-b border-[#eee]">
                                <div className="flex items-center gap-[15px]">
                                    <img src="https://i.imgur.com/V2kwkkK.png" alt="Logo" className="w-[150px]" />
                                </div>
                                <div className="text-right">
                                    <h2 className="uppercase text-[22px] text-client-secondary font-[700] mb-[15px]">PHIẾU DỊCH VỤ NỘI TRÚ</h2>
                                    <p className="text-[#7d7b7b] text-[15px] mb-[5px]">Mã: #{booking.code || booking._id?.slice(-8).toUpperCase()}</p>
                                    <p className="text-[#7d7b7b] text-[15px] mb-[15px]">Ngày đặt: {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}</p>
                                    <button className="bg-client-primary hover:bg-client-secondary text-white font-[600] text-[14px] py-[15px] px-[25px] rounded-[6px] transition-all cursor-pointer">
                                        Xuất hóa đơn PDF
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-[30px] p-[30px] border-b border-[#eee] bg-[#fdfdfd]">
                                <div>
                                    <h4 className="font-bold mb-3 uppercase text-[14px] tracking-wider text-client-primary">Thông tin khách hàng</h4>
                                    <div className="space-y-2">
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Khách hàng:</span> <span className="font-semibold text-client-secondary">{booking.fullName || "Khách hàng"}</span></p>
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Điện thoại:</span> <span className="font-semibold text-client-secondary">{booking.phone || "N/A"}</span></p>
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[120px] inline-block font-[500]">Ghi chú:</span> <span className="italic text-[#7d7b7b]">{booking.notes || "Không có"}</span></p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-3 uppercase text-[14px] tracking-wider text-client-primary">Trạng thái & Thanh toán</h4>
                                    <div className="space-y-2">
                                        <p className="text-[15px]"><span className="text-[#7d7b7b] w-[140px] inline-block font-[500]">Trạng thái:</span> <span className={`font-bold ${getStatusColor(booking.boardingStatus || booking.status)}`}>{getStatusText(booking.boardingStatus || booking.status)}</span></p>
                                        <p className="text-[15px]">
                                            <span className="text-[#7d7b7b] w-[140px] inline-block font-[500]">Thanh toán:</span>
                                            <span className={`font-bold uppercase ${booking.paymentStatus === 'paid' ? 'text-[#05A845]' : 'text-red-500'}`}>
                                                {booking.paymentStatus === 'paid' ? 'Đã hoàn thành' : 'Chưa thanh toán'}
                                            </span>
                                        </p>
                                        <p className="text-[15px]">
                                            <span className="text-[#7d7b7b] w-[140px] inline-block font-[500]">Phương thức:</span>
                                            <span className="font-semibold text-client-secondary uppercase">
                                                {booking.paymentMethod === 'pay_at_site' ? 'Thanh toán tại quầy' : booking.paymentMethod || "ZaloPay"}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9F9F9] border-b border-[#eee]">
                                    <tr>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Nội dung khách sạn</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-center">Nhận phòng</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-center">Trả phòng</th>
                                        <th className="p-[20px] text-[16px] font-[600] text-client-secondary text-right">Tổng cộng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[#eee]">
                                        <td className="p-[20px]">
                                            <p className="font-[700] text-client-secondary text-[17px] mb-2">{cage?.cageCode || "Chuồng nội trú"}</p>
                                            <div className="flex items-center gap-2 text-[13px] text-[#7d7b7b]">
                                                <span>Loại: {String(cage?.type || "Standard").toUpperCase()}</span>
                                                <span>•</span>
                                                <span>Số ngày: {days} ngày</span>
                                            </div>
                                            {pets.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {pets.map((pet: any, idx: number) => (
                                                        <div key={idx} className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 inline-flex items-center gap-2 mr-2">
                                                            <div className="w-8 h-8 rounded-full bg-client-primary flex items-center justify-center text-white text-[12px] font-bold overflow-hidden">
                                                                {pet.avatar ? <img src={pet.avatar} className="w-full h-full object-cover" /> : pet.name?.charAt(0) || "P"}
                                                            </div>
                                                            <span className="text-[13px] font-semibold">{pet.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-[20px] text-center text-[15px] font-[500] text-slate-600">
                                            {dayjs(checkIn).format("DD/MM/YYYY")}
                                        </td>
                                        <td className="p-[20px] text-center text-[15px] font-[500] text-slate-600">
                                            {dayjs(checkOut).format("DD/MM/YYYY")}
                                        </td>
                                        <td className="p-[20px] text-right font-[700] text-[18px] text-client-primary">
                                            {formatCurrency(booking.total || 0)}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="p-[20px] text-right font-[600] text-[#7d7b7b]">Thành tiền:</td>
                                        <td className="p-[20px] text-right font-[800] text-[22px] text-client-primary">
                                            {formatCurrency(booking.total || 0)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="p-[30px] border-t border-[#eee] bg-[#f9f9f9]/30">
                                <h4 className="font-bold text-client-secondary text-[16px] mb-3 flex items-center gap-2">
                                    <div className="w-2 h-5 bg-client-primary rounded-full"></div>
                                    Quy chuẩn nội trú
                                </h4>
                                <ul className="text-[14px] text-[#666] space-y-2 list-disc pl-5">
                                    <li>Thời gian nhận phòng sau 14:00 và trả phòng trước 12:00.</li>
                                    <li>Vui lòng cung cấp sổ tiêm phòng định kỳ cho bé khi nhận phòng.</li>
                                    <li>Chế độ dinh dưỡng và vận động được thực hiện theo yêu cầu riêng.</li>
                                    <li>Cập nhật hình ảnh/video hàng ngày qua tin nhắn.</li>
                                </ul>
                            </div>

                            {/* Nhật ký thú cưng */}
                            <ClientBoardingPetDiary bookingId={booking._id} pets={pets} />

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
