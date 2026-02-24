import { useState } from "react";
import dayjs from "dayjs";
import {
    Box,
    Card,
    Typography,
    Stack,
    CircularProgress,
    IconButton,
    Divider,
    Chip,
    Button
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getMySchedules } from "../../api/work-schedule.api";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { COLORS } from "../role/configs/constants";
import { useCheckIn, useCheckOut } from "../hr/hooks/useSchedules";
import { toast } from "react-toastify";

import { useAuthStore } from "../../../stores/useAuthStore";

import { getAttendanceConfig } from "../../api/attendance-config.api";

export const StaffWorkSchedulePage = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [viewDate, setViewDate] = useState(dayjs());

    const startDate = viewDate.startOf('week').format("YYYY-MM-DD");
    const endDate = viewDate.endOf('week').format("YYYY-MM-DD");

    const { data: scheduleRes, isLoading } = useQuery({
        queryKey: ["staff-schedules", startDate, endDate],
        queryFn: () => getMySchedules({
            startDate,
            endDate
        }),
    });

    const { data: configRes } = useQuery({
        queryKey: ["attendance-config"],
        queryFn: getAttendanceConfig
    });

    const config = configRes?.data || {};
    const earlyLimit = config.checkInEarlyLimit || 15;

    const { mutate: checkIn } = useCheckIn();
    const { mutate: checkOut } = useCheckOut();

    const userPermissions = user?.permissions || [];
    const canCheck = userPermissions.includes("attendance_checkin") || userPermissions.includes("attendance_edit");
    const isAdmin = userPermissions.includes("attendance_edit");

    const schedules = scheduleRes?.data || [];

    const handleCheckIn = (id: string) => {
        if (window.confirm("Xác nhận bắt đầu ca làm việc?")) {
            checkIn(id, {
                onSuccess: () => toast.success("Bắt đầu ca làm việc thành công!"),
                onError: (err: any) => toast.error(err.response?.data?.message || "Lỗi check-in")
            });
        }
    };

    const handleCheckOut = (id: string) => {
        if (window.confirm("Xác nhận kết thúc ca làm việc?")) {
            checkOut(id, {
                onSuccess: () => toast.success("Kết thúc ca làm việc thành công!"),
                onError: (err: any) => toast.error(err.response?.data?.message || "Lỗi check-out")
            });
        }
    };

    // Generate week days
    const weekDays: dayjs.Dayjs[] = [];
    let current = viewDate.startOf('week');
    for (let i = 0; i < 7; i++) {
        weekDays.push(current);
        current = current.add(1, 'day');
    }

    const getShiftForDay = (date: dayjs.Dayjs) => {
        return schedules.find((s: any) => dayjs(s.date).isSame(date, 'day'));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return { bg: 'rgba(255, 171, 0, 0.16)', color: '#FFAB00' };
            case 'checked-in': return { bg: 'rgba(0, 184, 217, 0.16)', color: '#00B8D9' };
            case 'checked-out': return { bg: 'rgba(34, 197, 94, 0.16)', color: '#22C55E' };
            case 'absent': return { bg: 'rgba(255, 86, 48, 0.16)', color: 'var(--palette-error-main)' };
            default: return { bg: 'rgba(145, 158, 171, 0.16)', color: 'var(--palette-text-secondary)' };
        }
    };

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Title title="Lịch làm việc của tôi" />
                    <Breadcrumb
                        items={[
                            { label: t("admin.dashboard"), to: `/${prefixAdmin}` },
                            { label: "Lịch làm việc cá nhân" }
                        ]}
                    />
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{ fontWeight: 600, color: COLORS.secondary }}>
                        Tuần: {viewDate.startOf('week').format("DD/MM")} - {viewDate.endOf('week').format("DD/MM/YYYY")}
                    </Typography>
                    <IconButton onClick={() => setViewDate(prev => prev.subtract(1, 'week'))}>
                        <Icon icon="eva:arrow-ios-back-fill" />
                    </IconButton>
                    <IconButton onClick={() => setViewDate(dayjs())}>
                        <Icon icon="eva:calendar-outline" />
                    </IconButton>
                    <IconButton onClick={() => setViewDate(prev => prev.add(1, 'week'))}>
                        <Icon icon="eva:arrow-ios-forward-fill" />
                    </IconButton>
                </Stack>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(7, 1fr)' },
                    gap: 2
                }}>
                    {weekDays.map((day, index) => {
                        const shift = getShiftForDay(day);
                        const isToday = day.isSame(dayjs(), 'day');
                        const statusStyle = shift ? getStatusColor(shift.status) : null;

                        // Logic kiểm tra giờ check-in
                        let isTooEarly = false;
                        let isOutsideSystemTime = false;
                        let openAt = "";

                        if (shift && isToday && shift.status === 'scheduled') {
                            const shiftStartStr = shift.shiftId?.startTime;
                            const shiftStartTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T${shiftStartStr}`);

                            // 1. Kiểm tra giờ hoạt động hệ thống
                            const systemStartTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T${config.workDayStartTime || '07:00'}`);
                            const systemEndTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T${config.workDayEndTime || '22:00'}`);

                            if (dayjs().isBefore(systemStartTime) || dayjs().isAfter(systemEndTime)) {
                                isOutsideSystemTime = true;
                            }

                            // 2. Kiểm tra giới hạn check-in sớm
                            const checkInOpenTime = shiftStartTime.subtract(earlyLimit, 'minute');
                            isTooEarly = dayjs().isBefore(checkInOpenTime);
                            openAt = checkInOpenTime.format("HH:mm");
                        }

                        return (
                            <Box key={index} sx={{
                                p: 2,
                                height: '100%',
                                minHeight: '260px',
                                borderRadius: "var(--shape-borderRadius-lg)",
                                border: isToday ? `2px solid ${COLORS.primary}` : '1px solid rgba(145, 158, 171, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                bgcolor: isToday ? 'rgba(33, 43, 54, 0.02)' : '#fff',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.12)'
                                }
                            }}>
                                <Box sx={{ mb: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ color: COLORS.secondary, textTransform: 'uppercase', fontWeight: 700 }}>
                                        {day.format("ddd")}
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: isToday ? COLORS.primary : COLORS.secondary }}>
                                        {day.format("DD")}
                                    </Typography>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {shift ? (
                                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.primary }}>
                                            {shift.shiftId?.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: COLORS.secondary }}>
                                            {shift.shiftId?.startTime} - {shift.shiftId?.endTime}
                                        </Typography>

                                        {shift.checkInTime && (
                                            <Typography variant="caption" sx={{ color: 'var(--palette-primary-main)', fontWeight: 600 }}>
                                                Vào: {dayjs(shift.checkInTime).format("HH:mm")}
                                            </Typography>
                                        )}
                                        {shift.checkOutTime && (
                                            <Typography variant="caption" sx={{ color: '#00B8D9', fontWeight: 600 }}>
                                                Ra: {dayjs(shift.checkOutTime).format("HH:mm")}
                                            </Typography>
                                        )}

                                        <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Chip
                                                label={shift.status === 'scheduled' ? 'Chưa bắt đầu' :
                                                    shift.status === 'checked-in' ? 'Đang làm' :
                                                        shift.status === 'checked-out' ? 'Đã xong' : 'Vắng'}
                                                size="small"
                                                sx={{
                                                    fontSize: '0.625rem',
                                                    height: '20px',
                                                    fontWeight: 700,
                                                    bgcolor: statusStyle?.bg,
                                                    color: statusStyle?.color,
                                                    mb: 1
                                                }}
                                            />

                                            {canCheck && isToday && shift.status === 'scheduled' && (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        fullWidth
                                                        disabled={(isTooEarly || isOutsideSystemTime) && !isAdmin}
                                                        onClick={() => handleCheckIn(shift._id)}
                                                        sx={{
                                                            borderRadius: "var(--shape-borderRadius)",
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem',
                                                            bgcolor: 'var(--palette-primary-main)',
                                                            '&:hover': { bgcolor: '#007B55' },
                                                            '&.Mui-disabled': {
                                                                bgcolor: 'rgba(145, 158, 171, 0.24)',
                                                                color: 'rgba(145, 158, 171, 0.8)'
                                                            }
                                                        }}
                                                    >
                                                        Check in
                                                    </Button>
                                                    {!isAdmin && isOutsideSystemTime && (
                                                        <Typography variant="caption" sx={{ textAlign: 'center', color: 'var(--palette-error-main)', fontSize: '0.65rem', fontWeight: 600 }}>
                                                            Hệ thống đóng (Sau {config.workDayEndTime})
                                                        </Typography>
                                                    )}
                                                    {!isAdmin && !isOutsideSystemTime && isTooEarly && (
                                                        <Typography variant="caption" sx={{ textAlign: 'center', color: 'var(--palette-error-main)', fontSize: '0.65rem', fontWeight: 600 }}>
                                                            Mở lúc {openAt}
                                                        </Typography>
                                                    )}
                                                </>
                                            )}

                                            {canCheck && isToday && shift.status === 'checked-in' && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    fullWidth
                                                    onClick={() => handleCheckOut(shift._id)}
                                                    sx={{
                                                        borderRadius: "var(--shape-borderRadius)",
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        bgcolor: '#00B8D9',
                                                        '&:hover': { bgcolor: '#007896' }
                                                    }}
                                                >
                                                    Check out
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: COLORS.secondary, fontStyle: 'italic' }}>
                                            Nghỉ
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            )}

            <Card sx={{ mt: 4, p: 3, borderRadius: "var(--shape-borderRadius-lg)", bgcolor: 'rgba(145, 158, 171, 0.04)' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Chú thích trạng thái:</Typography>
                <Stack direction="row" spacing={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFAB00' }} />
                        <Typography variant="caption">Chưa bắt đầu ca</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#00B8D9' }} />
                        <Typography variant="caption">Đang trong ca làm</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22C55E' }} />
                        <Typography variant="caption">Đã hoàn thành ca</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'var(--palette-error-main)' }} />
                        <Typography variant="caption">Vắng mặt</Typography>
                    </Box>
                </Stack>
            </Card>
        </Box>
    );
};




