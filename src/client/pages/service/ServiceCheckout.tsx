import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMyBooking, updateBooking } from "../../api/booking.api";
import { ProductBanner } from "../product/sections/ProductBanner";
import { FooterSub } from "../../components/layouts/FooterSub";
import { motion, AnimatePresence } from "framer-motion";
import { 
    CreditCard, 
    Wallet, 
    Banknote, 
    ArrowLeft,
    User,
    LogOut,
    Calendar, 
    Clock, 
    PawPrint,
    Loader2,
    CheckCircle2,
    MessageSquare
} from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useAuthStore } from "../../../stores/useAuthStore";

const breadcrumbs = [
    { label: "Trang chủ", to: "/" },
    { label: "Dịch vụ", to: "/services" },
    { label: "Thanh toán đặt lịch", to: "#" },
];

export const ServiceCheckoutPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [booking, setBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<string>("money");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (id) {
            getMyBooking(id)
                .then(res => {
                    if (res.code === 200) {
                        setBooking(res.data);
                        setNotes(res.data.notes || "");
                        if (res.data.notes) setShowNotes(true);
                    } else {
                        toast.error("Không tìm thấy thông tin lịch đặt!");
                        navigate("/services");
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error("Lỗi khi tải thông tin lịch đặt");
                    navigate("/services");
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, navigate]);

    const handlePayment = async () => {
        if (!booking || !id) return;
        setIsProcessing(true);

        try {
            // Cập nhật ghi chú trước khi thanh toán
            await updateBooking(id, { notes: showNotes ? notes : "" });

            const phone = booking.customerPhone || "";
            const bookingCode = booking.code;

            if (paymentMethod === "zalopay") {
                window.location.href = `http://localhost:3000/api/v1/client/order/payment-zalopay?bookingCode=${bookingCode}&phone=${phone}`;
            } else if (paymentMethod === "vnpay") {
                window.location.href = `http://localhost:3000/api/v1/client/order/payment-vnpay?bookingCode=${bookingCode}&phone=${phone}`;
            } else {
                // Thanh toán tại quầy
                toast.success("Đặt lịch thành công! TeddyPet đang đợi bé ạ.");
                navigate("/services/booking/success");
            }
        } catch (error) {
            console.error(error);
            toast.error("Gặp lỗi khi xử lý thông tin, bạn thử lại sau nha!");
            setIsProcessing(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/auth/login");
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <Loader2 className="w-10 h-10 text-client-primary animate-spin" />
                <p className="text-gray-500 font-medium font-secondary uppercase tracking-widest text-[13px]">Đang tải thông tin thanh toán...</p>
            </div>
        );
    }

    if (!booking) return null;

    return (
        <>
            <ProductBanner
                pageTitle="Thanh toán"
                breadcrumbs={breadcrumbs}
                url="https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-shop-listing.jpg"
                className="bg-top"
            />

            <div className="app-container flex pb-[150px] 2xl:pb-[100px] relative">
                {/* Left Column: Booking Information */}
                <div className="w-[calc(100%-518px)] py-[50px]">
                    <div className="mb-[40px] p-[20px] bg-[#fcfcfc] border border-dashed border-gray-200 rounded-[15px] flex items-center justify-between">
                        <div className="flex items-center gap-[12px] text-[16px] text-client-secondary font-medium">
                            <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                                <User className="w-[20px] h-[20px] text-client-primary" />
                            </div>
                            <span>Tài khoản: <span className="font-bold">{user?.fullName}</span></span>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="px-[15px] py-[8px] rounded-[10px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-[8px] text-[13px] font-bold"
                        >
                            <LogOut className="w-[16px] h-[16px]" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>

                    <h2 className="text-[40px] font-secondary mt-[8px] mb-[30px] font-bold">Thông tin dịch vụ</h2>

                    <div className="space-y-[25px]">
                        {/* Summary Card */}
                        <div className="bg-white border border-gray-100 rounded-[25px] p-[35px]">
                            <h3 className="text-[18px] font-bold text-client-secondary mb-[25px]">Chi tiết đặt lịch</h3>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">Dịch vụ thực hiện</span>
                                        <span className="text-[16px] font-bold text-client-secondary">{booking.serviceId?.name}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">Thời gian hẹn</span>
                                        <div className="space-y-1 mt-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-client-primary" />
                                                <span className="text-[16px] font-bold text-client-secondary">
                                                    {dayjs(booking.start).format("DD/MM/YYYY")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-client-primary" />
                                                <span className="text-[16px] font-bold text-client-secondary">
                                                    {dayjs(booking.start).format("HH:mm")} - {dayjs(booking.end).format("HH:mm")}
                                                </span>
                                                <span className="text-[13px] text-client-primary/60 font-medium bg-client-primary/5 px-2 py-0.5 rounded-full">
                                                    ~{dayjs(booking.end).diff(dayjs(booking.start), 'minute')} phút
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">Người đặt</span>
                                        <span className="text-[16px] font-bold text-client-secondary">{booking.customerName}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">Số điện thoại</span>
                                        <span className="text-[16px] font-bold text-client-secondary">{booking.customerPhone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-[30px] mb-[40px] cursor-pointer">
                            <input 
                                type="checkbox" 
                                id="bookingNotesCheckbox" 
                                checked={showNotes} 
                                onChange={() => setShowNotes(!showNotes)} 
                                className="hidden" 
                            />
                            <label htmlFor="bookingNotesCheckbox" className="text-client-text pl-[0px] text-[16px] font-medium select-none flex items-center gap-[12px]">
                                <div className={`w-[20px] h-[20px] border-2 rounded-[4px] flex items-center justify-center transition-all ${showNotes ? 'bg-client-primary border-client-primary' : 'border-[#ddd]'}`}>
                                    {showNotes && <div className="w-[10px] h-[6px] border-l-2 border-b-2 border-white -rotate-45 mb-[2px]"></div>}
                                </div>
                                Thêm ghi chú lịch đặt
                            </label>
                            
                            <AnimatePresence>
                                {showNotes && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-[20px]">
                                            <textarea
                                                placeholder="Lưu ý đặc biệt cho dịch vụ, ví dụ: bé hơi nhát người lạ, cần cắt tỉa kỹ phần đuôi..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows={3}
                                                className="rounded-[20px] border border-[#eee] text-client-secondary py-[14px] px-[28px] w-full outline-none focus:border-client-primary transition-default resize-none bg-white hover:border-gray-300"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="pt-[40px] mt-[40px] border-t border-[#eee]">
                        <Link to="/services" className="flex items-center text-client-secondary font-secondary hover:text-client-primary transition-default group">
                            <ArrowLeft className="text-[18px] mr-[10px] transition-transform group-hover:-translate-x-1" />
                            <span className="text-[16px] font-secondary font-medium">Trở lại dịch vụ</span>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Order Summary Sidebar */}
                <div className="w-[468px] ml-[50px] py-[50px] shrink-0">
                    <div className="sticky top-[20px] bg-white rounded-[25px] border border-[#eee] overflow-hidden">
                        <h2 className="py-[20px] px-[30px] text-[20px] font-bold text-client-secondary border-b border-[#eee]">Tóm tắt đơn đặt</h2>
                        
                        <div className="p-[35px]">
                            {/* Pet List Summary */}
                            <ul className="mb-[25px] max-h-[300px] overflow-visible pr-[10px]">
                                {booking.petIds?.map((pet: any, index: number) => {
                                    let petPrice = 0;
                                    if (booking.serviceId?.pricingType === 'fixed') {
                                        petPrice = booking.serviceId?.basePrice || 0;
                                    } else if (booking.serviceId?.pricingType === 'by-weight') {
                                        const weight = pet.weight || 0;
                                        const priceItem = booking.serviceId?.priceList?.find((item: any) => {
                                            const label = item.label;
                                            if (!label) return false;
                                            if (label.includes('<')) return weight < parseFloat(label.replace(/[^\d.]/g, ''));
                                            if (label.includes('>')) return weight > parseFloat(label.replace(/[^\d.]/g, ''));
                                            if (label.includes('-')) {
                                                const nums = label.match(/\d+\.?\d*/g);
                                                return nums && weight >= parseFloat(nums[0]) && weight <= parseFloat(nums[1]);
                                            }
                                            return weight <= parseFloat(label.replace(/[^\d.]/g, ''));
                                        });
                                        petPrice = priceItem ? priceItem.value : (booking.serviceId?.basePrice || 0);
                                    }

                                    return (
                                        <li key={index} className="flex mb-[20px] pb-[20px] overflow-visible border-b border-[#f9f9f9] last:border-0 last:mb-0">
                                            <div className="relative shrink-0">
                                                <div className="w-[65px] h-[65px] rounded-[12px] overflow-hidden border border-[#eee] bg-gray-50">
                                                    {pet.avatar ? <img src={pet.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100"><PawPrint size={24}/></div>}
                                                </div>
                                                <div className="absolute top-0 right-0 translate-y-[-35%] translate-x-[35%] shadow-md aspect-square bg-client-primary w-[22px] rounded-full flex items-center justify-center text-white text-[11px] font-bold border-2 border-white">
                                                    1
                                                </div>
                                            </div>
                                            <div className="pl-[15px] pr-[10px] flex-1">
                                                <div className="text-[14px] font-bold text-client-secondary mb-[2px] line-clamp-1">{pet.name}</div>
                                                <p className="text-client-primary font-bold text-[13px]">{booking.serviceId?.name}</p>
                                            </div>
                                            <div className="text-client-secondary ml-auto font-bold text-[14px] self-center">
                                                {petPrice.toLocaleString()}đ
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Payment Methods */}
                            <div className="mb-[35px] pt-[25px] border-t border-[#eee]">
                                <h3 className="text-[16px] font-bold text-client-secondary mb-[18px] tracking-tight">
                                    Phương thức thanh toán
                                </h3>
                                <div className="space-y-[12px]">
                                    {[
                                        { id: 'money', label: 'Thanh toán tại quầy' },
                                        { id: 'zalopay', label: 'Ví điện tử ZaloPay' },
                                        { id: 'vnpay', label: 'Cổng thanh toán VNPAY' }
                                    ].map((method) => (
                                        <label key={method.id} className="flex items-center gap-[12px] cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={paymentMethod === method.id}
                                                onChange={() => setPaymentMethod(method.id)}
                                                className="appearance-none w-[16px] h-[16px] border-[2px] border-[#ddd] rounded-full checked:border-client-primary checked:border-[5px] bg-white transition-all cursor-pointer"
                                            />
                                            <span className={`text-[14px] font-medium transition-colors ${paymentMethod === method.id ? 'text-client-secondary font-bold' : 'text-gray-600'}`}>
                                                {method.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="space-y-[15px] pt-[25px] border-t border-[#eee]">
                                <div className="flex justify-between text-[#666] text-[14px]">
                                    <span className="font-medium">Tạm tính</span>
                                    <span className="font-bold text-client-secondary">{booking.subTotal?.toLocaleString()}đ</span>
                                </div>
                                {booking.discount > 0 && (
                                    <div className="flex justify-between text-[#666] text-[14px]">
                                        <span className="font-medium">Giảm giá</span>
                                        <span className="font-bold text-green-600">-{booking.discount?.toLocaleString()}đ</span>
                                    </div>
                                )}
                                
                                <div className="pt-[20px] border-t border-[#eee] flex justify-between items-center">
                                    <span className="text-[16px] font-bold text-client-secondary uppercase tracking-tight">Tổng thanh toán</span>
                                    <div className="text-[26px] text-client-primary font-bold tracking-tighter leading-none">{booking.total?.toLocaleString()}đ</div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className={`w-full mt-[30px] py-[12px] px-[25px] rounded-[30px] text-white font-bold transition-all text-[15px] flex items-center justify-center gap-2 ${
                                        isProcessing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-client-primary hover:bg-client-secondary cursor-pointer active:scale-95'
                                    }`}
                                >
                                    {isProcessing ? (
                                        "Đang xử lý..."
                                    ) : (
                                        "ĐẶT LỊCH NGAY"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <FooterSub />
        </>
    );
};
