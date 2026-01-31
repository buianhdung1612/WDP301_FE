import { FooterSub } from "../../components/layouts/FooterSub";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PhoneEnabledOutlinedIcon from '@mui/icons-material/PhoneEnabledOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import { useState } from "react";

export const BookingPage = () => {
    const [isOpenTime, setIsOpenTime] = useState(false);
    const [isOpenService, setIsOpenService] = useState(false);
    const [selectedTime, setSelectedTime] = useState("8:00");
    const [selectedService, setSelectedService] = useState("Chọn dịch vụ");

    const times = [
        "8:00",
        "9:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
    ];

    const services = [
        "Khách sạn cho chó",
        "Khách sạn cho mèo",
        "Spa & Chăm sóc thú cưng",
    ];

    const handleSelectTime = (time: string) => {
        setSelectedTime(time);
        setIsOpenTime(false);
    };

    const handleSelectService = (service: string) => {
        setSelectedService(service);
        setIsOpenService(false);
    };

    return (
        <>
            <div className="relative">
                <div className="app-container flex py-[100px] bg-white">
                    <div className="px-[20px] w-[42%] z-[10]">
                        <p className="uppercase text-client-secondary text-[1.7rem] font-[700] mb-[15px]">
                            Dịch vụ cao cấp
                        </p>
                        <h2 className="text-[5.7rem] 2xl:text-[5.7rem] 2xl:font-[500] text-[#181818] leading-[1.2] font-third mb-[20px]">
                            Hãy để chúng tôi chăm sóc bé cưng của bạn
                        </h2>
                        <p className="text-[#505050] font-[500] text-[1.8rem] inline-block mt-[15px]">
                            Hãy mang bé cưng đến với chúng tôi – nơi đội ngũ chuyên viên sẽ
                            chăm sóc tận tâm và chuyên nghiệp nhất.
                        </p>
                    </div>
                </div>
                <img
                    className="absolute right-[0%] max-w-[58%] top-[-20%] 2xl:top-[-17%]"
                    src="https://pawsitive.bold-themes.com/coco/wp-content/uploads/sites/3/2019/08/hero_image_13-1.png"
                    alt=""
                />
            </div>

            <div className="app-container flex py-[100px]">
                <div className="w-[50%] px-[30px]">
                    <h2 className="text-[4.7rem] font-third text-[#181818] mb-[64px]">
                        Liên hệ chúng tôi
                    </h2>

                    <div className="flex gap-[16px] mb-[32px] group">
                        <div className="w-[45px] h-[45px] text-[#181818] flex items-center justify-center shadow-[0_0_72px_#afe2e5_inset] group-hover:shadow-[0_0_4px_#afe2e5_inset] transition-all duration-200 ease rounded-full">
                            <EditLocationAltIcon style={{ fontSize: "2.8rem" }} />
                        </div>
                        <div>
                            <div className="text-[2rem] font-[700] mb-[10px] group-hover:text-[#ffbaa0] cursor-pointer transition-default">
                                Địa điểm
                            </div>
                            <p>64 Ung Văn Khiêm, Pleiku, Gia Lai</p>
                        </div>
                    </div>

                    <div className="flex gap-[16px] mb-[32px] group">
                        <div className="w-[45px] h-[45px] text-[#181818] flex items-center justify-center shadow-[0_0_72px_#cfecbc_inset] group-hover:shadow-[0_0_4px_#cfecbc_inset] transition-all duration-200 ease rounded-full">
                            <EditLocationAltIcon style={{ fontSize: "2.8rem" }} />
                        </div>
                        <div>
                            <div className="text-[2rem] font-[700] mb-[10px] group-hover:text-[#ffbaa0] cursor-pointer transition-default">
                                Thời gian
                            </div>
                            <p>Thứ 2 - Thứ 7: 7:00 sáng - 4:00 chiều</p>
                        </div>
                    </div>

                    <div className="flex gap-[16px] mb-[32px] group">
                        <div className="w-[45px] h-[45px] text-[#181818] flex items-center justify-center shadow-[0_0_72px_#ffbaa0_inset] group-hover:shadow-[0_0_4px_#ffbaa0_inset] transition-all duration-300 ease rounded-full">
                            <RocketLaunchIcon style={{ fontSize: "2.8rem" }} />
                        </div>
                        <div>
                            <div className="text-[2rem] font-[700] mb-[10px] group-hover:text-[#ffbaa0] cursor-pointer transition-default">
                                Chăm sóc di động
                            </div>
                            <p>
                                Bạn có thể theo dõi thú cưng của mình qua camera ngay trên điện
                                thoại.
                            </p>
                        </div>
                    </div>

                    <div className="w-[335px] h-[190px]">
                        <img src="https://pawsitive.bold-themes.com/coco/wp-content/uploads/sites/3/2019/07/text_04.png" alt="" width={335} height={190} className="image-phone-booking cursor-pointer" />
                    </div>
                </div>

                <div className="w-[50%] px-[30px] py-[50px]">
                    <form className="p-[40px] bg-[#e67e2026] rounded-[50px] w-[580px]">
                        <input
                            type="text"
                            placeholder="Họ và tên"
                            name="fullname"
                            className="w-full mb-[30px] py-[16px] text-[#181818] outline-none px-[24px] border border-[#181818] focus:border-[#ffbaa0] transition-colors duration-500 rounded-[50px]"
                        />

                        <div className="flex justify-between">
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                className="w-[230px] mb-[30px] py-[16px] text-[#181818] outline-none px-[24px] border border-[#181818] focus:border-[#ffbaa0] transition-colors duration-500 rounded-[50px]"
                            />
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                name="phone"
                                className="w-[230px] mb-[30px] py-[16px] text-[#181818] outline-none px-[24px] border border-[#181818] focus:border-[#ffbaa0] transition-colors duration-500 rounded-[50px]"
                            />
                        </div>

                        <input
                            type="text"
                            placeholder="Địa chỉ"
                            name="address"
                            className="w-full mb-[30px] py-[16px] text-[#181818] outline-none px-[24px] border border-[#181818] focus:border-[#ffbaa0] transition-colors duration-500 rounded-[50px]"
                        />

                        {/* Select thời gian */}
                        <div className="flex justify-between relative mb-[30px]">
                            <input
                                type="date"
                                name="date"
                                className="w-[234px] py-[16px] text-[#181818] outline-none px-[24px] border border-[#181818] focus:border-[#ffbaa0] transition-colors duration-500 rounded-[50px]"
                            />

                            <div className="relative w-[250px]">
                                <div
                                    onClick={() => {
                                        setIsOpenTime(!isOpenTime);
                                        setIsOpenService(false);
                                    }}
                                    className="w-full rounded-[50px] py-[16px] text-[#828282] cursor-pointer outline-none px-[24px] border border-[#181818] focus:border-[#ffbaa0] transition-colors duration-500 flex justify-between items-center"
                                >
                                    <span>{selectedTime}</span>
                                    {isOpenTime ? (
                                        <KeyboardArrowUpIcon
                                            className="text-[#828282]"
                                            style={{ fontSize: "3rem" }}
                                        />
                                    ) : (
                                        <KeyboardArrowDownIcon
                                            className="text-[#828282]"
                                            style={{ fontSize: "3rem" }}
                                        />
                                    )}
                                </div>

                                {isOpenTime && (
                                    <ul className="absolute right-0 top-[70px] w-full max-h-[320px] overflow-y-auto border border-[#00000012] text-[#181818] bg-white rounded-[20px] shadow-lg z-10">
                                        {times.map((time) => (
                                            <li
                                                key={time}
                                                onClick={() => handleSelectTime(time)}
                                                className="py-[8px] px-[16px] hover:text-[#ffbaa0] transition-colors duration-150 cursor-pointer"
                                            >
                                                {time}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Select dịch vụ */}
                        <div className="relative w-full mb-[30px]">
                            <div
                                onClick={() => {
                                    setIsOpenService(!isOpenService);
                                    setIsOpenTime(false);
                                }}
                                className="w-full rounded-[50px] py-[16px] text-[#828282] cursor-pointer outline-none px-[24px] border border-[#181818] focus:border-[#ffbaa0] transition-colors duration-500 flex justify-between items-center"
                            >
                                <span>{selectedService}</span>
                                {isOpenService ? (
                                    <KeyboardArrowUpIcon
                                        className="text-[#828282]"
                                        style={{ fontSize: "3rem" }}
                                    />
                                ) : (
                                    <KeyboardArrowDownIcon
                                        className="text-[#828282]"
                                        style={{ fontSize: "3rem" }}
                                    />
                                )}
                            </div>

                            {isOpenService && (
                                <ul className="absolute right-0 top-[70px] w-full max-h-[320px] overflow-y-auto border border-[#00000012] text-[#181818] bg-white rounded-[20px] shadow-lg z-10">
                                    {services.map((service) => (
                                        <li
                                            key={service}
                                            onClick={() => handleSelectService(service)}
                                            className="py-[8px] px-[16px] hover:text-[#ffbaa0] transition-colors duration-150 cursor-pointer"
                                        >
                                            {service}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <textarea name="message" maxLength={2000} placeholder="Lời nhắn" rows={10} className="mb-[40px] w-full h-[110px] text-[#181818] py-[16px] px-[24px] outline-none border border-[#181818] focus:border-[#ffbaa0] transition-colors duration-500 rounded-[20px]"></textarea>
                        <button type="submit" className="text-[#181818] rounded-[50px] shadow-[0_0_0_72px_#ffbaa0_inset] hover:shadow-[0_0_0_2px_#ffbaa0_inset] w-[120px] h-[41px] font-[500] cursor-pointer transition-all duration-300">Gửi</button>
                    </form>
                </div>
            </div>

            <div className="app-container flex gap-[30px] pb-[100px]">
                <div className="w-[413px] px-[20px]">
                    <div className="w-full h-[206px]">
                        <img src="https://pawsitive.bold-themes.com/coco/wp-content/uploads/sites/3/2019/08/inner_image_maps_02.png" alt="" width={413} height={206} className="w-full h-full object-cover rounded-t-[50px]" />
                    </div>
                    <div className="bg-[#e67e2026] px-[30px] pt-[32px] pb-[40px] rounded-b-[50px]">
                        <div className="flex mb-[32px]">
                            <div className="w-[45px] h-[45px] text-[#ffbaa0]">
                                <EditLocationAltIcon style={{
                                    fontSize: "4rem"
                                }} />
                            </div>
                            <div className="pl-[20px]">
                                <div className="text-[2.2rem] font-[800] text-[#181818] mb-[12px]">Địa chỉ</div>
                                <p className="text-[#181818]">64 Ung Văn Khiêm, Pleiku, Gia Lai</p>
                            </div>
                        </div>
                        <div className="flex mb-[32px]">
                            <div className="w-[45px] h-[45px] text-[#ffbaa0]">
                                <PhoneEnabledOutlinedIcon style={{
                                    fontSize: "4rem"
                                }} />
                            </div>
                            <div className="pl-[20px]">
                                <div className="text-[2.2rem] font-[800] text-[#181818] mb-[12px]">Số điện thoại</div>
                                <p className="text-[#181818]">+84346587796</p>
                                <p className="text-[#181818]">+84346587796</p>
                            </div>
                        </div>
                        <div className="flex mb-[32px]">
                            <div className="w-[45px] h-[45px] text-[#ffbaa0]">
                                <MailOutlineOutlinedIcon style={{
                                    fontSize: "4rem"
                                }} />
                            </div>
                            <div className="pl-[20px]">
                                <div className="text-[2.2rem] font-[800] text-[#181818] mb-[12px]">E-mail</div>
                                <p className="text-[#181818]">teddypet@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.610010397031!2d106.809883!3d10.841127599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1761230475278!5m2!1sen!2s" width="100%" height="100%" loading="lazy"></iframe>
                </div>
            </div>

            <FooterSub />
        </>
    );
};
