import { Box, Stack, TextField, ThemeProvider, useTheme, Button, MenuItem, Select, FormControl, InputLabel, FormHelperText, createTheme } from "@mui/material"
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "../../components/ui/Breadcrumb"
import { Title } from "../../components/ui/Title"
import { useState, type Dispatch, type SetStateAction } from "react"
import { Tiptap } from "../../components/layouts/titap/Tiptap"
import { CollapsibleCard } from "../../components/ui/CollapsibleCard"
import { useCreateBlog } from "./hooks/useBlog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { createBlogSchema, CreateBlogFormValues } from "../../schemas/blog.schema"
import { FormUploadSingleFile } from "../../components/upload/FormUploadSingleFile"
import { toast } from "react-toastify"
import { prefixAdmin } from "../../constants/routes"

import { useNestedBlogCategories } from "../blog-category/hooks/useBlogCategory";
import { CategoryTreeSelectGeneric } from "../../components/ui/CategoryTreeSelectGeneric";
import { useBlogTags } from "./hooks/useBlog";

export const BlogCreatePage = () => {
    const { t } = useTranslation();
    const [expandedDetail, setExpandedDetail] = useState(true);
    const [expandedExtra, setExpandedExtra] = useState(true);
    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();

    const localTheme = createTheme(outerTheme, {
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none !important",
                        backdropFilter: "none !important",
                        backgroundColor: "#fff !important",
                        boxShadow: "0 0 2px 0 #919eab33, 0 12px 24px -4px #919eab1f",
                        borderRadius: "16px",
                        color: "#1C252E",
                    },
                }
            },
            MuiAutocomplete: {
                styleOverrides: {
                    listbox: {
                        padding: 0,
                    },
                    option: {
                        fontSize: '1.4rem',
                        padding: '6px',
                        marginBottom: '4px',
                        borderRadius: '6px',
                    },
                },
            },
        }
    });

    const { data: blogCategories = [] } = useNestedBlogCategories();
    const { data: availableTags = [] } = useBlogTags();
    const { mutate: create, isPending } = useCreateBlog();

    const {
        control,
        handleSubmit,
        reset,
    } = useForm<CreateBlogFormValues>({
        resolver: zodResolver(createBlogSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            content: "",
            avatar: "",
            category: [],
            status: "draft",
        },
    });

    const onSubmit = (data: CreateBlogFormValues) => {
        // Map string IDs to what API expects.
        // BE expects "category" as a JSON string of array of strings, e.g. "[\"id1\"]" 
        // OR simply an array of strings if using non-form-data JSON body.
        // Given existing patterns, we likely need to send it compatible with what controller expects.
        // Controller: req.body.category = JSON.parse(req.body.category); -> implies it receives a stringified JSON.

        const payload = {
            ...data,
            category: JSON.stringify(data.category)
        };

        create(payload, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(response.message || "Tạo bài viết thành công");
                    reset();
                } else {
                    toast.error(response.message);
                }
            },
            onError: () => {
                toast.error("Tạo bài viết thất bại");
            }
        });
    };

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title={t("admin.blog.title.create")} />
                    <Breadcrumb
                        items={[
                            { label: t("admin.dashboard"), to: "/" },
                            { label: t("admin.blog.title.list"), to: `/${prefixAdmin}/blog/list` },
                            { label: t("admin.common.create") }
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
                            title={t("admin.common.details")}
                            subheader={t("admin.common.description")}
                            expanded={expandedDetail}
                            onToggle={toggle(setExpandedDetail)}
                        >
                            <Stack p="24px" gap="24px">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label={t("admin.blog.fields.title")}
                                            fullWidth
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label={t("admin.blog.fields.excerpt")}
                                            multiline
                                            rows={4}
                                            fullWidth
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={{}}
                                        />
                                    )}
                                />
                                <Controller
                                    name="content"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Box>
                                            <Tiptap
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                            {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
                                        </Box>
                                    )}
                                />
                                <FormUploadSingleFile
                                    name="avatar"
                                    control={control}
                                />
                            </Stack>
                        </CollapsibleCard>
                        <CollapsibleCard
                            title={t("admin.common.attributes")}
                            subheader={t("admin.common.description")}
                            expanded={expandedExtra}
                            onToggle={toggle(setExpandedExtra)}
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
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel id="status-select-label">{t("admin.common.status")}</InputLabel>
                                                <Select
                                                    {...field}
                                                    labelId="status-select-label"
                                                    label={t("admin.common.status")}
                                                >
                                                    <MenuItem value="draft">{t("admin.blog.status.draft")}</MenuItem>
                                                    <MenuItem value="published">{t("admin.blog.status.published")}</MenuItem>
                                                    <MenuItem value="archived">{t("admin.blog.status.archived")}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                    <CategoryTreeSelectGeneric
                                        control={control}
                                        categories={blogCategories}
                                        name="category"
                                        label={t("admin.blog.fields.category")}
                                        placeholder={t("admin.blog.fields.select_category")}
                                        multiple={true}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>
                        <Box gap="24px" sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
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
                                {isPending ? t('admin.common.processing') : t('admin.blog.title.create')}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>

        </>
    )
}