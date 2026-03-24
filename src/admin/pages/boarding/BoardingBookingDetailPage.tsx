import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getBoardingBookingDetail, updateBoardingBookingStatus, updateBoardingPaymentStatus } from "../../api/boarding-booking.api";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { confirmAction } from "../../utils/swal";

const STATUS_OPTIONS: { [key: string]: { label: string; color: string; bg: string } } = {
    pending: { label: "Chờ xử lý", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" },
    held: { label: "Giữ chỗ", color: "var(--palette-primary-dark)", bg: "var(--palette-primary-lighter)" },
    confirmed: { label: "Đã xác nhận", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" },
    "checked-in": { label: "Đã nhận", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)" },
    "checked-out": { label: "Đã trả", color: "var(--palette-secondary-dark)", bg: "var(--palette-secondary-lighter)" },
    cancelled: { label: "Đã hủy", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" },
};

const PAYMENT_STATUS_OPTIONS: { [key: string]: { label: string; color: string; bg: string } } = {
    unpaid: { label: "Chưa thanh toán", color: "var(--palette-error-dark)", bg: "var(--palette-error-lighter)" },
    partial: { label: "Đã cọc 20%", color: "var(--palette-warning-dark)", bg: "var(--palette-warning-lighter)" },
    paid: { label: "Đã thanh toán", color: "var(--palette-success-dark)", bg: "var(--palette-success-lighter)" },
    refunded: { label: "Đã hoàn tiền", color: "var(--palette-info-dark)", bg: "var(--palette-info-lighter)" },
};

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

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
        mutationFn: (status: string) => updateBoardingBookingStatus(id || "", status),
        onSuccess: () => {
            toast.success("Cập nhật trạng thái thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-booking-detail", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
        },
    });

    const updatePaymentMut = useMutation({
        mutationFn: (status: string) => updateBoardingPaymentStatus(id || "", status),
        onSuccess: () => {
            toast.success("Cập nhật trạng thái thanh toán thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-booking-detail", id] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái thanh toán");
        },
    });

    const handleStatusChange = (status: string) => {
        const label = STATUS_OPTIONS[status]?.label || status;
        confirmAction(
            `Xác nhận ${label}?`,
            `Bạn có chắc chắn muốn chuyển đơn sang trạng thái "${label}" không?`,
            () => updateStatusMut.mutate(status),
            "info"
        );
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 20 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!booking) {
        return (
            <Box sx={{ p: 5, textAlign: "center" }}>
                <Typography>Không tìm thấy thông tin đơn lưu trú</Typography>
            </Box>
        );
    }

    const currentStatus = STATUS_OPTIONS[booking.boardingStatus] || { label: booking.boardingStatus, color: "var(--palette-text-disabled)", bg: "var(--palette-background-neutral)" };
    const currentPayment = PAYMENT_STATUS_OPTIONS[booking.paymentStatus] || { label: booking.paymentStatus, color: "var(--palette-text-disabled)", bg: "var(--palette-background-neutral)" };

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, mt: 0.5 }}>
                        <Icon icon="eva:arrow-ios-back-fill" width={20} />
                    </IconButton>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Title title={`Chi tiết đơn #${booking.code?.slice(-6).toUpperCase() || "N/A"}`} />
                            <Chip
                                label={currentStatus.label}
                                size="small"
                                sx={{ bgcolor: currentStatus.bg, color: currentStatus.color, fontWeight: 700, borderRadius: 1 }}
                            />
                        </Stack>
                        <Breadcrumb
                            items={[
                                { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                                { label: "Khách sạn", to: `/${prefixAdmin}/boarding/booking-list` },
                                { label: "Chi tiết đơn" },
                            ]}
                        />
                    </Box>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Select
                        size="small"
                        value={booking.boardingStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        sx={{
                            minWidth: 140,
                            height: 36,
                            borderRadius: '8px',
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--palette-text-primary)' },
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}
                    >
                        {Object.entries(STATUS_OPTIONS).map(([val, opt]) => (
                            <MenuItem key={val} value={val} sx={{ fontSize: '0.875rem' }}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                    <Button
                        variant="contained"
                        startIcon={<Icon icon="solar:pen-bold" />}
                        onClick={() => navigate(`/${prefixAdmin}/boarding/edit/${id}`)}
                        sx={{
                            height: 36,
                            fontWeight: 700,
                            borderRadius: "8px",
                            bgcolor: "var(--palette-grey-800)",
                            color: "white",
                            textTransform: "none",
                        }}
                    >
                        Sửa đơn
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        {/* Summary & Cage Info */}
                        <Card sx={{ borderRadius: "16px", boxShadow: "var(--customShadows-card)", overflow: "hidden" }}>
                            <Box sx={{ p: 3, bgcolor: "var(--palette-background-neutral)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h6" fontWeight={700}>Thông tin lưu trú</Typography>
                                <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                                    <Box sx={{ textAlign: "right" }}>
                                        <Typography variant="caption" color="text.secondary">Ngày nhận</Typography>
                                        <Typography variant="subtitle2" fontWeight={700}>{dayjs(booking.checkInDate).format("DD/MM/YYYY")}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "right" }}>
                                        <Typography variant="caption" color="text.secondary">Ngày trả</Typography>
                                        <Typography variant="subtitle2" fontWeight={700}>{dayjs(booking.checkOutDate).format("DD/MM/YYYY")}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "right" }}>
                                        <Typography variant="caption" color="text.secondary">Số đêm</Typography>
                                        <Typography variant="subtitle2" fontWeight={700} color="primary.main">{booking.numberOfDays || 0}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Box sx={{ textAlign: "center", minWidth: 100 }}>
                                        <Icon icon="solar:home-2-bold" width={48} color="var(--palette-primary-main)" />
                                        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700 }}>{booking.cageId?.cageCode || "N/A"}</Typography>
                                        <Typography variant="caption" color="text.secondary">Mã chuồng</Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700}>Thông tin chuồng</Typography>
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="text.secondary">Loại chuồng</Typography>
                                                <Typography variant="body2" fontWeight={600}>{String(booking.cageId?.type || "Standard").toUpperCase()}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Typography variant="caption" color="text.secondary">Kích thước</Typography>
                                                <Typography variant="body2" fontWeight={600}>{String(booking.cageId?.size || "M").toUpperCase()}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>

                        {/* Pet List */}
                        <Card sx={{ borderRadius: "16px", boxShadow: "var(--customShadows-card)" }}>
                            <Box sx={{ p: 3, borderBottom: "1px dashed var(--palette-divider)" }}>
                                <Typography variant="h6" fontWeight={700}>Danh sách thú cưng</Typography>
                            </Box>
                            <Box>
                                {(booking.petIds || []).map((pet: any, index: number) => (
                                    <Stack
                                        key={pet._id || index}
                                        direction="row"
                                        spacing={3}
                                        alignItems="center"
                                        sx={{ p: 3, "&:not(:last-child)": { borderBottom: "1px solid var(--palette-background-neutral)" } }}
                                    >
                                        <Avatar
                                            src={pet.avatar}
                                            variant="rounded"
                                            sx={{ width: 64, height: 64, borderRadius: "12px", bgcolor: "var(--palette-background-neutral)" }}
                                        >
                                            <Icon icon="solar:dog-bold" width={32} />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={700}>{pet.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {pet.breed || pet.type || "Thú cưng"} • {pet.weight || 0}kg • {pet.age || "N/A"} tuổi
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: "right" }}>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {formatCurrency(booking.pricePerDay || booking.total / (booking.numberOfDays || 1))}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Giá/đêm</Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Box>
                        </Card>

                        {/* Care History / Notes */}
                        <Card sx={{ p: 3, borderRadius: "16px", boxShadow: "var(--customShadows-card)" }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Ghi chú & Chăm sóc đặc biệt</Typography>
                            <Box sx={{ p: 2, borderRadius: "8px", bgcolor: "rgba(255, 171, 0, 0.08)", border: "1px dashed #ffab00" }}>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {booking.specialCare || booking.notes || "Không có ghi chú đặc biệt."}
                                </Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="outlined"
                                color="info"
                                startIcon={<Icon icon="solar:calendar-mark-bold" />}
                                onClick={() => navigate(`/${prefixAdmin}/boarding/care-schedule`)}
                                sx={{ mt: 3, height: 48, borderRadius: "12px", borderStyle: "dashed" }}
                            >
                                Xem lịch trình chăm sóc chi tiết
                            </Button>
                        </Card>
                    </Stack>
                </Grid>

                {/* Right Column */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        {/* Customer Info */}
                        <Card sx={{ p: 3, borderRadius: "16px", boxShadow: "var(--customShadows-card)" }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Thông tin khách hàng</Typography>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                <Avatar src={booking.userId?.avatar} sx={{ width: 48, height: 48 }}>
                                    {booking.fullName?.charAt(0) || "U"}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700}>{booking.fullName || booking.userId?.fullName || "Khách lẻ"}</Typography>
                                    <Typography variant="caption" color="text.secondary">Mã KH: {booking.userId?._id?.slice(-8).toUpperCase() || "N/A"}</Typography>
                                </Box>
                            </Stack>
                            <Divider sx={{ mb: 3, borderStyle: "dashed" }} />
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Icon icon="solar:phone-bold" color="var(--palette-text-disabled)" />
                                    <Typography variant="body2" fontWeight={600}>{booking.phone || "N/A"}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Icon icon="solar:letter-bold" color="var(--palette-text-disabled)" />
                                    <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>{booking.email || "N/A"}</Typography>
                                </Stack>
                            </Stack>
                        </Card>

                        {/* Payment Info */}
                        <Card sx={{ p: 3, borderRadius: "16px", boxShadow: "var(--customShadows-card)" }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Thanh toán</Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                                    <Chip
                                        label={currentPayment.label}
                                        size="small"
                                        sx={{ bgcolor: currentPayment.bg, color: currentPayment.color, fontWeight: 700, borderRadius: 1 }}
                                    />
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Phương thức</Typography>
                                    <Typography variant="body2" fontWeight={600}>{String(booking.paymentMethod || "Tiền mặt").toUpperCase()}</Typography>
                                </Stack>
                                <Divider sx={{ borderStyle: "dashed" }} />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
                                    <Typography variant="subtitle2" fontWeight={600}>{formatCurrency(booking.subTotal || 0)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Giảm giá</Typography>
                                    <Typography variant="subtitle2" fontWeight={600} color="error.main">-{formatCurrency(booking.discount || 0)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" sx={{ pt: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={800}>TỔNG CỘNG</Typography>
                                    <Typography variant="h6" fontWeight={800} color="primary.main">{formatCurrency(booking.total || 0)}</Typography>
                                </Stack>

                                {booking.paymentStatus !== 'paid' && (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        onClick={() => handlePaymentStatusChange('paid')}
                                        sx={{ mt: 2, height: 44, borderRadius: '10px', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.24)' }}
                                    >
                                        Xác nhận đã thanh toán
                                    </Button>
                                )}
                            </Stack>
                        </Card>

                        {/* Admin Action Box */}
                        <Box sx={{ p: 2, borderRadius: "16px", bgcolor: "var(--palette-background-neutral)", border: "1px solid var(--palette-divider)" }}>
                            <Typography variant="caption" sx={{ color: "var(--palette-text-disabled)", display: "block", mb: 1, fontWeight: 700 }}>QUẢN TRỊ VIÊN</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Đơn được tạo vào {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}.
                                Lần cuối cập nhật {dayjs(booking.updatedAt).format("HH:mm")}.
                            </Typography>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );

    function handlePaymentStatusChange(status: string) {
        confirmAction(
            "Xác nhận thanh toán?",
            "Xác nhận khách hàng đã hoàn thành thanh toán cho đơn này.",
            () => updatePaymentMut.mutate(status),
            "success"
        );
    }
};
