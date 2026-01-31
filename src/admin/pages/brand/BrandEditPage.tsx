import { Box, Stack, TextField, ThemeProvider, useTheme, Button, CircularProgress } from "@mui/material";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { Tiptap } from "../../components/layouts/titap/Tiptap";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useBrandDetail, useUpdateBrand } from "./hooks/useBrand";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { createBrandSchema, CreateBrandFormValues } from "../../schemas/brand.schema";
import { SwitchButton } from "../../components/ui/SwitchButton";
import { getBrandTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { FormUploadSingleFile } from "../../components/upload/FormUploadSingleFile";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

export const BrandEditPage = () => {
    const { id } = useParams();
    const [expandedDetail, setExpandedDetail] = useState(true);

    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getBrandTheme(outerTheme);

    const { data: detailRes, isLoading: isLoadingDetail } = useBrandDetail(id);
    const { mutate: update, isPending: isUpdating } = useUpdateBrand();

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<CreateBrandFormValues>({
        resolver: zodResolver(createBrandSchema),
        defaultValues: {
            name: "",
            description: "",
            status: "active",
            avatar: "",
        },
    });

    useEffect(() => {
        if (detailRes) {
            reset({
                name: detailRes.name || "",
                description: detailRes.description || "",
                status: detailRes.status || "active",
                avatar: detailRes.avatar || "",
            });
        }
    }, [detailRes, reset]);

    const onSubmit = (data: CreateBrandFormValues) => {
        update({ id: id!, data }, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(response.message || "Cập nhật thương hiệu thành công");
                } else {
                    toast.error(response.message);
                }
            },
            onError: () => {
                toast.error("Có lỗi xảy ra trong quá trình cập nhật");
            }
        });
    };

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
                    <Title title="Chỉnh sửa thương hiệu" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Thương hiệu", to: `/${prefixAdmin}/brand/list` },
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
                            subheader="Cập nhật tiêu đề, mô tả và hình ảnh thương hiệu"
                            expanded={expandedDetail}
                            onToggle={toggle(setExpandedDetail)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px 16px" }}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Tên thương hiệu"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                                fullWidth
                                            />
                                        )}
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
                                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật thương hiệu'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    );
};
