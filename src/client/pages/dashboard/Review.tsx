import { Link } from "react-router-dom";
import { ProductBanner } from "../product/sections/ProductBanner";
import { Sidebar } from "./sections/Sidebar";
import StarIcon from "@mui/icons-material/Star";


export const ReviewPage = () => {
    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Tài khoản", to: "/dashboard/profile" },
        { label: "Đánh giá của tôi", to: `/dashboard/review` },
    ];

    return (
        <>
            <ProductBanner
                pageTitle="Đánh giá của tôi"
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
                            Đánh giá của tôi
                        </h3>
                        {/* <div className="p-[50px] border border-[#eee] rounded-[10px] flex flex-col items-center justify-center text-center space-y-[20px]">
                            <div className="w-[100px] h-[100px] bg-gray-50 rounded-full flex items-center justify-center">
                                <span className="text-[4rem]">✍️</span>
                            </div>
                            <div className="space-y-[5px]">
                                <p className="text-[1.8rem] font-[600] text-client-secondary tracking-tight">Chưa có đánh giá nào</p>
                                <p className="text-[1.5rem] text-[#7d7b7b]">Bạn chưa thực hiện đánh giá cho sản phẩm nào.</p>
                            </div>
                        </div> */}
                        <div className="border border-[#eee] p-[20px] mb-[20px] rounded-[10px] flex">
                            <img className="w-[70px] h-[70px] rounded-full overflow-hidden border-[3px] shadow-[0px_7px_29px_0px_#64646f33] border-white object-cover" src="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-11c-1000x1048.jpg" alt="" />
                            <div className="pl-[25px] w-full">
                                <h5 className="text-[1.7rem] flex justify-between items-center font-[600] text-client-secondary hover:text-client-primary transition-default">
                                    <Link to={"#"}>Denim 2 Quarter Pant</Link>
                                    <span className="flex items-center gap-[2px]">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                sx={{
                                                    fontSize: "2rem !important",
                                                    color: "#F9A61C !important",
                                                }}
                                            />
                                        ))}
                                    </span>
                                </h5>
                                <p className="text-[1.3rem] text-client-secondary mt-[2px] mb-[13px]">05 January 2025</p>
                                <p className="text-[#7d7b7b] text-[1.4rem]">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos voluptate nesciunt facilis itaque.</p>
                            </div>
                        </div>
                        <div className="border border-[#eee] p-[20px] mb-[20px] rounded-[10px] flex">
                            <img className="w-[70px] h-[70px] rounded-full overflow-hidden border-[3px] shadow-[0px_7px_29px_0px_#64646f33] border-white object-cover" src="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-11c-1000x1048.jpg" alt="" />
                            <div className="pl-[25px] w-full">
                                <h5 className="text-[1.7rem] flex justify-between items-center font-[600] text-client-secondary hover:text-client-primary transition-default">
                                    <Link to={"#"}>Denim 2 Quarter Pant</Link>
                                    <span className="flex items-center gap-[2px]">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                sx={{
                                                    fontSize: "2rem !important",
                                                    color: "#F9A61C !important",
                                                }}
                                            />
                                        ))}
                                    </span>
                                </h5>
                                <p className="text-[1.3rem] text-client-secondary mt-[2px] mb-[13px]">05 January 2025</p>
                                <p className="text-[#7d7b7b] text-[1.4rem]">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos voluptate nesciunt facilis itaque.</p>
                            </div>
                        </div>
                        <div className="border border-[#eee] p-[20px] mb-[20px] rounded-[10px] flex">
                            <img className="w-[70px] h-[70px] rounded-full overflow-hidden border-[3px] shadow-[0px_7px_29px_0px_#64646f33] border-white object-cover" src="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-11c-1000x1048.jpg" alt="" />
                            <div className="pl-[25px] w-full">
                                <h5 className="text-[1.7rem] flex justify-between items-center font-[600] text-client-secondary hover:text-client-primary transition-default">
                                    <Link to={"#"}>Denim 2 Quarter Pant</Link>
                                    <span className="flex items-center gap-[2px]">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                sx={{
                                                    fontSize: "2rem !important",
                                                    color: "#F9A61C !important",
                                                }}
                                            />
                                        ))}
                                    </span>
                                </h5>
                                <p className="text-[1.3rem] text-client-secondary mt-[2px] mb-[13px]">05 January 2025</p>
                                <p className="text-[#7d7b7b] text-[1.4rem]">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos voluptate nesciunt facilis itaque.</p>
                            </div>
                        </div>
                        <div className="border border-[#eee] p-[20px] mb-[20px] rounded-[10px] flex">
                            <img className="w-[70px] h-[70px] rounded-full overflow-hidden border-[3px] shadow-[0px_7px_29px_0px_#64646f33] border-white object-cover" src="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/product-img-11c-1000x1048.jpg" alt="" />
                            <div className="pl-[25px] w-full">
                                <h5 className="text-[1.7rem] flex justify-between items-center font-[600] text-client-secondary hover:text-client-primary transition-default">
                                    <Link to={"#"}>Denim 2 Quarter Pant</Link>
                                    <span className="flex items-center gap-[2px]">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                sx={{
                                                    fontSize: "2rem !important",
                                                    color: "#F9A61C !important",
                                                }}
                                            />
                                        ))}
                                    </span>
                                </h5>
                                <p className="text-[1.3rem] text-client-secondary mt-[2px] mb-[13px]">05 January 2025</p>
                                <p className="text-[#7d7b7b] text-[1.4rem]">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus exercitationem accusantium obcaecati quos voluptate nesciunt facilis itaque.</p>
                            </div>
                        </div>

                        {/* Pagination */}
                        <ul className="flex items-center mt-[50px] justify-center gap-[11px]">
                            <li className="flex items-center cursor-pointer justify-center bg-client-secondary text-white rounded-full w-[4.5rem] h-[4.5rem]">1</li>
                            <li className="flex items-center cursor-pointer justify-center bg-client-primary hover:bg-client-secondary transition-default text-white rounded-full w-[4.5rem] h-[4.5rem]">2</li>
                            <div className="w-[4.5rem] h-[4.5rem] rounded-full bg-client-primary hover:bg-client-secondary cursor-pointer transition-default flex items-center justify-center next-button"></div>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};
