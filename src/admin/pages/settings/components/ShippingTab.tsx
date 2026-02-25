import { Card, TextField, Button, Typography, Box, Stack } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingShippingSchema, SettingShippingFormValues } from "../../../schemas/setting.schema";
import { useSettingShipping, useUpdateSettingShipping } from "../hooks/useSettings";
import { useEffect } from "react";

export const ShippingTab = () => {
    const { data: initialData, isLoading } = useSettingShipping();
    const { mutate: updateSettings } = useUpdateSettingShipping();

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm<SettingShippingFormValues>({
        resolver: zodResolver(settingShippingSchema),
        defaultValues: {
            tokenGoShip: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    const onSubmit = (data: SettingShippingFormValues) => {
        updateSettings(data);
    };

    if (isLoading) return <Typography>Đang tải...</Typography>;

    return (
        <Card sx={{ p: 4, borderRadius: '16px', bgcolor: 'white' }}>
            <Typography variant="subtitle1" sx={{ mb: 4, fontWeight: 700 }}>API hãng vận chuyển</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <Controller
                        name="tokenGoShip"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Token GoShip"
                                fullWidth
                                multiline
                                rows={4}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
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
