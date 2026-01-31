import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDescProps {
    description: string;
    content: string;
}

const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export const ProductDesc = ({ description, content }: ProductDescProps) => {
    const [activeTabKey, setActiveTabKey] = useState("description");

    const productTabsData = [
        {
            label: "Mô tả sản phẩm",
            key: "description",
            content: description || "Chưa có văn bản mô tả cho sản phẩm này."
        },
        {
            label: "Nội dung chi tiết",
            key: "content",
            content: content || "Chưa có nội dung chi tiết cho sản phẩm này."
        },
        {
            label: "Giao hàng & Trả hàng",
            key: "delivery_returns",
            content: `
                <div class="space-y-4">
                    <p><strong>Chính Sách Giao Hàng:</strong> Chúng tôi cung cấp dịch vụ giao hàng tiêu chuẩn và giao hàng nhanh toàn quốc. Thời gian giao hàng dự kiến là 1-2 ngày làm việc cho khu vực nội thành (TP. HCM, Hà Nội) và 3-5 ngày làm việc cho các tỉnh thành khác. Miễn phí giao hàng cho đơn từ 999.000₫.</p>
                    <p><strong>Quy Định Đổi Trả:</strong> Khách hàng có quyền yêu cầu đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu có lỗi từ nhà sản xuất hoặc sản phẩm không đúng mô tả.</p>
                </div>
            `
        },
    ];

    const activeTab = productTabsData.find(tab => tab.key === activeTabKey);

    return (
        <div className="px-[30px] pt-[80px] mb-[50px]">
            <div className="app-container p-[40px] rounded-[3rem] bg-[#e67e201a]">
                <ul className="flex items-center gap-[45px] border-b border-[#d7d7d7]">
                    {productTabsData.map((tab) => {
                        const isActive = tab.key === activeTabKey;
                        return (
                            <li
                                key={tab.key}
                                className={`
                                    relative 
                                    text-[2.1rem] 
                                    font-secondary 
                                    font-[900]
                                    px-[10px] 
                                    pb-[20px] 
                                    cursor-pointer 
                                    transition-all duration-300
                                    before:content-[""] 
                                    before:absolute 
                                    before:bottom-[-2px] 
                                    before:left-0 
                                    before:h-[3px] 
                                    before:bg-client-primary 
                                    before:z-[10] 
                                    before:transition-all 
                                    before:duration-300
                                    ${isActive
                                        ? 'text-client-primary font-bold before:w-full'
                                        : 'text-client-secondary hover:text-client-primary before:w-0 hover:before:w-full'
                                    }
                                `}
                                onClick={() => setActiveTabKey(tab.key)}
                            >
                                {tab.label}
                            </li>
                        );
                    })}
                </ul>

                <div className="pt-[40px] text-[1.6rem] text-[#505050] min-h-[200px] leading-relaxed">
                    <AnimatePresence mode="wait">
                        {activeTab && (
                            <motion.div
                                key={activeTab.key}
                                variants={contentVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: activeTab.content }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
