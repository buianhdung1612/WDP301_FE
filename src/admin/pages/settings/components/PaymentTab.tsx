import { Card, TextField, Button, Typography, Box, Stack, Grid, Divider } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingPaymentSchema, SettingPaymentFormValues } from "../../../schemas/setting.schema";
import { useSettingPayment, useUpdateSettingPayment } from "../hooks/useSettings";
import { useEffect } from "react";

export const PaymentTab = () => {
    const { data: initialData, isLoading } = useSettingPayment();
    const { mutate: updateSettings } = useUpdateSettingPayment();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<SettingPaymentFormValues>({
        resolver: zodResolver(settingPaymentSchema),
        defaultValues: {
            zaloAppId: "",
            zaloKey1: "",
            zaloKey2: "",
            zaloDomain: "",
            vnpTmnCode: "",
            vnpHashSecret: "",
            vnpUrl: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const onSubmit = (data: SettingPaymentFormValues) => {
        updateSettings(data);
    };

    if (isLoading) return <Typography>Đang tải...</Typography>;

    return (
        <Card sx={{ p: 4, borderRadius: '16px', bgcolor: 'white' }}>
            <Typography variant="subtitle1" sx={{ mb: 4, fontWeight: 700 }}>API cổng thanh toán</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                    {/* ZaloPay Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1C252E', fontWeight: 700 }}>ZaloPay</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="zaloAppId"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="App Id" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="zaloKey1"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Key 1" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="zaloKey2"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Key 2" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="zaloDomain"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Tên miền" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    {/* VNPay Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1C252E', fontWeight: 700 }}>VNPay</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="vnpTmnCode"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Tmn Code" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="vnpHashSecret"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Hash Secret" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="vnpUrl"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="URL" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                bgcolor: '#00A76F',
                                color: 'white',
                                '&:hover': { bgcolor: '#008b5e' },
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                py: 1
                            }}
                        >
                            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Card>
    );
};
