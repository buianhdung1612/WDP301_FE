import React, { useMemo } from 'react';
import { Box, Typography, Stack, Tooltip, Avatar, alpha, Skeleton } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useSchedules } from '../../hr/hooks/useSchedules';
import { useBookings } from '../hooks/useBookingManagement';
import { Icon } from '@iconify/react';
import { useStaffByService } from '../../account-admin/hooks/useAccountAdmin';

interface StaffAvailabilityTimelineProps {
    date: Dayjs;
    serviceId?: string;
    staffList?: any[];
    selectionStart?: Dayjs;
    selectionEnd?: Dayjs;
    selectedStaffIds?: string[];
    onlyShowSelected?: boolean;
    currentBookingId?: string;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 to 23:00

export const StaffAvailabilityTimeline: React.FC<StaffAvailabilityTimelineProps> = ({
    date,
    serviceId,
    staffList: propStaffList,
    selectionStart,
    selectionEnd,
    selectedStaffIds = [],
    onlyShowSelected = false,
    currentBookingId
}) => {
    const isToday = date.isSame(dayjs(), 'day');
    const currentTimePos = useMemo(() => {
        if (!isToday) return null;
        const now = dayjs();
        const start = 8;
        const end = 23;
        const currentHour = now.hour() + now.minute() / 60;
        if (currentHour < start || currentHour > end) return null;
        return ((currentHour - start) / (end - start)) * 100;
    }, [isToday]);

    // Fetch all schedules for this date
    const { data: schedulesRes, isLoading: isLoadingSchedules } = useSchedules({
        date: date.format('YYYY-MM-DD')
    });
    const schedules = schedulesRes?.data || [];

    // Fetch all bookings for this date
    const { data: bookingsRes, isLoading: isLoadingBookings } = useBookings({
        date: date.format('YYYY-MM-DD')
    });
    const bookings = bookingsRes?.data || [];

    // Fetch staff for this service (only used if propStaffList is not provided)
    const { data: fetchedStaff = [], isLoading: isLoadingStaff } = useStaffByService(propStaffList ? undefined : serviceId);
    const capableStaff = propStaffList || fetchedStaff;

    const staffData = useMemo(() => {
        const map = new Map();

        // 1. If we have a list of capable staff, start with them
        if (capableStaff.length > 0) {
            capableStaff.forEach((staff: any) => {
                map.set(staff._id, {
                    info: staff,
                    schedules: [],
                    bookings: []
                });
            });
        }

        // 2. Add schedules
        schedules.forEach((s: any) => {
            const staffId = s.staffId?._id;
            if (!staffId) return;

            // If we have a restricted list (serviceId was provided) and this staff isn't in it, skip
            if (serviceId && !map.has(staffId)) return;

            if (!map.has(staffId)) {
                map.set(staffId, {
                    info: s.staffId,
                    schedules: [],
                    bookings: []
                });
            }
            map.get(staffId).schedules.push(s);
        });

        // 3. Add bookings
        bookings.forEach((b: any) => {
            if (currentBookingId && b._id === currentBookingId) return;

            const assignedStaffIds = (b.staffIds && b.staffIds.length > 0)
                ? b.staffIds
                : (b.staffId?._id ? [b.staffId._id] : []);

            assignedStaffIds.forEach((sId: any) => {
                const staffId = typeof sId === 'object' ? sId?._id : sId;
                if (!staffId) return;

                // If we have a restricted list and this staff isn't in it, skip
                if (serviceId && !map.has(staffId)) return;

                if (!map.has(staffId)) {
                    map.set(staffId, {
                        info: b.staffId,
                        schedules: [],
                        bookings: []
                    });
                }
                map.get(staffId).bookings.push(b);
            });
        });

        const allStaff = Array.from(map.values()).sort((a, b) => a.info.fullName.localeCompare(b.info.fullName));

        if (onlyShowSelected && selectedStaffIds.length > 0) {
            return allStaff.filter(s => selectedStaffIds.includes(s.info._id));
        }

        return allStaff;
    }, [schedules, bookings, capableStaff, selectedStaffIds, onlyShowSelected, currentBookingId]);

    if (isLoadingSchedules || isLoadingBookings || isLoadingStaff) {
        return (
            <Stack spacing={2} sx={{ mt: 2 }}>
                {[1, 2, 3].map(i => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="rounded" width="100%" height={32} sx={{ borderRadius: '8px' }} />
                    </Box>
                ))}
            </Stack>
        );
    }

