import { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Card,
    Grid,
    Avatar,
    Button,
    IconButton,
    CircularProgress
} from "@mui/material";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
    updateBoardingCareSchedule
} from "../../api/boarding-booking.api";
import { uploadMediaToCloudinary } from "../../api/uploadCloudinary.api";
import { useQueryClient } from "@tanstack/react-query";

interface TaskDashboardProps {
    bookings: any[];
    careDate: string;
}

export const BoardingTaskDashboard = ({ bookings, careDate }: TaskDashboardProps) => {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");
    const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

    // Flatten tasks
    const allTasks = useMemo(() => {
        const tasks: any[] = [];
        const currentCareDate = dayjs(careDate);

        bookings.forEach(booking => {
            const feeding = Array.isArray(booking.feedingSchedule) ? booking.feedingSchedule : [];
            const exercise = Array.isArray(booking.exerciseSchedule) ? booking.exerciseSchedule : [];

            // Xác định thời gian check-in/out thực tế (ưu tiên actual nếu có)
            const checkIn = dayjs(booking.actualCheckInDate || booking.checkInDate);
            const checkOut = dayjs(booking.actualCheckOutDate || booking.checkOutDate);

            const isFirstDay = currentCareDate.isSame(checkIn, 'day');
            const isLastDay = currentCareDate.isSame(checkOut, 'day');

            const checkInTimeStr = checkIn.format("HH:mm");
            const checkOutTimeStr = checkOut.format("HH:mm");

            const dayDiff = currentCareDate.startOf('day').diff(dayjs(checkIn).startOf('day'), 'day') + 1;
            const targetDaySuffix = `Ngày ${dayDiff}`;

            // Xử lý lịch ăn
            feeding.forEach((item: any, index: number) => {
                const taskTime = item.time || "00:00";
                
                // Trích xuất prefix "07:30" nếu có chứa "- Ngày N"
                const baseTimeMatch = taskTime.split(" - ")[0];
                const baseTime = baseTimeMatch.trim();

                // Lọc nhiệm vụ theo ngày
                if (taskTime.includes("Ngày") && !taskTime.includes(targetDaySuffix)) return;

                // Lọc nhiệm vụ theo giờ check-in/out
                if (isFirstDay && baseTime < checkInTimeStr) return;
                if (isLastDay && baseTime > checkOutTimeStr) return;

                tasks.push({
                    ...item,
                    bookingId: booking._id,
                    bookingCode: booking.code,
                    pets: booking.petIds || [],
                    customerName: booking.fullName || booking.userId?.fullName,
                    type: "feeding",
                    scheduleIndex: index,
                    displayTime: dayjs(`2000-01-01 ${baseTime}`).format("hh:mm A") + (taskTime.includes("Ngày") ? ` (N${dayDiff})` : ""),
                    sortTime: baseTime
                });
            });

            // Xử lý lịch vận động
            exercise.forEach((item: any, index: number) => {
                const taskTime = item.time || "00:00";
                
                const baseTimeMatch = taskTime.split(" - ")[0];
                const baseTime = baseTimeMatch.trim();

                if (taskTime.includes("Ngày") && !taskTime.includes(targetDaySuffix)) return;

                // Lọc nhiệm vụ theo giờ check-in/out
                if (isFirstDay && baseTime < checkInTimeStr) return;
                if (isLastDay && baseTime > checkOutTimeStr) return;

                tasks.push({
                    ...item,
                    bookingId: booking._id,
                    bookingCode: booking.code,
                    pets: booking.petIds || [],
                    customerName: booking.fullName || booking.userId?.fullName,
                    type: "exercise",
                    scheduleIndex: index,
                    displayTime: baseTime + (taskTime.includes("Ngày") ? ` (N${dayDiff})` : ""),
                    sortTime: baseTime
                });
            });
        });

        return tasks.sort((a, b) => a.sortTime.localeCompare(b.sortTime));
    }, [bookings, careDate]);

    const filteredTasks = useMemo(() => {
        let list = allTasks;

        if (filterStatus !== "all") {
            list = list.filter(t => t.status === filterStatus);
        }

        if (filterType !== "all") {
            list = list.filter(t => t.type === filterType);
        }

        return list;
    }, [allTasks, filterStatus, filterType]);

    const stats = useMemo(() => {
        const total = allTasks.length;
        const done = allTasks.filter(t => t.status === "done").length;
        const pending = allTasks.filter(t => t.status === "pending").length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        return { total, done, pending, percent };
    }, [allTasks]);

    const handleQuickComplete = async (task: any, files: FileList | null) => {
        if (!files || files.length === 0) {
            toast.error("Vui lòng tải ảnh minh chứng để hoàn thành");
            return;
        }

        const taskId = `${task.bookingId}-${task.type}-${task.scheduleIndex}`;
        try {
            setUploadingTaskId(taskId);
            const fileArray = Array.from(files);
            const uploaded = await uploadMediaToCloudinary(fileArray);

            // Find the original booking and update its schedule
            const booking = bookings.find(b => b._id === task.bookingId);
            if (!booking) return;

            const feedingSchedule = [...(booking.feedingSchedule || [])];
            const exerciseSchedule = [...(booking.exerciseSchedule || [])];

            if (task.type === "feeding") {
                feedingSchedule[task.scheduleIndex] = {
                    ...feedingSchedule[task.scheduleIndex],
                    status: "done",
                    proofMedia: uploaded as any,
                    doneAt: new Date().toISOString()
                };
            } else {
                exerciseSchedule[task.scheduleIndex] = {
                    ...exerciseSchedule[task.scheduleIndex],
                    status: "done",
                    proofMedia: uploaded as any,
                    doneAt: new Date().toISOString()
                };
            }

            await updateBoardingCareSchedule(task.bookingId, {
                feedingSchedule,
                exerciseSchedule,
                careDate
            });

            toast.success(`Nhiệm vụ ${task.displayTime} cho ${task.bookingCode} đã hoàn tất`);
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
        } catch (error: any) {
            toast.error(error.message || "Lỗi cập nhật nhiệm vụ");
        } finally {
            setUploadingTaskId(null);
        }
    };

    return (
        <Box className="space-y-8">
            {/* Header Stats */}
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card className="p-6 bg-white rounded-[20px] border border-[#f0f2f5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
                        <Box>
                            <Typography variant="overline" className="font-[800] text-[#94a3b8] tracking-[0.1em] mb-1 block">TIẾN ĐỘ CHUNG</Typography>
                            <Box className="flex items-baseline gap-2 mb-3">
                                <Typography variant="h3" className="font-[900] text-[#1e293b] leading-none">{stats.percent}%</Typography>
                                <Typography variant="caption" className="text-[#94a3b8] font-[700] uppercase tracking-tighter">{stats.done}/{stats.total} Tác vụ</Typography>
                            </Box>
                            <Box className="w-[120px] h-[6px] bg-[#f1f5f9] rounded-full overflow-hidden">
                                <Box className="h-full bg-[#10b981] transition-all duration-1000" style={{ width: `${stats.percent}%` }} />
                            </Box>
                        </Box>
                        <Box className="relative flex items-center justify-center">
                            <CircularProgress
                                variant="determinate"
                                value={stats.percent}
                                size={70}
                                thickness={5}
                                sx={{ color: '#10b981', '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
                            />
                            <Box className="absolute flex items-center justify-center w-8 h-8 bg-[#f0fdf4] rounded-full">
                                <Icon icon="solar:chart-2-bold" width={18} className="text-[#10b981]" />
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card className="p-6 bg-white rounded-[20px] border border-[#f0f2f5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-l-[6px] border-l-[#3b82f6] flex items-center justify-between">
                        <Box>
                            <Typography variant="overline" className="font-[800] text-[#94a3b8] tracking-[0.1em] mb-1 block">CHỜ THỰC HIỆN</Typography>
                            <Typography variant="h3" className="font-[900] text-[#1e293b] mb-1">{String(stats.pending).padStart(2, '0')}</Typography>
                            <Typography variant="caption" className="text-[#94a3b8] font-[600]">Cần xử lý trong buổi sáng</Typography>
                        </Box>
                        <Box className="w-12 h-12 bg-[#eff6ff] rounded-[14px] flex items-center justify-center">
                            <Icon icon="solar:clipboard-list-bold" width={24} className="text-[#3b82f6]" />
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card className="p-6 bg-white rounded-[20px] border border-[#f0f2f5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-l-[6px] border-l-[#10b981] flex items-center justify-between">
                        <Box>
                            <Typography variant="overline" className="font-[800] text-[#94a3b8] tracking-[0.1em] mb-1 block">ĐÃ XONG</Typography>
                            <Typography variant="h3" className="font-[900] text-[#1e293b] mb-1">{String(stats.done).padStart(2, '0')}</Typography>
                            <Typography variant="caption" className="text-[#10b981] font-[700] flex items-center gap-1">
                                <Icon icon="solar:graph-up-bold" width={14} /> +2 so với hôm qua
                            </Typography>
                        </Box>
                        <Box className="w-12 h-12 bg-[#f0fdf4] rounded-[14px] flex items-center justify-center">
                            <Icon icon="solar:check-circle-bold" width={24} className="text-[#10b981]" />
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters Bar */}
            <Box className="p-6 bg-[#f8fafc] rounded-[24px] border border-[#f1f5f9] flex items-center justify-between gap-4">
                <Box className="flex items-center gap-2 p-1.5 bg-white rounded-[16px] border border-[#e2e8f0] shadow-sm">
                    <Button
                        size="small"
                        onClick={() => setFilterStatus("all")}
                        className={`px-6 h-10 rounded-[12px] font-[800] uppercase text-[12px] tracking-wider transition-all ${filterStatus === "all" ? 'bg-[#1e293b] text-white' : 'text-[#64748b] hover:bg-slate-50'}`}
                    >Tất cả</Button>
                    <Button
                        size="small"
                        onClick={() => setFilterStatus("pending")}
                        className={`px-6 h-10 rounded-[12px] font-[800] uppercase text-[12px] tracking-wider transition-all ${filterStatus === "pending" ? 'bg-[#1e293b] text-white' : 'text-[#64748b] hover:bg-slate-50'}`}
                    >Chờ</Button>
                    <Button
                        size="small"
                        onClick={() => setFilterStatus("done")}
                        className={`px-6 h-10 rounded-[12px] font-[800] uppercase text-[12px] tracking-wider transition-all ${filterStatus === "done" ? 'bg-[#1e293b] text-white' : 'text-[#64748b] hover:bg-slate-50'}`}
                    >Xong</Button>
                </Box>

                <Box className="flex items-center gap-4">
                    <Box className="flex items-center gap-1.5 p-1.5 bg-white rounded-[16px] border border-[#e2e8f0] shadow-sm">
                        <IconButton
                            size="small"
                            onClick={() => setFilterType("all")}
                            className={`w-10 h-10 rounded-[12px] ${filterType === "all" ? 'bg-[#f1f5f9] text-[#1e293b]' : 'text-[#94a3b8]'}`}
                        ><Icon icon="solar:list-bold" width={20} /></IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setFilterType("feeding")}
                            className={`w-10 h-10 rounded-[12px] ${filterType === "feeding" ? 'bg-[#f1f5f9] text-[#1e293b]' : 'text-[#94a3b8]'}`}
                        ><Icon icon="solar:utensils-bold" width={20} /></IconButton>
                    </Box>

                    <Box className="flex items-center gap-3 px-6 h-[52px] bg-white rounded-[16px] border border-[#e2e8f0] text-[#1e293b] font-[800] shadow-sm">
                        <Icon icon="solar:calendar-bold" width={22} className="text-[#3b82f6]" />
                        <span className="text-[14px]">{dayjs(careDate).format("DD / MM / YYYY")}</span>
                    </Box>
                </Box>
            </Box>

            {/* Table Header Labels - Calibrated with Row Grid */}
            <Box className="px-12 grid grid-cols-12 gap-0">
                <Box className="col-span-2"><Typography variant="overline" className="font-[800] text-[#94a3b8] tracking-[0.2em] text-[10px]">THỜI GIAN / LOẠI</Typography></Box>
                <Box className="col-span-3 px-8"><Typography variant="overline" className="font-[800] text-[#94a3b8] tracking-[0.2em] text-[10px]">THÔNG TIN THÚ CƯNG</Typography></Box>
                <Box className="col-span-4 px-6"><Typography variant="overline" className="font-[800] text-[#94a3b8] tracking-[0.2em] text-[10px]">NỘI DUNG CHĂM SÓC</Typography></Box>
                <Box className="col-span-3 text-right pr-12"><Typography variant="overline" className="font-[800] text-[#94a3b8] tracking-[0.2em] text-[10px]">TRẠNG THÁI</Typography></Box>
            </Box>

            {/* Task List */}
            <Box className="space-y-6">
                {filteredTasks.length === 0 ? (
                    <Box className="py-24 text-center bg-white rounded-[32px] border-2 border-dashed border-[#e2e8f0]">
                        <Icon icon="solar:inbox-line-bold-duotone" width={80} className="mx-auto text-[#cbd5e1] mb-6" />
                        <Typography variant="h5" className="text-[#64748b] font-bold">Không tìm thấy nhiệm vụ nào</Typography>
                        <Typography variant="body2" className="text-[#94a3b8] font-medium mt-1">Vui lòng điều chỉnh bộ lọc hoặc chọn ngày khác</Typography>
                    </Box>
                ) : (
                    filteredTasks.map((task) => {
                        const taskId = `${task.bookingId}-${task.type}-${task.scheduleIndex}`;
                        const isUploading = uploadingTaskId === taskId;
                        const isDone = task.status === "done";
                        const isFeeding = task.type === "feeding";

                        return (
                            <Card key={taskId} className={`p-0 rounded-[28px] border border-[#f1f5f9] shadow-[0_2px_12px_rgba(0,0,0,0.015)] transition-all overflow-hidden ${isDone ? 'bg-[#f8fafc]/40' : 'bg-white'}`}>
                                <Grid container className="items-stretch">
                                    {/* Left Border Accent */}
                                    <Box className={`w-[6px] h-full ${isFeeding ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`} />

                                    <Grid container className="flex-1 p-6 items-center">
                                        {/* Time Column (col-span-2) */}
                                        <Grid size={{ xs: 12, sm: 2 }} className="flex flex-col items-center justify-center border-r border-[#f1f5f9]">
                                            <Typography variant="h4" className={`font-[900] ${isDone ? 'text-[#cbd5e1]' : 'text-[#0f172a]'}`}>
                                                {task.displayTime}
                                            </Typography>
                                            <Box className="mt-2.5">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-[900] tracking-widest ${isFeeding ? 'bg-[#eff6ff] text-[#3b82f6]' : 'bg-[#f0fdf4] text-[#10b981]'}`}>
                                                    {isFeeding ? "ĂN UỐNG" : "VỆ SINH"}
                                                </span>
                                            </Box>
                                        </Grid>

                                        {/* Pet Info Column (col-span-3) */}
                                        <Grid size={{ xs: 12, sm: 3 }} className="px-8 border-r border-[#f1f5f9] h-full flex flex-col justify-center">
                                            <Box className="flex items-center gap-4">
                                                <Avatar
                                                    src={task.pets[0]?.avatar}
                                                    variant="rounded"
                                                    sx={{ width: 56, height: 56, borderRadius: '14px', bgcolor: '#f1f5f9', border: '1px solid #f1f5f9' }}
                                                />
                                                <Box>
                                                    <Typography variant="subtitle1" className="font-[900] text-[#1e293b] leading-tight mb-0.5">{task.pets[0]?.name || "Thú cưng"}</Typography>
                                                    <Typography variant="caption" className="font-[700] text-[#3b82f6] block tracking-tighter">#{task.bookingCode.slice(-6).toUpperCase()}</Typography>
                                                    <Typography variant="caption" className="text-[#94a3b8] font-[600] flex items-center gap-1">
                                                        <Icon icon="solar:user-bold" width={10} /> {task.customerName}
                                                    </Typography>
                                                    {!task.staffId && (
                                                        <Typography variant="caption" className="text-[#ef4444] font-[900] flex items-center gap-1 mt-1 uppercase tracking-tighter">
                                                            <Icon icon="solar:danger-bold" width={12} /> Chưa gán nhân viên
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {/* Content Column (col-span-4) */}
                                        <Grid size={{ xs: 12, sm: 4 }} className="px-6 border-r border-[#f1f5f9] h-full flex flex-col justify-center">
                                            <Box className={`p-4 rounded-[18px] border-2 shadow-sm ${isFeeding ? 'bg-[#eff6ff]/20 border-[#eff6ff] text-[#1e293b]' : 'bg-[#f0fdf4]/20 border-[#f0fdf4] text-[#1e293b]'}`}>
                                                <Typography variant="body2" className="font-[800] mb-1 leading-snug">
                                                    {isFeeding ? `${task.food} (${task.amount || "N/A"})` : `${task.activity} (${task.durationMinutes || 0}m)`}
                                                </Typography>
                                                <Typography variant="caption" className="text-[#64748b] leading-relaxed font-[500] line-clamp-2 italic">
                                                    {task.note || "Đảm bảo thực hiện đúng liều lượng."}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        {/* Action Column (col-span-3) */}
                                        <Grid size={{ xs: 12, sm: 3 }} className="pl-6 flex justify-center">
                                            {isDone ? (
                                                <Box className="flex flex-col items-center gap-1 text-[#10b981] bg-[#f0fdf4] px-8 py-3 rounded-[20px] border border-[#dcfce7] min-w-[160px]">
                                                    <Icon icon="solar:check-circle-bold" width={22} />
                                                    <Typography variant="caption" className="font-[900] uppercase tracking-[0.2em] text-[10px]">Đã Xong</Typography>
                                                </Box>
                                            ) : (
                                                <>
                                                    <input
                                                        type="file"
                                                        id={`upload-${taskId}`}
                                                        style={{ display: "none" }}
                                                        onChange={(e) => handleQuickComplete(task, e.target.files)}
                                                        accept="image/*,video/*"
                                                    />
                                                    <label htmlFor={`upload-${taskId}`}>
                                                        <Button
                                                            component="span"
                                                            disabled={isUploading}
                                                            className="bg-[#0f172a] hover:bg-[#334155] text-white rounded-[18px] py-3 px-8 shadow-md capitalize flex items-center gap-2 transition-all min-w-[160px] justify-center"
                                                        >
                                                            {isUploading ? <CircularProgress size={18} color="inherit" /> : <Icon icon="solar:camera-bold" width={20} />}
                                                            <Typography variant="body2" className="font-[900]">Hoàn thành</Typography>
                                                        </Button>
                                                    </label>
                                                </>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Card>
                        );
                    })
                )}
            </Box>
        </Box>
    );
};
