import { Link } from "react-router-dom"

export const Section2 = () => {
    return (
        <div className="bg-[#F6F2ED] relative">
            <img src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/10/shape1-17.png" alt="" className="absolute top-[20%] left-[5%] animation-shake" width={76} height={57} />
            <img src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/10/shape1-12.png" alt="" className="absolute top-[20%] right-[5%] animation-shake" width={64} height={70} />
            <img src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/10/shape1-6.png" alt="" className="absolute bottom-[27%] left-[5%] animation-heartbeat" width={66} height={67} />
            <img src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/10/shape1-5.png" alt="" className="absolute top-[65%] right-[5%] animation-jumpReverseAni" width={65} height={76} />
            <img src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/09/shape1-24.png" alt="" className="absolute bottom-[0.1%] left-[-1%] animation-moving" width={386} height={184} />
            <div className="app-container w-[1320px] py-[120px] flex flex-wrap justify-center">
                <div className="text-[#F8721F] font-[700] inline-flex items-center service-sub-title py-[11px] mb-[24px]">
                    <img
                        src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/08/subtitle-icon.svg"
                        alt=""
                        width={31}
                        height={24}
                    />
                    <div className="ml-[10px]">cam kết</div>
                </div>
                <h2 className="w-full text-center font-secondary text-[4.5rem] mb-[15px]">Trái tim trung thành – Mái ấm trọn đời.</h2>
                <p className="text-[#6C6D71] mb-[18px] font-[500] text-[1.8rem]">Dịch vụ chăm sóc toàn diện, mang đến trải nghiệm nghỉ dưỡng thoải mái và an toàn nhất cho thú cưng của bạn.</p>
                <div className="flex w-full items-center">
                    <div className="w-[50%] p-[46px] relative">
                        <div className="mt-[30px]">
                            <div className="mb-[25px] overflow-hidden rounded-[16px]">
                                <img
                                    src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/09/pricing-1-1.jpg"
                                    alt=""
                                    className="rounded-[16px] hover:scale-[1.05] transition-all duration-[400ms] object-cover"
                                />
                            </div>
                            <div className="w-[65%]">
                                <h3 className="text-[2.4rem] font-[700] text-[#02000F] mb-[5px]">Khách sạn cho chó</h3>
                                <p className="mb-[5px] text-[2rem] text-[#02000F]">Chỉ từ <span className="ml-[5px]">100.000đ</span></p>
                                <p className="text-[#6C6D71] font-[500]">Không gian nghỉ dưỡng lý tưởng giúp cún cưng thư giãn, vui chơi và được chăm sóc chu đáo.</p>
                            </div>
                            <Link
                                to="/dat-lich"
                                className="service-book-now"
                            >
                                Đặt ngay
                            </Link>
                        </div>
                    </div>
                    <div className="w-[50%] p-[46px]">
                        <div className="flex gap-[20px] relative mb-[84px]">
                            <div className="overflow-hidden rounded-[16px] w-[132px] h-[140px]">
                                <img
                                    src="https://wordpress.themehour.net/babet/wp-content/uploads/2025/09/pricing-1-2.jpg"
                                    alt=""
                                    className="rounded-[16px] hover:scale-[1.05] transition-all duration-[400ms] w-full h-full object-cover"
                                    width={132}
                                    height={140}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="w-[90%]">
                                    <h3 className="text-[2.4rem] font-[700] text-[#02000F] mb-[5px]">Khách sạn cho mèo</h3>
                                    <p className="mb-[5px] text-[2rem] text-[#02000F]">Chỉ từ 100.00đ</p>
                                    <p className="text-[#6C6D71] font-[500]">Dịch vụ lưu trú dành riêng cho mèo, đảm bảo sạch sẽ, riêng tư và được chăm sóc chu đáo từng giờ.</p>
                                </div>
                                <Link
                                    to="/dat-lich"
                                    className="service-book-now service-book-now-small"
                                >
                                    Đặt ngay
                                </Link>
                            </div>
                        </div>
                        <div className="flex gap-[20px] relative">
                            <div className="overflow-hidden rounded-[16px] w-[132px] h-[140px]">
                                <img
                                    src="https://i.imgur.com/2wrEgDa.jpeg"
                                    alt=""
                                    className="rounded-[16px] hover:scale-[1.05] transition-all duration-[400ms] w-full h-full object-cover"
                                    width={132}
                                    height={140}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="w-[90%]">
                                    <h3 className="text-[2.4rem] font-[700] text-[#02000F] mb-[5px]">Spa & Chăm sóc thú cưng</h3>
                                    <p className="mb-[5px] text-[2rem] text-[#02000F]">Chỉ từ 100.00đ</p>
                                    <p className="text-[#6C6D71] font-[500]">Dịch vụ lưu trú dành riêng cho mèo, đảm bảo sạch sẽ, riêng tư và được chăm sóc chu đáo từng giờ.</p>
                                </div>
                                <Link
                                    to="/dat-lich"
                                    className="service-book-now service-book-now-small"
                                >
                                    Đặt ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}