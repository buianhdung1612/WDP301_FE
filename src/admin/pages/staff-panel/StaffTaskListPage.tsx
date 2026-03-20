import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
    Box,
    Card,
    Typography,
    Stack,
    Button,
    Grid,
    CircularProgress,
    Chip,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useStartBooking, useUpdateBookingStatus } from "../booking/hooks/useBookingManagement";
import { getBoardingBookings } from "../../api/boarding-booking.api";
import { prefixAdmin } from "../../constants/routes";

export const StaffTaskListPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [filterDate, setFilterDate] = useState(dayjs());

    const [selectedDetailBooking, setSelectedDetailBooking] = useState<any>(null);

    const { mutate: startService } = useStartBooking();
    const { mutate: updateStatus } = useUpdateBookingStatus();

    // Fetch Boarding data to count feeding/exercise tasks
    const { data: boardingRes, isLoading, refetch } = useQuery({
        queryKey: ["admin-boarding-bookings-stats", filterDate.format("YYYY-MM-DD")],
        queryFn: () => getBoardingBookings({ limit: 1000 }),
        enabled: !!user
    });

    const boardingBookings = useMemo(() => {
        return (boardingRes as any)?.data?.recordList || (Array.isArray(boardingRes?.data) ? boardingRes.data : []);
    }, [boardingRes]);

    // Task management functions
    const handleStart = (id: string, petId?: string) => {
        startService({ id, petId }, {
            onSuccess: () => {
                toast.success("Started service successfully");
                refetch();
            },
            onError: (error: any) => {
                const message = error.response?.data?.message || "Error starting service";
                toast.error(message);
            }
        });
    };

    const handleComplete = (id: string, petId?: string) => {
        updateStatus({ id, status: "completed", petId }, {
            onSuccess: () => {
                toast.success("Completed service successfully");
                refetch();
            },
            onError: (error: any) => {
                const message = error.response?.data?.message || "Error updating status";
                toast.error(message);
            }
        });
    };

    const filteredBoarding = useMemo(() => {
        return boardingBookings.filter((b: any) => {
            const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
            const dayIndex = filterDate.diff(checkInDate, 'day');
            const totalDays = b.numberOfDays || 1;
            return dayIndex >= 0 && dayIndex < totalDays;
        });
    }, [boardingBookings, filterDate]);

    // Memoized counts for the stats cards
    const statsData = useMemo(() => {
        let totalAssigned = 0;
        let completedAssigned = 0;
        let urgentFeeding = 0;

        filteredBoarding.forEach((b: any) => {
            const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
            const dayIndex = filterDate.diff(checkInDate, 'day');
            const totalDays = b.numberOfDays || 1;

            const fItemsPerDay = Math.ceil((b.feedingSchedule?.length || 0) / totalDays);
            const fDaily = (b.feedingSchedule || []).slice(dayIndex * fItemsPerDay, (dayIndex + 1) * fItemsPerDay);

            fDaily.forEach((f: any) => {
                if ((f.staffId?._id || f.staffId) === user?.id) {
                    totalAssigned++;
                    if (f.status === 'done') completedAssigned++;
                }
                if (f.status === 'pending') urgentFeeding++;
            });

            const eItemsPerDay = Math.ceil((b.exerciseSchedule?.length || 0) / totalDays);
            const eDaily = (b.exerciseSchedule || []).slice(dayIndex * eItemsPerDay, (dayIndex + 1) * eItemsPerDay);

            eDaily.forEach((e: any) => {
                if ((e.staffId?._id || e.staffId) === user?.id) {
                    totalAssigned++;
                    if (e.status === 'done') completedAssigned++;
                }
            });
        });

        return {
            efficiency: totalAssigned > 0 ? Math.round((completedAssigned / totalAssigned) * 100) : 0,
            urgentFeeding,
            activeStays: boardingBookings.length
        };
    }, [filteredBoarding, boardingBookings.length, user?.id]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#111827', mb: 0.5 }}>Lịch trình hôm nay</Typography>
                    <Typography variant="body1" sx={{ color: '#6B7280', fontWeight: 500 }}>
                        {filterDate.format("DD/MM/YYYY")} —
                        <Box component="span" sx={{ ml: 1, color: '#111827', fontWeight: 700 }}>Chào đón {boardingBookings.length} bé hôm nay</Box>
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton onClick={() => setFilterDate(prev => prev.subtract(1, 'day'))} sx={{ bgcolor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Icon icon="solar:arrow-left-bold" />
                    </IconButton>
                    <Chip
                        icon={<Icon icon="solar:cloud-sun-bold" width={20} style={{ color: '#00A76F' }} />}
                        label="28°C Nắng"
                        sx={{ bgcolor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontWeight: 700, p: 2, height: 40 }}
                    />
                    <IconButton onClick={() => setFilterDate(prev => prev.add(1, 'day'))} sx={{ bgcolor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Icon icon="solar:arrow-right-bold" />
                    </IconButton>
                </Stack>
            </Stack>

            <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, bgcolor: '#007B55', color: '#fff', borderRadius: '24px', height: '100%', position: 'relative', overflow: 'hidden' }}>
                        <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800 }}>HIỆU SUẤT CÔNG VIỆC</Typography>
                        <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ my: 1 }}>
                            <Typography variant="h2" sx={{ fontWeight: 900 }}>{statsData.efficiency}%</Typography>
                            <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9 }}>Tăng trưởng</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>So với chỉ số tuần trước</Typography>
                        <Icon icon="solar:graph-up-bold" width={100} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }} />
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, bgcolor: '#FEE9D1', border: '2px solid #fdba74', borderRadius: '24px', height: '100%', position: 'relative' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Chip label="KHẨN CẤP" size="small" sx={{ bgcolor: '#B76E00', color: '#fff', fontWeight: 900 }} />
                            <Icon icon="solar:danger-bold" width={24} style={{ color: '#B76E00' }} />
                        </Stack>
                        <Box sx={{ my: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#452C00' }}>{statsData.urgentFeeding} bé cần cho ăn</Typography>
                        </Box>
                        <Button variant="text" sx={{ color: '#B76E00', fontWeight: 800, p: 0 }} endIcon={<Icon icon="solar:arrow-right-bold" />}>
                            Xử lý ngay
                        </Button>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, bgcolor: '#fff', borderRadius: '24px', height: '100%', boxShadow: '0 8px 16px rgba(145, 158, 171, 0.08)' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, bgcolor: '#E4F8DD', borderRadius: '12px', color: '#007B55' }}>
                                <Icon icon="solar:users-group-rounded-bold" width={24} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800 }}>ĐANG LƯU TRÚ</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900 }}>{statsData.activeStays}</Typography>
                            </Box>
                        </Stack>
                        <Box sx={{ mt: 3 }}>
                            <Box sx={{ height: 8, bgcolor: '#F4F6F8', borderRadius: 4, overflow: 'hidden' }}>
                                <Box sx={{ width: '85%', height: '100%', bgcolor: '#007B55' }} />
                            </Box>
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
                                Công suất đạt 85%
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        <Typography variant="h5" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Icon icon="solar:clipboard-list-bold-duotone" width={28} />
                            Danh sách phân công
                        </Typography>

                        {filteredBoarding.length === 0 ? (
                            <Card sx={{ p: 5, textAlign: 'center', borderRadius: '24px', border: '2px dashed #E5E7EB', bgcolor: 'transparent' }}>
                                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 700 }}>Không có nhiệm vụ nào trong ngày này.</Typography>
                                <Typography variant="body2" sx={{ color: 'text.disabled' }}>Mọi thứ đã hoàn tất!</Typography>
                            </Card>
                        ) : (
                            filteredBoarding.map((b: any) => {
                                const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
                                const dayIndex = filterDate.diff(checkInDate, 'day');
                                const totalDays = b.numberOfDays || 1;

                                const fItemsPerDay = Math.ceil((b.feedingSchedule?.length || 0) / totalDays);
                                const fDaily = (b.feedingSchedule || []).slice(dayIndex * fItemsPerDay, (dayIndex + 1) * fItemsPerDay);

                                const eItemsPerDay = Math.ceil((b.exerciseSchedule?.length || 0) / totalDays);
                                const eDaily = (b.exerciseSchedule || []).slice(dayIndex * eItemsPerDay, (dayIndex + 1) * eItemsPerDay);

                                const hasUserTask = fDaily.some((f: any) => (f.staffId?._id || f.staffId) === user?.id) ||
                                    eDaily.some((e: any) => (e.staffId?._id || e.staffId) === user?.id);

                                if (!hasUserTask) return null;

                                return (
                                    <Card key={b._id} sx={{ p: 3, borderRadius: '32px', border: '1px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.05)' } }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Avatar
                                                src={b.petIds?.[0]?.avatar}
                                                sx={{ width: 80, height: 80, border: '4px solid #F3F4F6', bgcolor: '#E5E7EB' }}
                                            >
                                                {b.petIds?.[0]?.name?.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{b.petIds?.[0]?.name}</Typography>
                                                    <Chip label="ĐANG Ở" size="small" sx={{ bgcolor: '#E7F5EF', color: '#007B55', fontWeight: 900, fontSize: '10px' }} />
                                                </Stack>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1.5 }}>
                                                    Chuồng: <Box component="span" sx={{ color: '#111827' }}>{b.cageId?.cageCode || 'N/A'}</Box> • Ngày {dayIndex + 1} trên {totalDays}
                                                </Typography>
                                                <Stack direction="row" spacing={1}>
                                                    <Chip label="Bữa sáng" size="small" variant="outlined" sx={{ borderRadius: '8px', fontWeight: 700 }} />
                                                    <Chip label="Nhận phòng: 09:00 AM" size="small" variant="outlined" sx={{ borderRadius: '8px', fontWeight: 700 }} />
                                                </Stack>
                                            </Box>
                                            <IconButton onClick={() => setSelectedDetailBooking(b)} sx={{ bgcolor: '#F3F4F6', p: 1.5 }}>
                                                <Icon icon="solar:eye-bold" />
                                            </IconButton>
                                        </Stack>
                                    </Card>
                                );
                            })
                        )}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={4}>
                        <Card sx={{ p: 3, borderRadius: '32px', bgcolor: '#fff', border: '1px solid #F3F4F6' }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Dòng thời gian hoạt động</Typography>
                            <Stack spacing={3}>
                                {[1, 2, 3].map((_, i) => (
                                    <Stack key={i} direction="row" spacing={2.5}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: '14px', bgcolor: i === 0 ? '#E0F2FE' : '#F3F4F6', color: i === 0 ? '#0C53B7' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon icon={i === 0 ? "solar:bell-bing-bold" : "solar:check-circle-bold"} width={20} />
                                            </Box>
                                            {i < 2 && <Box sx={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', width: 2, height: 20, bgcolor: '#F3F4F6' }} />}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: i === 0 ? '#111827' : 'text.secondary' }}>Nhiệm vụ định kỳ cho {i === 0 ? 'Luna' : 'Milo'}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>Cần theo dõi sức khỏe</Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </Card>

                        <Card sx={{ p: 3, borderRadius: '32px', bgcolor: '#111827', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="overline" sx={{ opacity: 0.6, fontWeight: 900 }}>THÚ CƯNG CỦA TUẦN</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, mb: 2 }}>Golden Milo</Typography>
                                <Button variant="contained" sx={{ bgcolor: '#fff', color: '#111827', fontWeight: 900, borderRadius: '12px', '&:hover': { bgcolor: '#F3F4F6' } }}>
                                    Xem câu chuyện
                                </Button>
                            </Box>
                            <Icon icon="solar:star-bold" width={120} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.2, color: '#FCD34D' }} />
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            {/* DETAIL DIALOG */}
            <Dialog
                open={!!selectedDetailBooking}
                onClose={() => setSelectedDetailBooking(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '40px', p: 1, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }
                }}
            >
                {selectedDetailBooking && (() => {
                    const b = selectedDetailBooking;
                    const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
                    const dayIndex = filterDate.diff(checkInDate, 'day');
                    const totalDays = b.numberOfDays || 1;

                    const fItemsPerDay = Math.ceil((b.feedingSchedule?.length || 0) / totalDays);
                    const feedingToday = (b.feedingSchedule || []).slice(dayIndex * fItemsPerDay, (dayIndex + 1) * fItemsPerDay);

                    const eItemsPerDay = Math.ceil((b.exerciseSchedule?.length || 0) / totalDays);
                    const exerciseToday = (b.exerciseSchedule || []).slice(dayIndex * eItemsPerDay, (dayIndex + 1) * eItemsPerDay);

                    return (
                        <>
                            <DialogTitle sx={{ p: 4, pb: 2 }}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Avatar src={b.petIds?.[0]?.avatar} sx={{ width: 90, height: 90, border: '6px solid #F3F4F6', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 900 }}>{b.petIds?.[0]?.name}</Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Chip label={b.cageId?.cageCode} size="small" sx={{ fontWeight: 800 }} />
                                            <Chip label="ĐANG Ở" size="small" sx={{ bgcolor: '#E7F5EF', color: '#007B55', fontWeight: 800 }} />
                                        </Stack>
                                    </Box>
                                    <IconButton onClick={() => setSelectedDetailBooking(null)} sx={{ alignSelf: 'flex-start', bgcolor: '#F9FAFB' }}>
                                        <Icon icon="solar:close-circle-bold" />
                                    </IconButton>
                                </Stack>
                            </DialogTitle>

                            <DialogContent sx={{ px: 4, pb: 4 }}>
                                <Box sx={{ p: 3, bgcolor: '#F9FAFB', borderRadius: '32px', mb: 4 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 3 }}>Nhiệm vụ hôm nay — {filterDate.format("DD/MM")}</Typography>

                                    <Stack spacing={2.5}>
                                        <Typography variant="overline" sx={{ color: '#007B55', fontWeight: 900 }}>Lịch cho ăn</Typography>
                                        {feedingToday.length > 0 ? feedingToday.map((f: any, i: number) => (
                                            <Box key={i} sx={{ p: 2, bgcolor: '#fff', borderRadius: '20px', border: '1px solid #F3F4F6' }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box sx={{ p: 1, bgcolor: '#E7F5EF', borderRadius: '10px', color: '#007B55' }}>
                                                        <Icon icon="solar:bone-bold" />
                                                    </Box>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{f.time} — {f.food}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Lượng: {f.amount}</Typography>
                                                    </Box>
                                                    {f.status === 'done' ? (
                                                        <Icon icon="solar:check-circle-bold" style={{ color: '#007B55' }} />
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            onClick={() => handleComplete(b._id, b.petIds?.[0]?._id)}
                                                            sx={{ borderRadius: '12px', fontWeight: 800, bgcolor: '#007B55', color: '#fff' }}
                                                        >
                                                            Cho ăn
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Box>
                                        )) : <Typography variant="caption">Không có lịch cho ăn.</Typography>}

                                        <Typography variant="overline" sx={{ color: '#B78103', fontWeight: 900, mt: 2 }}>Vận động</Typography>
                                        {exerciseToday.length > 0 ? exerciseToday.map((e: any, i: number) => (
                                            <Box key={i} sx={{ p: 2, bgcolor: '#fff', borderRadius: '20px', border: '1px solid #F3F4F6' }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Box sx={{ p: 1, bgcolor: '#FFF7CD', borderRadius: '10px', color: '#B78103' }}>
                                                        <Icon icon="solar:running-bold" />
                                                    </Box>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{e.time} — {e.activity}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{e.durationMinutes} phút</Typography>
                                                    </Box>
                                                    {e.status === 'done' ? (
                                                        <Icon icon="solar:check-circle-bold" style={{ color: '#007B55' }} />
                                                    ) : (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleStart(b._id, b.petIds?.[0]?._id)}
                                                            sx={{ borderRadius: '12px', fontWeight: 800 }}
                                                        >
                                                            Bắt đầu
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Box>
                                        )) : <Typography variant="caption">Không có lịch vận động.</Typography>}
                                    </Stack>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate(`/${prefixAdmin}/boarding/booking-list`)}
                                    sx={{ bgcolor: '#111827', py: 2, borderRadius: '20px', fontWeight: 900, '&:hover': { bgcolor: '#1f2937' } }}
                                >
                                    Đi tới Quản lý Khách sạn
                                </Button>
                            </DialogContent>
                        </>
                    );
                })()}
            </Dialog>
        </Box>
    );
};
