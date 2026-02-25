import { Card, TextField, Button, Typography, Box, Stack, Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingAppPasswordSchema, SettingAppPasswordFormValues } from "../../../schemas/setting.schema";
import { useSettingAppPassword, useUpdateSettingAppPassword } from "../hooks/useSettings";
import { useEffect } from "react";

export const AppPasswordTab = () => {
    const { data: initialData, isLoading } = useSettingAppPassword();
    const { mutate: updateSettings } = useUpdateSettingAppPassword();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<SettingAppPasswordFormValues>({
        resolver: zodResolver(settingAppPasswordSchema),
        defaultValues: {
            gmailUser: "",
            gmailPassword: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const onSubmit = (data: SettingAppPasswordFormValues) => {
        updateSettings(data);
    };

    if (isLoading) return <Typography>Đang tải...</Typography>;

    return (
        <Card sx={{ p: 4, borderRadius: '16px', bgcolor: 'white' }}>
            <Typography variant="subtitle1" sx={{ mb: 4, fontWeight: 700 }}>API mật khẩu ứng dụng của Google</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="gmailUser"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Gmail User"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="gmailPassword"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Gmail Password"
                                        fullWidth
                                        type="password"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        size="small"
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
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
