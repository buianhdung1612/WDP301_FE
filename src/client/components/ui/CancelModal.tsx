import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

interface CancelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
    confirmText?: string;
    isBooking?: boolean;
    paymentStatus?: string;
}

const CANCEL_REASONS = [
    "Tôi muốn cập nhật địa chỉ/sđt nhận hàng.",
    "Tôi muốn thêm/thay đổi Mã giảm giá",
    "Tôi muốn thay đổi sản phẩm (kích thước, màu sắc, số lượng...)",
    "Thủ tục thanh toán rắc rối",
    "Tôi tìm thấy chỗ mua khác tốt hơn (Rẻ hơn, uy tín hơn, giao nhanh hơn...)",
    "Tôi không có nhu cầu mua nữa",
    "Tôi không tìm thấy lý do hủy phù hợp",
    "Lý do khác",
];

export const CancelModal: React.FC<CancelModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Lý Do Hủy",
    confirmText = "HỦY ĐƠN HÀNG",
    isBooking = false,
    paymentStatus = "unpaid",
}) => {
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    React.useEffect(() => {
        if (isOpen) {
            setSelectedReason("");
            setCustomReason("");
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (selectedReason === "Lý do khác") {
            if (customReason.trim()) {
                onConfirm(customReason.trim());
            }
        } else if (selectedReason) {
            onConfirm(selectedReason);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white w-full max-w-[650px] rounded-[16px] overflow-hidden shadow-2xl"
                    >
                        <div className="p-[35px]">
                            <h3 className="text-[26px] font-bold text-[#333] mb-4">{title}</h3>

                            <div className="bg-[#fffdf5] border border-[#fceabc] p-2 rounded-lg flex gap-3 mb-4">
                                <div className="mt-0.5">
                                    <Icon icon="solar:info-circle-bold" className="text-[#facc15] text-[20px]" />
                                </div>
                                <p className="text-[14px] text-[#856404] leading-relaxed">
                                    Nếu bạn xác nhận hủy, toàn bộ {isBooking ? "lịch đặt" : "đơn hàng"} sẽ được hủy. Chọn lý do hủy phù hợp nhất với bạn nhé!
                                </p>
                            </div>

                            {paymentStatus === "paid" && (
                                <div className="mb-4 text-[13px] text-red-500 font-medium italic">
                                    * {isBooking ? "Lịch đặt" : "Đơn hàng"} đã thanh toán sẽ được kiểm tra và thực hiện hoàn tiền sau khi bạn gửi yêu cầu.
                                </div>
                            )}

                            <div className="space-y-4 pr-2">
                                {CANCEL_REASONS.map((reason, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="cancelReason"
                                                className="peer hidden"
                                                checked={selectedReason === reason}
                                                onChange={() => setSelectedReason(reason)}
                                            />
                                            <div className="w-[18px] h-[18px] border-2 border-[#ddd] rounded-full peer-checked:border-client-primary transition-all group-hover:border-client-primary"></div>
                                            <div className="absolute w-[8px] h-[8px] bg-client-primary rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                        </div>
                                        <span className={`text-[15px] transition-colors ${selectedReason === reason ? "text-client-secondary font-semibold" : "text-[#555] group-hover:text-client-secondary"}`}>
                                            {reason}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <AnimatePresence>
                                {selectedReason === "Lý do khác" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-4 overflow-hidden"
                                    >
                                        <textarea
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            placeholder="Vui lòng nhập lý do của bạn..."
                                            className="w-full h-[100px] p-4 border border-[#eee] rounded-lg text-[14px] outline-none focus:border-client-primary transition-all resize-none bg-[#fcfcfc]"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center justify-end gap-4 mt-4">
                                <button
                                    onClick={onClose}
                                    className="relative overflow-hidden group bg-[#f5f5f5] rounded-[8px] px-[25px] py-[12px] font-[600] text-[14px] text-[#666] cursor-pointer"
                                >
                                    <span className="relative z-10 transition-colors group-hover:text-white uppercase">Không phải bây giờ</span>
                                    <div className="absolute top-0 left-0 w-full h-full bg-[#ccc] transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!selectedReason || (selectedReason === "Lý do khác" && !customReason.trim())}
                                    className={`relative overflow-hidden group rounded-[8px] px-[25px] py-[12px] font-[600] text-[14px] transition-all ${(selectedReason && (selectedReason !== "Lý do khác" || customReason.trim()))
                                        ? "bg-client-primary text-white cursor-pointer"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                        }`}
                                >
                                    <span className="relative z-10 uppercase">{confirmText}</span>
                                    {(selectedReason && (selectedReason !== "Lý do khác" || customReason.trim())) && (
                                        <div className="absolute top-0 left-0 w-full h-full bg-client-secondary transition-transform duration-500 ease-in-out transform scale-x-0 origin-left group-hover:scale-x-100"></div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
