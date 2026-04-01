
import {
    Box,
    Card,
    Stack,
    Grid,
    Avatar,
    Typography,
    Button,
    Chip,
    IconButton,
    MenuItem,
    Select,
    CircularProgress,
    alpha
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { prefixAdmin } from "../../constants/routes";
import { getBoardingBookingDetail, updateBoardingBookingStatus, updateBoardingPaymentStatus } from "../../api/boarding-booking.api";

const STATUS_OPTIONS: { [key: string]: { label: string; color: string; bg: string } } = {
    pending: { label: "Chờ xử lý", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" },
    held: { label: "Đang giữ chỗ", color: "var(--palette-primary-dark)", bg: "var(--palette-primary-lighter)" },
    confirmed: { label: "Đã xác nhận", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" },
    "checked-in": { label: "Đã nhận chuồng", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)" },
    "checked-out": { label: "Đã trả chuồng", color: "var(--palette-secondary-dark)", bg: "var(--palette-secondary-lighter)" },
    cancelled: { label: "Đã hủy", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" },
};

const PAYMENT_STATUS_OPTIONS: { [key: string]: { label: string; color: string; bg: string } } = {
    unpaid: { label: "Chưa thanh toán", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" },
    partial: { label: "Đặt cọc 20%", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" },
    paid: { label: "Đã thanh toán", color: "var(--palette-success-main)", bg: "rgba(34, 197, 94, 0.16)" },
    refunded: { label: "Đã hoàn tiền", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" },
};

export const BoardingBookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: res, isLoading } = useQuery({
        queryKey: ["admin-boarding-booking-detail", id],
        queryFn: () => getBoardingBookingDetail(id || ""),
        enabled: !!id,
    });
    const booking = res?.data;

    const updateStatusMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateBoardingBookingStatus(id, status),
        onSuccess: () => {
            toast.success("Cập nhật trạng thái thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-booking-detail", id] });
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Lỗi cập nhật trạng thái"),
    });

    const updatePaymentMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateBoardingPaymentStatus(id, status),
        onSuccess: () => {
            toast.success("Cập nhật trạng thái thanh toán thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-booking-detail", id] });
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Lỗi cập nhật thanh toán"),
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!booking) {
        return (
            <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography sx={{ color: 'var(--palette-text-primary)' }}>Không tìm thấy đơn khách sạn</Typography>
            </Box>
        );
    }

    const currentStatus = STATUS_OPTIONS[booking.boardingStatus] || STATUS_OPTIONS.pending;
    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
            {/* Header section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ p: 1, mr: 1 }}>
                        <Icon icon="eva:arrow-ios-back-fill" width={20} />
                    </IconButton>

                    <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--palette-text-primary)' }}>
                                Đơn vắng mặt #{booking.code || booking._id.slice(-6).toUpperCase()}
                            </Typography>
                            <Chip
                                label={currentStatus.label}
                                size="small"
                                sx={{
                                    fontWeight: 700,
                                    height: 22,
                                    fontSize: '0.75rem',
                                    borderRadius: 'var(--shape-borderRadius-sm)',
                                    color: currentStatus.color,
                                    bgcolor: currentStatus.bg,
                                }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'var(--palette-text-disabled)', fontSize: '0.875rem' }}>
                            Ngày đặt: {dayjs(booking.createdAt).format("DD MMM YYYY h:mm a")}
                        </Typography>
                    </Stack>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Select
                        size="small"
                        value={booking.boardingStatus}
                        onChange={(e) => updateStatusMut.mutate({ id: booking._id, status: e.target.value })}
                        disabled={updateStatusMut.isPending}
                        sx={{ minWidth: 160, borderRadius: '8px', fontWeight: 600 }}
                    >
                        {Object.entries(STATUS_OPTIONS).map(([val, opt]) => (
                            <MenuItem key={val} value={val}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                    <Button
                        variant="contained"
                        startIcon={<Icon icon="solar:calendar-mark-bold" />}
                        onClick={() => navigate(`/${prefixAdmin}/boarding/care-schedule`)}
                        sx={{
                            fontWeight: 700,
                            borderRadius: '8px',
                            bgcolor: 'var(--palette-primary-main)',
                            '&:hover': { bgcolor: 'var(--palette-primary-dark)' }
                        }}
                    >
                        Lịch chăm sóc
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        {/* Pets & Cage Card */}
                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Thông tin lưu trú</Typography>
                            <Stack spacing={2}>
                                {booking.items?.length > 0 
                                    ? booking.items.map((item: any, idx: number) => {
                                        const pet = Array.isArray(item.petIds) && item.petIds.length > 0 
                                            ? item.petIds[0] 
                                            : (item.petId || booking.petIds?.[idx]);
                                        
                                        if (!pet) return null;

                                        return (
                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'var(--palette-background-neutral)' }}>
                                                <Avatar src={pet.avatar} variant="rounded" sx={{ width: 64, height: 64 }}>
                                                    <Icon icon="solar:dog-bold" width={32} />
                                                </Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{pet.name}</Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {pet.type === 'dog' ? 'Chó' : (pet.type === 'cat' ? 'Mèo' : pet.type)} • {pet.breed || "Chưa xác định"} • {pet.weight || "?"}kg
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.cageId?.cageCode || booking.cageId?.cageCode || "N/A"}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Tên chuồng/phòng</Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })
                                    : booking.petIds?.map((pet: any, idx: number) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'var(--palette-background-neutral)' }}>
                                            <Avatar src={pet.avatar} variant="rounded" sx={{ width: 64, height: 64 }}>
                                                <Icon icon="solar:dog-bold" width={32} />
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{pet.name}</Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {pet.type === 'dog' ? 'Chó' : 'Mèo'} • {pet.breed || "Chưa xác định"} • {pet.weight || "?"}kg
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{booking.cageId?.cageCode || "N/A"}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Tên chuồng/phòng</Typography>
                                            </Box>
                                        </Box>
                                    ))
                                }
                            </Stack>

                            <Box sx={{ mt: 3, p: 2, border: '1px dashed var(--palette-divider)', borderRadius: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Ngày đến dự kiến</Typography>
                                        <Typography variant="subtitle1" fontWeight={700}>{dayjs(booking.checkInDate).format("DD/MM/YYYY")}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="caption" color="text.secondary">Ngày đi dự kiến</Typography>
                                        <Typography variant="subtitle1" fontWeight={700}>{dayjs(booking.checkOutDate).format("DD/MM/YYYY")}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" color="primary.main" fontWeight={800}>
                                            Tổng thời gian: {booking.numberOfDays} đêm
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Card>

                        {/* Customer Information */}
                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Thông tin khách hàng</Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={booking.userId?.avatar} sx={{ width: 48, height: 48 }} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{booking.fullName || booking.userId?.fullName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{booking.phone || booking.userId?.phone} • {booking.userId?.email}</Typography>
                                </Box>
                            </Stack>
                            {booking.notes && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#ffab00', 0.08), borderRadius: 1 }}>
                                    <Typography variant="caption" color="warning.dark" fontWeight={800}>GHI CHÚ:</Typography>
                                    <Typography variant="body2">{booking.notes}</Typography>
                                </Box>
                            )}
                        </Card>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        {/* Summary & Payment Card */}
                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Thanh toán</Typography>

                            <Stack spacing={2} sx={{ mb: 3 }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Đơn giá/đêm</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>{formatCurrency(booking.pricePerDay)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Số đêm</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>x{booking.numberOfDays}</Typography>
                                </Stack>
                                {booking.surcharge > 0 && (
                                    <Stack spacing={0.5}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" color="warning.main" fontWeight={600}>Phụ phí phát sinh</Typography>
                                            <Typography variant="subtitle2" fontWeight={700} color="warning.main">+{formatCurrency(booking.surcharge)}</Typography>
                                        </Stack>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                            Lý do: {booking.surchargeReason || "Trả chuồng trễ"}
                                        </Typography>
                                    </Stack>
                                )}
                                <Box sx={{ borderTop: '1px solid var(--palette-divider)', pt: 2 }}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="h6" fontWeight={800}>Tổng cộng</Typography>
                                        <Typography variant="h6" fontWeight={800} color="primary.main">{formatCurrency(booking.total)}</Typography>
                                    </Stack>
                                </Box>
                            </Stack>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Trạng thái thanh toán</Typography>
                                <Select
                                    fullWidth
                                    size="small"
                                    value={booking.paymentStatus}
                                    onChange={(e) => updatePaymentMut.mutate({ id: booking._id, status: e.target.value })}
                                    disabled={updatePaymentMut.isPending}
                                    sx={{ borderRadius: '8px', fontWeight: 600 }}
                                >
                                    {Object.entries(PAYMENT_STATUS_OPTIONS).map(([val, opt]) => (
                                        <MenuItem key={val} value={val}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        </Card>

                        {/* History Card */}
                        <Card sx={{ p: 3, borderRadius: 'var(--shape-borderRadius-lg)', boxShadow: 'var(--customShadows-card)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Lịch sử lưu trú</Typography>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: booking.boardingStatus === 'checked-out' ? 'success.main' : 'text.disabled', mt: 1 }} />
                                        <Box sx={{ flexGrow: 1, width: 2, bgcolor: 'background.neutral', my: 1 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Check-out thành công</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {booking.actualCheckOutDate ? dayjs(booking.actualCheckOutDate).format("DD/MM/YYYY HH:mm") : "Chưa trả chuồng"}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ['checked-in', 'checked-out'].includes(booking.boardingStatus) ? 'info.main' : 'text.disabled', mt: 1 }} />
                                        <Box sx={{ flexGrow: 1, width: 2, bgcolor: 'background.neutral', my: 1 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Check-in thành công</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {booking.actualCheckInDate ? dayjs(booking.actualCheckInDate).format("DD/MM/YYYY HH:mm") : "Chưa nhận chuồng"}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mt: 1 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Tạo đơn lưu trú</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
