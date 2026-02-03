import { Box, Stack, TextField, ThemeProvider, useTheme, Button, MenuItem, FormControl, InputLabel, Select, Chip, OutlinedInput } from "@mui/material"
import { Breadcrumb } from "../../components/ui/Breadcrumb"
import { Title } from "../../components/ui/Title"
import { Tiptap } from "../../components/layouts/titap/Tiptap"
import { useState, type Dispatch, type SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useCreateServiceCategory, useNestedServiceCategories } from "./hooks/useServiceCategory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { serviceCategorySchema, ServiceCategoryFormValues } from "../../schemas/service-category.schema";
import { getServiceCategoryTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { FormUploadSingleFile } from "../../components/upload/FormUploadSingleFile";
import { toast } from "react-toastify";
import { CategoryParentSelect } from "../../components/ui/CategoryTreeSelect";
import { SwitchButton } from "../../components/ui/SwitchButton";

const PET_TYPES = ["DOG", "CAT"];
const BOOKING_TYPES = [
    { value: 'HOTEL', label: 'Khách sạn' },
    { value: 'STANDALONE', label: 'Dịch vụ lẻ' },
    { value: 'BOTH', label: 'Cả hai' },
];

export const ServiceCategoryCreatePage = () => {
    const [expandedDetail, setExpandedDetail] = useState(true);
    const [expandedConfig, setExpandedConfig] = useState(true);

    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getServiceCategoryTheme(outerTheme);

    const {
        control,
        handleSubmit,
        reset
    } = useForm<ServiceCategoryFormValues>({
        resolver: zodResolver(serviceCategorySchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            parentId: "",
            status: "active",
            avatar: "",
            bookingTypes: "STANDALONE",
            petTypes: ["DOG", "CAT"],
        },
    });

    const { data: nestedCategories = [] } = useNestedServiceCategories();
    const { mutate: create, isPending } = useCreateServiceCategory();

    const onSubmit = (data: ServiceCategoryFormValues) => {
        console.log(data);
        create(data, {
            onSuccess: (response) => {
                if (response.code === 201 || response.success) {
                    toast.success("Tạo danh mục thành công!");
                    reset();
                } else {
                    toast.error(response.message || "Tạo danh mục thất bại");
                }
            },
            onError: () => {
                toast.error("Tạo danh mục thất bại");
            }
        });
    };

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Tạo mới danh mục dịch vụ" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Danh mục dịch vụ", to: `/${prefixAdmin}/service/categories` },
                            { label: "Tạo mới" }
                        ]}
                    />
                </div>
            </div>
            <ThemeProvider theme={localTheme}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack sx={{ margin: "0px 120px", gap: "40px" }}>
                        <CollapsibleCard
                            title="Chi tiết"
                            subheader="Tiêu đề, mô tả, hình ảnh..."
                            expanded={expandedDetail}
                            onToggle={toggle(setExpandedDetail)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px 16px" }}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Tên danh mục"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <CategoryParentSelect
                                        control={control}
                                        name="parentId"
                                        categories={nestedCategories}
                                    />
                                </Box>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <Tiptap
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <FormUploadSingleFile
                                    name="avatar"
                                    control={control}
                                />
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title="Cấu hình"
                            subheader="Loại đặt chỗ, loại thú cưng..."
                            expanded={expandedConfig}
                            onToggle={toggle(setExpandedConfig)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px 16px" }}>
                                    <Controller
                                        name="bookingTypes"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Loại đặt chỗ</InputLabel>
                                                <Select {...field} label="Loại đặt chỗ">
                                                    {BOOKING_TYPES.map(type => (
                                                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                    <Controller
                                        name="petTypes"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Loại Thú cưng</InputLabel>
                                                <Select
                                                    {...field}
                                                    multiple
                                                    input={<OutlinedInput label="Loại Thú cưng" />}
                                                    renderValue={(selected) => (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {(selected as string[]).map((value) => (
                                                                <Chip key={value} label={value} size="small" />
                                                            ))}
                                                        </Box>
                                                    )}
                                                >
                                                    {PET_TYPES.map((name) => (
                                                        <MenuItem key={name} value={name}>{name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        <Box gap="24px" sx={{ display: "flex", alignItems: "center" }}>
                            <SwitchButton
                                control={control}
                                name="status"
                                checkedValue="active"
                                uncheckedValue="inactive"
                            />
                            <Button
                                type="submit"
                                disabled={isPending}
                                sx={{
                                    background: '#1C252E',
                                    minHeight: "4.8rem",
                                    minWidth: "6.4rem",
                                    fontWeight: 700,
                                    fontSize: "1.4rem",
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    boxShadow: "none",
                                    "&:hover": {
                                        background: "#454F5B",
                                        boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                                    }
                                }}
                                variant="contained"
                            >
                                {isPending ? 'Đang tạo...' : 'Tạo danh mục'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    );
};