    if (staffData.length === 0) {
        return (
            <Box sx={{
                p: 4,
                mt: 2,
                textAlign: 'center',
                bgcolor: alpha('#919EAB', 0.04),
                borderRadius: '16px',
                border: '1px dashed',
                borderColor: alpha('#919EAB', 0.2),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5
            }}>
                <Icon icon="solar:calendar-slash-bold-duotone" width={48} color={alpha('#919EAB', 0.5)} />
                <Typography variant="body2" sx={{ color: '#637381', fontWeight: 500 }}>
                    Không có nhân viên thực hiện nhiệm vụ trong ngày này
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            mt: 2,
            p: 2,
            bgcolor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: alpha('#919EAB', 0.12),
            boxShadow: '0 4px 12px 0 rgba(145, 158, 171, 0.08)',
            overflow: 'hidden'
        }}>
            <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 800, position: 'relative' }}>
                    {/* Header: Hours */}
                    <Box sx={{
                        display: 'flex',
                        borderBottom: '1px solid',
                        borderColor: alpha('#919EAB', 0.1),
                        pb: 1.5,
                        mb: 2
                    }}>
                        <Box sx={{ width: 180, flexShrink: 0 }}>
                            <Typography variant="overline" sx={{ color: '#919EAB', fontWeight: 700 }}>Nhân viên</Typography>
                        </Box>
                        {HOURS.map(hour => (
                            <Box key={hour} sx={{ flex: 1, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#637381' }}>
                                    {hour}:00
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Timeline Data Container */}
                    <Stack spacing={2.5}>
                        {staffData.map((staff: any) => (
                            <Box key={staff.info._id} sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* Staff Info Column */}
                                <Box sx={{ width: 180, pr: 2, flexShrink: 0 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Box sx={{ position: 'relative' }}>
                                            <Avatar src={staff.info.avatar} sx={{ width: 32, height: 32, border: '2px solid #fff', boxShadow: '0 0 0 1px #919EAB33' }} />
                                            {staff.schedules.length > 0 && (
                                                <Box sx={{
                                                    position: 'absolute', bottom: -2, right: -2,
                                                    width: 10, height: 10, bgcolor: '#00A76F',
                                                    borderRadius: '50%', border: '2px solid #fff'
                                                }} />
                                            )}
                                        </Box>
                                        <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
                                            {staff.info.fullName}
                                        </Typography>
                                    </Stack>
                                </Box>

                                {/* Timeline Track */}
                                <Box sx={{
                                    flex: (HOURS.length - 1),
                                    position: 'relative',
                                    height: 36,
                                    bgcolor: alpha('#919EAB', 0.04),
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: alpha('#919EAB', 0.08) }
                                }}>
                                    {/* Hour vertical dividers */}
                                    {HOURS.map((_, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                position: 'absolute',
                                                left: `${(idx / (HOURS.length - 1)) * 100}%`,
                                                height: '100%',
                                                width: '1px',
                                                bgcolor: alpha('#919EAB', 0.08)
                                            }}
                                        />
                                    ))}

                                    {/* Current Time Indicator */}
                                    {currentTimePos !== null && (
                                        <Box sx={{
                                            position: 'absolute', left: `${currentTimePos}%`,
                                            top: -4, bottom: -4, width: '2px',
                                            bgcolor: '#FF5630', zIndex: 20,
                                            '&::before': {
                                                content: '""', position: 'absolute', top: -2, left: -3,
                                                width: 8, height: 8, bgcolor: '#FF5630', borderRadius: '50%'
                                            }
                                        }} />
                                    )}

                                    {/* Work Schedules (Shifts) */}
                                    {staff.schedules.map((s: any) => {
                                        if (!s.shiftId) return null;
                                        const [startH, startM] = s.shiftId.startTime.split(':').map(Number);
                                        const [endH, endM] = s.shiftId.endTime.split(':').map(Number);

                                        const left = Math.max(0, ((startH + startM / 60 - 8) / (HOURS.length - 1)) * 100);
                                        const right = Math.min(100, ((endH + endM / 60 - 8) / (HOURS.length - 1)) * 100);
                                        const width = right - left;

                                        if (width <= 0) return null;

                                        return (
                                            <Tooltip key={s._id} title={`Ca làm việc: ${s.shiftId.name} (${s.shiftId.startTime} - ${s.shiftId.endTime})`}>
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0, bottom: 0,
                                                        left: `${left}%`, width: `${width}%`,
                                                        bgcolor: alpha('#00A76F', 0.08),
                                                        border: '1px solid',
                                                        borderColor: alpha('#00A76F', 0.2),
                                                        borderRadius: '8px',
                                                        zIndex: 1
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}

                                    {/* Existing Bookings */}
                                    {staff.bookings.map((b: any) => {
                                        const start = dayjs(b.actualStart || b.start);
                                        const end = dayjs(b.completedAt || b.expectedFinish || b.end);
                                        const startH = start.hour() + start.minute() / 60;
                                        const endH = end.hour() + end.minute() / 60;

                                        const left = Math.max(0, ((startH - 8) / (HOURS.length - 1)) * 100);
                                        const right = Math.min(100, ((endH - 8) / (HOURS.length - 1)) * 100);
                                        const width = right - left;

                                        if (width <= 0) return null;

                                        return (
                                            <Tooltip key={b._id} arrow title={
                                                <Box sx={{ p: 0.5 }}>
                                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>{b.serviceId?.name || 'Dịch vụ'}</Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>{start.format('HH:mm')} - {end.format('HH:mm')}</Typography>
                                                </Box>
                                            }>
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 6, bottom: 6,
                                                        left: `${left}%`, width: `${width}%`,
                                                        background: 'linear-gradient(135deg, #00A76F 0%, #008559 100%)',
                                                        borderRadius: '6px',
                                                        boxShadow: '0 4px 8px rgba(0, 167, 111, 0.24)',
                                                        zIndex: 5,
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.1s',
                                                        '&:hover': { transform: 'scaleY(1.1)', zIndex: 12 }
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}

                                    {/* New Booking Preview (Selection) */}
                                    {selectionStart && selectionEnd && (
                                        (() => {
                                            const startH = selectionStart.hour() + selectionStart.minute() / 60;
                                            const endH = selectionEnd.hour() + selectionEnd.minute() / 60;

                                            const left = Math.max(0, ((startH - 8) / (HOURS.length - 1)) * 100);
                                            const right = Math.min(100, ((endH - 8) / (HOURS.length - 1)) * 100);
                                            const width = right - left;

                                            if (width <= 0) return null;

                                            const isSelectedStaff = selectedStaffIds.includes(staff.info._id);

                                            return (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: isSelectedStaff ? -2 : 4,
                                                        bottom: isSelectedStaff ? -2 : 4,
                                                        left: `${left}%`, width: `${width}%`,
                                                        border: isSelectedStaff ? '2px solid #FFAB00' : '2px dashed #919EAB',
                                                        bgcolor: isSelectedStaff ? alpha('#FFAB00', 0.15) : 'transparent',
                                                        borderRadius: '8px',
                                                        zIndex: 15,
                                                        pointerEvents: 'none',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        animation: isSelectedStaff ? 'pulse 2s infinite' : 'none',
                                                        '@keyframes pulse': {
                                                            '0%': { boxShadow: '0 0 0 0 rgba(255, 171, 0, 0.4)' },
                                                            '70%': { boxShadow: '0 0 0 8px rgba(255, 171, 0, 0)' },
                                                            '100%': { boxShadow: '0 0 0 0 rgba(255, 171, 0, 0)' },
                                                        },
                                                        '&::after': isSelectedStaff ? {
                                                            content: '"Đang chọn"',
                                                            position: 'absolute',
                                                            top: -20, left: '50%', transform: 'translateX(-50%)',
                                                            fontSize: '0.625rem', fontWeight: 800, color: '#FFAB00',
                                                            whiteSpace: 'nowrap', textTransform: 'uppercase'
                                                        } : {}
                                                    }}
                                                />
                                            );
                                        })()
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>

            {/* Premium Legend */}
            <Box sx={{
                mt: 3,
                pt: 2.5,
                borderTop: '1px solid',
                borderColor: alpha('#919EAB', 0.1),
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 0.75, bgcolor: alpha('#00A76F', 0.08),
                    borderRadius: '8px', border: '1px solid', borderColor: alpha('#00A76F', 0.1)
                }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: alpha('#00A76F', 0.2), border: '1px solid', borderColor: '#00A76F', borderRadius: '3px' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#00A76F' }}>Ca trực dự kiến</Typography>
                </Box>

                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 0.75, bgcolor: alpha('#00A76F', 0.15),
                    borderRadius: '8px', border: '1px solid', borderColor: alpha('#00A76F', 0.1),
                    background: 'linear-gradient(135deg, rgba(0, 167, 111, 0.1) 0%, rgba(0, 133, 89, 0.1) 100%)'
                }}>
                    <Box sx={{ width: 10, height: 10, background: 'linear-gradient(135deg, #00A76F 0%, #008559 100%)', borderRadius: '3px' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#008559' }}>Lịch đã chiếm chỗ</Typography>
                </Box>

                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 0.75, bgcolor: alpha('#919EAB', 0.08),
                    borderRadius: '8px', border: '1px dashed', borderColor: alpha('#919EAB', 0.3)
                }}>
                    <Box sx={{ width: 10, height: 10, border: '2px dashed #919EAB', borderRadius: '3px' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#637381' }}>Giờ bạn đang chọn</Typography>
                </Box>

                {isToday && (
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        px: 1.5, py: 0.75, bgcolor: alpha('#FF5630', 0.08),
                        borderRadius: '8px', border: '1px solid', borderColor: alpha('#FF5630', 0.1)
                    }}>
                        <Box sx={{ width: 10, height: 2, bgcolor: '#FF5630', borderRadius: '1px' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF5630' }}>Hiện tại</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
