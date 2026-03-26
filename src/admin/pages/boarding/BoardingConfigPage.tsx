import {
    Box,
    Card,
    Grid,
    TextField,
    Typography,
    Stack,
    alpha,
    Button,
    InputAdornment,
    CircularProgress
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useForm, Controller } from "react-hook-form";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useEffect } from "react";
import { prefixAdmin } from "../../constants/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBoardingConfig, updateBoardingConfig } from "../../api/boarding-config.api";
import { toast } from "react-toastify";

const BRAND_COLORS = {
    primary: "#3b82f6", // Blue for Hotel
    border: alpha("#919EAB", 0.16)
};

export const BoardingConfigPage = () => {
    const queryClient = useQueryClient();

    const { data: configRes, isLoading } = useQuery({
        queryKey: ["admin-boarding-config"],
        queryFn: getBoardingConfig
    });

    const updateMut = useMutation({
        mutationFn: updateBoardingConfig,
        onSuccess: () => {
            toast.success("Cập nhật cấu hình khách sạn thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-config"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
        }
    });

    const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
        defaultValues: {
            checkInTime: "14:00",
            checkOutTime: "12:00",
            lateCheckOutGracePeriod: 30,
            surchargeHalfDayPrice: 100000,
            surchargeFullDayPrice: 200000,
            depositPercentage: 20,
            minDaysForDeposit: 2,
            autoCancelHeldHours: 2,
            bookingCancellationPeriod: 24,
            refundPercentage: 80
        },
    });

    useEffect(() => {
        if (configRes?.data) {
            reset(configRes.data);
        }
    }, [configRes, reset]);

    const onSubmit = (data: any) => {
        updateMut.mutate(data);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '1000px', mx: 'auto', p: 3 }}>
            <Box sx={{ mb: 5 }}>
                <Title title="Cấu hình Khách sạn (Hotel)" />
                <Breadcrumb items={[{ label: "Dashboard", to: `/${prefixAdmin}` }, { label: "Boarding", to: `/${prefixAdmin}/boarding/booking-list` }, { label: "Cấu hình" }]} />
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                    {/* Quy trình Check-in/Check-out */}
                    <Card sx={{ p: 4, borderRadius: '24px', boxShadow: "0 8px 32px rgba(0,0,0,0.03)", border: `1px solid ${BRAND_COLORS.border}` }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                            <Box sx={{ p: 1, bgcolor: alpha(BRAND_COLORS.primary, 0.1), borderRadius: '12px', color: BRAND_COLORS.primary }}>
                                <Icon icon="solar:history-bold-duotone" width={24} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Thời gian & Quy trình</Typography>
                        </Stack>

                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller name="checkInTime" control={control} render={({ field }) => (
                                    <TextField {...field} label="Giờ nhận phòng tiêu chuẩn" fullWidth type="time" InputLabelProps={{ shrink: true }} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller name="checkOutTime" control={control} render={({ field }) => (
                                    <TextField {...field} label="Giờ trả phòng tiêu chuẩn" fullWidth type="time" InputLabelProps={{ shrink: true }} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller name="lateCheckOutGracePeriod" control={control} render={({ field }) => (
                                    <TextField {...field} label="Thời gian gia hạn trễ (Grace Period)" fullWidth type="number"
                                        InputProps={{ endAdornment: <InputAdornment position="end">phút</InputAdornment> }}
                                        onChange={(e) => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller name="autoCancelHeldHours" control={control} render={({ field }) => (
                                    <TextField {...field} label="Tự động hủy đơn 'Held' sau" fullWidth type="number"
                                        InputProps={{ endAdornment: <InputAdornment position="end">giờ</InputAdornment> }}
                                        onChange={(e) => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Phụ thu & Đặt cọc */}
                    <Card sx={{ p: 4, borderRadius: '24px', boxShadow: "0 8px 32px rgba(0,0,0,0.03)", border: `1px solid ${BRAND_COLORS.border}` }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                            <Box sx={{ p: 1, bgcolor: alpha("#f59e0b", 0.1), borderRadius: '12px', color: "#f59e0b" }}>
                                <Icon icon="solar:wad-of-money-bold-duotone" width={24} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Phụ phí & Đặt cọc</Typography>
                        </Stack>

                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller name="surchargeHalfDayPrice" control={control} render={({ field }) => (
                                    <TextField {...field} label="Phụ thu nửa ngày (≤ 6h)" fullWidth type="number"
                                        InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                                        onChange={(e) => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller name="surchargeFullDayPrice" control={control} render={({ field }) => (
                                    <TextField {...field} label="Phụ thu trọn ngày (> 6h)" fullWidth type="number"
                                        InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                                        onChange={(e) => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 12 }}>
                                <Controller name="depositPercentage" control={control} render={({ field }) => (
                                    <TextField {...field} label="Tỷ lệ đặt cọc đơn khách sạn (%)" fullWidth type="number"
                                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                        onChange={(e) => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 12 }}>
                                <Controller name="minDaysForDeposit" control={control} render={({ field }) => (
                                    <TextField {...field} label="Số ngày ở tối thiểu để yêu cầu đặt cọc" fullWidth type="number"
                                        InputProps={{ endAdornment: <InputAdornment position="end">ngày</InputAdornment> }}
                                        onChange={(e) => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Chính sách Hủy phòng */}
                    <Card sx={{ p: 4, borderRadius: '24px', boxShadow: "0 8px 32px rgba(0,0,0,0.03)", border: `1px solid ${BRAND_COLORS.border}` }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                            <Box sx={{ p: 1, bgcolor: alpha("#ef4444", 0.1), borderRadius: '12px', color: "#ef4444" }}>
                                <Icon icon="solar:shield-warning-bold-duotone" width={24} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Chính sách Hủy phòng</Typography>
                        </Stack>

                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller name="bookingCancellationPeriod" control={control} render={({ field }) => (
                                    <TextField {...field} label="Thời hạn hủy đơn trước khi check-in" fullWidth type="number"
                                        InputProps={{ endAdornment: <InputAdornment position="end">giờ</InputAdornment> }}
                                        onChange={(e) => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller name="refundPercentage" control={control} render={({ field }) => (
                                    <TextField {...field} label="Tỷ lệ hoàn tiền khi hủy hợp lệ" fullWidth type="number"
                                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                        onChange={(e) => field.onChange(Number(e.target.value))} />
                                )} />
                            </Grid>
                        </Grid>
                    </Card>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 10 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={updateMut.isPending || isSubmitting}
                            sx={{
                                px: 8, py: 1.5, borderRadius: '16px',
                                bgcolor: '#1c252e', '&:hover': { bgcolor: '#000' },
                                fontWeight: 800,
                                fontSize: '1rem',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}
                        >
                            {isSubmitting ? "Đang xử lý..." : "Lưu cấu hình Hotel"}
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Box>
    );
};
