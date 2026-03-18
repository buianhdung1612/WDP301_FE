import { Box, Card, Grid, TextField, Typography, Stack, alpha, Switch, FormControlLabel } from "@mui/material";
import { Icon } from "@iconify/react";
import { useForm, Controller } from "react-hook-form";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useEffect } from "react";
import { prefixAdmin } from "../../constants/routes";
import { useBookingConfig, useUpdateBookingConfig } from "./hooks/useBookingConfig";
import { COLORS } from "../role/configs/constants";
import { LoadingButton } from "../../components/ui/LoadingButton";

export const BookingConfigPage = () => {
    const { data: config, isLoading } = useBookingConfig();
    const { mutate: updateConfig, isPending } = useUpdateBookingConfig();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm({
        defaultValues: {
            bookingGracePeriod: 15,
            bookingCancelPeriod: 60,
            allowEarlyStartMinutes: 30,
            autoCancelEnabled: false,
            autoConfirmEnabled: false,
            depositPercentage: 0
        },
    });

    useEffect(() => {
        if (config) {
            reset(config);
        }
    }, [config, reset]);

    const onSubmit = (data: any) => {
        updateConfig(data);
    };

    if (isLoading) {
        return <Typography sx={{ p: 4 }}>Đang tải dữ liệu...</Typography>;
    }

    return (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5 }}>
                <Title title="Cấu hình hệ thống đặt lịch" />
                <Breadcrumb
                    items={[
                        { label: "Dashboard", to: `/${prefixAdmin}` },
                        { label: "Đơn dịch vụ", to: `/${prefixAdmin}/booking/list` },
                        { label: "Cấu hình" }
                    ]}
                />
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <Card sx={{
                        p: 4,
                        borderRadius: '20px',
                        boxShadow: "var(--customShadows-card)",
                        border: `1px solid ${alpha('#919EAB', 0.12)}`
                    }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                            <Icon icon="solar:settings-bold-duotone" width={24} color={COLORS.primary} />
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>Quy tắc thời gian</Typography>
                        </Stack>

                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="bookingGracePeriod"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Thời gian trễ tối đa (phút)"
                                            fullWidth
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            helperText="Sau thời gian này khách chưa đến đơn sẽ báo 'Trễ'"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="bookingCancelPeriod"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Thời gian tự động hủy (phút)"
                                            fullWidth
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            helperText="Thời gian trễ tối đa trước khi bị hủy"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="allowEarlyStartMinutes"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Bắt đầu sớm tối đa (phút)"
                                            fullWidth
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            helperText="Cho phép nhân viên bắt đầu làm sớm hơn lịch hẹn"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="depositPercentage"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Phần trăm đặt cọc (%)"
                                            fullWidth
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            helperText="Tỉ lệ % khách cần thanh toán trước để xác nhận lịch"
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Card>

                    <Card sx={{
                        p: 4,
                        borderRadius: '20px',
                        boxShadow: "var(--customShadows-card)",
                        border: `1px solid ${alpha('#919EAB', 0.12)}`
                    }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
                            <Icon icon="solar:Bell-bold-duotone" width={24} color={COLORS.primary} />
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>Tự động hóa</Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <Controller
                                name="autoConfirmEnabled"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch checked={field.value} onChange={field.onChange} />}
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Tự động xác nhận đơn</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Chấp nhận tất cả đơn đặt mới mà không cần duyệt thủ công</Typography>
                                            </Box>
                                        }
                                    />
                                )}
                            />
                            <Controller
                                name="autoCancelEnabled"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch checked={field.value} onChange={field.onChange} />}
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Tự động hủy khi quá hạn</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Hủy đơn nếu khách hàng không đến sau thời gian hủy (Cancel Period)</Typography>
                                            </Box>
                                        }
                                    />
                                )}
                            />
                        </Stack>
                    </Card>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <LoadingButton
                            type="submit"
                            loading={isPending || isSubmitting}
                            label="Lưu cấu hình"
                            loadingLabel="Đang lưu..."
                            sx={{ px: 4, py: 1.5, borderRadius: "var(--shape-borderRadius-md)", fontSize: '1rem' }}
                        />
                    </Box>
                </Stack>
            </form>
        </Box>
    );
};




