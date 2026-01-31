import StarIcon from "@mui/icons-material/Star";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import { Link } from "react-router-dom";

export const OverviewPage = () => {
    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Tổng quan", to: "/dashboard/overview" },
    ];

    const recentOrders = [
        { id: "#75HJFDYD4", date: "July 16, 2023", status: "Hoàn thành", amount: "$200", statusColor: "text-[#05A845]" },
        { id: "#75HJF6WER", date: "June 23, 2023", status: "Đang xử lý", amount: "$60", statusColor: "text-[#007BFF]" },
        { id: "#75HJF457G", date: "Aug 18, 2023", status: "Hoàn thành", amount: "$180", statusColor: "text-[#05A845]" },
        { id: "#75HJF5FKI", date: "June 22, 2023", status: "Hoàn thành", amount: "$140", statusColor: "text-[#05A845]" },
        { id: "#75HJF47O7", date: "Jan 12, 2023", status: "Đã hủy", amount: "$80", statusColor: "text-[#ff0000]" },
    ];

    const recentReviews = [
        { title: "Denim 2 Quarter Pant", date: "05 January 2025", rating: 5, content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos voluptate..." },
        { title: "Half Sleeve Tops For Women", date: "03 April 2025", rating: 4, content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos..." },
        { title: "Cherry Fabric Western Tops", date: "10 March 2025", rating: 5, content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos voluptate..." },
    ];

    return (
        <>
            <ProductBanner
                pageTitle="Tổng quan"
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
                        <div className="grid grid-cols-3">
                            <div className="px-[12px]">
                                <div className="bg-[#0aa84812] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#05A845] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[4rem]">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[3.2rem] font-[600]">
                                        471
                                        <span className="text-[#7d7b7b] font-[400] text-[1.6rem] block">Tổng đơn hàng</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#66aaee1f] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#6ae] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[4rem]">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[3.2rem] font-[600]">
                                        56
                                        <span className="text-[#7d7b7b] font-[400] text-[1.6rem] block">Đơn hàng hoàn tất</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#ffa5001c] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#ffa500] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[4rem]">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[3.2rem] font-[600]">
                                        28
                                        <span className="text-[#7d7b7b] font-[400] text-[1.6rem] block">Đơn hàng chờ xử lý</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#ff000012] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#DB4437] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[4rem]">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[3.2rem] font-[600]">
                                        12
                                        <span className="text-[#7d7b7b] font-[400] text-[1.6rem] block">Đơn hàng đã hủy</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#80008014] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#800080] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[4rem]">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[3.2rem] font-[600]">
                                        48
                                        <span className="text-[#7d7b7b] font-[400] text-[1.6rem] block">Danh sách yêu thích</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="px-[12px]">
                                <div className="bg-[#ab977424] p-[20px] mb-[25px] rounded-[8px] ml-[25px] flex items-center">
                                    <div className="w-[75px] h-[75px] mr-[30px] bg-[#AB9774] text-white rounded-[8px] flex items-center justify-center ml-[-40px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[4rem]">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-[3.2rem] font-[600]">
                                        26
                                        <span className="text-[#7d7b7b] font-[400] text-[1.6rem] block">Đánh giá</span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="mt-[25px] flex">
                            <div className="w-[58.3%] px-[12px]">
                                <h3 className="text-[2.1rem] text-client-secondary font-[600] mb-[15px]">Đơn hàng gần đây</h3>
                                <div className="border border-[#eee] rounded-[12px] overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#F9F9F9] border-b border-[#eee]">
                                            <tr>
                                                <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Mã đơn hàng</th>
                                                <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Ngày</th>
                                                <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Trạng thái</th>
                                                <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Tổng</th>
                                                <th className="p-[20px] text-[1.6rem] font-[600] text-client-secondary">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#eee]">
                                            {recentOrders.map((order, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-[20px] text-[1.5rem] text-[#7d7b7b]">{order.id}</td>
                                                    <td className="p-[20px] text-[1.5rem] text-[#7d7b7b]">{order.date}</td>
                                                    <td className={`p-[20px] text-[1.5rem] font-[500] ${order.statusColor}`}>{order.status}</td>
                                                    <td className="p-[20px] text-[1.5rem] text-[#7d7b7b] font-[500]">{order.amount}</td>
                                                    <td className="p-[20px]">
                                                        <div className="flex flex-col gap-[8px]">
                                                            <Link
                                                                to={`/dashboard/order/invoice/${order.id.replace('#', '')}`}
                                                                className="flex items-center gap-[6px] text-[1.4rem] text-[#7d7b7b] hover:text-client-primary transition-default"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[1.8rem] h-[1.8rem]">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.412 8.1 7.288 5 12 5c4.711 0 8.58 3.1 9.964 6.678a1.012 1.012 0 0 1 0 .644C20.58 15.9 16.711 19 12 19c-4.712 0-8.58-3.1-9.964-6.678Z" />
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                                </svg>
                                                                Xem
                                                            </Link>
                                                            {order.status === "Hoàn thành" && (
                                                                <Link
                                                                    to={`/dashboard/order/detail/${order.id.replace('#', '')}`}
                                                                    className="flex items-center gap-[6px] text-[1.4rem] text-[#7d7b7b] hover:text-client-primary transition-default"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[1.8rem] h-[1.8rem]">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                                                    </svg>
                                                                    Đánh giá
                                                                </Link>
                                                            )}
                                                            {order.status === "Đang xử lý" && (
                                                                <button className="flex items-center gap-[6px] text-[1.4rem] text-[#7d7b7b] hover:text-[#ff0000] transition-default">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-[1.8rem] h-[1.8rem]">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                    Hủy đơn
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
                                <h3 className="text-[2.1rem] text-client-secondary font-[600] mb-[15px]">Đánh giá gần đây</h3>
                                <div className="border border-[#eee] rounded-[12px] p-[20px] bg-white">
                                    <ul className="divide-y divide-[#eee]">
                                        {recentReviews.map((review, idx) => (
                                            <li key={idx} className={`${idx === 0 ? "pb-[20px]" : "py-[20px]"}`}>
                                                <div className="flex justify-between items-start mb-[5px]">
                                                    <h4 className="text-[1.7rem] font-[600] text-client-secondary">{review.title}</h4>
                                                    <div className="flex items-center gap-[2px]">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon
                                                                key={i}
                                                                sx={{
                                                                    fontSize: "2rem !important",
                                                                    color: i < review.rating ? "#F9A61C !important" : "#ccc !important",
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[1.3rem] text-client-secondary mb-[10px]">{review.date}</p>
                                                <p className="text-[#7d7b7b] text-[1.4rem] line-clamp-2 leading-relaxed">
                                                    {review.content}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

