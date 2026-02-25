import { Box, Card, Grid, TextField, Button, Typography, Stack, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingGeneralSchema, SettingGeneralFormValues } from "../../../schemas/setting.schema";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { uploadImagesToCloudinary } from "../../../api/uploadCloudinary.api";
import { useSettingGeneral, useUpdateSettingGeneral } from "../hooks/useSettings";
import { useServices } from "../../service/hooks/useService";

const PREDEFINED_COLORS = [
    "#00A76F", // Green
    "#8e33ff", // Purple
    "#FFAB00", // Orange
    "#FF5630", // Red
    "#00B8D9", // Cyan
    "#2196f3", // Blue
    "#FF4842", // Light Red
    "#74CAFB", // Sky Blue
    "#1890FF", // Bright Blue
    "#54D62C", // Lime Green
];

export const GeneralSettingTab = () => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: initialData, isLoading: isSettingsLoading } = useSettingGeneral();
    const { data: services = [], isLoading: isServicesLoading } = useServices();
    const { mutate: updateSettings } = useUpdateSettingGeneral();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { isSubmitting }
    } = useForm<SettingGeneralFormValues>({
        resolver: zodResolver(settingGeneralSchema),
        defaultValues: {
            websiteName: "",
            logo: "",
            phone: "",
            email: "",
            address: "",
            copyright: "",
            defaultPassword: "password123",
            facebook: "",
            instagram: "",
            youtube: "",
            serviceColors: []
        },
    });

    useEffect(() => {
        if (initialData && services.length > 0) {
            const mergedServiceColors = services.map((service: any) => {
                const existingColor = initialData.serviceColors?.find(
                    (sc: any) => sc.serviceId === service._id || sc.serviceId === service.id
                );
                return {
                    serviceId: service._id || service.id,
                    serviceName: service.name,
                    color: existingColor ? existingColor.color : PREDEFINED_COLORS[0]
                };
            });

            reset({
                ...initialData,
                serviceColors: mergedServiceColors
            });
        }
    }, [initialData, services, reset]);

    const { fields } = useFieldArray({
        control,
        name: "serviceColors",
    });

    const logo = watch("logo");

    const handleOpenFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Định dạng file không hợp lệ. Vui lòng chọn *.jpeg, *.jpg, *.png, hoặc *.gif");
            event.target.value = "";
            return;
        }

        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("Dung lượng file quá lớn. Tối đa là 3 Mb");
            event.target.value = "";
            return;
        }

        try {
            setIsUploading(true);
            const [url] = await uploadImagesToCloudinary([file]);
            setValue("logo", url, { shouldValidate: true });
            toast.success("Tải logo thành công!");
        } catch (error) {
            toast.error("Tải logo thất bại!");
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data: any) => {
        const formData = data as SettingGeneralFormValues;
        const formattedData = {
            ...formData,
            serviceColors: formData.serviceColors?.map(sc => ({
                serviceId: sc.serviceId,
                color: sc.color
            }))
        };
        updateSettings(formattedData);
    };

    if (isSettingsLoading || isServicesLoading) return <Typography>Đang tải dữ liệu...</Typography>;

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px', bgcolor: 'white' }}>
                            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700, fontSize: '0.875rem' }}>Logo Website</Typography>
                            <Box
                                onClick={handleOpenFile}
                                sx={{
                                    width: 144,
                                    height: 144,
                                    mx: 'auto',
                                    cursor: 'pointer',
                                    borderRadius: '50%',
                                    border: '1px dashed rgba(145, 158, 171, 0.32)',
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'rgba(145, 158, 171, 0.08)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    '&:hover': { opacity: 0.72 }
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                {logo ? (
                                    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                                        <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        <Box sx={{
                                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            bgcolor: 'rgba(0,0,0,0.4)', opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s', color: 'white'
                                        }}>
                                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Thay đổi</Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Stack spacing={1} alignItems="center" sx={{ color: '#637381' }}>
                                        <Icon icon="solar:camera-add-bold" fontSize={32} />
                                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>{isUploading ? "Đang tải..." : "Tải logo"}</Typography>
                                    </Stack>
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ mt: 3, color: '#919EAB', fontSize: '0.75rem', lineHeight: 1.5 }}>
                                Định dạng cho phép *.jpeg, *.jpg, *.png, *.gif
                                <br />
                                Dung lượng tối đa 3 Mb
                            </Typography>
                        </Card>

                        <Card sx={{ p: 4, borderRadius: '16px', bgcolor: 'white' }}>
                            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700, fontSize: '0.875rem' }}>Màu sắc Dịch vụ</Typography>
                            <Stack spacing={3} sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                                {fields.map((field, index) => (
                                    <Stack key={field.id} direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1C252E' }}>
                                            {(field as any).serviceName}
                                        </Typography>

                                        <Controller
                                            name={`serviceColors.${index}.color`}
                                            control={control}
                                            render={({ field: fieldProp }) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '140px', justifyContent: 'flex-end' }}>
                                                    {PREDEFINED_COLORS.map((color) => {
                                                        const isSelected = fieldProp.value === color;
                                                        return (
                                                            <Tooltip key={color} title={color} arrow>
                                                                <Box
                                                                    onClick={() => fieldProp.onChange(color)}
                                                                    sx={{
                                                                        width: 20,
                                                                        height: 20,
                                                                        borderRadius: '50%',
                                                                        bgcolor: color,
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: isSelected ? '2px solid #1C252E' : '2px solid transparent',
                                                                        transition: 'all 0.2s',
                                                                        '&:hover': { transform: 'scale(1.2)' }
                                                                    }}
                                                                >
                                                                    {isSelected && (
                                                                        <Icon icon="eva:checkmark-fill" color="white" width={10} height={10} />
                                                                    )}
                                                                </Box>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        />
                                    </Stack>
                                ))}
                            </Stack>
                        </Card>

                        <Card sx={{ p: 4, borderRadius: '16px', bgcolor: 'white' }}>
                            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700, fontSize: '0.875rem' }}>Quản lý Giống</Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: '#637381', fontSize: '0.8125rem' }}>
                                Quản lý danh sách giống chó và mèo được gợi ý khi khách hàng thêm thú cưng mới.
                            </Typography>
                            <Button
                                component={Link}
                                to="/admin/service/breed/list"
                                fullWidth
                                variant="outlined"
                                startIcon={<Icon icon="solar:pets-bold" />}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    py: 1.5,
                                    borderColor: '#919EAB52',
                                    color: '#1C252E',
                                    '&:hover': {
                                        borderColor: '#1C252E',
                                        bgcolor: 'rgba(28, 37, 46, 0.04)'
                                    }
                                }}
                            >
                                Quản lý ngay
                            </Button>
                        </Card>
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ p: 4, borderRadius: '16px', bgcolor: 'white' }}>
                        <Typography variant="subtitle1" sx={{ mb: 4, fontWeight: 700, fontSize: '0.875rem' }}>Thông tin chung</Typography>

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="websiteName"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Tên Website" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Số điện thoại" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Email liên hệ" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="defaultPassword"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Mật khẩu mặc định" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Địa chỉ" fullWidth multiline rows={2} error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="copyright"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Bản quyền (Copyright)" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                            </Grid>
                        </Grid>


                        <Box sx={{ mt: 5 }}>
                            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700, fontSize: '0.875rem' }}>Mạng xã hội</Typography>
                            <Stack spacing={3}>
                                <Controller
                                    name="facebook"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Facebook URL" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                                <Controller
                                    name="instagram"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Instagram URL" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                                <Controller
                                    name="youtube"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField {...field} label="Youtube URL" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                            </Stack>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isSubmitting}
                                sx={{
                                    bgcolor: '#00A76F',
                                    color: 'white',
                                    '&:hover': { bgcolor: '#008b5e' },
                                    minWidth: 140,
                                    height: 48,
                                    fontSize: '0.9375rem',
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    textTransform: 'none'
                                }}
                            >
                                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                            </Button>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </form>
    );
};
