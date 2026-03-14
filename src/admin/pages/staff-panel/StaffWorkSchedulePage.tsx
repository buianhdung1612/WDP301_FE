import { useState } from "react";
import dayjs from "dayjs";
import {
    Box,
    Typography,
    Stack,
    CircularProgress,
    IconButton,
    Divider,
    Chip
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getMySchedules } from "../../api/work-schedule.api";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { COLORS } from "../role/configs/constants";



export const StaffWorkSchedulePage = () => {
    const { t } = useTranslation();
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


    const schedules = scheduleRes?.data || [];


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

        </Box>
    );
};




