import { Card, TextField, Button, Typography, Box, Stack, Grid, Divider } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingLoginSocialSchema, SettingLoginSocialFormValues } from "../../../schemas/setting.schema";
import { useSettingLoginSocial, useUpdateSettingLoginSocial } from "../hooks/useSettings";
import { useEffect } from "react";

export const SocialLoginTab = () => {
    const { data: initialData, isLoading } = useSettingLoginSocial();
    const { mutate: updateSettings } = useUpdateSettingLoginSocial();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<SettingLoginSocialFormValues>({
        resolver: zodResolver(settingLoginSocialSchema),
        defaultValues: {
            googleClientId: "",
            googleClientSecret: "",
            googleCallbackUrl: "",
            facebookAppId: "",
            facebookAppSecret: "",
            facebookCallbackUrl: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const onSubmit = (data: SettingLoginSocialFormValues) => {
        updateSettings(data);
    };

    if (isLoading) return <Typography>Đang tải...</Typography>;

    return (
        <Card sx={{ p: 4, borderRadius: '16px', bgcolor: 'white' }}>
            <Typography variant="subtitle1" sx={{ mb: 4, fontWeight: 700 }}>API đăng nhập mạng xã hội</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                    {/* Google Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1C252E', fontWeight: 700 }}>Đăng nhập bằng Google</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="googleClientId"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Client Id" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="googleClientSecret"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Client Secret" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="googleCallbackUrl"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Callback URL" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    {/* Facebook Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#1C252E', fontWeight: 700 }}>Đăng nhập bằng Facebook</Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="facebookAppId"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="App Id" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="facebookAppSecret"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="App Secret" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="facebookCallbackUrl"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Callback URL" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} size="small" />
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
