import { ProductBanner } from "../product/sections/ProductBanner";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "./sections/Sidebar";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { formatCurrency } from "../../helpers";
import { getBoardingBookingDetail } from "../../api/dashboard.api";

export const BoardingBookingDetailPage = () => {
    const { id } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Lịch khách sạn", to: "/dashboard/boarding-bookings" },
        { label: "Chi tiết lịch", to: `/dashboard/boarding-bookings/${id}` },
    ];

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                const response = await getBoardingBookingDetail(id);
                setData(response);
            } catch (error) {
                console.error("Failed to fetch boarding booking detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const booking = data?.booking;
    const pets = data?.pets || [];
    const cage = data?.cage;
    const timeline = data?.timeline || [];

    return (
        <>
            <ProductBanner
                pageTitle="Chi tiết lịch khách sạn"
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
                        <div className="flex items-center justify-between mb-[25px]">
                            <h3 className="text-[2.4rem] font-[600] text-client-secondary">
                                Chi tiết lịch khách sạn
                            </h3>
                            <Link
                                to="/dashboard/boarding-bookings"
                                className="text-[1.4rem] text-client-primary hover:underline"
                            >
                                Quay lại danh sách
                            </Link>
                        </div>

                        {loading ? (
                            <div className="text-[1.6rem]">Đang tải...</div>
                        ) : !booking ? (
                            <div className="text-[1.6rem]">Không tìm thấy lịch.</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
                                <div className="border border-[#eee] rounded-[10px] p-[20px]">
                                    <h4 className="text-[1.8rem] font-[600] text-client-secondary mb-[12px]">Thông tin lịch</h4>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Mã lịch:</span> {booking.boardingBookingCode || booking._id}</p>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Ngày nhận:</span> {booking.checkInDate ? dayjs(booking.checkInDate).format("DD/MM/YYYY HH:mm") : "-"}</p>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Ngày trả:</span> {booking.checkOutDate ? dayjs(booking.checkOutDate).format("DD/MM/YYYY HH:mm") : "-"}</p>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Trạng thái:</span> {booking.status}</p>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Thanh toán:</span> {booking.paymentStatus} ({booking.paymentMethod || "-"})</p>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Tổng tiền:</span> {formatCurrency(booking.totalPrice || 0)}</p>
                                    {booking.holdExpiresAt && (
                                        <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Giữ phòng đến:</span> {dayjs(booking.holdExpiresAt).format("DD/MM/YYYY HH:mm")}</p>
                                    )}
                                </div>

                                <div className="border border-[#eee] rounded-[10px] p-[20px]">
                                    <h4 className="text-[1.8rem] font-[600] text-client-secondary mb-[12px]">Phòng & thú cưng</h4>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Chuồng:</span> {cage?.cageCode || booking.cageId || "-"}</p>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Loại:</span> {cage?.type || "-"}</p>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Size:</span> {cage?.size || "-"}</p>
                                    <p className="text-[1.5rem] mb-[8px]"><span className="font-[600]">Giá/ngày:</span> {formatCurrency(cage?.dailyPrice || booking.pricePerDay || 0)}</p>
                                    <div className="mt-[12px]">
                                        <p className="text-[1.5rem] font-[600] mb-[8px]">Danh sách thú cưng</p>
                                        {pets.length === 0 ? (
                                            <p className="text-[1.4rem] text-[#7d7b7b]">Không có dữ liệu thú cưng.</p>
                                        ) : (
                                            <ul className="space-y-[6px]">
                                                {pets.map((pet: any) => (
                                                    <li key={pet._id} className="text-[1.4rem] text-[#555]">
                                                        {pet.name} - {pet.breed || "Không rõ giống"} ({pet.type})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div className="border border-[#eee] rounded-[10px] p-[20px] lg:col-span-2">
                                    <h4 className="text-[1.8rem] font-[600] text-client-secondary mb-[12px]">Timeline trạng thái</h4>
                                    {timeline.length === 0 ? (
                                        <p className="text-[1.4rem] text-[#7d7b7b]">Chưa có timeline.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                                            {timeline.map((item: any) => (
                                                <div key={item.key} className="border border-[#f0f0f0] rounded-[8px] p-[12px]">
                                                    <p className="text-[1.4rem] font-[600]">{item.label}</p>
                                                    <p className="text-[1.3rem] text-[#7d7b7b]">
                                                        {item.at ? dayjs(item.at).format("DD/MM/YYYY HH:mm:ss") : "-"}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
