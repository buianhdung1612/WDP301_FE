import { Box, createTheme, FormControl, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField, ThemeProvider, useTheme, Button, Checkbox, FormControlLabel, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Divider } from "@mui/material"
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "../../components/ui/Breadcrumb"
import { Title } from "../../components/ui/Title"
import { useState, useMemo, useEffect, type Dispatch, type SetStateAction } from "react"
import { Tiptap } from "../../components/layouts/titap/Tiptap"
import { UploadFiles } from "../../components/ui/UploadFiles"
import { CollapsibleCard } from "../../components/ui/CollapsibleCard"
import { prefixAdmin } from "../../constants/routes";
import { CategoryTreeSelectGeneric } from "../../components/ui/CategoryTreeSelectGeneric";
import { useCreateProductData, useCreateProduct } from "./hooks/useProduct";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "../../schemas/product.schema";
import { LoadingButton } from "../../components/ui/LoadingButton";

interface CustomFile extends File {
    preview: string;
}

interface VariantAttribute {
    attrId: string;
    attrType: string;
    label: string;
    value: string;
}

interface Variant {
    id: string;
    attributeValue: VariantAttribute[];
    priceOld: string;
    priceNew: string;
    stock: string;
    status: boolean;
}

export const ProductCreatePage = () => {
    const { t } = useTranslation();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { }
    } = useForm<any>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            name: "",
            description: "",
            content: "",
            position: "",
            priceOld: "",
            priceNew: "",
            stock: "",
            images: [],
            status: "active",
            category: [],
            attributes: [],
            variants: [],
        },
    });

    const [resetKey, setResetKey] = useState(0);
    const [expandedDetail, setExpandedDetail] = useState(true);
    const [expandedExtra, setExpandedExtra] = useState(true);
    const [expandedPrice, setExpandedPrice] = useState(true);
    const [expandedVariants, setExpandedVariants] = useState(true);

    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const [files, setFiles] = useState<CustomFile[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    const { data: createData } = useCreateProductData();
    const { mutate: create, isPending } = useCreateProduct();

    const attributes = createData?.attributeList || [];
    const nestedCategories = createData?.categoryList || [];

    const outerTheme = useTheme();

    const localTheme = useMemo(() => createTheme(outerTheme, {
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none !important",
                        backdropFilter: "none !important",
                        backgroundColor: "var(--palette-background-paper) !important",
                        boxShadow: "var(--customShadows-card)",
                        borderRadius: "var(--shape-borderRadius-lg)",
                        color: "var(--palette-text-primary)",
                    },
                }
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        backgroundColor: "var(--palette-background-neutral)",
                        "& .MuiTableCell-root": {
                            fontWeight: 600,
                            color: "var(--palette-text-secondary)",
                            fontSize: "1rem",
                        }
                    }
                }
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        fontSize: "1rem",
                    }
                }
            },
            MuiTypography: {
                styleOverrides: {
                    root: {
                        fontSize: "1rem",
                    },
                    subtitle1: {
                        fontSize: "1rem",
                        fontWeight: 600,
                    },
                    subtitle2: {
                        fontSize: "1rem",
                        fontWeight: 600,
                    }
                }
            },
            MuiFormControlLabel: {
                styleOverrides: {
                    label: {
                        fontSize: "1rem",
                    }
                }
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        fontSize: "1rem",
                    }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        fontSize: "1rem",
                    }
                }
            }
        }
    }), [outerTheme]);

    useEffect(() => {
        setValue("images", files);
    }, [files, setValue]);

    useEffect(() => {
        setValue("variants", variants);
        // Calculate total stock if variants exist
        if (variants.length > 0) {
            const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
            setValue("stock", String(totalStock));
        }
    }, [variants, setValue]);

    const selectedAttributeIds = watch("attributes") || [];

    const handleToggleAttribute = (id: string) => {
        const next = selectedAttributeIds.includes(id)
            ? selectedAttributeIds.filter(attrId => attrId !== id)
            : [...selectedAttributeIds, id];
        setValue("attributes", next);

        if (next.length === 0) {
            setVariants([]);
        }
    };

    const generateVariants = () => {
        const selectedAttrs = attributes.filter((attr: any) => selectedAttributeIds.includes((attr.id || attr._id).toString()));
        if (selectedAttrs.length === 0) return;

        const cartesian = (arrays: any[][]): any[][] => {
            return arrays.reduce((a, b) =>
                a.flatMap(d => b.map(e => [d, e].flat()))
                , [[]]);
        };

        const attrValues = selectedAttrs.map((attr: any) =>
            (attr.options || []).map((opt: any) => ({
                attrId: (attr.id || attr._id).toString(),
                attrType: attr.type,
                label: opt.label,
                value: opt.value
            }))
        );

        const combinations = cartesian(attrValues);
        const priceOldField = watch("priceOld");
        const priceNewField = watch("priceNew");

        const newVariants: Variant[] = combinations.map((combo, index) => ({
            id: `v-${Date.now()}-${index}`,
            attributeValue: combo,
            priceOld: String(priceOldField),
            priceNew: String(priceNewField),
            stock: "0",
            status: true
        }));

        setVariants(newVariants);
    };

    const handleUpdateVariant = (id: string, field: keyof Variant, value: any) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const onSubmit = (data: any) => {
        const payload = {
            ...data,
            category: JSON.stringify(data.category),
            variants: JSON.stringify(data.variants.map(v => ({
                status: v.status,
                attributeValue: v.attributeValue,
                priceOld: v.priceOld,
                priceNew: v.priceNew,
                stock: v.stock
            }))),
            attributes: JSON.stringify(data.attributes),
            images: JSON.stringify(data.images.map((f: any) => f.name || f)),
            priceOld: String(data.priceOld),
            priceNew: String(data.priceNew),
            stock: String(data.stock),
            position: String(data.position)
        };

        console.log(">>> Product Data to Create:", payload);

        create(payload, {
            onSuccess: (res) => {
                if (res.success) {
                    toast.success(res.message || "Tạo sản phẩm thành công!");
                    reset({
                        name: "",
                        description: "",
                        content: "",
                        position: "",
                        priceOld: "",
                        priceNew: "",
                        stock: "",
                        images: [],
                        status: "active",
                        category: [],
                        attributes: [],
                        variants: [],
                    });
                    setFiles([]);
                    setVariants([]);
                    setResetKey(prev => prev + 1);
                } else {
                    toast.error(res.message || "Tạo sản phẩm thất bại");
                }
            },
            onError: (err: any) => {
                toast.error(err?.message || "Đã xảy ra lỗi khi tạo sản phẩm");
            }
        });
    };

    const onError = (errors: any) => {
        console.log(">>> Validation Errors:", errors);
    };


    return (
        <>
            <div className="mb-[calc(5*var(--spacing))] gap-[calc(2*var(--spacing))] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title={t('admin.product.title.create')} />
                    <Breadcrumb
                        items={[
                            { label: t('admin.dashboard'), to: "/" },
                            { label: t('admin.product.title.list'), to: `/${prefixAdmin}/product/list` },
                            { label: t('admin.common.create') }
                        ]}
                    />
                </div>
            </div>
            <ThemeProvider theme={localTheme}>
                <form onSubmit={handleSubmit(onSubmit, onError)}>
                    <Stack sx={{
                        margin: "0px calc(15 * var(--spacing))",
                        gap: "calc(5 * var(--spacing))",
                        pb: 10
                    }}>
                        <CollapsibleCard
                            title={t('admin.common.details')}
                            subheader={t('admin.common.description')}
                            expanded={expandedDetail}
                            onToggle={toggle(setExpandedDetail)}
                        >
                            <Stack p="calc(3 * var(--spacing))" gap="calc(3 * var(--spacing))">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label={t('admin.product.fields.name')}
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
                                            label={t('admin.common.description')}
                                            multiline
                                            rows={4}
                                            fullWidth
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="content"
                                    control={control}
                                    render={({ field }) => (
                                        <Tiptap
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <UploadFiles
                                    key={resetKey}
                                    files={files}
                                    onFilesChange={(newFiles) => setFiles(newFiles)}
                                />
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title={t('admin.common.attributes')}
                            subheader={t('admin.common.description')}
                            expanded={expandedExtra}
                            onToggle={toggle(setExpandedExtra)}
                        >
                            <Stack p="calc(3 * var(--spacing))" gap="calc(3 * var(--spacing))">
                                <CategoryTreeSelectGeneric
                                    multiple
                                    name="category"
                                    control={control}
                                    categories={nestedCategories}
                                    label={t('admin.product.fields.select_category')}
                                />
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: "calc(3 * var(--spacing)) calc(2 * var(--spacing))",
                                    }}
                                >
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl>
                                                <InputLabel id="status-select-label" sx={{ color: "var(--palette-text-secondary)" }}>{t('admin.common.status')}</InputLabel>
                                                <Select
                                                    {...field}
                                                    labelId="status-select-label"
                                                    input={<OutlinedInput label={t('admin.common.status')} />}
                                                >
                                                    <MenuItem value="draft">{t('admin.product.status.draft')}</MenuItem>
                                                    <MenuItem value="active">{t('admin.product.status.active')}</MenuItem>
                                                    <MenuItem value="inactive">{t('admin.product.status.inactive')}</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />

                                    <Controller
                                        name="position"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label={t('admin.common.position')}
                                                fullWidth
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title={"Giá"}
                            subheader={"Các trường liên quan đến giá"}
                            expanded={expandedPrice}
                            onToggle={toggle(setExpandedPrice)}
                        >
                            <Stack p="calc(3 * var(--spacing))" gap="calc(3 * var(--spacing))">
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: "calc(3 * var(--spacing))" }}>
                                    <Controller
                                        name="priceOld"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label={"Giá gốc"}
                                                fullWidth
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="priceNew"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label={"Giá mới"}
                                                fullWidth
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </Box>
                                <Controller
                                    name="stock"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label={"Còn lại"}
                                            fullWidth
                                            disabled={variants.length > 0}
                                            error={!!fieldState.error}
                                            helperText={variants.length > 0 ? "Tổng từ các biến thể" : fieldState.error?.message}
                                        />
                                    )}
                                />
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title={"Biến thể sản phẩm"}
                            subheader={"Tạo các biến thể dựa trên thuộc tính"}
                            expanded={expandedVariants}
                            onToggle={toggle(setExpandedVariants)}
                        >
                            <Stack p="calc(3 * var(--spacing))" gap="calc(3 * var(--spacing))">
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Danh sách thuộc tính</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {attributes.map((attr: any) => {
                                            const attrId = (attr.id || attr._id).toString();
                                            return (
                                                <FormControlLabel
                                                    key={attrId}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedAttributeIds.includes(attrId)}
                                                            onChange={() => handleToggleAttribute(attrId)}
                                                        />
                                                    }
                                                    label={attr.name}
                                                />
                                            );
                                        })}
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{ mt: 2, textTransform: 'none', borderRadius: "var(--shape-borderRadius)", fontWeight: 600, fontSize: '0.875rem' }}
                                        onClick={generateVariants}
                                    >
                                        Tạo biến thể
                                    </Button>
                                </Box>

                                {selectedAttributeIds.length > 0 && variants.length > 0 && (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Danh sách biến thể</Typography>
                                            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--palette-text-disabled)33', borderRadius: "var(--shape-borderRadius-lg)", overflow: 'hidden' }}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell width={80}>Trạng thái</TableCell>
                                                            {/* Dynamic columns based on selected attributes */}
                                                            {attributes.filter((a: any) => selectedAttributeIds.includes((a.id || a._id).toString())).map((a: any) => (
                                                                <TableCell key={(a.id || a._id).toString()}>{a.name}</TableCell>
                                                            ))}
                                                            <TableCell>Giá cũ</TableCell>
                                                            <TableCell>Giá mới</TableCell>
                                                            <TableCell>Còn lại</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {variants.map((v) => (
                                                            <TableRow key={v.id}>
                                                                <TableCell>
                                                                    <Switch
                                                                        size="small"
                                                                        checked={v.status}
                                                                        onChange={(e) => handleUpdateVariant(v.id, 'status', e.target.checked)}
                                                                        color="success"
                                                                    />
                                                                </TableCell>
                                                                {v.attributeValue.map((attr, idx) => (
                                                                    <TableCell key={idx}>
                                                                        <Typography sx={{ fontSize: '0.875rem' }}>{attr.label}</Typography>
                                                                    </TableCell>
                                                                ))}
                                                                <TableCell>
                                                                    <TextField size="small" placeholder="0" value={v.priceOld} onChange={(e) => handleUpdateVariant(v.id, 'priceOld', e.target.value)} />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField size="small" placeholder="0" value={v.priceNew} onChange={(e) => handleUpdateVariant(v.id, 'priceNew', e.target.value)} />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <TextField size="small" placeholder="0" value={v.stock} onChange={(e) => handleUpdateVariant(v.id, 'stock', e.target.value)} />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </CollapsibleCard>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: "calc(2 * var(--spacing))" }}>
                            <LoadingButton
                                type="submit"
                                loading={isPending}
                                label={t('admin.product.title.create')}
                                loadingLabel="Đang xử lý..."
                            />
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    )
}



