import { Box, Card, Grid, Typography, Stack, Avatar, List, ListItemButton, ListItemAvatar, ListItemText, alpha, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton } from "@mui/material";
import { useState, useEffect } from "react";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "../../api/account-admin.api";
import { getBookings } from "../../api/booking.api";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { COLORS } from "../role/configs/constants";

export const StaffWorkHistoryPage = () => {
    const [selectedStaff, setSelectedStaff] = useState<any>(null);

    // Fetch all accounts
    const { data: accountsData, isLoading: isAccountsLoading } = useQuery({
        queryKey: ["staff-accounts"],
        queryFn: () => getAccounts({ limit: 100 }),
    });

    const staffList = accountsData?.data || [];

    // Fetch bookings for selected staff
    const { data: bookingsData, isLoading: isBookingsLoading } = useQuery({
        queryKey: ["staff-bookings", selectedStaff?._id],
        queryFn: () => getBookings({ staffId: selectedStaff._id, noLimit: true }),
        enabled: !!selectedStaff?._id,
    });

    const bookings = bookingsData?.data || [];

    useEffect(() => {
        if (staffList.length > 0 && !selectedStaff) {
            setSelectedStaff(staffList[0]);
        }
    }, [staffList, selectedStaff]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "success";
            case "in-progress": return "info";
            case "confirmed": return "primary";
            case "delayed": return "warning";
            case "cancelled": return "error";
            default: return "default";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed": return "Hoàn thành";
            case "in-progress": return "Đang làm";
            case "confirmed": return "Đã xác nhận";
            case "delayed": return "Trễ hẹn";
            case "cancelled": return "Đã hủy";
            default: return status;
        }
    };

    return (
        <Box sx={{ p: '1.5rem' }}>
            <Box sx={{ mb: 5 }}>
                <Title title="Lịch sử công việc" />
                <Breadcrumb
                    items={[
                        { label: "Dashboard", to: `/${prefixAdmin}` },
                        { label: "Nhân sự", to: `/${prefixAdmin}/hr` },
                        { label: "Lịch sử công việc" }
                    ]}
                />
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                    <Card sx={{
                        height: '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '16px',
                        boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                    }}>
                        <Box sx={{ p: 2, borderBottom: `1px dashed ${alpha('#919EAB', 0.2)}` }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Nhân viên</Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                            <List>
                                {isAccountsLoading ? (
                                    <Typography sx={{ p: 2, textAlign: 'center' }}>Đang tải...</Typography>
                                ) : (
                                    staffList.map((staff: any) => (
                                        <ListItemButton
                                            key={staff._id}
                                            selected={selectedStaff?._id === staff._id}
                                            onClick={() => setSelectedStaff(staff)}
                                            sx={{
                                                borderRadius: '8px',
                                                mb: 0.5,
                                                '&.Mui-selected': {
                                                    bgcolor: alpha(COLORS.primary, 0.08),
                                                    color: COLORS.primary,
                                                    '&:hover': { bgcolor: alpha(COLORS.primary, 0.12) }
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={staff.avatar}>{staff.fullName?.charAt(0)}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={staff.fullName}
                                                secondary={staff.email}
                                                primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                                                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                                            />
                                        </ListItemButton>
                                    ))
                                )}
                            </List>
                        </Box>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8, lg: 9 }}>
                    <Card sx={{
                        height: '70vh',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '16px',
                        boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                    }}>
                        {selectedStaff ? (
                            <>
                                <Box sx={{ p: 3, borderBottom: `1px dashed ${alpha('#919EAB', 0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar src={selectedStaff.avatar} sx={{ width: 48, height: 48 }} />
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedStaff.fullName}</Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {bookings.filter((b: any) => b.bookingStatus === 'completed').length} / {bookings.length} dịch vụ hoàn thành
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Doanh thu thực tế (Đã xong)</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.primary }}>
                                            {bookings
                                                .filter((b: any) => b.bookingStatus === 'completed')
                                                .reduce((sum: number, b: any) => sum + (b.total || 0), 0)
                                                .toLocaleString()}đ
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                    <TableContainer>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Mã đơn</TableCell>
                                                    <TableCell>Thời gian</TableCell>
                                                    <TableCell>Dịch vụ</TableCell>
                                                    <TableCell>Khách hàng</TableCell>
                                                    <TableCell>Doanh thu</TableCell>
                                                    <TableCell>Trạng thái</TableCell>
                                                    <TableCell align="right">Hành động</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {isBookingsLoading ? (
                                                    <TableRow><TableCell colSpan={7} align="center">Đang tải...</TableCell></TableRow>
                                                ) : bookings.length === 0 ? (
                                                    <TableRow><TableCell colSpan={7} align="center">Trống</TableCell></TableRow>
                                                ) : (
                                                    bookings.map((booking: any) => (
                                                        <TableRow key={booking._id} hover>
                                                            <TableCell sx={{ fontWeight: 600 }}>#{booking.code}</TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">{dayjs(booking.start).format("DD/MM/YYYY")}</Typography>
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    {dayjs(booking.start).format("HH:mm")}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>{booking.serviceId?.name}</TableCell>
                                                            <TableCell>{booking.userId?.fullName || "Khách vãng lai"}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>{booking.total?.toLocaleString()}đ</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={getStatusText(booking.bookingStatus)}
                                                                    color={getStatusColor(booking.bookingStatus) as any}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <IconButton size="small">
                                                                    <Icon icon="solar:eye-bold" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography color="text.disabled">Chọn nhân viên để xem</Typography>
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
