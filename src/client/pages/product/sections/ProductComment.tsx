import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useState } from "react";

export const ProductComment = () => {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);

    return (
        <div>
            <div className="app-container">
                <h2 className="text-[35px] 2xl:text-[28px] font-secondary text-client-secondary">Đánh giá của khách hàng</h2>
                <ul className="mb-[60px]">
                    <li className="py-[30px] border-b border-[#10293726] mb-[30pxx] flex">
                        <div className="flex">
                            <img src="https://secure.gravatar.com/avatar/4b4d70c085ba692974261304da0860f360cb1f3a616203402e9e19f2d3bda5f8?s=60&d=mm&r=g" alt="" width={60} height={60} className="w-[60px] h-[60px] rounded-[10px] border border-[#e1dde7]" />
                            <div className="ml-[20px] w-[74.2%]">
                                <div className="flex items-center mb-[10px]">
                                    <strong className="font-secondary text-[16px] text-client-secondary">Hihhihi</strong>
                                    <span className="text-client-text mx-[5px]">-</span>
                                    <span className="text-client-text text-[14px]">24 / 6 / 2025</span>
                                </div>
                                <p className="text-client-text leading-[1.8]">Sản phẩm thật sự vượt ngoài mong đợi! 💯 Chất lượng tốt, thiết kế tinh tế và sử dụng rất dễ dàng. Sau một thời gian trải nghiệm, mình cảm thấy rất hài lòng — đáng đồng tiền bát gạo. Giao hàng nhanh, đóng gói cẩn thận, dịch vụ hỗ trợ cũng cực kỳ nhiệt tình. Sẽ tiếp tục ủng hộ trong tương lai! 🌟</p>
                            </div>
                        </div>
                        <div className="flex items-center items-stretch">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    sx={{
                                        fontSize: "20px !important",
                                        color: i < 5 ? "#ffbb00 !important" : "#ccc !important",
                                    }}
                                />
                            ))}
                        </div>
                    </li>
                    <li className="py-[30px] border-b border-[#10293726] mb-[30pxx] flex">
                        <div className="flex">
                            <img src="https://secure.gravatar.com/avatar/4b4d70c085ba692974261304da0860f360cb1f3a616203402e9e19f2d3bda5f8?s=60&d=mm&r=g" alt="" width={60} height={60} className="w-[60px] h-[60px] rounded-[10px] border border-[#e1dde7]" />
                            <div className="ml-[20px] w-[74.2%]">
                                <div className="flex items-center mb-[10px]">
                                    <strong className="font-secondary text-[16px] text-client-secondary">Hihhihi</strong>
                                    <span className="text-client-text mx-[5px]">-</span>
                                    <span className="text-client-text text-[14px]">24 / 6 / 2025</span>
                                </div>
                                <p className="text-client-text leading-[1.8]">Sản phẩm thật sự vượt ngoài mong đợi! 💯 Chất lượng tốt, thiết kế tinh tế và sử dụng rất dễ dàng. Sau một thời gian trải nghiệm, mình cảm thấy rất hài lòng — đáng đồng tiền bát gạo. Giao hàng nhanh, đóng gói cẩn thận, dịch vụ hỗ trợ cũng cực kỳ nhiệt tình. Sẽ tiếp tục ủng hộ trong tương lai! 🌟</p>
                            </div>
                        </div>
                        <div className="flex items-stretch">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    sx={{
                                        fontSize: "20px !important",
                                        color: i < 5 ? "#ffbb00 !important" : "#ccc !important",
                                    }}
                                />
                            ))}
                        </div>
                    </li>
                </ul>
            </div>
            <form className="app-container  mt-[70px] pb-[150px] 2xl:pb-[120px]">
                <h3 className="text-[30px] 2xl:text-[24px] font-secondary text-client-secondary mb-[20px]">Thêm đánh giá</h3>
                <p className="text-client-text font-[500] mb-[20px]">Địa chỉ email của bạn sẽ không được công khai. Các trường bắt buộc được đánh dấu <span className="text-[#FF0000]">*</span></p>
                <label className="text-client-text block font-[500] mb-[5px]" htmlFor="">Đánh giá của bạn</label>
                <div className="flex mb-[20px]">
                    {[...Array(5)].map((_, i) => {
                        const index = i + 1;
                        const isActive = index <= (hoverRating || rating);

                        return (
                            <div
                                key={index}
                                onMouseEnter={() => setHoverRating(index)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(index)}
                                className="cursor-pointer"
                            >
                                {isActive ? (
                                    <StarIcon
                                        sx={{
                                            fontSize: "28px",
                                            color: "#FF6262",
                                        }}
                                    />
                                ) : (
                                    <StarBorderIcon
                                        sx={{
                                            fontSize: "28px",
                                            color: "#ccc",
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
                <label className="text-client-text font-[500] block mb-[5px]" htmlFor="comment">Bình luận của bạn <span className="text-[#FF0000]">*</span></label>
                <textarea name="comment" id="comment" className="outline-none text-client-text h-[150px] w-full rounded-[20px] border border-[#d7d7d7] bg-white py-[16px] px-[32px] mb-[20px]"></textarea>
                <div className="flex gap-[20px] mb-[20px]">
                    <div className="flex-1">
                        <label className="text-client-text font-[500] block mb-[5px]" htmlFor="fullname">Tên <span className="text-[#FF0000]">*</span></label>
                        <input type="text" id="fullname" className="outline-none text-client-text h-[58px] w-full rounded-[40px] border border-[#d7d7d7] bg-white py-[16px] px-[32px]" />
                    </div>
                    <div className="flex-1">
                        <label className="text-client-text font-[500] block mb-[5px]" htmlFor="email">Email <span className="text-[#FF0000]">*</span></label>
                        <input type="email" id="email" className="outline-none text-client-text h-[58px] w-full rounded-[40px] border border-[#d7d7d7] bg-white py-[16px] px-[32px]" />
                    </div>
                </div>
                <div className="flex items-center mb-[30px] checkbox">
                    <input type="checkbox" name="" id="check" hidden />
                    <label htmlFor="check" className="pl-[12px] font-[500] text-client-text">Lưu tên, email và trang web của tôi trong trình duyệt này cho lần bình luận tiếp theo.</label>
                </div>
                <button type="submit" className="min-w-[150px] cursor-pointer bg-client-primary hover:bg-client-secondary transition-default text-white font-secondary px-[30px] py-[16px] rounded-[50px]">Xác nhận</button>
            </form>
        </div>
    )
}