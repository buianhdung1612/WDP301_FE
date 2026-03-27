import { Box, Typography, CircularProgress, Chip, TablePagination } from "@mui/material";
import { useBookings } from "../../booking/hooks/useBookingManagement";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { prefixAdmin } from "../../../constants/routes";
import { useMemo, useState } from "react";

interface UserBookingHistoryProps {
    userId: string;
}

export const UserBookingHistory = ({ userId }: UserBookingHistoryProps) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const { data: res, isLoading } = useBookings({
        userId,
        page: page + 1,
        limit: rowsPerPage,
    });

    const bookings = useMemo(() => {
        if (!res) return [];
        const data = res as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [res]);

    const pagination = res?.data?.pagination || { totalRecords: 0 };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const statusMap: any = {
        pending: { label: "Chờ xác nhận", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" },
        confirmed: { label: "Đã xác nhận", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" },
        delayed: { label: "Trễ hẹn", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" },
        "in-progress": { label: "Đang thực hiện", color: "var(--palette-primary-dark)", bg: "var(--palette-primary-lighter)" },
        completed: { label: "Hoàn thành", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)" },
        cancelled: { label: "Đã hủy", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" }
    };

    if (isLoading) {
        return (
            <Box sx={{ p: 5, textAlign: 'center' }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (bookings.length === 0) {
        return (
            <Box sx={{ p: 5, textAlign: 'center', color: 'var(--palette-text-disabled)' }}>
                Chưa có dữ liệu đặt chỗ dịch vụ.
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 800 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '220px 1fr 150px 150px 150px', p: 2, bgcolor: 'var(--palette-background-neutral)', fontWeight: 600 }}>
                        <Box>Mã đơn</Box>
                        <Box>Dịch vụ / Thú cưng</Box>
                        <Box>Thời gian</Box>
                        <Box textAlign="right">Tổng tiền</Box>
                        <Box textAlign="center">Trạng thái</Box>
                    </Box>
                    {bookings.map((booking: any) => (
                        <Box
                            key={booking._id}
                            onClick={() => navigate(`/${prefixAdmin}/booking/detail/${booking._id}`)}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '220px 1fr 150px 150px 150px',
                                p: 2,
                                borderBottom: '1px dashed var(--palette-background-neutral)',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'var(--palette-action-hover)' },
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--palette-primary-main)' }}>
                                #{booking.code || booking._id.slice(-6).toUpperCase()}
                            </Typography>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{booking.serviceId?.name || "Dịch vụ"}</Typography>
                                <Typography variant="caption" sx={{ color: 'var(--palette-text-disabled)' }}>
                                    Thú cưng: {booking.petIds?.map((p: any) => p.name).join(', ') || "N/A"}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2">{dayjs(booking.start).format("DD/MM/YYYY")}</Typography>
                                <Typography variant="caption" sx={{ color: 'var(--palette-text-disabled)' }}>
                                    {dayjs(booking.start).format("HH:mm")} - {dayjs(booking.end).format("HH:mm")}
                                </Typography>
                            </Box>
                            <Typography variant="subtitle2" textAlign="right">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.total || 0)}
                            </Typography>
                            <Box textAlign="center">
                                {(() => {
                                    const status = statusMap[booking.bookingStatus] || { label: booking.bookingStatus, color: 'var(--palette-text-disabled)', bg: "var(--palette-background-neutral)" };
                                    return (
                                        <Chip
                                            label={status.label}
                                            size="small"
                                            sx={{
                                                borderRadius: "var(--shape-borderRadius-sm)",
                                                fontWeight: 700,
                                                fontSize: '0.6875rem',
                                                color: status.color,
                                                bgcolor: status.bg,
                                                height: '24px',
                                            }}
                                        />
                                    );
                                })()}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={pagination.totalRecords || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số lượng hiển thị:"
                sx={{
                    '& .MuiTablePagination-selectLabel': { mb: 0 },
                    '& .MuiTablePagination-input': { mt: 0, mb: 0 },
                    '& .MuiTablePagination-actions': { mt: 0, mb: 0 },
                    '& .MuiTablePagination-toolbar': { minHeight: 48, p: 0, pr: 1 }
                }}
            />
        </Box>
    );
};
