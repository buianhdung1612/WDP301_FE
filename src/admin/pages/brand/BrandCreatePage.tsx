import { Box, Stack, TextField, ThemeProvider, useTheme, Button } from "@mui/material"
import { Breadcrumb } from "../../components/ui/Breadcrumb"
import { Title } from "../../components/ui/Title"
import { Tiptap } from "../../components/layouts/titap/Tiptap"
import { useState, type Dispatch, type SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useCreateBrand } from "./hooks/useBrand";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { CreateBrandFormValues, createBrandSchema } from "../../schemas/brand.schema";
import { SwitchButton } from "../../components/ui/SwitchButton";
import { getBrandTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { FormUploadSingleFile } from "../../components/upload/FormUploadSingleFile";
import { toast } from "react-toastify";

export const BrandCreatePage = () => {
    const [expandedDetail, setExpandedDetail] = useState(true);
    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getBrandTheme(outerTheme);

    const {
        control,
        handleSubmit,
        reset
    } = useForm<CreateBrandFormValues>({
        resolver: zodResolver(createBrandSchema),
        defaultValues: {
            name: "",
            description: "",
            status: "active",
            avatar: "",
        },
    });

    const { mutate: create, isPending } = useCreateBrand();

    const onSubmit = (data: CreateBrandFormValues) => {
        create(data, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(response.message || "Tạo thương hiệu thành công");
                    reset({
                        name: "",
                        description: "",
                        status: "active",
                        avatar: "",
                    });
                } else {
                    toast.error(response.message);
                }
            },
            onError: () => {
                toast.error("Tạo thương hiệu thất bại");
            }
        });
    };

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Tạo mới thương hiệu" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Thương hiệu", to: `/${prefixAdmin}/brand/list` },
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
                            title="Chi tiết"
                            subheader="Tiêu đề, mô tả, hình ảnh..."
                            expanded={expandedDetail}
                            onToggle={toggle(setExpandedDetail)}
                        >
                            <Stack p="24px" gap="24px">
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr",
                                        gap: "24px 16px",
                                    }}
                                >
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Tên thương hiệu"
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
                                {isPending ? 'Đang tạo...' : 'Tạo thương hiệu'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>

        </>
    )
}
