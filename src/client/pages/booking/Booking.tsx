import { FooterSub } from "../../components/layouts/FooterSub";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PhoneEnabledOutlinedIcon from '@mui/icons-material/PhoneEnabledOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Scissors, Bath, Sparkles, Info, Calendar } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useServices } from "../../hooks/useService";

// Icon mapping based on service name or category
const getServiceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("tắm")) return <Bath className="w-5 h-5" />;
    if (n.includes("tỉa") || n.includes("grooming")) return <Scissors className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
};

// Color mapping for variety
const COLORS = ["#afe2e5", "#cfecbc", "#ffbaa0", "#d0bfff", "#fff4b3", "#ffd1dc"];

const TIME_SLOTS = [
    "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

export const BookingPage = () => {
    const { data: allServices = [], isLoading } = useServices();

    // Filter for individual services (STANDALONE or BOTH)
    const services = useMemo(() => {
        return allServices.filter((s: any) => {
            const bookingType = s.categoryId?.bookingTypes;
            // If category is missing, we still might want to show it as standalone by default
            return !bookingType || bookingType === "STANDALONE" || bookingType === "BOTH";
        }).map((s: any, index: number) => ({
            id: s._id,
            name: s.name,
            price: s.basePrice || (s.priceList && s.priceList[0]?.value) || 0,
            icon: getServiceIcon(s.name),
            color: COLORS[index % COLORS.length]
        }));
    }, [allServices]);

    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService || !selectedTime) {
            toast.error("Vui lòng chọn đầy đủ dịch vụ và thời gian!");
            return;
        }
        toast.success("Yêu cầu đặt lịch của bạn đã được nhận! Chúng tôi sẽ gọi xác nhận sớm.");
    };

    return (
        <div className="bg-[#fcfcfc]">
            {/* --- HERO SECTION (Restored to Original) --- */}
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
                    alt="Pawsitive Mascot"
                />
            </div>

            {/* --- BOOKING & CONTACT SECTION --- */}
            <div className="app-container flex py-[80px] flex-col lg:flex-row gap-[40px]">
                {/* Left Side: Contact Info (Original Style) */}
                <div className="w-full lg:w-[45%] px-[20px]">
                    <h2 className="text-[4rem] font-third text-[#181818] mb-[50px]">
                        Liên hệ chúng tôi
                    </h2>

                    <div className="space-y-[40px]">
                        <div className="flex gap-[16px] group">
                            <div className="w-[50px] h-[50px] text-[#181818] flex items-center justify-center shadow-[0_0_72px_#afe2e5_inset] rounded-full shrink-0 group-hover:scale-110 transition-transform">
                                <EditLocationAltIcon style={{ fontSize: "2.4rem" }} />
                            </div>
                            <div>
                                <div className="text-[2rem] font-[700] mb-[5px] group-hover:text-client-secondary transition-colors">Địa điểm</div>
                                <p className="text-[1.6rem] text-[#505050]">64 Ung Văn Khiêm, Pleiku, Gia Lai</p>
                            </div>
                        </div>

                        <div className="flex gap-[16px] group">
                            <div className="w-[50px] h-[50px] text-[#181818] flex items-center justify-center shadow-[0_0_72px_#cfecbc_inset] rounded-full shrink-0 group-hover:scale-110 transition-transform">
                                <EditLocationAltIcon style={{ fontSize: "2.4rem" }} />
                            </div>
                            <div>
                                <div className="text-[2rem] font-[700] mb-[5px] group-hover:text-client-secondary transition-colors">Thời gian</div>
                                <p className="text-[1.6rem] text-[#505050]">7:00 AM - 6:00 PM (Thứ 2 - Chủ Nhật)</p>
                            </div>
                        </div>

                        <div className="flex gap-[16px] group">
                            <div className="w-[50px] h-[50px] text-[#181818] flex items-center justify-center shadow-[0_0_72px_#ffbaa0_inset] rounded-full shrink-0 group-hover:scale-110 transition-transform">
                                <RocketLaunchIcon style={{ fontSize: "2.4rem" }} />
                            </div>
                            <div>
                                <div className="text-[2rem] font-[700] mb-[5px] group-hover:text-client-secondary transition-colors">Dịch vụ Spa</div>
                                <p className="text-[1.6rem] text-[#505050]">Cắt tỉa, tắm rửa và làm đẹp theo phong cách quốc tế.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-[60px] hidden md:block">
                        <img src="https://pawsitive.bold-themes.com/coco/wp-content/uploads/sites/3/2019/07/text_04.png" alt="" width={330} />
                    </div>
                </div>

                {/* Right Side: Enhanced Booking Form (Same Frame) */}
                <div className="w-full lg:w-[55%] px-[20px]">
                    <form onSubmit={handleSubmit} className="p-[35px] md:p-[45px] bg-[#e67e2015] border border-[#e67e2030] rounded-[50px] shadow-sm">
                        <h3 className="text-[3rem] font-third text-[#181818] mb-[35px] text-center">Đặt lịch ngay</h3>

                        <div className="space-y-[25px]">
                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                                <input
                                    type="text"
                                    placeholder="Họ và tên"
                                    required
                                    className="w-full py-[14px] px-[24px] border border-[#18181820] rounded-[50px] outline-none focus:border-client-secondary bg-white text-[1.5rem]"
                                />
                                <input
                                    type="text"
                                    placeholder="Số điện thoại"
                                    required
                                    className="w-full py-[14px] px-[24px] border border-[#18181820] rounded-[50px] outline-none focus:border-client-secondary bg-white text-[1.5rem]"
                                />
                            </div>

                            <input
                                type="email"
                                placeholder="Email (Tùy chọn)"
                                className="w-full py-[14px] px-[24px] border border-[#18181820] rounded-[50px] outline-none focus:border-client-secondary bg-white text-[1.5rem]"
                            />

                            {/* Service Selection - Grid based instead of dropdown */}
                            <div>
                                <label className="block text-[1.6rem] font-bold text-[#181818] mb-[15px] ml-[10px]">
                                    1. Chọn dịch vụ Grooming & Spa:
                                </label>
                                <div className="grid grid-cols-2 gap-[10px] relative min-h-[100px]">
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-client-secondary"></div>
                                        </div>
                                    )}
                                    {!isLoading && services.length === 0 && (
                                        <div className="col-span-2 py-[20px] text-center text-[1.4rem] text-[#637381]">
                                            Hiện chưa có dịch vụ lẻ nào khả dụng.
                                        </div>
                                    )}
                                    {services.map((s: any) => (
                                        <motion.div
                                            key={s.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedService(s.id)}
                                            className={`relative p-[15px] rounded-[25px] border-2 cursor-pointer bg-white transition-all flex items-center gap-[12px] ${selectedService === s.id
                                                ? "border-client-secondary shadow-md"
                                                : "border-transparent hover:border-[#18181810]"
                                                }`}
                                        >
                                            <div
                                                className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: `${s.color}40`, color: "#181818" }}
                                            >
                                                {s.icon}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[1.4rem] font-bold leading-tight">{s.name}</span>
                                                <span className="text-client-secondary font-bold text-[1.3rem]">{s.price.toLocaleString()}đ</span>
                                            </div>
                                            {selectedService === s.id && (
                                                <motion.div layoutId="check" className="absolute top-2 right-2">
                                                    <Check className="w-4 h-4 text-client-secondary" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* DateTime Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
                                <div>
                                    <label className="flex items-center gap-2 text-[1.5rem] font-bold text-[#181818] mb-[10px] ml-[10px]">
                                        <Calendar className="w-4 h-4 text-client-secondary" />
                                        2. Chọn ngày:
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={dayjs().format("YYYY-MM-DD")}
                                        className="w-full py-[12px] px-[20px] border border-[#18181820] rounded-[50px] outline-none focus:border-client-secondary bg-white text-[1.4rem]"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-[1.5rem] font-bold text-[#181818] mb-[10px] ml-[10px]">
                                        <Clock className="w-4 h-4 text-client-secondary" />
                                        3. Chọn giờ:
                                    </label>
                                    <div className="grid grid-cols-4 gap-[6px]">
                                        {TIME_SLOTS.map((time) => (
                                            <button
                                                type="button"
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`py-[8px] rounded-[15px] text-[1.2rem] font-bold border transition-all ${selectedTime === time
                                                    ? "bg-client-secondary text-white border-client-secondary shadow-sm"
                                                    : "bg-white border-[#18181815] text-[#181818] hover:border-client-secondary"
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <textarea
                                placeholder="Ghi chú thêm về bé cưng của bạn..."
                                rows={2}
                                className="w-full py-[14px] px-[24px] border border-[#18181820] rounded-[20px] outline-none focus:border-client-secondary bg-white text-[1.5rem] resize-none"
                            ></textarea>

                            <div className="flex items-start gap-[10px] p-[15px] bg-white/50 rounded-[20px] border border-dashed border-client-secondary/40">
                                <Info className="w-5 h-5 text-client-secondary shrink-0 mt-[2px]" />
                                <p className="text-[1.3rem] text-[#505050] font-[500]">
                                    Quý khách vui lòng đến đúng giờ đã hẹn. Nếu trễ quá 15 phút, TeddyPet xin phép dời lịch để đảm bảo chất lượng phục vụ.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-[16px] rounded-[50px] bg-client-secondary text-[#181818] font-bold text-[1.8rem] shadow-sm hover:bg-orange-400 active:scale-[0.98] transition-all"
                            >
                                Xác nhận đặt lịch
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- MAP SECTION (Original Layout) --- */}
            <div className="app-container flex gap-[30px] pb-[100px] flex-col md:flex-row">
                <div className="w-full md:w-[413px]">
                    <div className="w-full h-[200px]">
                        <img src="https://pawsitive.bold-themes.com/coco/wp-content/uploads/sites/3/2019/08/inner_image_maps_02.png" alt="" className="w-full h-full object-cover rounded-t-[50px]" />
                    </div>
                    <div className="bg-[#e67e2015] p-[35px] rounded-b-[50px] border-x border-b border-[#e67e2030]">
                        <div className="space-y-[30px]">
                            <div className="flex gap-[15px]">
                                <EditLocationAltIcon className="text-client-secondary" style={{ fontSize: "3.5rem" }} />
                                <div>
                                    <div className="text-[2rem] font-bold text-[#181818]">Địa chỉ</div>
                                    <p className="text-[1.5rem] text-[#505050]">64 Ung Văn Khiêm, Pleiku, Gia Lai</p>
                                </div>
                            </div>
                            <div className="flex gap-[15px]">
                                <PhoneEnabledOutlinedIcon className="text-client-secondary" style={{ fontSize: "3.5rem" }} />
                                <div>
                                    <div className="text-[2rem] font-bold text-[#181818]">Điện thoại</div>
                                    <p className="text-[1.5rem] text-[#505050]">+84 346 587 796</p>
                                </div>
                            </div>
                            <div className="flex gap-[15px]">
                                <MailOutlineOutlinedIcon className="text-client-secondary" style={{ fontSize: "3.5rem" }} />
                                <div>
                                    <div className="text-[2rem] font-bold text-[#181818]">Email</div>
                                    <p className="text-[1.5rem] text-[#505050]">teddypet@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-h-[400px] rounded-[50px] overflow-hidden border border-[#eee]">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3434.9814421447605!2d106.809883!3d10.8411276!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1761230475278!5m2!1sen!2s"
                        width="100%" height="100%" loading="lazy" style={{ border: 0 }}
                    ></iframe>
                </div>
            </div>

            <FooterSub />
        </div>
    );
};
