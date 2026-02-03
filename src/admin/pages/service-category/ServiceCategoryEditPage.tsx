import { Box, Stack, TextField, ThemeProvider, useTheme, Button, MenuItem, FormControl, InputLabel, Select, Chip, OutlinedInput, CircularProgress } from "@mui/material"
import { Breadcrumb } from "../../components/ui/Breadcrumb"
import { Title } from "../../components/ui/Title"
import { Tiptap } from "../../components/layouts/titap/Tiptap"
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useUpdateServiceCategory, useNestedServiceCategories, useServiceCategoryDetail } from "./hooks/useServiceCategory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { serviceCategorySchema, ServiceCategoryFormValues } from "../../schemas/service-category.schema";
import { getServiceCategoryTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { FormUploadSingleFile } from "../../components/upload/FormUploadSingleFile";
import { toast } from "react-toastify";
import { CategoryParentSelect } from "../../components/ui/CategoryTreeSelect";
import { SwitchButton } from "../../components/ui/SwitchButton";
import { useParams, useNavigate } from "react-router-dom";

const PET_TYPES = ["DOG", "CAT"];
const BOOKING_TYPES = [
    { value: 'HOTEL', label: 'Khách sạn' },
    { value: 'STANDALONE', label: 'Dịch vụ lẻ' },
    { value: 'BOTH', label: 'Cả hai' },
];

export const ServiceCategoryEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expandedDetail, setExpandedDetail] = useState(true);
    const [expandedConfig, setExpandedConfig] = useState(true);

    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getServiceCategoryTheme(outerTheme);

    const { data: category, isLoading: isFetching } = useServiceCategoryDetail(id);
    const { data: nestedCategories = [] } = useNestedServiceCategories();
    const { mutate: update, isPending } = useUpdateServiceCategory();

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

    useEffect(() => {
        if (category) {
            reset({
                name: category.name || "",
                slug: category.slug || "",
                description: category.description || "",
                parentId: category.parentId || "",
                status: category.status || "active",
                avatar: category.avatar || "",
                bookingTypes: category.bookingTypes || "STANDALONE",
                petTypes: category.petTypes || ["DOG", "CAT"],
            });
        }
    }, [category, reset]);

    const onSubmit = (data: ServiceCategoryFormValues) => {
        update({ id: id as string, data }, {
            onSuccess: (response) => {
                if (response.code === 200 || response.success) {
                    toast.success("Cập nhật danh mục thành công!");
                    navigate(`/${prefixAdmin}/service/categories`);
                } else {
                    toast.error(response.message || "Cập nhật thất bại");
                }
            },
            onError: () => {
                toast.error("Cập nhật danh mục thất bại");
            }
        });
    };

    if (isFetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Chỉnh sửa danh mục dịch vụ" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Danh mục dịch vụ", to: `/${prefixAdmin}/service/categories` },
                            { label: "Chỉnh sửa" }
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
                                        categories={nestedCategories.filter((c: any) => c._id !== id)}
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
                                {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    );
};
