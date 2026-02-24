import { useState, useEffect } from "react";
import {
    Box,
    Card,
    Typography,
    Stack,
    TextField,
    InputAdornment,
    CircularProgress
} from "@mui/material";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Icon } from "@iconify/react";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useAttendanceConfig } from "./hooks/useAttendanceConfig";
import { LoadingButton } from "../../components/ui/LoadingButton";

export const AttendanceConfigPage = () => {
    const { config, isLoading, update, isPending } = useAttendanceConfig();
    const [formData, setFormData] = useState<any>({
        checkInEarlyLimit: 15,
        checkOutLateLimit: 60,
        lateThreshold: 5,
        absentThreshold: 60,
        workDayStartTime: "07:00",
        workDayEndTime: "22:00"
    });

    useEffect(() => {
        if (config) {
            setFormData({
                checkInEarlyLimit: config.checkInEarlyLimit,
                checkOutLateLimit: config.checkOutLateLimit,
                lateThreshold: config.lateThreshold,
                absentThreshold: config.absentThreshold,
                workDayStartTime: config.workDayStartTime,
                workDayEndTime: config.workDayEndTime
            });
        }
    }, [config]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: name.includes('Limit') || name.includes('Threshold') ? Number(value) : value
        }));
    };

    const handleTimeChange = (name: string, newValue: any) => {
        if (newValue) {
            setFormData((prev: any) => ({
                ...prev,
                [name]: dayjs(newValue).format('HH:mm')
            }));
        }
    };

    const parseTimeString = (timeStr: string) => {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return dayjs().set('hour', hours).set('minute', minutes).set('second', 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        update(formData);
    };

    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box>
            <Box sx={{ mb: 5 }}>
                <Title title="Cấu hình Chấm công" />
                <Breadcrumb
                    items={[
                        { label: "Dashboard", to: `/${prefixAdmin}` },
                        { label: "Cài đặt", to: `/${prefixAdmin}/dashboard/setting-general` },
                        { label: "Chấm công" }
                    ]}
                />
            </Box>

            <form onSubmit={handleSubmit}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: "calc(3 * var(--spacing))"
                }}>
                    {/* Time Window Settings */}
                    <Card sx={{ p: 3, borderRadius: "var(--shape-borderRadius-lg)" }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Icon icon="solar:clock-circle-bold-duotone" width={24} color="var(--palette-primary-main)" />
                            <Typography variant="h6">Giờ mở cửa hệ thống (24h)</Typography>
                        </Stack>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: "calc(2 * var(--spacing))" }}>
                                <TimePicker
                                    label="Giờ bắt đầu"
                                    value={parseTimeString(formData.workDayStartTime)}
                                    onChange={(newValue) => handleTimeChange('workDayStartTime', newValue)}
                                    ampm={false}
                                    format="HH:mm"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            helperText: "VD: 07:00"
                                        }
                                    }}
                                />
                                <TimePicker
                                    label="Giờ kết thúc"
                                    value={parseTimeString(formData.workDayEndTime)}
                                    onChange={(newValue) => handleTimeChange('workDayEndTime', newValue)}
                                    ampm={false}
                                    format="HH:mm"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            helperText: "VD: 22:00"
                                        }
                                    }}
                                />
                            </Box>
                        </LocalizationProvider>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                            * Hệ thống sẽ dùng định dạng 24h (13:00 thay vì 1:00 PM). Chặn toàn bộ các thao tác check-in/out ngoài khung giờ này.
                        </Typography>
                    </Card>

                    {/* Attendance Limits */}
                    <Card sx={{ p: 3, borderRadius: "var(--shape-borderRadius-lg)" }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                            <Icon icon="solar:user-rounded-bold-duotone" width={24} color="#FFAB00" />
                            <Typography variant="h6">Quy định Chấm công</Typography>
                        </Stack>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Giới hạn Check-in sớm"
                                name="checkInEarlyLimit"
                                value={formData.checkInEarlyLimit}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">phút</InputAdornment>,
                                }}
                                helperText="Nhân viên chỉ được bấm check-in sớm tối đa số phút này so với giờ bắt đầu ca."
                            />
                            <TextField
                                fullWidth
                                type="number"
                                label="Ngưỡng tính Đi muộn"
                                name="lateThreshold"
                                value={formData.lateThreshold}
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">phút</InputAdornment>,
                                }}
                                helperText="Bắt đầu tính là đi muộn sau bao nhiêu phút kể từ khi ca khởi chạy."
                            />
                        </Stack>
                    </Card>

                    {/* Other Rules */}
                    <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                        <Card sx={{ p: 3, borderRadius: "var(--shape-borderRadius-lg)" }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <Icon icon="solar:shield-check-bold-duotone" width={24} color="#00B8D9" />
                                <Typography variant="h6">Các quy tắc khác</Typography>
                            </Stack>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: "calc(2 * var(--spacing))" }}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Ngưỡng tính Vắng mặt"
                                    name="absentThreshold"
                                    value={formData.absentThreshold}
                                    onChange={handleChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">phút</InputAdornment>,
                                    }}
                                    helperText="Quá số phút này không check-in sẽ tự động ghi nhận là vắng mặt."
                                />
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Giới hạn Check-out muộn"
                                    name="checkOutLateLimit"
                                    value={formData.checkOutLateLimit}
                                    onChange={handleChange}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">phút</InputAdornment>,
                                    }}
                                    helperText="Cho phép nhân viên check-out muộn tối đa bao nhiêu phút sau khi kết thúc ca."
                                />
                            </Box>
                        </Card>
                    </Box>
                </Box>

                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
                    <LoadingButton
                        type="submit"
                        loading={isPending}
                        label="Lưu cấu hình"
                        loadingLabel="Đang lưu..."
                        size="large"
                    />
                </Stack>
            </form>
        </Box>
    );
};




