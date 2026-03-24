import { useState, useEffect } from "react";
import { getClientBoardingPetDiaries } from "../../api/boarding-pet-diary.api";
import dayjs from "dayjs";

export const ClientBoardingPetDiary = ({ bookingId }: { bookingId: string }) => {
    const [diaries, setDiaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!bookingId) return;
        const fetchDiaries = async () => {
            setLoading(true);
            try {
                const res = await getClientBoardingPetDiaries(bookingId);
                setDiaries(res.data || []);
            } catch (error) {
                console.error("Failed to load pet diaries");
            } finally {
                setLoading(false);
            }
        };
        fetchDiaries();
    }, [bookingId]);

    if (loading) return <div className="text-center py-5">Đang tải nhật ký...</div>;
    if (diaries.length === 0) return null;

    // Group by Date -> Meal -> diaries
    const grouped = diaries.reduce((acc: any, diary: any) => {
        const dateStr = dayjs(diary.date).format("DD/MM/YYYY");
        if (!acc[dateStr]) acc[dateStr] = {};
        if (!acc[dateStr][diary.meal]) acc[dateStr][diary.meal] = [];
        acc[dateStr][diary.meal].push(diary);
        return acc;
    }, {});

    return (
        <div className="mt-8 border border-[#eee] rounded-[12px] bg-white overflow-hidden">
            <div className="p-[30px] border-b border-[#eee] bg-[#f9f9f9]/30">
                <h3 className="text-[20px] font-[600] text-client-secondary mb-2">Nhật Ký Lưu Trú Hàng Ngày</h3>
                <p className="text-[#7d7b7b] text-[14px]">Theo dõi tình hình ăn uống và sức khỏe của thú cưng trong thời gian lưu trú.</p>
            </div>

            <div className="p-[30px] space-y-8">
                {Object.keys(grouped).sort((a, b) => dayjs(b, "DD/MM/YYYY").diff(dayjs(a, "DD/MM/YYYY"))).map(dateStr => (
                    <div key={dateStr} className="relative pl-6 border-l-2 border-client-primary/20 pb-4 last:pb-0">
                        <div className="absolute w-4 h-4 bg-client-primary rounded-full -left-[9px] top-0 border-4 border-white"></div>
                        <h4 className="font-[700] text-[16px] text-client-secondary mb-4 mt-[-4px]">{dateStr}</h4>

                        <div className="space-y-4">
                            {["Sáng", "Trưa", "Tối"].map(meal => {
                                const mealLogs = grouped[dateStr][meal];
                                if (!mealLogs || mealLogs.length === 0) return null;

                                return (
                                    <div key={meal} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <h5 className="font-[600] text-[14px] text-client-primary mb-3">Bữa {meal}</h5>
                                        <div className="space-y-4">
                                            {mealLogs.map((log: any) => (
                                                <div key={log._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-50">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-6 h-6 rounded-full bg-client-primary/10 flex items-center justify-center text-[10px] uppercase font-bold text-client-primary overflow-hidden">
                                                            {log.petId?.avatar ? <img src={log.petId.avatar} className="w-full h-full object-cover" /> : log.petId?.name?.charAt(0)}
                                                        </div>
                                                        <span className="font-[600] text-[14px] text-client-secondary">{log.petId?.name}</span>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-2 text-[13px] mb-2">
                                                        <div className="bg-green-50 text-green-700 px-2 py-1 rounded">Ăn: <span className="font-[600]">{log.eatingStatus}</span></div>
                                                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Tiêu hóa: <span className="font-[600]">{log.digestionStatus}</span></div>
                                                        <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded">Tâm trạng: <span className="font-[600]">{log.moodStatus}</span></div>
                                                    </div>

                                                    {log.note && (
                                                        <p className="text-[13px] text-[#666] italic bg-yellow-50/50 p-2 rounded mt-2">
                                                            " {log.note} " <span className="text-[11px] text-gray-400 block mt-1">- {log.staffName}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
