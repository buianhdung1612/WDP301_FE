import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CircularProgress,
    Stack,
    Typography,
    Chip,
    Avatar,
    Divider,
    FormControl,
    Select,
    MenuItem,
    alpha
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useAssignStaff, useUpdateBookingStatus, useStartBooking, useRecommendedStaff } from "./hooks/useBookingManagement";
import { getBookingDetail, getStaffBookingDetail } from "../../api/booking.api";
import { useBookingConfig } from "./hooks/useBookingConfig";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { COLORS } from "../role/configs/constants";
import { StaffAvailabilityTimeline } from "./sections/StaffAvailabilityTimeline";

export const BookingDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedStaffId, setSelectedStaffId] = useState<string>("");

    const { user } = useAuthStore();
    const permissions = user?.permissions || [];
    const canAssign = permissions.includes("booking_assign");
    const canEdit = permissions.includes("booking_edit");

    const isStaff = user?.roles?.some((role: any) => role.isStaff);
    const hasViewAll = permissions.includes("booking_view_all");

    const { data: bookingRes, isLoading: isLoadingBooking } = useQuery<any>({
        queryKey: ["booking", id, isStaff, hasViewAll],
        queryFn: () => (isStaff && !hasViewAll) ? getStaffBookingDetail(id!) : getBookingDetail(id!),
        enabled: !!id
    });
    const booking = bookingRes?.data;

    const { mutate: assignStaff, isPending: isAssigning } = useAssignStaff();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateBookingStatus();
    const { mutate: startBooking, isPending: isStarting } = useStartBooking();

    // Fetch recommended staff only if canAssign
    const { data: recommendationsRes, isLoading: isLoadingRecommendations } = useRecommendedStaff(id || "", { enabled: canAssign && !!id });
    const staffList = recommendationsRes?.data || [];

    const { data: config } = useBookingConfig();

    const isTooEarlyToStart = useMemo(() => {
        if (!booking?.start || !config) return false;
        const now = dayjs();
        const scheduledStart = dayjs(booking.start);
        const earliestAllowed = scheduledStart.subtract(config.allowEarlyStartMinutes || 30, 'minute');
        return now.isBefore(earliestAllowed);
    }, [booking, config]);

    // Set initial selected staff from booking
    useEffect(() => {
        if (booking?.staffId?._id) {
            setSelectedStaffId(booking.staffId._id);
        }
    }, [booking]);

    const handleAssignStaff = () => {
        if (!selectedStaffId || !id) {
            toast.error("Vui lòng chọn nhân viên");
            return;
        }

        assignStaff(
            { bookingId: id, staffId: selectedStaffId },
            {
                onSuccess: (res) => {
                    if (res.code === 200) {
                        toast.success("Phân công nhân viên thành công");
                    } else {
                        toast.error(res.message || "Có lỗi xảy ra");
                    }
                },
                onError: (error: any) => {
                    const msg = error?.response?.data?.message || "Không thể phân công nhân viên";
                    toast.error(msg);
                }
            }
        );
    };

    const handleStartBooking = () => {
        if (!id) return;
        startBooking(id, {
            onSuccess: () => {
                toast.success("Đã bắt đầu thực hiện dịch vụ");
            },
            onError: (error: any) => {
                const msg = error?.response?.data?.message || "Không thể bắt đầu dịch vụ";
                toast.error(msg);
            }
        });
    };

    const handleStatusUpdate = (status: string) => {
        if (!id) return;
        updateStatus(
            { id, status },
            {
                onSuccess: () => {
                    toast.success(t("admin.validation.update_success"));
                },
                onError: (error: any) => {
                    const msg = error?.response?.data?.message || "Không thể cập nhật trạng thái";
                    toast.error(msg);
                }
            }
        );
    };

    if (isLoadingBooking) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    if (!booking) {
        return (
            <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography>Không tìm thấy thông tin booking</Typography>
            </Box>
        );
    }

    const statusMap: any = {
        pending: { label: t("admin.booking.status.pending"), color: "#FFAB00", bg: "rgba(255, 171, 0, 0.16)" },
        confirmed: { label: t("admin.booking.status.confirmed"), color: "#00B8D9", bg: "rgba(0, 184, 217, 0.16)" },
        delayed: { label: "Trễ hẹn", color: "#FF5630", bg: "rgba(255, 86, 48, 0.16)" },
        "in-progress": { label: t("admin.booking.status.in_progress"), color: "#00A76F", bg: "rgba(0, 167, 111, 0.16)" },
        completed: { label: t("admin.booking.status.completed"), color: "#22C55E", bg: "rgba(34, 197, 94, 0.16)" },
        cancelled: { label: t("admin.booking.status.cancelled"), color: "#FF5630", bg: "rgba(255, 86, 48, 0.16)" }
    };

    const currentStatus = statusMap[booking.bookingStatus] || { label: booking.bookingStatus, color: COLORS.disabled, bg: "rgba(145, 158, 171, 0.16)" };

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "1.5rem" }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                    <Title title="Chi tiết Booking" />
                    <Breadcrumb
                        items={[
                            { label: t("admin.dashboard"), to: `/${prefixAdmin}` },
                            { label: t("admin.booking.title.list"), to: `/${prefixAdmin}/booking/list` },
                            { label: "Chi tiết" }
                        ]}
                    />
                </Box>
                <Stack direction="row" spacing={1.5}>
                    {canEdit && (
                        <Button
                            variant="contained"
                            startIcon={<Icon icon="solar:pen-bold" />}
                            onClick={() => navigate(`/${prefixAdmin}/booking/edit/${id}`)}
                            sx={{
                                bgcolor: COLORS.primary,
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                                borderRadius: "8px",
                                textTransform: "none",
                                "&:hover": { bgcolor: "#454F5B" }
                            }}
                        >
                            Chỉnh sửa
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<Icon icon="eva:arrow-back-fill" />}
                        onClick={() => navigate(`/${prefixAdmin}/booking/list`)}
                        sx={{
                            borderColor: COLORS.border,
                            color: COLORS.primary,
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            borderRadius: "8px",
                            textTransform: "none",
                            "&:hover": {
                                borderColor: COLORS.primary,
                                bgcolor: "rgba(145, 158, 171, 0.08)"
                            }
                        }}
                    >
                        Quay lại
                    </Button>
                </Stack>
            </Box>

            <Stack spacing={3}>
                {/* Booking Info Card */}
                <Card sx={{ borderRadius: "16px", boxShadow: COLORS.shadow, p: 3 }}>
                    <Stack spacing={2.5}>
                        {/* Code & Status */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: COLORS.primary }}>
                                Mã đơn: #{booking.code?.slice(-6).toUpperCase() || "N/A"}
                            </Typography>
                            <Chip
                                label={currentStatus.label}
                                sx={{
                                    borderRadius: "6px",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    color: currentStatus.color,
                                    bgcolor: currentStatus.bg,
                                    height: "28px",
                                    "& .MuiChip-label": { px: "12px" }
                                }}
                            />
                        </Box>

                        <Divider />

                        {/* Customer Info */}
                        <Box>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1.5 }}>
                                Thông tin khách hàng
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    src={booking.userId?.avatar}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "12px",
                                        bgcolor: "rgba(145, 158, 171, 0.08)"
                                    }}
                                >
                                    <Icon icon="eva:person-fill" width={24} style={{ color: COLORS.secondary }} />
                                </Avatar>
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem", color: COLORS.primary }}>
                                        {booking.userId?.fullName || "Khách vãng lai"}
                                    </Typography>
                                    <Typography sx={{ color: COLORS.secondary, fontSize: "0.8125rem" }}>
                                        {booking.userId?.phone || "Không xác định"}
                                    </Typography>
                                    <Typography sx={{ color: COLORS.secondary, fontSize: "0.8125rem" }}>
                                        {booking.userId?.email || "Không xác định"}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Service Info */}
                        <Box>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1 }}>
                                Dịch vụ
                            </Typography>
                            <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: COLORS.primary }}>
                                {booking.serviceId?.name || "Không xác định"}
                            </Typography>
                        </Box>

                        {/* Time */}
                        <Box>
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1 }}>
                                Thời gian
                            </Typography>
                            <Stack spacing={0.5}>
                                <Typography sx={{ fontSize: "0.9375rem", fontWeight: 600, color: COLORS.primary }}>
                                    {booking.start ? dayjs(booking.start).format("DD/MM/YYYY") : "Chưa xác định"}
                                </Typography>
                                <Typography sx={{ fontSize: "0.875rem", color: COLORS.success, fontWeight: 600 }}>
                                    {booking.start && booking.end
                                        ? `${dayjs(booking.start).format("HH:mm")} - ${dayjs(booking.end).format("HH:mm")}`
                                        : "Chưa xác định"}
                                </Typography>
                            </Stack>

                            {/* Actual Execution Times */}
                            {(booking.actualStart || booking.completedAt) && (
                                <Box sx={{ mt: 1, p: 1.5, borderRadius: '8px', bgcolor: alpha(COLORS.success, 0.05), border: `1px dashed ${alpha(COLORS.success, 0.3)}` }}>
                                    {booking.actualStart && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Icon icon="solar:play-bold-duotone" width={16} color={COLORS.success} />
                                            <Typography sx={{ fontSize: "0.8125rem", color: COLORS.secondary }}>
                                                Bắt đầu thực tế: <b>{dayjs(booking.actualStart).format("HH:mm")}</b>
                                            </Typography>
                                        </Stack>
                                    )}
                                    {booking.completedAt && (
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                            <Icon icon="solar:check-circle-bold-duotone" width={16} color={COLORS.success} />
                                            <Typography sx={{ fontSize: "0.8125rem", color: COLORS.secondary }}>
                                                Hoàn thành thực tế: <b>{dayjs(booking.completedAt).format("HH:mm")}</b>
                                            </Typography>
                                        </Stack>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* Pets */}
                        {booking.petIds && booking.petIds.length > 0 && (
                            <Box>
                                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1 }}>
                                    Thú cưng
                                </Typography>
                                <Stack spacing={1.5}>
                                    {booking.petIds.map((pet: any, index: number) => {
                                        const petId = pet._id || pet;
                                        const mapping = booking.petStaffMap?.find((m: any) =>
                                            (m.petId?._id || m.petId)?.toString() === petId?.toString()
                                        );
                                        const staffMember = mapping ? (booking.staffIds?.find((s: any) => s._id === mapping.staffId) || booking.staffId) : null;

                                        return (
                                            <Box key={index} sx={{ p: 1.5, borderRadius: '8px', bgcolor: mapping?.surchargeAmount > 0 ? alpha(COLORS.error, 0.04) : 'transparent', border: mapping?.surchargeAmount > 0 ? `1px dashed ${alpha(COLORS.error, 0.3)}` : 'none' }}>
                                                <Typography sx={{ fontSize: "0.875rem", color: COLORS.primary, fontWeight: 600 }}>
                                                    • {pet.name || `Thú cưng ${index + 1}`} ({pet.breed || "Không xác định"})
                                                </Typography>

                                                <Stack direction="row" spacing={2} sx={{ ml: 2, mt: 0.5 }} flexWrap="wrap">
                                                    {mapping && (
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <Icon icon="solar:user-bold" width={14} color={COLORS.success} />
                                                            <Typography sx={{ fontSize: "0.75rem", color: COLORS.success, fontWeight: 600 }}>
                                                                Phụ trách: {staffMember?.fullName || "Chưa xác định"}
                                                            </Typography>
                                                        </Stack>
                                                    )}

                                                    {mapping?.surchargeAmount > 0 && (
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <Icon icon="solar:bill-list-bold-duotone" width={14} color={COLORS.error} />
                                                            <Typography sx={{ fontSize: "0.75rem", color: COLORS.error, fontWeight: 700 }}>
                                                                Phụ phí: {mapping.surchargeAmount.toLocaleString()}đ ({mapping.surchargeNotes})
                                                            </Typography>
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        )}

                        {/* Notes */}
                        {booking.notes && (
                            <Box>
                                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1 }}>
                                    Ghi chú
                                </Typography>
                                <Typography sx={{ fontSize: "0.875rem", color: COLORS.primary }}>
                                    {booking.notes}
                                </Typography>
                            </Box>
                        )}

                        <Divider />

                        {/* Payment Info */}
                        <Stack direction="row" spacing={4}>
                            <Box flex={1}>
                                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1 }}>
                                    Chi tiết thanh toán
                                </Typography>
                                {booking.petStaffMap?.some((m: any) => m.surchargeAmount > 0) ? (
                                    <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: '250px' }}>
                                            <Typography variant="caption" color="text.secondary">Tạm tính:</Typography>
                                            <Typography variant="caption" fontWeight={600}>{(booking.subTotal || 0).toLocaleString()}đ</Typography>
                                        </Box>
                                        {booking.discount > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: '250px' }}>
                                                <Typography variant="caption" color="text.secondary">Giảm giá:</Typography>
                                                <Typography variant="caption" fontWeight={600} color="error.main">-{(booking.discount || 0).toLocaleString()}đ</Typography>
                                            </Box>
                                        )}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: '250px' }}>
                                            <Typography variant="caption" color="error.main">Phụ thu quá giờ:</Typography>
                                            <Typography variant="caption" fontWeight={700} color="error.main">
                                                +{booking.petStaffMap.reduce((sum: number, m: any) => sum + (m.surchargeAmount || 0), 0).toLocaleString()}đ
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ maxWidth: '250px', my: 0.5 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: '250px' }}>
                                            <Typography variant="subtitle2">Tổng cộng:</Typography>
                                            <Typography variant="subtitle2" color="primary.main" fontWeight={800}>{(booking.total || 0).toLocaleString()}đ</Typography>
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: COLORS.primary }}>
                                        {booking.total?.toLocaleString() || 0} đ
                                    </Typography>
                                )}
                            </Box>
                            <Box flex={1}>
                                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1 }}>
                                    Thanh toán
                                </Typography>
                                <Typography sx={{ fontSize: "0.875rem", color: COLORS.primary }}>
                                    {booking.paymentMethod === "money" ? "Tiền mặt" : booking.paymentMethod?.toUpperCase()}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={booking.paymentStatus === "paid" ? "Đã thanh toán" : booking.paymentStatus === "unpaid" ? "Chưa thanh toán" : "Đã hoàn tiền"}
                                    sx={{
                                        mt: 0.5,
                                        fontSize: "0.6875rem",
                                        fontWeight: 700,
                                        color: booking.paymentStatus === "paid" ? "#22C55E" : booking.paymentStatus === "unpaid" ? "#FFAB00" : "#FF5630",
                                        bgcolor: booking.paymentStatus === "paid" ? "rgba(34, 197, 94, 0.16)" : booking.paymentStatus === "unpaid" ? "rgba(255, 171, 0, 0.16)" : "rgba(255, 86, 48, 0.16)"
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Stack>
                </Card>

                {/* Staff Assignment Card - Only for Managers */}
                {
                    canAssign && (
                        <Card sx={{ borderRadius: "16px", boxShadow: COLORS.shadow, p: 3 }}>
                            <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: COLORS.primary, mb: 2.5 }}>
                                Phân bổ nhân viên
                            </Typography>

                            <Stack spacing={2.5}>
                                {/* Warning if no staff */}
                                {!booking.staffId && (!booking.staffIds || booking.staffIds.length === 0) && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: "12px",
                                            bgcolor: "rgba(255, 171, 0, 0.08)",
                                            border: "1px solid rgba(255, 171, 0, 0.24)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5
                                        }}
                                    >
                                        <Icon icon="eva:alert-triangle-fill" width={24} style={{ color: "#FFAB00" }} />
                                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#B76E00" }}>
                                            Chưa phân bổ nhân viên! Vui lòng chọn nhân viên để có thể xác nhận đơn.
                                        </Typography>
                                    </Box>
                                )}

                                {/* Current Staff */}
                                {(booking.staffIds?.length > 0 || booking.staffId) && (
                                    <Box>
                                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1.5 }}>
                                            Nhân viên hiện tại
                                        </Typography>
                                        <Stack spacing={2}>
                                            {(booking.staffIds?.length > 0 ? booking.staffIds : [booking.staffId]).map((staff: any) => (
                                                <Stack key={staff?._id} direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                        src={staff?.avatar}
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: "10px",
                                                            bgcolor: "rgba(0, 167, 111, 0.16)"
                                                        }}
                                                    >
                                                        <Icon icon="eva:person-fill" width={20} style={{ color: COLORS.success }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: COLORS.primary }}>
                                                            {staff?.fullName || "Chưa xác định"}
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label="Đã phân bổ"
                                                            sx={{
                                                                mt: 0.5,
                                                                fontSize: "0.6875rem",
                                                                fontWeight: 700,
                                                                height: "20px",
                                                                color: "#00A76F",
                                                                bgcolor: "rgba(0, 167, 111, 0.16)"
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                <Divider />

                                {/* Select Staff */}
                                <Box>
                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: COLORS.secondary, mb: 1.5 }}>
                                        {booking.staffId ? "Chọn nhân viên khác" : "Chọn nhân viên"}
                                    </Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={selectedStaffId}
                                                onChange={(e) => setSelectedStaffId(e.target.value)}
                                                displayEmpty
                                                disabled={isLoadingRecommendations}
                                                sx={{
                                                    borderRadius: "8px",
                                                    "& .MuiSelect-select": {
                                                        py: "10px"
                                                    }
                                                }}
                                            >
                                                <MenuItem value="" disabled>
                                                    {isLoadingRecommendations ? "Đang tải đề xuất..." : "Chọn nhân viên"}
                                                </MenuItem>
                                                {staffList.map((staff: any, index: number) => (
                                                    <MenuItem
                                                        key={staff.staffId}
                                                        value={staff.staffId}
                                                        disabled={!staff.isAvailable}
                                                        sx={{
                                                            opacity: staff.isAvailable ? 1 : 0.6,
                                                            bgcolor: staff.isAvailable ? 'inherit' : alpha('#919EAB', 0.04)
                                                        }}
                                                    >
                                                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                                <Box sx={{ position: 'relative' }}>
                                                                    <Avatar src={staff.avatar} sx={{ width: 24, height: 24 }} />
                                                                    {index === 0 && staff.isAvailable && (
                                                                        <Box sx={{
                                                                            position: 'absolute', top: -4, right: -4,
                                                                            bgcolor: '#FFAB00', width: 10, height: 10,
                                                                            borderRadius: '50%', border: '1.5px solid #fff'
                                                                        }} />
                                                                    )}
                                                                </Box>
                                                                <Box>
                                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                                                            {staff.fullName}
                                                                        </Typography>
                                                                        {index === 0 && staff.isAvailable && (
                                                                            <Chip
                                                                                label="Gợi ý"
                                                                                size="small"
                                                                                sx={{
                                                                                    height: 16, fontSize: '0.625rem', fontWeight: 800,
                                                                                    bgcolor: '#FFAB00', color: '#fff', px: 0.5
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Stack>
                                                                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.secondary }}>
                                                                        Ca làm: {staff.shift}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Chip
                                                                    size="small"
                                                                    label={staff.isAvailable ? "Rảnh" : staff.isBusy ? "Bận" : "Hết ca"}
                                                                    color={staff.isAvailable ? "success" : "error"}
                                                                    variant="outlined"
                                                                    sx={{ fontSize: '0.625rem', height: 18, border: 'none', bgcolor: staff.isAvailable ? 'rgba(34, 197, 94, 0.16)' : 'rgba(255, 86, 48, 0.16)' }}
                                                                />
                                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 60 }}>
                                                                    {staff.workloadCount} ca
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Button
                                            variant="contained"
                                            onClick={handleAssignStaff}
                                            disabled={!selectedStaffId || isAssigning}
                                            sx={{
                                                bgcolor: COLORS.primary,
                                                color: "#fff",
                                                minHeight: "40px",
                                                fontWeight: 700,
                                                fontSize: "0.875rem",
                                                px: 3,
                                                borderRadius: "8px",
                                                textTransform: "none",
                                                boxShadow: "none",
                                                whiteSpace: "nowrap",
                                                "&:hover": {
                                                    bgcolor: "#454F5B",
                                                    boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                                                },
                                                "&:disabled": {
                                                    bgcolor: "rgba(145, 158, 171, 0.24)",
                                                    color: "rgba(145, 158, 171, 0.48)"
                                                }
                                            }}
                                        >
                                            {isAssigning ? "Đang phân công..." : "Phân công"}
                                        </Button>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Card>
                    )
                }

                {/* Timeline Visualization - Only for Managers */}
                {
                    canAssign && (
                        <Card sx={{ borderRadius: "16px", boxShadow: COLORS.shadow, p: 3 }}>
                            <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                                Trực quan lịch làm việc
                            </Typography>
                            <Typography sx={{ fontSize: "0.8125rem", color: COLORS.secondary, mb: 3 }}>
                                Xem chi tiết lịch của tất cả nhân viên trong ngày {dayjs(booking.start).format("DD/MM/YYYY")}
                            </Typography>
                            <StaffAvailabilityTimeline
                                date={dayjs(booking.start)}
                                selectionStart={dayjs(booking.start)}
                                selectionEnd={dayjs(booking.end)}
                                selectedStaffId={selectedStaffId}
                            />
                        </Card>
                    )
                }

                {/* Action Buttons - Only if canEdit */}
                {
                    canEdit && ["pending", "confirmed", "delayed", "in-progress"].includes(booking.bookingStatus) && (
                        <Card sx={{ borderRadius: "16px", boxShadow: COLORS.shadow, p: 3 }}>
                            <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: COLORS.primary, mb: 2.5 }}>
                                Thao tác
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap gap={2}>
                                {["confirmed", "delayed"].includes(booking.bookingStatus) && (
                                    <Box>
                                        <Button
                                            variant="contained"
                                            startIcon={<Icon icon="eva:play-fill" />}
                                            onClick={handleStartBooking}
                                            disabled={isStarting}
                                            sx={{
                                                bgcolor: COLORS.primary,
                                                color: "#fff",
                                                fontWeight: 700,
                                                fontSize: "0.875rem",
                                                px: 3,
                                                borderRadius: "8px",
                                                textTransform: "none",
                                                "&:hover": { bgcolor: "#454F5B" },
                                                "&:disabled": {
                                                    bgcolor: "rgba(145, 158, 171, 0.24)",
                                                    color: "rgba(145, 158, 171, 0.48)"
                                                }
                                            }}
                                        >
                                            {isStarting ? "Đang xử lý..." : "Bắt đầu làm"}
                                        </Button>
                                        {isTooEarlyToStart && (
                                            <Typography sx={{ fontSize: "0.75rem", color: "#FF5630", mt: 1, fontWeight: 600 }}>
                                                * Còn quá sớm để bắt đầu (Tối đa {config?.allowEarlyStartMinutes || 30} phút)
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                                {booking.bookingStatus === "pending" && (
                                    <Box>
                                        <Button
                                            variant="contained"
                                            startIcon={<Icon icon="eva:checkmark-circle-2-fill" />}
                                            onClick={() => handleStatusUpdate("confirmed")}
                                            disabled={isUpdatingStatus || (!booking.staffId && (!booking.staffIds || booking.staffIds.length === 0))}
                                            sx={{
                                                bgcolor: COLORS.success,
                                                color: "#fff",
                                                fontWeight: 700,
                                                fontSize: "0.875rem",
                                                px: 3,
                                                borderRadius: "8px",
                                                textTransform: "none",
                                                boxShadow: "none",
                                                "&:hover": {
                                                    bgcolor: "#007B55",
                                                    boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                                                },
                                                "&:disabled": {
                                                    bgcolor: "rgba(145, 158, 171, 0.24)",
                                                    color: "rgba(145, 158, 171, 0.48)"
                                                }
                                            }}
                                        >
                                            Xác nhận đơn
                                        </Button>
                                        {!booking.staffId && (!booking.staffIds || booking.staffIds.length === 0) && (
                                            <Typography sx={{ fontSize: "0.75rem", color: "#FFAB00", mt: 1, fontWeight: 600 }}>
                                                * Vui lòng phân bổ nhân viên trước khi xác nhận
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                                {["pending", "confirmed"].includes(booking.bookingStatus) && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Icon icon="eva:close-circle-fill" />}
                                        onClick={() => handleStatusUpdate("cancelled")}
                                        disabled={isUpdatingStatus}
                                        sx={{
                                            bgcolor: "#FF5630",
                                            color: "#fff",
                                            fontWeight: 700,
                                            fontSize: "0.875rem",
                                            px: 3,
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            boxShadow: "none",
                                            "&:hover": {
                                                bgcolor: "#B71D18",
                                                boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                                            }
                                        }}
                                    >
                                        Hủy đơn
                                    </Button>
                                )}
                                {booking.bookingStatus === "confirmed" && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Icon icon="eva:checkmark-circle-2-fill" />}
                                        onClick={() => handleStatusUpdate("completed")}
                                        disabled={isUpdatingStatus}
                                        sx={{
                                            bgcolor: "#00A76F",
                                            color: "#fff",
                                            fontWeight: 700,
                                            fontSize: "0.875rem",
                                            px: 3,
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            boxShadow: "none",
                                            "&:hover": {
                                                bgcolor: "#007B55",
                                                boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                                            }
                                        }}
                                    >
                                        Hoàn thành
                                    </Button>
                                )}
                            </Stack>
                        </Card>
                    )
                }
            </Stack >
        </Box >
    );
};
