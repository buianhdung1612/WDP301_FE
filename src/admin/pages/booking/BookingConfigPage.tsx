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
            autoConfirmEnabled: false
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
        return <Typography sx={{ p: 4 }}>Ðang t?i d? li?u...</Typography>;
    }

    return (
        <Box sx={{ maxWidth: '800px', mx: 'auto', p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5 }}>
                <Title title="C?u hình h? th?ng d?t l?ch" />
                <Breadcrumb
                    items={[
                        { label: "Dashboard", to: `/${prefixAdmin}` },
                        { label: "Ðon d?ch v?", to: `/${prefixAdmin}/booking/list` },
                        { label: "C?u hình" }
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
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>Quy t?c th?i gian</Typography>
                        </Stack>

                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="bookingGracePeriod"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Th?i gian tr? t?i da (phút)"
                                            fullWidth
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            helperText="Sau th?i gian này khách chua d?n don s? báo 'Tr?'"
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
                                            label="Th?i gian t? d?ng h?y (phút)"
                                            fullWidth
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            helperText="Th?i gian tr? t?i da tru?c khi b? h?y"
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
                                            label="B?t d?u s?m t?i da (phút)"
                                            fullWidth
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            helperText="Cho phép nhân viên b?t d?u làm s?m hon l?ch h?n"
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
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>T? d?ng hóa</Typography>
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
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>T? d?ng xác nh?n don</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Ch?p nh?n t?t c? don d?t m?i mà không c?n duy?t th? công</Typography>
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
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>T? d?ng h?y khi quá h?n</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>H?y don n?u khách hàng không d?n sau th?i gian h?y (Cancel Period)</Typography>
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
                            label="Luu c?u hình"
                            loadingLabel="Ðang luu..."
                            sx={{ px: 4, py: 1.5, borderRadius: "var(--shape-borderRadius-md)", fontSize: '1rem' }}
                        />
                    </Box>
                </Stack>
            </form>
        </Box>
    );
};




