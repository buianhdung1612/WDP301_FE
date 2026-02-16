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

    const tasks = bookingsRes?.data || [];

    const handleStart = (id: string) => {
        startService(id, {
            onSuccess: () => {
                toast.success("Đã bắt đầu thực hiện dịch vụ");
                refetch();
            },
            onError: () => toast.error("Lỗi khi bắt đầu dịch vụ")
        });
    };

    const handleComplete = (id: string) => {
        updateStatus({ id, status: "completed" }, {
            onSuccess: () => {
                toast.success("Đã hoàn thành dịch vụ");
                refetch();
            },
            onError: () => toast.error("Lỗi khi cập nhật trạng thái")
        });
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Chip label="Chờ thực hiện" size="small" sx={{ bgcolor: 'rgba(0, 184, 217, 0.16)', color: '#00B8D9', fontWeight: 700 }} />;
            case "in-progress":
                return <Chip label="Đang thực hiện" size="small" sx={{ bgcolor: 'rgba(255, 171, 0, 0.16)', color: '#FFAB00', fontWeight: 700 }} />;
            case "completed":
                return <Chip label="Hoàn thành" size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.16)', color: '#22C55E', fontWeight: 700 }} />;
            case "delayed":
                return <Chip label="Trễ hẹn" size="small" sx={{ bgcolor: 'rgba(255, 86, 48, 0.16)', color: '#FF5630', fontWeight: 700 }} />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: '1.5rem' }}>
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
                <Card sx={{ p: 8, textAlign: 'center', borderRadius: '16px', bgcolor: 'rgba(145, 158, 171, 0.04)', border: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                    <Icon icon="eva:file-text-outline" width={64} style={{ color: '#919EAB', marginBottom: '16px' }} />
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
                                '&:hover': { bgcolor: '#454F5B' }
                            }}
                        >
                            Tạo đơn dịch vụ mới
                        </Button>
                    )}
                </Card>
            ) : (
                <Stack spacing={3}>
                    {tasks.map((task: any) => (
                        <Card key={task._id} sx={{
                            p: 3,
                            borderRadius: '16px',
                            boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                            borderLeft: `6px solid ${task.bookingStatus === 'in-progress' ? '#FFAB00' :
                                task.bookingStatus === 'completed' ? '#22C55E' :
                                    '#00B8D9'
                                }`
                        }}>
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

                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
                                            <Typography variant="caption" sx={{ color: COLORS.secondary, display: 'block' }}>Thú cưng:</Typography>
                                            <Typography variant="subtitle2">
                                                {task.petIds?.map((p: any) => p.name).join(", ") || "N/A"}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>

                                {/* Actions */}
                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="Xem chi tiết">
                                        <IconButton onClick={() => navigate(`/${prefixAdmin}/booking/detail/${task._id}`)}>
                                            <Icon icon="eva:eye-fill" />
                                        </IconButton>
                                    </Tooltip>

                                    {task.bookingStatus === 'confirmed' && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Icon icon="eva:play-circle-fill" />}
                                            onClick={() => handleStart(task._id)}
                                            disabled={isStarting}
                                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                                        >
                                            Bắt đầu
                                        </Button>
                                    )}

                                    {task.bookingStatus === 'in-progress' && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<Icon icon="eva:checkmark-circle-2-fill" />}
                                            onClick={() => handleComplete(task._id)}
                                            disabled={isUpdating}
                                            sx={{ borderRadius: '8px', textTransform: 'none', color: '#fff' }}
                                        >
                                            Hoàn thành
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
};
