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
