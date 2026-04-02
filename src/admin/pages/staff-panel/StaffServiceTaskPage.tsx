/**
 * StaffServiceTaskPage — UI dành riêng cho nhân viên bộ phận Dịch vụ (Grooming, Spa, Spa, Thú y...)
 * Nhân viên thấy trang này khi role của họ thuộc phòng ban có tên chứa "dịch vụ" / "service" / "grooming" ...
 */
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
    IconButton,
    Divider,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useStaffTasks, useStartBooking, useUpdateBookingStatus } from "../booking/hooks/useBookingManagement";
import { confirmAction } from "../../utils/swal";
import { prefixAdmin } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";

// Timer đếm thời gian thực hiện dịch vụ
const ServiceTimer = ({ startedAt, duration, maxDuration, minDuration }: {
    startedAt: string;
    duration: number;
    maxDuration: number;
    minDuration: number;
}) => {
    const [elapsed, setElapsed] = useState(0);

    const calculate = useCallback(() => {
        setElapsed(dayjs().diff(dayjs(startedAt), 'minute'));
    }, [startedAt]);

    useEffect(() => {
        calculate();
        const interval = setInterval(calculate, 30000);
        return () => clearInterval(interval);
    }, [calculate]);

    const isOverMax = maxDuration > 0 && elapsed > maxDuration;
    const getColor = () => {
        if (isOverMax) return 'var(--palette-error-main)';
        if (duration > 0 && elapsed >= duration) return 'var(--palette-warning-main)';
        return 'var(--palette-info-main)';
    };
    const minRemaining = minDuration > 0 && elapsed < minDuration ? minDuration - elapsed : 0;

    return (
        <Stack spacing={0.5} alignItems="flex-end">
            <Stack direction="row" spacing={1} alignItems="center">
                <Icon icon="eva:clock-outline" width={16} style={{ color: getColor() }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: getColor() }}>
                    {elapsed} phút {isOverMax && "(ĐÃ QUÁ GIỜ)"}
                </Typography>
                {minRemaining > 0 && (
                    <Chip label={`Chờ thêm ${minRemaining}p`} size="small" variant="outlined" color="error" sx={{ height: 20, fontSize: '10px' }} />
                )}
            </Stack>
        </Stack>
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

export const StaffServiceTaskPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [filterDate, setFilterDate] = useState(dayjs());
    const [processingItem, setProcessingItem] = useState<{ id: string; petId?: string } | null>(null);

    const { data: bookingsRes, isLoading, refetch } = useStaffTasks({
        date: filterDate.format("YYYY-MM-DD"),
        noLimit: true,
    });

    const { mutate: startService, isPending: isStarting } = useStartBooking();
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateBookingStatus();
    /* handleExtend removed - handled by automated jobs */

    const tasks = bookingsRes?.data || [];

    const handleStart = (id: string, petId?: string) => {
        confirmAction("Bắt đầu dịch vụ?", "Xác nhận bạn muốn bắt đầu thực hiện dịch vụ ngay bây giờ.", () => {
            setProcessingItem({ id, petId });
            startService({ id, petId }, {
                onSuccess: () => { toast.success("Đã bắt đầu thực hiện dịch vụ cho thú cưng"); refetch(); },
                onError: (error: any) => toast.error(error.response?.data?.message || "Lỗi khi bắt đầu dịch vụ"),
                onSettled: () => setProcessingItem(null),
            });
        }, 'info');
    };

    const handleComplete = (id: string, petId?: string) => {
        confirmAction("Hoàn thành dịch vụ?", "Bạn có chắc chắn muốn xác nhận hoàn thành dịch vụ này?", () => {
            setProcessingItem({ id, petId });
            updateStatus({ id, status: "completed", petId }, {
                onSuccess: () => { toast.success("Đã hoàn thành dịch vụ cho thú cưng"); refetch(); },
                onError: (error: any) => toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái"),
                onSettled: () => setProcessingItem(null),
            });
        }, 'success');
    };

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: "calc(3 * var(--spacing))" }}>
            {/* Header */}
            <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>Công việc hôm nay</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Bộ phận Dịch vụ — {filterDate.format("DD/MM/YYYY")}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
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
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
                        Không có lịch đặt nào được phân công cho bạn trong ngày này
                    </Typography>
                </Card>
            ) : (
                <Stack spacing={3}>
                    {tasks.map((task: any) => {
                        const assignedToMe = task.petStaffMap
                            ?.filter((m: any) => m.staffId === user?.id || m.staffId?._id === user?.id) || [];

                        return (
                            <Card key={task._id} sx={{
                                p: 3,
                                borderRadius: 'var(--shape-borderRadius-lg)',
                                boxShadow: 'var(--customShadows-card)',
                                borderLeft: `6px solid ${task.isOverrun ? 'var(--palette-error-main)' :
                                    task.bookingStatus === 'in-progress' ? 'var(--palette-warning-main)' :
                                        task.bookingStatus === 'completed' ? 'var(--palette-success-main)' :
                                            task.bookingStatus === 'cancelled' ? 'var(--palette-error-main)' :
                                                'var(--palette-info-main)'}`,
                                bgcolor: task.bookingStatus === 'cancelled' ? 'var(--palette-error-lighter)' : 'var(--palette-background-paper)',
                            }}>
                                {/* Cảnh báo quá giờ */}
                                {task.isOverrun && (
                                    <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', bgcolor: 'rgba(255, 72, 66, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" sx={{ color: 'var(--palette-error-main)', fontWeight: 700 }}>
                                            ⚠️ Việc quá giờ này có thể gây trễ các lịch đặt sau.
                                            {user?.roles?.some((r: any) => r.isAdmin) ? " Vui lòng kiểm tra và dời lịch nếu cần." : " Vui lòng báo cho quản lý để xử lý."}
                                        </Typography>
                                        {user?.roles?.some((r: any) => r.isAdmin) && (
                                            <Button size="small" color="error" variant="contained"
                                                startIcon={<Icon icon="solar:calendar-minimalistic-bold" />}
                                                onClick={() => navigate(`/${prefixAdmin}/booking/detail/${task._id}`)}
                                                sx={{ fontSize: '10px', fontWeight: 800, height: 24 }}
                                            >
                                                Dời lịch sau
                                            </Button>
                                        )}
                                    </Box>
                                )}

                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
                                    {/* Giờ & Mã */}
                                    <Box sx={{ minWidth: '150px' }}>
                                        {task.originalStart && dayjs(task.originalStart).format("HH:mm") !== dayjs(task.start).format("HH:mm") && (
                                            <Typography variant="caption" sx={{ color: 'var(--palette-error-main)', fontWeight: 700, textDecoration: 'line-through', display: 'flex', alignItems: 'center', mb: -0.5, gap: 0.5 }}>
                                                <Icon icon="solar:clock-circle-bold" width={12} />
                                                Gốc: {dayjs(task.originalStart).format("HH:mm")}
                                            </Typography>
                                        )}
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--palette-primary-main)' }}>
                                            {dayjs(task.start).format("HH:mm")}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                            {dayjs(task.start).format("DD/MM/YYYY")}
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700 }}>
                                            #{task.code}
                                        </Typography>
                                    </Box>

                                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

                                    {/* Dịch vụ & Khách */}
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            {getStatusChip(task.bookingStatus)}
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{task.serviceId?.name}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={3} sx={{ mt: 2 }} flexWrap="wrap">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar src={task.userId?.avatar} sx={{ width: 32, height: 32 }}>
                                                    {task.userId?.fullName?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2">{task.userId?.fullName || task.customerName}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {task.userId?.phone || task.customerPhone}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    <IconButton onClick={() => navigate(`/${prefixAdmin}/booking/detail/${task._id}`)}>
                                        <Icon icon="eva:eye-fill" />
                                    </IconButton>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                {/* Thú cưng được giao */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 700 }}>
                                        THÚ CƯNG BẠN PHỤ TRÁCH {assignedToMe.length > 0 ? `(${assignedToMe.length})` : ''}:
                                    </Typography>
                                    <Stack spacing={2}>
                                        {assignedToMe.length > 0 ? assignedToMe.map((m: any, idx: number) => (
                                            <Card key={idx} variant="outlined" sx={{
                                                p: 2,
                                                bgcolor: task.bookingStatus === 'cancelled' ? 'var(--palette-error-lighter)' : 'var(--palette-background-neutral)',
                                                borderRadius: 'var(--shape-borderRadius-md)',
                                            }}>
                                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar src={m.petId?.avatar} sx={{ bgcolor: 'var(--palette-primary-main)' }}>
                                                            {m.petId?.name?.charAt(0) || "P"}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{m.petId?.name || "N/A"}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{m.petId?.breed || "Giống loài"}</Typography>
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
                                                                        startIcon={(isStarting && processingItem?.id === task._id && processingItem?.petId === m.petId?._id)
                                                                            ? <CircularProgress size={16} color="inherit" />
                                                                            : <Icon icon={task.bookingStatus === 'pending' ? "eva:clock-outline" : "eva:play-circle-fill"} />
                                                                        }
                                                                        onClick={() => handleStart(task._id, m.petId?._id)}
                                                                        disabled={(isStarting && processingItem?.id === task._id) || task.bookingStatus === 'pending'}
                                                                        sx={{ borderRadius: "var(--shape-borderRadius)", textTransform: 'none' }}
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
                                                                        <Stack direction="row" spacing={1}>
                                                                            {/* Gia hạn button removed - handled by automated jobs */}
                                                                            <Button
                                                                                variant="contained"
                                                                                size="small"
                                                                                color="success"
                                                                                startIcon={(isUpdating && processingItem?.id === task._id)
                                                                                    ? <CircularProgress size={16} color="inherit" />
                                                                                    : <Icon icon="eva:checkmark-circle-2-fill" />
                                                                                }
                                                                                onClick={() => handleComplete(task._id, m.petId?._id)}
                                                                                disabled={(isUpdating && processingItem?.id === task._id) ||
                                                                                    (task.serviceId?.minDuration > 0 && dayjs().diff(dayjs(m.startedAt), 'minute') < task.serviceId.minDuration)
                                                                                }
                                                                                sx={{ borderRadius: "var(--shape-borderRadius)", textTransform: 'none' }}
                                                                            >
                                                                                Hoàn thành
                                                                            </Button>
                                                                        </Stack>
                                                                    </Stack>
                                                                )}
                                                            </>
                                                        )}
                                                        {m.status === 'completed' && task.bookingStatus !== 'cancelled' && (
                                                            <Icon icon="eva:checkmark-circle-2-fill" width={24} style={{ color: 'var(--palette-success-main)' }} />
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
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
};
