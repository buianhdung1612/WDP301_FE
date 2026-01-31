import { Box, Stack, TextField, ThemeProvider, useTheme, Button, CircularProgress } from "@mui/material";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { Tiptap } from "../../components/layouts/titap/Tiptap";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useProductCategoryDetail, useNestedProductCategories, useUpdateProductCategory } from "./hooks/useProductCategory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { createCategorySchema, CreateCategoryFormValues } from "../../schemas/product-category.schema";
import { SwitchButton } from "../../components/ui/SwitchButton";
import { getProductCategoryTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { FormUploadSingleFile } from "../../components/upload/FormUploadSingleFile";
import { toast } from "react-toastify";
import { CategoryParentSelect } from "../../components/ui/CategoryTreeSelect";
import { useParams } from "react-router-dom";

export const ProductCategoryEditPage = () => {
    const { id } = useParams();
    const [expandedDetail, setExpandedDetail] = useState(true);

    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getProductCategoryTheme(outerTheme);

    const { data: detailRes, isLoading: isLoadingDetail } = useProductCategoryDetail(id);
    const { data: nestedCategories = [] } = useNestedProductCategories();

    const { mutate: update, isPending: isUpdating } = useUpdateProductCategory();

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<CreateCategoryFormValues>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            name: "",
            description: "",
            parent: "",
            status: "active",
            avatar: "",
        },
    });

    // 3. Đổ dữ liệu vào Form khi có dữ liệu từ Detail API
    useEffect(() => {
        if (detailRes && detailRes._id) {
            const detail = detailRes;
            reset({
                name: detail.name || "",
                description: detail.description || "",
                // Convert sang string để Select Component nhận diện đúng
                // Xử lý trường hợp parent là object (populated) hoặc string (id)
                parent: detail.parent
                    ? (typeof detail.parent === 'object' ? (detail.parent as any)._id : String(detail.parent))
                    : "",
                status: detail.status,
                avatar: detail.avatar || "",
            });
        }
    }, [detailRes, reset]);

    const onSubmit = (data: CreateCategoryFormValues) => {
        // Gom dữ liệu form + categoryId để gửi lên (Backend dùng chung POST để Edit)
        const payload = {
            ...data,
            parent: data.parent === "" ? null : data.parent
        };

        update({ id: id!, data: payload }, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(response.message || "Cập nhật danh mục thành công");
                } else {
                    toast.error(response.message);
                }
            },
            onError: () => {
                toast.error("Có lỗi xảy ra trong quá trình cập nhật");
            }
        });
    };

    // Hiển thị loading khi đang tải dữ liệu ban đầu
    if (isLoadingDetail) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Chỉnh sửa danh mục sản phẩm" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Danh mục sản phẩm", to: `/${prefixAdmin}/product-category/list` },
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
                            subheader="Cập nhật tiêu đề, mô tả và hình ảnh danh mục"
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
                                                fullWidth
                                            />
                                        )}
                                    />
                                    <CategoryParentSelect
                                        control={control}
                                        categories={nestedCategories}
                                        excludedId={id}
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

                        <Box gap="24px" sx={{ display: "flex", alignItems: "center" }}>
                            <SwitchButton
                                control={control}
                                name="status"
                                checkedValue="active"
                                uncheckedValue="inactive"
                            />

                            <Button
                                type="submit"
                                disabled={isUpdating}
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
                                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật danh mục'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    );
};
