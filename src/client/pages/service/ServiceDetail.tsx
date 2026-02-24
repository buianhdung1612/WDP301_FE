import { useParams, Link } from "react-router-dom";
import { useServiceDetail } from "../../hooks/useService";
import { ProductBanner } from "../product/sections/ProductBanner";
import { ProductGallery } from "../product/sections/ProductGallery";
import { ServiceDesc } from "./sections/ServiceDesc";
import { ServiceComment } from "./sections/ServiceComment";
import { ServiceRelated } from "./sections/ServiceRelated";
import { FooterSub } from "../../components/layouts/FooterSub";
import { Skeleton, Typography, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, Heart,
    X, Plus, Calendar
} from "lucide-react";
import StarIcon from "@mui/icons-material/Star";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { Icon } from "@iconify/react";
import { getAvailableTimeSlots, createBooking } from "../../api/booking.api";
import { getMyPets } from "../../api/pet.api";
import { useAuthStore } from "../../../stores/useAuthStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export const ServiceDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { data: service, isLoading, error } = useServiceDetail(slug || "");

    // Booking States
    const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
    const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
    const [pets, setPets] = useState<any[]>([]);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [activeTimeSession, setActiveTimeSession] = useState("Sáng");
    const [activeHour, setActiveHour] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [bookingPreview, setBookingPreview] = useState<any>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Fetch Pets
    useEffect(() => {
        if (user) {
            getMyPets().then(res => setPets(res.data || []));
        }
    }, [user]);

    // Fetch Time Slots
    useEffect(() => {
        if (service && selectedDate) {
            setIsLoadingSlots(true);
            // Default to 1 pet to show available slots even if none selected yet
            const petCount = selectedPetIds.length > 0 ? selectedPetIds.length : 1;
            getAvailableTimeSlots(selectedDate, service._id, petCount, selectedPetIds)
                .then(res => {
                    setAvailableSlots(res.data || []);
                    if (selectedTimeSlot && !res.data.find((s: any) => s.time === selectedTimeSlot.time)) {
                        setSelectedTimeSlot(null);
                        setBookingPreview(null);
                    }
                })
                .finally(() => setIsLoadingSlots(false));
        } else {
            setAvailableSlots([]);
        }
    }, [service, selectedDate, selectedPetIds]);

    const handlePetToggle = (petId: string) => {
        setSelectedPetIds(prev =>
            prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
        );
    };

    const filteredSlotsBySession = useMemo(() => {
        return availableSlots.filter((slot: any) => {
            const hour = parseInt(slot.time.split(":")[0]);
            if (activeTimeSession === "Sáng") return hour < 13;
            if (activeTimeSession === "Chiều") return hour >= 13 && hour < 18;
            if (activeTimeSession === "Tối") return hour >= 18;
            return true;
        });
    }, [availableSlots, activeTimeSession]);

    const groupedSlots = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredSlotsBySession.forEach((slot: any) => {
            const hour = slot.time.split(":")[0];
            if (!groups[hour]) groups[hour] = [];
            groups[hour].push(slot);
        });
        return groups;
    }, [filteredSlotsBySession]);

    // Auto-select first available hour when session/data changes
    useEffect(() => {
        const hours = Object.keys(groupedSlots).sort((a, b) => parseInt(a) - parseInt(b));
        if (hours.length > 0 && (!activeHour || !groupedSlots[activeHour])) {
            setActiveHour(hours[0]);
        }
    }, [groupedSlots]);

    const pricing = useMemo(() => {
        if (!service) return { total: 0, breakdown: [] };
        const petCount = selectedPetIds.length;
        if (petCount === 0) return { total: 0, breakdown: [] };

        if (service.pricingType === 'fixed') {
            return {
                total: service.basePrice * petCount,
                breakdown: selectedPetIds.map(id => ({
                    name: pets.find(p => p._id === id)?.name || "Thú cưng",
                    price: service.basePrice
                }))
            };
        } else {
            const breakdown = selectedPetIds.map(id => {
                const pet = pets.find(p => p._id === id);
                if (!pet) return { name: "N/A", price: 0, weight: 0 };
                const weight = pet.weight || 0;
                let matchedPrice = service.basePrice || 0;
                let priceLabel = "Mặc định";

                if (service.priceList && service.priceList.length > 0) {
                    for (const bracket of service.priceList) {
                        const numbers = bracket.label.match(/\d+/g);
                        if (numbers) {
                            const val1 = parseInt(numbers[0]);
                            const val2 = numbers[1] ? parseInt(numbers[1]) : Infinity;
                            if (bracket.label.toLowerCase().includes("dưới") || bracket.label.includes("<")) {
                                if (weight <= val1) { matchedPrice = bracket.value; priceLabel = bracket.label; break; }
                            } else if (bracket.label.toLowerCase().includes("trên") || bracket.label.includes(">")) {
                                if (weight > val1) { matchedPrice = bracket.value; priceLabel = bracket.label; break; }
                            } else if (weight >= val1 && weight <= val2) {
                                matchedPrice = bracket.value; priceLabel = bracket.label; break;
                            }
                        }
                    }
                }
                return { name: pet.name, weight: weight, price: matchedPrice, priceLabel };
            });
            const total = breakdown.reduce((acc, curr) => acc + curr.price, 0);
            return { total, breakdown };
        }
    }, [service, selectedPetIds, pets]);

    const handleVerifySchedule = () => {
        if (!selectedTimeSlot || selectedPetIds.length === 0) return;

        setIsVerifying(true);
        // Simulate a tiny delay for "checking" feel, though logic is local
        setTimeout(() => {
            const duration = service?.duration || 30;
            const freeStaff = selectedTimeSlot.freeStaff || 1;
            const petCount = selectedPetIds.length;

            const timeline: any[] = [];
            let currentStartTime = dayjs(`${selectedDate} ${selectedTimeSlot.time}`, "YYYY-MM-DD HH:mm");

            const petNames = selectedPetIds.map(id => pets.find(p => p._id === id)?.name || "Thú cưng");

            let petIndex = 0;
            while (petIndex < petCount) {
                const batchSize = Math.min(freeStaff, petCount - petIndex);
                const batchEndTime = currentStartTime.add(duration, 'minute');

                timeline.push({
                    startTime: currentStartTime.format("HH:mm"),
                    endTime: batchEndTime.format("HH:mm"),
                    pets: petNames.slice(petIndex, petIndex + batchSize)
                });

                petIndex += batchSize;
                currentStartTime = batchEndTime;
            }

            setBookingPreview({
                totalDuration: duration * Math.ceil(petCount / freeStaff),
                endTime: currentStartTime.format("HH:mm"),
                timeline
            });
            setIsVerifying(false);
        }, 600);
    };

    const handleSubmit = async () => {
        if (!user) { toast.info("Vui lòng đăng nhập để đặt lịch ạ!"); navigate("/auth/login"); return; }
        if (!service) return;
        if (selectedPetIds.length === 0) { toast.warning("Bé cưng nào sẽ đi Spa vậy ạ? Vui lòng chọn bé nha!"); return; }
        if (!selectedTimeSlot) { toast.warning("Bạn chưa chọn giờ hẹn kìa!"); return; }
        try {
            const startTime = dayjs(`${selectedDate} ${selectedTimeSlot.time}`, "YYYY-MM-DD HH:mm").toISOString();
            const bookingData = {
                serviceId: service._id,
                petIds: selectedPetIds,
                startTime: startTime,
                notes: note
            };
            const response = await createBooking(bookingData);
            if (response.code === 200 || response.code === 201) {
                toast.success("Đặt lịch thành công! TeddyPet đang đợi bé ạ.");
                navigate("/services/booking/success");
            } else { toast.error(response.message || "Có lỗi xảy ra, thử lại sau nha."); }
        } catch (error: any) { toast.error(error.response?.data?.message || "Lỗi hệ thống, bạn thông cảm nha!"); }
    };

    if (isLoading) return (
        <div className="app-container py-[100px]">
            <Skeleton variant="rectangular" width="100%" height={500} sx={{ borderRadius: '40px' }} />
        </div>
    );

    if (error || !service) return (
        <div className="flex flex-col items-center justify-center py-[200px] gap-6">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                <X className="w-12 h-12 text-red-400" />
            </div>
            <Typography variant="h4" className="font-secondary">Dịch vụ không tồn tại</Typography>
            <Link to="/services" className="px-8 py-3 bg-client-primary text-white rounded-full font-bold">Quay lại danh sách</Link>
        </div>
    );

    const breadcrumbs = [
        { label: "Trang chủ", to: "/" },
        { label: "Dịch vụ", to: "/services" },
        { label: service.name, to: `/services/${service.slug}` },
    ];

    return (
        <div className="bg-white">
            <ProductBanner
                pageTitle="Chi tiết dịch vụ"
                breadcrumbs={breadcrumbs}
                url="https://wordpress.themehour.net/babet/wp-content/uploads/2025/07/breadcumb-bg.jpg"
                className="bg-top"
            />

            <section className="relative px-[30px] bg-white pt-[80px] pb-[120px]">
                <div className="app-container grid grid-cols-2 gap-[60px] 2xl:gap-[40px] relative border-b border-[#eee] pb-[80px] items-stretch">
                    {/* Left Column: Product Gallery */}
                    <ProductGallery images={service.images || []} />

                    {/* Right Column: Service Information */}
                    <div>
                        <div className="flex flex-col h-full">
                            <span className="text-client-primary font-bold uppercase tracking-[3px] text-[13px] inline-block">
                                {service.categoryId?.name || "SPA & CHĂM SÓC"}
                            </span>
                            <h2 className="text-[36px] mt-[20px] font-secondary text-client-secondary leading-tight">{service.name}</h2>

                            <div className="flex items-center my-[10px]">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon
                                            key={i}
                                            sx={{
                                                fontSize: "20px !important",
                                                color: "#ffbb00 !important",
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-[20px] mx-[20px] text-[#ccc]">|</span>
                                <p className="text-[16px] text-[#505050]">(2 đánh giá từ khách hàng)</p>
                            </div>

                            <div className="mt-[20px] text-client-secondary text-[28px] font-secondary">
                                <p>
                                    {service.pricingType === 'fixed'
                                        ? `${service.basePrice.toLocaleString("vi-VN")}đ`
                                        : `Chỉ từ ${(service.priceList?.[0]?.value || service.basePrice || 0).toLocaleString("vi-VN")}đ`}
                                </p>
                            </div>

                            {/* Booking Options */}
                            <div className="space-y-5 mt-[40px]">
                                {/* Pet Selection */}
                                <div>
                                    <div className="mb-[15px] text-client-secondary flex items-center">
                                        <span className="font-secondary text-[18px]">Chọn bé cưng:</span>
                                        {selectedPetIds.length > 0 && <span className="ml-[10px] text-client-primary font-bold">({selectedPetIds.length} bé)</span>}
                                    </div>
                                    <div className="flex items-center flex-wrap gap-[10px]">
                                        {pets.map(pet => {
                                            const isSelected = selectedPetIds.includes(pet._id);
                                            return (
                                                <div
                                                    key={pet._id}
                                                    className={`flex items-center justify-center py-[10px] px-[25px] cursor-pointer capitalize rounded-[40px] transition-all border font-bold
                                                        ${isSelected
                                                            ? 'bg-client-secondary text-white border-client-secondary shadow-md'
                                                            : 'bg-[#fff0f0] text-client-secondary border-transparent hover:bg-client-secondary hover:text-white'}`}
                                                    onClick={() => handlePetToggle(pet._id)}
                                                >
                                                    {pet.name}
                                                </div>
                                            );
                                        })}
                                        <Link to="/dashboard/pet/create" className="w-[45px] h-[45px] rounded-full border-2 border-dashed border-[#eee] flex items-center justify-center text-[#ccc] hover:border-client-primary hover:text-client-primary transition-all">
                                            <Plus size={20} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="custom-datepicker">
                                        <div className="mb-[10px] text-client-secondary font-secondary text-[18px]">Ngày hẹn:</div>
                                        <Box sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: '55px',
                                                borderRadius: '40px',
                                                bgcolor: '#f8f8f8',
                                                transition: 'all 0.3s',
                                                border: '1px solid transparent',
                                                '& fieldset': { border: 'none' },
                                                '&:hover fieldset': { border: 'none' },
                                                '&.Mui-focused': {
                                                    bgcolor: '#fff',
                                                    borderColor: '#000 !important',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                px: '24px !important',
                                                fontWeight: '800',
                                                color: '#102937',
                                                fontFamily: 'inherit',
                                                fontSize: '16px'
                                            }
                                        }}>
                                            <DatePicker
                                                value={dayjs(selectedDate)}
                                                onChange={(newValue) => setSelectedDate(newValue ? newValue.format("YYYY-MM-DD") : "")}
                                                minDate={dayjs()}
                                                format="DD / MM / YYYY"
                                                slots={{ openPickerIcon: () => <Calendar size={20} className="text-gray-400" /> }}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                    },
                                                    desktopPaper: {
                                                        sx: {
                                                            bgcolor: '#121528',
                                                            borderRadius: '5px',
                                                            marginTop: '3px',
                                                            width: "272px",
                                                            color: "white",
                                                            padding: "8px 8px 0px",
                                                            overflow: 'hidden',
                                                            '& .MuiDateCalendar-root': {
                                                                width: '256px !important',
                                                                minWidth: '256px !important',
                                                                height: 'auto',
                                                            },
                                                            '& .MuiDayCalendar-slideTransition': {
                                                                minHeight: '185px !important',
                                                            },
                                                            '& .MuiPickersCalendarHeader-root': {
                                                                background: 'linear-gradient(90deg, #f86ca7 0%, #ff7f18 100%)',
                                                                padding: '3.2px 8px',
                                                                color: '#fff',
                                                                position: "relative",
                                                                borderRadius: "5px",
                                                                m: "0",
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minHeight: '36px',
                                                                '& .MuiPickersCalendarHeader-labelContainer': {
                                                                    margin: 0,
                                                                    zIndex: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                },
                                                                '& .MuiPickersCalendarHeader-switchViewButton': {
                                                                    display: 'none',
                                                                },
                                                                '& .MuiPickersCalendarHeader-label': {
                                                                    fontWeight: '700',
                                                                    fontSize: '15px',
                                                                    textAlign: "center",
                                                                },
                                                                '& .MuiPickersArrowSwitcher-root': {
                                                                    position: 'absolute',
                                                                    width: '100%',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    left: 0,
                                                                    padding: '0 4px',
                                                                    zIndex: 2,
                                                                },
                                                                '& .MuiIconButton-root': {
                                                                    color: '#fff',
                                                                    padding: '4px',
                                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                                                },
                                                                '& .MuiPickersArrowSwitcher-spacer': { display: 'none' }
                                                            },
                                                            '& .MuiDayCalendar-weekDayLabel': {
                                                                padding: '0.7em 0.3em',
                                                                textAlign: 'center',
                                                                fontWeight: 700,
                                                                border: 0,
                                                                color: '#fff',
                                                                fontSize: '13px',
                                                                width: '36px',
                                                                margin: '0'
                                                            },
                                                            '& .MuiDayCalendar-monthContainer': {
                                                                width: '256px !important',
                                                                padding: '0 !important'
                                                            },
                                                            '& .MuiDayCalendar-weekContainer': {
                                                                justifyContent: 'space-around',
                                                                margin: '0 !important'
                                                            },
                                                            '& .MuiPickersDay-root': {
                                                                border: '1px solid rgba(238, 238, 238, 0.5)',
                                                                background: '#fff',
                                                                fontWeight: 'normal',
                                                                padding: '4px',
                                                                transition: 'all 0.45s ease',
                                                                color: '#001d23',
                                                                textAlign: 'center',
                                                                fontSize: '0.85rem',
                                                                borderRadius: '5px',
                                                                width: '32px',
                                                                height: '32px',
                                                                margin: '2px',
                                                                '&:hover': {
                                                                    bgcolor: '#f5f5f5',
                                                                    borderColor: '#F472B6',
                                                                    color: '#F472B6'
                                                                },
                                                                '&.Mui-selected': {
                                                                    background: 'linear-gradient(135deg, #F472B6 0%, #FB923C 100%) !important',
                                                                    color: '#fff !important',
                                                                    borderColor: 'transparent',
                                                                    boxShadow: '0 4px 12px rgba(244, 114, 182, 0.4)',
                                                                    '&:hover': {
                                                                        filter: 'brightness(1.1)',
                                                                    },
                                                                },
                                                                '&.MuiPickersDay-today': {
                                                                    borderColor: '#F472B6',
                                                                    borderWidth: '1px',
                                                                    color: '#F472B6'
                                                                },
                                                                '&.Mui-disabled': {
                                                                    color: 'rgba(0, 0, 0, 0.1) !important',
                                                                    background: '#fafafa',
                                                                    border: '1px solid #eee'
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </div>
                                    <div>
                                        <div className="mb-[10px] text-client-secondary font-secondary text-[18px]">Giờ hẹn:</div>
                                        <div
                                            onClick={() => setIsTimeModalOpen(true)}
                                            className={`w-full h-[55px] px-6 rounded-[40px] flex items-center justify-between border cursor-pointer transition-all ${selectedTimeSlot ? 'border-client-primary bg-white ring-2 ring-client-primary/10' : 'border-transparent bg-[#f8f8f8]'}`}
                                        >
                                            <span className={`font-bold ${selectedTimeSlot ? 'text-client-primary' : 'text-gray-400'}`}>
                                                {selectedTimeSlot?.time || "Chọn giờ"}
                                            </span>
                                            <Clock className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                <div>
                                    <div className="mb-[10px] text-client-secondary font-secondary text-[18px]">Ghi chú:</div>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Lưu ý đặc biệt cho bé..."
                                        className="w-full h-[100px] p-6 rounded-[30px] bg-[#f8f8f8] border border-transparent focus:border-client-primary outline-none transition-all resize-none font-medium text-client-secondary focus:bg-white focus:ring-2 focus:ring-client-primary/10"
                                    />
                                </div>

                                {/* Pricing Breakdown */}
                                {selectedPetIds.length > 0 && (
                                    <div className="bg-orange-50/50 p-6 rounded-[30px] border border-orange-100/50">
                                        <div className="flex justify-between items-center text-[20px] font-secondary text-client-secondary">
                                            <span>Tạm tính ({selectedPetIds.length} bé):</span>
                                            <span className="text-client-primary font-bold">{pricing.total.toLocaleString()}đ</span>
                                        </div>
                                    </div>
                                )}

                                {/* Main Actions */}
                                <div className="flex items-center gap-[20px] h-[60px] mt-[40px]">
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 h-full rounded-[40px] text-white text-[20px] font-secondary bg-client-secondary hover:bg-client-primary transition-all shadow-xl active:scale-[0.98]"
                                    >
                                        ĐẶT LỊCH NGAY
                                    </button>
                                    <div className="w-[60px] h-full flex items-center justify-center text-client-secondary hover:text-client-primary transition-all border border-[#eee] rounded-full cursor-pointer">
                                        <Heart className="w-[28px] h-[28px]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Sections mirroring ProductDetailPage */}
            <ServiceDesc serviceName={service.name} description={service.description} />
            <ServiceComment />
            <ServiceRelated categoryId={service.categoryId?._id || service.categoryId} currentServiceId={service._id} />

            <FooterSub />

            {/* Time Selection Modal */}
            <AnimatePresence>
                {isTimeModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTimeModalOpen(false)}
                            className="absolute inset-0 bg-client-secondary/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-[620px] bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 pb-2 border-b border-gray-50/50">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-client-primary/10 flex items-center justify-center text-client-primary">
                                            <Clock size={18} />
                                        </div>
                                        <h3 className="text-[18px] font-bold text-client-secondary">Chọn giờ đặt lịch</h3>
                                    </div>
                                    <button onClick={() => setIsTimeModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all text-gray-400">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">

                                <div className="flex bg-gray-50 p-1 rounded-[15px] mb-4">
                                    {["Sáng", "Chiều", "Tối"].map((session) => (
                                        <button
                                            key={session}
                                            onClick={() => setActiveTimeSession(session)}
                                            className={`flex-1 py-1.5 rounded-[12px] text-[13px] font-bold transition-all 
                                                ${activeTimeSession === session ? "bg-white text-client-primary shadow-sm" : "text-gray-400"}`}
                                        >
                                            {session}
                                        </button>
                                    ))}
                                </div>

                                {isLoadingSlots ? (
                                    <div className="flex flex-col items-center py-6">
                                        <Icon icon="line-md:loading-loop" width={30} className="text-client-primary mb-2" />
                                        <p className="text-gray-400 text-[12px]">Đang tải...</p>
                                    </div>
                                ) : Object.keys(groupedSlots).length > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex gap-5 items-start">
                                            {/* Hours Selection */}
                                            <div className="w-[85px] flex flex-col gap-2">
                                                <span className="text-[10px] font-bold text-gray-300 px-1 uppercase tracking-widest">Giờ</span>
                                                <div className="flex flex-col max-h-[220px] overflow-y-auto pr-1 custom-scrollbar gap-1.5">
                                                    {Object.keys(groupedSlots)
                                                        .sort((a, b) => parseInt(a) - parseInt(b))
                                                        .map((hour) => (
                                                            <button
                                                                key={hour}
                                                                onClick={() => setActiveHour(hour)}
                                                                className={`py-1.5 rounded-[10px] text-[14px] text-center transition-all border-2
                                                                ${activeHour === hour
                                                                        ? "bg-client-secondary text-white border-client-secondary font-bold"
                                                                        : "bg-white text-gray-400 border-gray-50 hover:border-gray-200"}`}
                                                            >
                                                                {hour}h
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>

                                            {/* Minutes Fixed Grid */}
                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <span className="text-[10px] font-bold text-gray-300 px-1 uppercase tracking-widest">Phút (Mỗi 5p)</span>
                                                <div className="bg-gray-50/50 rounded-[15px] p-2.5 border border-gray-100">
                                                    <div className="grid grid-cols-4 gap-1.5">
                                                        {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => {
                                                            const fullTime = `${activeHour}:${m}`;
                                                            const slot = groupedSlots[activeHour || ""]?.find(s => s.time === fullTime);

                                                            // Priority: if slot exists from server, use its availability. 
                                                            // Otherwise, assume it's available for the UI's sake.
                                                            const isAvailable = slot ? (slot.status === "available") : true;
                                                            const isSelected = selectedTimeSlot?.time === fullTime;

                                                            return (
                                                                <button
                                                                    key={m}
                                                                    onClick={() => {
                                                                        if (slot) setSelectedTimeSlot(slot);
                                                                        else setSelectedTimeSlot({ time: fullTime, status: "available" });
                                                                    }}
                                                                    className={`py-2 rounded-[8px] font-bold text-[13px] transition-all border-2
                                                                    ${isSelected
                                                                            ? 'bg-client-primary border-client-primary text-white scale-105 shadow-md'
                                                                            : isAvailable
                                                                                ? 'bg-white border-gray-50 text-client-secondary hover:border-client-primary/40 hover:shadow-sm'
                                                                                : 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'}`}
                                                                >
                                                                    {m}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Verification & Preview Section */}
                                        {selectedTimeSlot && (
                                            <div className={`mt-5 transition-all duration-500 overflow-hidden ${bookingPreview ? "max-h-[400px]" : "max-h-[80px]"}`}>
                                                {!bookingPreview ? (
                                                    <button
                                                        onClick={handleVerifySchedule}
                                                        disabled={isVerifying}
                                                        className="w-full py-3.5 bg-gray-50 text-client-secondary rounded-[15px] font-bold text-[14px] hover:bg-client-primary/5 hover:text-client-primary transition-all border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 group"
                                                    >
                                                        {isVerifying ? (
                                                            <Icon icon="line-md:loading-loop" width={20} />
                                                        ) : (
                                                            <Icon icon="solar:shield-check-bold-duotone" width={20} className="text-client-primary group-hover:scale-110 transition-transform" />
                                                        )}
                                                        <span>Kiểm tra lộ trình phục vụ ({selectedPetIds.length} bé)</span>
                                                    </button>
                                                ) : (
                                                    <div className="bg-orange-50/30 rounded-[20px] p-4 border border-orange-100/50">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-6 bg-client-primary rounded-full"></div>
                                                                <h4 className="font-bold text-client-secondary text-[16px]">Lộ trình thực hiện</h4>
                                                            </div>
                                                            <button
                                                                onClick={() => setBookingPreview(null)}
                                                                className="flex items-center gap-1 text-[11px] font-bold text-client-primary hover:bg-client-primary/5 px-2.5 py-1 rounded-full transition-all"
                                                            >
                                                                <Icon icon="solar:restart-bold" width={12} />
                                                                Thay đổi
                                                            </button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {bookingPreview.timeline.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex gap-3">
                                                                    <div className="flex flex-col items-center pt-1">
                                                                        <div className="w-2 h-2 rounded-full bg-client-primary animate-pulse"></div>
                                                                        {idx !== bookingPreview.timeline.length - 1 && <div className="w-[1px] h-full bg-gray-200 my-1"></div>}
                                                                    </div>
                                                                    <div className="flex-1 pb-2">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-[13px] font-bold text-client-secondary bg-white px-2 py-0.5 rounded-lg border border-gray-100">{item.startTime} - {item.endTime}</span>
                                                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-client-primary/10 text-client-primary rounded-md uppercase tracking-wider">Đợt {idx + 1}</span>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {item.pets.map((pName: string, pIdx: number) => (
                                                                                <span key={pIdx} className="text-[12px] text-gray-600 bg-white/80 px-2 rounded-md border border-orange-50 capitalize">{pName}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="mt-4 pt-4 border-t border-orange-100/30 flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Hoàn tất vào lúc:</span>
                                                                <span className="text-[16px] font-bold text-client-primary">{bookingPreview.endTime}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Tổng thời gian:</span>
                                                                <p className="text-[16px] font-bold text-client-secondary">{bookingPreview.totalDuration} phút</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Icon icon="solar:calendar-minimalistic-broken" width={32} className="text-gray-200" />
                                        </div>
                                        <p className="text-gray-400 text-[14px] font-medium">Lịch hôm nay đã được đặt hết rồi ạ.</p>
                                    </div>
                                )}

                                {/* Modal Footer - Fixed if preview exists */}
                                {bookingPreview && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setIsTimeModalOpen(false);
                                                setBookingPreview(null);
                                            }}
                                            className="w-full py-4 bg-client-primary text-white rounded-[20px] font-bold text-[15px] shadow-lg shadow-client-primary/10 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <Icon icon="solar:check-circle-bold" width={22} className="group-hover:rotate-12 transition-transform" />
                                            <span>Đồng ý và Chốt lịch hẹn ({selectedTimeSlot.time})</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
