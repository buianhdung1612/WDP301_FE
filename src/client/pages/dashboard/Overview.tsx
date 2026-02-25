import StarIcon from "@mui/icons-material/Star";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getBoardingBookingList } from "../../api/dashboard.api";
import { formatCurrency } from "../../helpers";

export const OverviewPage = () => {
    const breadcrumbs = [
        { label: "Trang chu", to: "/" },
        { label: "Tai khoan", to: "/dashboard/profile" },
        { label: "Tong quan", to: "/dashboard/overview" },
    ];

    const recentOrders = [
        { id: "#75HJFDYD4", date: "July 16, 2023", status: "Hoan thanh", amount: "$200", statusColor: "text-[#05A845]" },
        { id: "#75HJF6WER", date: "June 23, 2023", status: "Dang xu ly", amount: "$60", statusColor: "text-[#007BFF]" },
        { id: "#75HJF457G", date: "Aug 18, 2023", status: "Hoan thanh", amount: "$180", statusColor: "text-[#05A845]" },
        { id: "#75HJF5FKI", date: "June 22, 2023", status: "Hoan thanh", amount: "$140", statusColor: "text-[#05A845]" },
        { id: "#75HJF47O7", date: "Jan 12, 2023", status: "Da huy", amount: "$80", statusColor: "text-[#ff0000]" },
    ];

    const recentReviews = [
        { title: "Denim 2 Quarter Pant", date: "05 January 2025", rating: 5, content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos voluptate..." },
        { title: "Half Sleeve Tops For Women", date: "03 April 2025", rating: 4, content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos..." },
        { title: "Cherry Fabric Western Tops", date: "10 March 2025", rating: 5, content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos voluptate..." },
    ];

    const { data: boardingRes, isLoading: boardingLoading } = useQuery<any>({
        queryKey: ["dashboard-boarding-bookings"],
        queryFn: getBoardingBookingList,
    });

    const boardingBookings = Array.isArray(boardingRes?.data)
        ? boardingRes.data
        : Array.isArray(boardingRes?.data?.data)
            ? boardingRes.data.data
            : Array.isArray(boardingRes)
                ? boardingRes
                : [];

    const getBoardingStatus = (status?: string) => {
        const normalized = String(status || "pending").toLowerCase();
        const map: Record<string, { text: string; cls: string }> = {
            pending: { text: "Dang cho", cls: "bg-orange-100 text-orange-700" },
            confirmed: { text: "Da xac nhan", cls: "bg-blue-100 text-blue-700" },
            checked_in: { text: "Dang luu tru", cls: "bg-purple-100 text-purple-700" },
            completed: { text: "Hoan thanh", cls: "bg-green-100 text-green-700" },
            cancelled: { text: "Da huy", cls: "bg-red-100 text-red-700" },
        };
        return map[normalized] || { text: normalized, cls: "bg-gray-100 text-gray-700" };
    };

    return (
        <>
            <ProductBanner
                pageTitle="Tong quan"
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
                        <div className="grid grid-cols-3">
                            <div className="px-[12px]">
                                <div className="bg-[#0aa84812] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#05A845] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[40px]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[32px] font-[600]">
                                        471
                                        <span className="text-[#7d7b7b] font-[400] text-[16px] block">Tong don hang</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#66aaee1f] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#6ae] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[40px]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[32px] font-[600]">
                                        56
                                        <span className="text-[#7d7b7b] font-[400] text-[16px] block">Don hang hoan tat</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#ffa5001c] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#ffa500] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[40px]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[32px] font-[600]">
                                        28
                                        <span className="text-[#7d7b7b] font-[400] text-[16px] block">Don hang cho xu ly</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#ff000012] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#DB4437] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[40px]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[32px] font-[600]">
                                        12
                                        <span className="text-[#7d7b7b] font-[400] text-[16px] block">Don hang da huy</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#80008014] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#800080] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[40px]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[32px] font-[600]">
                                        48
                                        <span className="text-[#7d7b7b] font-[400] text-[16px] block">Danh sach yeu thich</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#ab977424] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#AB9774] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[40px]">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[32px] font-[600]">
                                        26
                                        <span className="text-[#7d7b7b] font-[400] text-[16px] block">Danh gia</span>
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="mt-[25px] flex">
                            <div className="w-[58.3%] px-[12px]">
                                <h3 className="text-[21px] text-client-secondary font-[600] mb-[15px]">Don hang gan day</h3>
                                <div className="border border-[#eee] rounded-[12px] overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#F9F9F9] border-b border-[#eee]">
                                            <tr>
                                                <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Ma don hang</th>
                                                <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Ngay</th>
                                                <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Trang thai</th>
                                                <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Tong</th>
                                                <th className="p-[20px] text-[16px] font-[600] text-client-secondary">Hanh dong</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#eee]">
                                            {recentOrders.map((order, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-[20px] text-[15px] text-[#7d7b7b]">{order.id}</td>
                                                    <td className="p-[20px] text-[15px] text-[#7d7b7b]">{order.date}</td>
                                                    <td className={`p-[20px] text-[15px] font-[500] ${order.statusColor}`}>{order.status}</td>
                                                    <td className="p-[20px] text-[15px] text-[#7d7b7b] font-[500]">{order.amount}</td>
                                                    <td className="p-[20px]">
                                                        <div className="flex flex-col gap-[8px]">
                                                            <Link
                                                                to={`/dashboard/order/invoice/${order.id.replace('#', '')}`}
                                                                className="flex items-center gap-[6px] text-[14px] text-[#7d7b7b] hover:text-client-primary transition-default"
                                                            >
                                                                Xem
                                                            </Link>
                                                            {order.status === "Hoan thanh" && (
                                                                <Link
                                                                    to={`/dashboard/order/detail/${order.id.replace('#', '')}`}
                                                                    className="flex items-center gap-[6px] text-[14px] text-[#7d7b7b] hover:text-client-primary transition-default"
                                                                >
                                                                    Danh gia
                                                                </Link>
                                                            )}
                                                            {order.status === "Dang xu ly" && (
                                                                <button className="flex items-center gap-[6px] text-[14px] text-[#7d7b7b] hover:text-[#ff0000] transition-default">
                                                                    Huy don
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex-1 px-[12px]">
                                <h3 className="text-[21px] text-client-secondary font-[600] mb-[15px]">Danh gia gan day</h3>
                                <div className="border border-[#eee] rounded-[12px] p-[20px] bg-white">
                                    <ul className="divide-y divide-[#eee]">
                                        {recentReviews.map((review, idx) => (
                                            <li key={idx} className={`${idx === 0 ? "pb-[20px]" : "py-[20px]"}`}>
                                                <div className="flex justify-between items-start mb-[5px]">
                                                    <h4 className="text-[17px] font-[600] text-client-secondary">{review.title}</h4>
                                                    <div className="flex items-center gap-[2px]">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon
                                                                key={i}
                                                                sx={{
                                                                    fontSize: "20px !important",
                                                                    color: i < review.rating ? "#F9A61C !important" : "#ccc !important",
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[13px] text-client-secondary mb-[10px]">{review.date}</p>
                                                <p className="text-[#7d7b7b] text-[14px] line-clamp-2 leading-relaxed">
                                                    {review.content}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-[35px] px-[12px]">
                            <div className="rounded-[16px] border border-[#f1e4d6] bg-gradient-to-r from-[#fff7ef] to-[#fff] p-[22px]">
                                <div className="flex items-center justify-between mb-[12px]">
                                    <h3 className="text-[24px] font-secondary text-client-secondary">Khach san cua ban</h3>
                                    <Link
                                        to="/hotels"
                                        className="bg-client-primary text-white px-[18px] py-[8px] rounded-[999px] text-[13px] font-[700] hover:bg-client-secondary transition-default"
                                    >
                                        Dat them
                                    </Link>
                                </div>

                                {boardingLoading ? (
                                    <div className="text-[15px] text-[#637381]">Dang tai danh sach khach san...</div>
                                ) : boardingBookings.length === 0 ? (
                                    <div className="text-[15px] text-[#637381]">Ban chua co booking khach san nao.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                                        {boardingBookings.slice(0, 6).map((booking: any) => {
                                            const checkIn = booking?.checkInDate || booking?.startDate;
                                            const checkOut = booking?.checkOutDate || booking?.endDate;
                                            const status = getBoardingStatus(booking?.status || booking?.bookingStatus);
                                            const cage = booking?.cageId;
                                            const cageId = typeof cage === "string" ? cage : cage?._id;
                                            const cageCode = typeof cage === "string" ? "Phong" : cage?.cageCode || "Phong";

                                            return (
                                                <div key={booking?._id || `${booking?.code}-${checkIn}`} className="bg-white rounded-[12px] border border-[#f1e4d6] p-[14px]">
                                                    <div className="flex items-start justify-between gap-[10px]">
                                                        <div>
                                                            <div className="text-[13px] text-[#7d7b7b]">Ma booking</div>
                                                            <div className="text-[16px] font-[700] text-client-secondary">#{booking?.code || booking?._id?.slice(-6) || "N/A"}</div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[12px] font-[700] ${status.cls}`}>
                                                            {status.text}
                                                        </span>
                                                    </div>

                                                    <div className="mt-[12px] text-[14px] text-[#505050] space-y-[6px]">
                                                        <div><span className="text-[#7d7b7b]">Phong:</span> <span className="font-[600] text-client-secondary">{cageCode}</span></div>
                                                        <div><span className="text-[#7d7b7b]">Nhan:</span> {checkIn ? dayjs(checkIn).format("DD/MM/YYYY") : "-"}</div>
                                                        <div><span className="text-[#7d7b7b]">Tra:</span> {checkOut ? dayjs(checkOut).format("DD/MM/YYYY") : "-"}</div>
                                                        <div><span className="text-[#7d7b7b]">Tong tien:</span> <span className="font-[700] text-client-primary">{formatCurrency(booking?.totalPrice || booking?.total || 0)}</span></div>
                                                    </div>

                                                    {cageId && (
                                                        <Link
                                                            to={`/hotels/${cageId}`}
                                                            className="inline-flex mt-[12px] text-[13px] font-[700] text-client-primary hover:text-client-secondary transition-default"
                                                        >
                                                            Xem phong
                                                        </Link>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
