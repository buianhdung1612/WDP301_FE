import { Box, Card, Grid, Typography, Stack, Avatar, alpha, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, Menu, MenuItem, Tooltip, Skeleton } from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "../../api/account-admin.api";
import { getBookings } from "../../api/booking.api";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { COLORS } from "../role/configs/constants";
import { useDepartments } from "./hooks/useDepartments";
import { Tabs, Tab, styled } from "@mui/material";

dayjs.locale('vi');

const TabBadge = styled('span')(() => ({
    height: "22px",
    minWidth: "22px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: '8px',
    padding: '0px 6px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: 700,
    transition: 'all 0.2s',
}));

export const StaffWorkHistoryPage = () => {
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [selectedDepartmentId, setSelectedDepartmentId] = useState('all');

    // Fetch all accounts
    const { data: accountsData } = useQuery({
        queryKey: ["staff-accounts"],
        queryFn: () => getAccounts({ limit: 100 }),
    });

    const { data: departments = [] } = useDepartments();

    const allStaff = accountsData?.data || [];

    // Filter staff by department
    const filteredStaffList = useMemo(() => {
        if (selectedDepartmentId === 'all') return allStaff;
        return allStaff.filter((staff: any) =>
            staff.roles?.some((role: any) => role.departmentId === selectedDepartmentId || role.departmentId?._id === selectedDepartmentId)
        );
    }, [allStaff, selectedDepartmentId]);

    // Auto-select first staff from filtered list
    useEffect(() => {
        if (filteredStaffList.length > 0) {
            // Check if current selected staff is still in the filtered list
            const stillInList = filteredStaffList.find((s: any) => s._id === selectedStaff?._id);
            if (!stillInList) {
                setSelectedStaff(filteredStaffList[0]);
            }
        } else {
            if (selectedStaff !== null) {
                setSelectedStaff(null);
            }
        }
    }, [filteredStaffList, selectedStaff?._id]);

    // Fetch bookings for selected staff in selected month
    const { data: bookingsData, isLoading: isBookingsLoading } = useQuery({
        queryKey: ["staff-bookings", selectedStaff?._id, currentMonth.format("YYYY-MM")],
        queryFn: () => getBookings({
            staffId: selectedStaff._id,
            noLimit: true,
            startTime: currentMonth.startOf('month').toISOString(),
            endTime: currentMonth.endOf('month').toISOString()
        }),
        enabled: !!selectedStaff?._id,
    });

    const bookings = bookingsData?.data || [];

    const stats = useMemo(() => {
        const completed = bookings.filter((b: any) => b.bookingStatus === 'completed');
        return {
            total: bookings.length,
            completed: completed.length,
            revenue: completed.reduce((sum: number, b: any) => sum + (b.total || 0), 0)
        };
    }, [bookings]);

    const handleMonthChange = (direction: 'next' | 'prev') => {
        setCurrentMonth(prev => direction === 'next' ? prev.add(1, 'month') : prev.subtract(1, 'month'));
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "completed": return { color: "#22C55E", bg: alpha("#22C55E", 0.16), text: "Hoàn thành" };
            case "in-progress": return { color: "#00A76F", bg: alpha("#00A76F", 0.16), text: "Đang làm" };
            case "confirmed": return { color: "#00B8D9", bg: alpha("#00B8D9", 0.16), text: "Đã xác nhận" };
            case "delayed": return { color: "#FF5630", bg: alpha("#FF5630", 0.16), text: "Trễ hẹn" };
            case "cancelled": return { color: "#919EAB", bg: alpha("#919EAB", 0.16), text: "Đã hủy" };
            default: return { color: "#919EAB", bg: alpha("#919EAB", 0.16), text: status };
        }
    };

    return (
        <Box sx={{ p: '1.5rem', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <Box sx={{ mb: 4 }}>
                <Title title="Lịch sử dịch vụ nhân sự" />
                <Breadcrumb
                    items={[
                        { label: "Dashboard", to: `/${prefixAdmin}` },
                        { label: "Nhân sự", to: `/${prefixAdmin}/hr` },
                        { label: "Lịch sử dịch vụ" }
                    ]}
                />
            </Box>

            {/* Top Bar: Month Selector */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                gap: 2
            }}>
                <Card sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.5,
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    bgcolor: 'rgba(255, 255, 255, 0.8)'
                }}>
                    <IconButton onClick={() => handleMonthChange('prev')} size="small" sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: alpha(COLORS.primary, 0.1), transform: 'scale(1.1)' } }}>
                        <Icon icon="solar:alt-arrow-left-bold-duotone" width={24} color={COLORS.primary} />
                    </IconButton>
                    <Typography sx={{ mx: 4, fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize', minWidth: 180, textAlign: 'center', color: COLORS.primary }}>
                        {`Tháng ${currentMonth.format("MM/YYYY")}`}
                    </Typography>
                    <IconButton onClick={() => handleMonthChange('next')} size="small" sx={{ transition: 'all 0.2s', '&:hover': { bgcolor: alpha(COLORS.primary, 0.1), transform: 'scale(1.1)' } }}>
                        <Icon icon="solar:alt-arrow-right-bold-duotone" width={24} color={COLORS.primary} />
                    </IconButton>
                </Card>
            </Box>

            {/* Department Tabs */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Card sx={{
                    p: 0.5,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(145, 158, 171, 0.12)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                    <Tabs
                        value={selectedDepartmentId}
                        onChange={(_e, val) => setSelectedDepartmentId(val)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            minHeight: '44px',
                            '& .MuiTabs-indicator': {
                                height: '100%',
                                borderRadius: '12px',
                                bgcolor: alpha(COLORS.primary, 0.08),
                                zIndex: 0
                            },
                        }}
                    >
                        <Tab
                            value="all"
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Tất cả</Typography>
                                    <TabBadge sx={{
                                        bgcolor: selectedDepartmentId === 'all' ? COLORS.primary : alpha('#919EAB', 0.12),
                                        color: selectedDepartmentId === 'all' ? '#fff' : '#637381'
                                    }}>
                                        {allStaff.length}
                                    </TabBadge>
                                </Box>
                            }
                            sx={{ minHeight: '44px', textTransform: 'none', px: 3 }}
                        />
                        {departments.map((dept: any) => {
                            const count = allStaff.filter((s: any) =>
                                s.roles?.some((r: any) => r.departmentId === dept._id || r.departmentId?._id === dept._id)
                            ).length;

                            return (
                                <Tab
                                    key={dept._id}
                                    value={dept._id}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{dept.name}</Typography>
                                            <TabBadge sx={{
                                                bgcolor: selectedDepartmentId === dept._id ? COLORS.primary : alpha('#919EAB', 0.12),
                                                color: selectedDepartmentId === dept._id ? '#fff' : '#637381'
                                            }}>
                                                {count}
                                            </TabBadge>
                                        </Box>
                                    }
                                    sx={{ minHeight: '44px', textTransform: 'none', px: 3 }}
                                />
                            );
                        })}
                    </Tabs>
                </Card>
            </Box>

            <Grid container spacing={3}>
                {/* Left: Staff Selector & Info */}
                <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
                    <Stack spacing={3}>
                        {/* Selector Dropdown */}
                        <Card sx={{
                            p: 2.5,
                            borderRadius: '24px',
                            border: '1px solid',
                            borderColor: alpha('#E0E3E7', 0.8),
                            boxShadow: '0 8px 32px rgba(145, 158, 171, 0.05)',
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(8px)'
                        }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, fontWeight: 700, letterSpacing: 1.2, display: 'block' }}>NHÂN VIÊN</Typography>
                            <Button
                                fullWidth
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{
                                    justifyContent: 'space-between',
                                    bgcolor: alpha(COLORS.primary, 0.05),
                                    color: COLORS.primary,
                                    borderRadius: '16px',
                                    py: 1.8,
                                    px: 2,
                                    border: '1px solid',
                                    borderColor: alpha(COLORS.primary, 0.15),
                                    '&:hover': { bgcolor: alpha(COLORS.primary, 0.1), borderColor: alpha(COLORS.primary, 0.3) }
                                }}
                                endIcon={<Icon icon="solar:alt-arrow-down-bold-duotone" width={20} />}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar
                                        src={selectedStaff?.avatar}
                                        sx={{
                                            width: 32, height: 32,
                                            boxShadow: `0 0 0 2px #fff, 0 0 0 4px ${alpha(COLORS.primary, 0.2)}`
                                        }}
                                    />
                                    <Typography variant="subtitle2" fontWeight={700}>{selectedStaff?.fullName || "Chọn nhân viên"}</Typography>
                                </Stack>
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                                transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                                PaperProps={{
                                    sx: {
                                        mt: 1.5,
                                        borderRadius: '20px',
                                        minWidth: 320,
                                        maxHeight: 480,
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        border: '1px solid rgba(145,158,171,0.1)',
                                        p: 1
                                    }
                                }}
                            >
                                {filteredStaffList.map((staff: any) => (
                                    <MenuItem
                                        key={staff._id}
                                        selected={selectedStaff?._id === staff._id}
                                        onClick={() => {
                                            setSelectedStaff(staff);
                                            setAnchorEl(null);
                                        }}
                                        sx={{
                                            borderRadius: '12px',
                                            my: 0.5,
                                            py: 1.5,
                                            px: 2,
                                            gap: 2,
                                            '&.Mui-selected': { bgcolor: alpha(COLORS.primary, 0.1), '&:hover': { bgcolor: alpha(COLORS.primary, 0.15) } }
                                        }}
                                    >
                                        <Avatar src={staff.avatar} sx={{ width: 40, height: 40 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{staff.fullName}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{staff.email}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Card>

                        {/* Staff Personal Summary Card */}
                        {selectedStaff && (
                            <Card sx={{
                                p: 4,
                                borderRadius: '24px',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: alpha('#E0E3E7', 0.8),
                                boxShadow: '0 8px 32px rgba(145, 158, 171, 0.05)',
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, height: '6px',
                                    bgcolor: COLORS.primary,
                                    boxShadow: `0 2px 10px ${alpha(COLORS.primary, 0.3)}`
                                }
                            }}>
                                <Stack alignItems="center" spacing={2.5} sx={{ mb: 4 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Avatar
                                            src={selectedStaff.avatar}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                border: '4px solid #fff',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                            }}
                                        />
                                        <Box sx={{
                                            position: 'absolute', bottom: 6, right: 6,
                                            width: 20, height: 20, bgcolor: '#00A76F',
                                            borderRadius: '50%', border: '3px solid #fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }} />
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#212B36' }}>{selectedStaff.fullName}</Typography>
                                        <Chip
                                            label={selectedStaff.roles?.map((r: any) => r.name).join(', ') || 'Nhân viên'}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: alpha(COLORS.primary, 0.1),
                                                color: COLORS.primary,
                                                borderRadius: '8px',
                                                px: 1
                                            }}
                                        />
                                    </Box>
                                </Stack>

                                <Stack spacing={2.5}>
                                    <Box sx={{ p: 2.5, bgcolor: '#F4F6F8', borderRadius: '20px', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{ p: 1, bgcolor: alpha(COLORS.primary, 0.1), borderRadius: '10px' }}>
                                                    <Icon icon="solar:checklist-minimalistic-bold-duotone" width={22} color={COLORS.primary} />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#637381' }}>Dịch vụ</Typography>
                                            </Stack>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#212B36' }}>{stats.completed}/{stats.total}</Typography>
                                        </Stack>
                                    </Box>

                                    <Box sx={{ p: 2.5, bgcolor: '#F4F6F8', borderRadius: '20px', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{ p: 1, bgcolor: alpha('#22C55E', 0.1), borderRadius: '10px' }}>
                                                    <Icon icon="solar:wad-of-money-bold-duotone" width={22} color="#22C55E" />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#637381' }}>Doanh thu</Typography>
                                            </Stack>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#22C55E' }}>
                                                {stats.revenue.toLocaleString()}đ
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    <Box sx={{ p: 2.5, bgcolor: '#F4F6F8', borderRadius: '20px', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{ p: 1, bgcolor: alpha('#FFAB00', 0.1), borderRadius: '10px' }}>
                                                    <Icon icon="solar:chart-2-bold-duotone" width={22} color="#FFAB00" />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#637381' }}>Độ hiệu quả</Typography>
                                            </Stack>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFAB00' }}>
                                                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Card>
                        )}
                    </Stack>
                </Grid>

                {/* Right: Detailed Table */}
                <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
                    <Card sx={{
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: alpha('#E0E3E7', 0.8),
                        boxShadow: '0 8px 32px rgba(145, 158, 171, 0.05)',
                        overflow: 'hidden',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <Box sx={{
                            p: 3,
                            borderBottom: '1px dashed',
                            borderColor: alpha('#919EAB', 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2
                        }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ p: 1, bgcolor: alpha(COLORS.primary, 0.1), borderRadius: '12px' }}>
                                    <Icon icon="solar:history-bold-duotone" width={24} color={COLORS.primary} />
                                </Box>
                                <Typography variant="h6" fontWeight={700} sx={{ color: '#212B36' }}>Lịch sử dịch vụ</Typography>
                            </Stack>

                            <Stack direction="row" spacing={1.5}>
                                <Tooltip title="Xuất báo cáo (Excel)">
                                    <IconButton sx={{ bgcolor: alpha('#22C55E', 0.08), color: '#22C55E', borderRadius: '12px', '&:hover': { bgcolor: alpha('#22C55E', 0.15) } }}>
                                        <Icon icon="solar:file-export-bold-duotone" width={22} />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>

                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            <TableContainer>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ bgcolor: alpha('#F4F6F8', 0.8), color: '#637381', fontWeight: 700 }}>Mã đơn</TableCell>
                                            <TableCell sx={{ bgcolor: alpha('#F4F6F8', 0.8), color: '#637381', fontWeight: 700 }}>Dịch vụ</TableCell>
                                            <TableCell sx={{ bgcolor: alpha('#F4F6F8', 0.8), color: '#637381', fontWeight: 700 }}>Khách hàng</TableCell>
                                            <TableCell sx={{ bgcolor: alpha('#F4F6F8', 0.8), color: '#637381', fontWeight: 700 }}>Ngày thực hiện</TableCell>
                                            <TableCell sx={{ bgcolor: alpha('#F4F6F8', 0.8), color: '#637381', fontWeight: 700 }}>Thời gian</TableCell>
                                            <TableCell sx={{ bgcolor: alpha('#F4F6F8', 0.8), color: '#637381', fontWeight: 700 }}>Doanh thu</TableCell>
                                            <TableCell align="center" sx={{ bgcolor: alpha('#F4F6F8', 0.8), color: '#637381', fontWeight: 700 }}>Trạng thái</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {isBookingsLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell colSpan={7} sx={{ py: 1 }}><Skeleton variant="rounded" height={40} /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : bookings.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                                                    <Stack alignItems="center" spacing={1.5} sx={{ color: 'text.disabled' }}>
                                                        <Icon icon="solar:calendar-slash-bold-duotone" width={64} style={{ opacity: 0.3 }} />
                                                        <Typography variant="subtitle1" fontWeight={700}>Không có dữ liệu trong tháng này</Typography>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            bookings.map((booking: any) => {
                                                const status = getStatusStyles(booking.bookingStatus);
                                                return (
                                                    <TableRow key={booking._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.primary }}>
                                                                #{booking.code?.slice(-6).toUpperCase()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" fontWeight={700}>{booking.serviceId?.name}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Avatar src={booking.userId?.avatar} sx={{ width: 24, height: 24 }} />
                                                                <Typography variant="body2" fontWeight={500}>{booking.userId?.fullName || "Khách vãng lai"}</Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={600}>{dayjs(booking.start).format("DD/MM/YYYY")}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, px: 1, py: 0.5, borderRadius: '4px', bgcolor: alpha('#919EAB', 0.08) }}>
                                                                {dayjs(booking.actualStart || booking.start).format("HH:mm")} - {dayjs(booking.completedAt || booking.end).format("HH:mm")}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" fontWeight={700}>{booking.total?.toLocaleString()}đ</Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={status.text}
                                                                sx={{
                                                                    height: 24,
                                                                    fontSize: '0.6875rem',
                                                                    fontWeight: 700,
                                                                    color: status.color,
                                                                    bgcolor: status.bg,
                                                                    borderRadius: '6px'
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
