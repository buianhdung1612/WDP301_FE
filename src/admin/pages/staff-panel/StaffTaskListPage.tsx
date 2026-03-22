import { useNavigate } from "react-router-dom";
import { useState } from "react";
import dayjs from "dayjs";
import {
    Box,
    Card,
    Typography,
    Stack,
    Button,
    CircularProgress,
    Chip,
    Avatar,
    Divider,
    IconButton,
    Tooltip
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useStaffTasks, useStartBooking, useUpdateBookingStatus } from "../booking/hooks/useBookingManagement";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { COLORS } from "../role/configs/constants";
import { toast } from "react-toastify";
import { useEffect, useCallback } from "react";
import { confirmAction } from "../../utils/swal";

// Timer component for tracking service progress
const ServiceTimer = ({ startedAt, duration, maxDuration, minDuration }: { startedAt: string, duration: number, maxDuration: number, minDuration: number }) => {
    const [elapsed, setElapsed] = useState(0);

    const calculate = useCallback(() => {
        const start = dayjs(startedAt);
        const now = dayjs();
        setElapsed(now.diff(start, 'minute'));
    }, [startedAt]);

    useEffect(() => {
        calculate();
        const interval = setInterval(calculate, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, [calculate]);

    const isOverMax = maxDuration > 0 && elapsed > maxDuration;

    const getColor = () => {
        if (isOverMax) return 'var(--palette-error-main)'; // Red - Surcharge
        if (duration > 0 && elapsed >= duration) return 'var(--palette-warning-main)'; // Orange - Over expected
        return 'var(--palette-info-main)'; // Blue - Normal
    };

    const getRemainingForMin = () => {
        if (minDuration > 0 && elapsed < minDuration) {
            return minDuration - elapsed;
        }
        return 0;
    };

    const minRemaining = getRemainingForMin();

    return (
        <Stack spacing={0.5} alignItems="flex-end">
            <Stack direction="row" spacing={1} alignItems="center">
                <Icon icon="eva:clock-outline" width={16} style={{ color: getColor() }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: getColor() }}>
                    {elapsed} phút {isOverMax && "(ĐÃ QUÁ GIỜ)"}
                </Typography>
                {minRemaining > 0 && (
                    <Chip
                        label={`Chờ thêm ${minRemaining}p`}
                        size="small"
                        variant="outlined"
                        color="error"
                        sx={{ height: 20, fontSize: '10px' }}
                    />
                )}
            </Stack>
            {/* Estimated surcharge hidden based on user request */}
            {/* {isOverMax && surchargeType !== 'none' && (
                <Typography variant="caption" sx={{ color: 'var(--palette-error-main)', fontWeight: 800, fontSize: '10px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Icon icon="solar:bill-list-bold-duotone" width={12} />
                    Dự kiến phụ thu: {estSurcharge.toLocaleString()}đ
                </Typography>
            )} */}
        </Stack>
    );
};

export const StaffTaskListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [filterDate, setFilterDate] = useState(dayjs());

    // Fetch bookings assigned to this staff
    const { data: bookingsRes, isLoading, refetch } = useStaffTasks({
        date: filterDate.format("YYYY-MM-DD"),
        noLimit: true
    });

    const { mutate: startService, isPending: isStarting } = useStartBooking();
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateBookingStatus();

    const [processingItem, setProcessingItem] = useState<{ id: string; petId?: string } | null>(null);

    const tasks = bookingsRes?.data || [];


    const handleStart = (id: string, petId?: string) => {
        confirmAction(
            "Bắt đầu dịch vụ?",
            "Xác nhận bạn muốn bắt đầu thực hiện dịch vụ ngay bây giờ.",
            () => {
                setProcessingItem({ id, petId });
                startService({ id, petId }, {
                    onSuccess: () => {
                        toast.success("Đã bắt đầu thực hiện dịch vụ cho thú cưng");
                        refetch();
                    },
                    onError: (error: any) => {
                        const message = error.response?.data?.message || "Lỗi khi bắt đầu dịch vụ";
                        toast.error(message);
                    },
                    onSettled: () => setProcessingItem(null)
                });
            },
            'info'
        );
    };

    const handleComplete = (id: string, petId?: string) => {
        confirmAction(
            "Hoàn thành dịch vụ?",
            "Bạn có chắc chắn muốn xác nhận hoàn thành dịch vụ này?",
            () => {
                setProcessingItem({ id, petId });
                updateStatus({ id, status: "completed", petId }, {
                    onSuccess: () => {
                        toast.success("Đã hoàn thành dịch vụ cho thú cưng");
                        refetch();
                    },
                    onError: (error: any) => {
                        const message = error.response?.data?.message || "Lỗi khi cập nhật trạng thái";
                        toast.error(message);
                    },
                    onSettled: () => setProcessingItem(null)
                });
            },
            'success'
        );
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case "confirmed":
            case "pending":
                return <Chip label="Chờ thực hiện" size="small" sx={{ bgcolor: 'var(--palette-info-lighter)', color: 'var(--palette-info-dark)', fontWeight: 700 }} />;
            case "in-progress":
                return <Chip label="Đang thực hiện" size="small" sx={{ bgcolor: 'var(--palette-warning-lighter)', color: 'var(--palette-warning-dark)', fontWeight: 700 }} />;
            case "completed":
                return <Chip label="Hoàn thành" size="small" sx={{ bgcolor: 'var(--palette-success-lighter)', color: 'var(--palette-success-dark)', fontWeight: 700 }} />;
            case "delayed":
                return <Chip label="Trễ hẹn" size="small" sx={{ bgcolor: 'var(--palette-error-lighter)', color: 'var(--palette-error-dark)', fontWeight: 700 }} />;
            case "cancelled":
                return <Chip label="Đã hủy" size="small" sx={{ bgcolor: 'var(--palette-error-lighter)', color: 'var(--palette-error-dark)', fontWeight: 700 }} />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Title title="Công việc hôm nay" />
                    <Breadcrumb
                        items={[
                            { label: t("admin.dashboard"), to: `/${prefixAdmin}` },
                            { label: "Bảng điều khiển nhân viên" }
                        ]}
                    />
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{ fontWeight: 600, color: COLORS.secondary }}>
                        {filterDate.format("DD/MM/YYYY")}
                    </Typography>
                    <IconButton onClick={() => setFilterDate(prev => prev.subtract(1, 'day'))}>
                        <Icon icon="eva:arrow-ios-back-fill" />
                    </IconButton>
                    <IconButton onClick={() => setFilterDate(dayjs())}>
                        <Icon icon="eva:calendar-outline" />
                    </IconButton>
                    <IconButton onClick={() => setFilterDate(prev => prev.add(1, 'day'))}>
                        <Icon icon="eva:arrow-ios-forward-fill" />
                    </IconButton>
                </Stack>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : tasks.length === 0 ? (
                <Card sx={{ p: 8, textAlign: 'center', borderRadius: 'var(--shape-borderRadius-lg)', bgcolor: 'var(--palette-background-neutral)', border: '1px dashed var(--palette-shared-inputOutlined)' }}>
                    <Icon icon="eva:file-text-outline" width={64} style={{ color: 'var(--palette-text-disabled)', marginBottom: '16px' }} />
                    <Typography variant="h6" sx={{ color: COLORS.secondary, mb: 3 }}>
                        Không có lịch đặt nào được phân công cho bạn trong ngày này
                    </Typography>
                    {user?.permissions?.includes("booking_create") && (
                        <Button
                            variant="contained"
                            startIcon={<Icon icon="eva:plus-fill" />}
                            onClick={() => navigate(`/${prefixAdmin}/booking/create`)}
                            sx={{
                                bgcolor: COLORS.primary,
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1.5,
                                boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.24)',
                                '&:hover': { bgcolor: 'var(--palette-grey-800)' }
                            }}
                        >
                            Tạo đơn dịch vụ mới
                        </Button>
                    )}
                </Card>
            ) : (
                <Stack spacing={3}>
                    {tasks.map((task: any) => {
                        // Lọc các thú cưng được giao cho nhân viên hiện tại
                        const assignedToMe = task.petStaffMap
                            ?.filter((m: any) => m.staffId === user?.id || m.staffId?._id === user?.id)
                            || [];

                        return (
                            <Card key={task._id} sx={{
                                p: 3,
                                borderRadius: 'var(--shape-borderRadius-lg)',
                                boxShadow: 'var(--customShadows-card)',
                                borderLeft: `6px solid ${task.bookingStatus === 'in-progress' ? 'var(--palette-warning-main)' :
                                    task.bookingStatus === 'completed' ? 'var(--palette-success-main)' :
                                        task.bookingStatus === 'cancelled' ? 'var(--palette-error-main)' :
                                            'var(--palette-info-main)'
                                    }`,
                                bgcolor: task.bookingStatus === 'cancelled' ? 'var(--palette-error-lighter)' : 'var(--palette-background-paper)'
                            }}>
                                <Stack spacing={3}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                                        {/* Time & Code */}
                                        <Box sx={{ minWidth: '150px' }}>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary }}>
                                                {dayjs(task.start).format("HH:mm")}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: COLORS.secondary, display: 'block' }}>
                                                {dayjs(task.start).format("DD/MM/YYYY")}
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ mt: 1, color: COLORS.primary, fontWeight: 700 }}>
                                                #{task.code}
                                            </Typography>
                                        </Box>

                                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                                        {/* Service & Customer */}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                {getStatusChip(task.bookingStatus)}
                                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                    {task.serviceId?.name}
                                                </Typography>
                                            </Stack>

                                            <Stack direction="row" spacing={3} sx={{ mt: 2 }} flexWrap="wrap">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar src={task.userId?.avatar} sx={{ width: 32, height: 32 }}>
                                                        {task.userId?.fullName?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2">{task.userId?.fullName || task.customerName}</Typography>
                                                        <Typography variant="caption" sx={{ color: COLORS.secondary }}>
                                                            {task.userId?.phone || task.customerPhone}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Divider orientation="vertical" flexItem />

                                                <Box>
                                                    <Typography variant="caption" sx={{ color: COLORS.secondary, display: 'block' }}>Tổng quát:</Typography>
                                                    <Typography variant="subtitle2">
                                                        {task.petIds?.length} thú cưng ({task.petIds?.map((p: any) => p.name).join(", ")})
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>

                                        <Tooltip title="Xem chi tiết đơn">
                                            <IconButton onClick={() => navigate(`/${prefixAdmin}/booking/detail/${task._id}`)}>
                                                <Icon icon="eva:eye-fill" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>

                                    <Divider />

                                    {/* Danh sách thú cưng được giao cho tôi */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 2, color: COLORS.secondary, fontWeight: 700 }}>
                                            THÚ CƯNG BẠN PHỤ TRÁCH {assignedToMe.length > 0 ? `(${assignedToMe.length})` : ''}:
                                        </Typography>

                                        <Stack spacing={2}>
                                            {assignedToMe.length > 0 ? assignedToMe.map((m: any, idx: number) => (
                                                <Card key={idx} variant="outlined" sx={{
                                                    p: 2,
                                                    bgcolor: task.bookingStatus === 'cancelled' ? 'var(--palette-error-lighter)' : 'var(--palette-background-neutral)',
                                                    borderRadius: 'var(--shape-borderRadius-md)',
                                                    borderColor: task.bookingStatus === 'cancelled' ? 'var(--palette-error-light)' : 'var(--palette-action-hover)'
                                                }}>
                                                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar src={m.petId?.avatar} sx={{ bgcolor: COLORS.primary }}>
                                                                {m.petId?.name?.charAt(0) || "P"}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                    {m.petId?.name || "N/A"}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {m.petId?.breed || "Giống loài"}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ ml: 2 }}>
                                                                {getStatusChip(task.bookingStatus === 'cancelled' ? 'cancelled' : (m.status || 'pending'))}
                                                            </Box>
                                                        </Stack>

                                                        <Stack direction="row" spacing={1}>
                                                            {task.bookingStatus !== 'cancelled' && (
                                                                <>
                                                                    {(m.status === 'pending' || !m.status) && (
                                                                        <Button
                                                                            variant="contained"
                                                                            size="small"
                                                                            startIcon={
                                                                                (isStarting && processingItem?.id === task._id && processingItem?.petId === m.petId?._id) ?
                                                                                    <CircularProgress size={16} color="inherit" /> :
                                                                                    <Icon icon={task.bookingStatus === 'pending' ? "eva:clock-outline" : "eva:play-circle-fill"} />
                                                                            }
                                                                            onClick={() => handleStart(task._id, m.petId?._id)}
                                                                            disabled={(isStarting && processingItem?.id === task._id && processingItem?.petId === m.petId?._id) || task.bookingStatus === 'pending'}
                                                                            sx={{
                                                                                borderRadius: "var(--shape-borderRadius)",
                                                                                textTransform: 'none',
                                                                                ...(task.bookingStatus === 'pending' && {
                                                                                    bgcolor: 'rgba(145, 158, 171, 0.24)',
                                                                                    color: 'rgba(145, 158, 171, 0.8)'
                                                                                })
                                                                            }}
                                                                        >
                                                                            {task.bookingStatus === 'pending' ? 'Chờ xác nhận' : 'Bắt đầu'}
                                                                        </Button>
                                                                    )}

                                                                    {m.status === 'in-progress' && (
                                                                        <Stack spacing={1} alignItems="flex-end" sx={{ mr: 2 }}>
                                                                            <ServiceTimer
                                                                                startedAt={m.startedAt}
                                                                                duration={task.serviceId?.duration || 0}
                                                                                minDuration={task.serviceId?.minDuration || 0}
                                                                                maxDuration={task.serviceId?.maxDuration || 0}
                                                                            />
                                                                            <Button
                                                                                variant="contained"
                                                                                size="small"
                                                                                color="success"
                                                                                startIcon={
                                                                                    (isUpdating && processingItem?.id === task._id && processingItem?.petId === m.petId?._id) ?
                                                                                        <CircularProgress size={16} color="inherit" /> :
                                                                                        <Icon icon="eva:checkmark-circle-2-fill" />
                                                                                }
                                                                                onClick={() => handleComplete(task._id, m.petId?._id)}
                                                                                disabled={
                                                                                    (isUpdating && processingItem?.id === task._id && processingItem?.petId === m.petId?._id) ||
                                                                                    (task.serviceId?.minDuration > 0 &&
                                                                                        dayjs().diff(dayjs(m.startedAt), 'minute') < task.serviceId.minDuration)
                                                                                }
                                                                                sx={{
                                                                                    borderRadius: "var(--shape-borderRadius)",
                                                                                    textTransform: 'none',
                                                                                    color: "var(--palette-common-white)"
                                                                                }}
                                                                            >
                                                                                Hoàn thành
                                                                            </Button>
                                                                        </Stack>
                                                                    )}
                                                                </>
                                                            )}

                                                            {m.status === 'completed' && task.bookingStatus !== 'cancelled' && (
                                                                <Stack alignItems="flex-end">
                                                                    <Icon icon="eva:checkmark-circle-2-fill" width={24} style={{ color: 'var(--palette-success-main)' }} />
                                                                    {/* Final surcharge hidden based on user request */}
                                                                    {/* {m.surchargeAmount > 0 && (
                                                                        <Typography variant="caption" sx={{ color: 'var(--palette-error-main)', fontWeight: 700, mt: 0.5 }}>
                                                                            +{m.surchargeAmount.toLocaleString()}đ phụ thu
                                                                        </Typography>
                                                                    )} */}
                                                                </Stack>
                                                            )}

                                                            {task.bookingStatus === 'cancelled' && (
                                                                <Typography variant="caption" sx={{ color: 'var(--palette-error-main)', fontWeight: 700 }}>
                                                                    Lịch đã hủy
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                </Card>
                                            )) : (
                                                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                                    (Đơn hàng này không chỉ định cụ thể thú cưng cho bạn)
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
};




