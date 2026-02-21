import { Box, Stack, TextField, ThemeProvider, useTheme, MenuItem, Select, FormControl, InputLabel } from "@mui/material"
import { Breadcrumb } from "../../components/ui/Breadcrumb"
import { Title } from "../../components/ui/Title"
import { useState, type Dispatch, type SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useCreateCoupon } from "./hooks/useCoupon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { createCouponSchema } from "../../schemas/coupon.schema";
import { getCouponTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { LoadingButton } from "../../components/ui/LoadingButton";

export const CouponCreatePage = () => {
    const [expandedDetail, setExpandedDetail] = useState(true);
    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getCouponTheme(outerTheme);

    const {
        control,
        handleSubmit,
        reset,
        watch
    } = useForm<any>({
        resolver: zodResolver(createCouponSchema),
        defaultValues: {
            code: "",
            name: "",
            description: "",
            typeDiscount: "percentage",
            value: 0,
            minOrderValue: 0,
            maxDiscountValue: 0,
            usageLimit: 0,
            startDate: "",
            endDate: "",
            typeDisplay: "private",
            status: "inactive",
        },
    });

    const typeDiscount = watch("typeDiscount");

    const { mutate: create, isPending } = useCreateCoupon();

    const onSubmit = (data: any) => {
        create(data, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(response.message || "Tạo mã giảm giá thành công");
                    reset({
                        code: "",
                        name: "",
                        description: "",
                        typeDiscount: "percentage",
                        value: 0,
                        minOrderValue: 0,
                        maxDiscountValue: 0,
                        usageLimit: 0,
                        startDate: "",
                        endDate: "",
                        typeDisplay: "private",
                        status: "inactive",
                    });
                } else {
                    toast.error(response.message);
                }
            },
            onError: () => {
                toast.error("Tạo mã giảm giá thất bại");
            }
        });
    };

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Tạo mới mã giảm giá" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Mã giảm giá", to: `/${prefixAdmin}/coupon/list` },
                            { label: "Tạo mới" }
                        ]}
                    />
                </div>
            </div>
            <ThemeProvider theme={localTheme}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack sx={{
                        margin: "0px 120px",
                        gap: "40px"
                    }}>
                        <CollapsibleCard
                            title="Thông tin cơ bản"
                            subheader="Mã, tên, mô tả..."
                            expanded={expandedDetail}
                            onToggle={toggle(setExpandedDetail)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: "24px 16px",
                                    }}
                                >
                                    <Controller
                                        name="code"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Mã giảm giá"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Tên mã giảm giá"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </Box>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Mô tả"
                                            multiline
                                            rows={3}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title="Cấu hình giảm giá"
                            subheader="Loại giảm giá, giá trị, giới hạn..."
                            expanded={true}
                            onToggle={() => { }}
                        >
                            <Stack p="24px" gap="24px">
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: "24px 16px",
                                    }}
                                >
                                    <Controller
                                        name="typeDiscount"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Loại giảm giá</InputLabel>
                                                <Select {...field} label="Loại giảm giá">
                                                    <MenuItem value="percentage">Phần trăm (%)</MenuItem>
                                                    <MenuItem value="fixed">Số tiền cố định (VNĐ)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                    <Controller
                                        name="value"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label={typeDiscount === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
                                                type="number"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="minOrderValue"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Đơn hàng tối thiểu (VNĐ)"
                                                type="number"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="maxDiscountValue"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Giảm tối đa (VNĐ)"
                                                type="number"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="usageLimit"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Số lần sử dụng tối đa"
                                                type="number"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="typeDisplay"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Hiển thị</InputLabel>
                                                <Select {...field} label="Hiển thị">
                                                    <MenuItem value="public">Công khai</MenuItem>
                                                    <MenuItem value="private">Riêng tư</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title="Thời gian hiệu lực"
                            subheader="Ngày bắt đầu và kết thúc"
                            expanded={true}
                            onToggle={() => { }}
                        >
                            <Stack p="24px" gap="24px">
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: "24px 16px",
                                    }}
                                >
                                    <Controller
                                        name="startDate"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Ngày bắt đầu (DD/MM/YYYY)"
                                                placeholder="01/01/2026"
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="endDate"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Ngày kết thúc (DD/MM/YYYY)"
                                                placeholder="31/12/2026"
                                            />
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        <Box gap="24px" sx={{ display: "flex", alignItems: "center" }}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Trạng thái"
                                        SelectProps={{ native: true }}
                                        variant="outlined"
                                        sx={{ minWidth: 150 }}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Tạm ẩn</option>
                                    </TextField>
                                )}
                            />
                            <LoadingButton
                                type="submit"
                                loading={isPending}
                                label="Tạo mã giảm giá"
                                loadingLabel="Đang tạo..."
                                sx={{ minHeight: "3rem", minWidth: "4rem" }}
                            />
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>

        </>
    )
}
