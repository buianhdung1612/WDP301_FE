import { Box, Stack, TextField, ThemeProvider, useTheme, Button, MenuItem, FormControl, InputLabel, Select, Chip, OutlinedInput, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress } from "@mui/material"
import { Breadcrumb } from "../../components/ui/Breadcrumb"
import { Title } from "../../components/ui/Title"
import { Tiptap } from "../../components/layouts/titap/Tiptap"
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useUpdateService, useServiceDetail } from "./hooks/useService";
import { useNestedServiceCategories } from "../service-category/hooks/useServiceCategory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { serviceSchema, ServiceFormValues } from "../../schemas/service.schema";
import { getServiceTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { SwitchButton } from "../../components/ui/SwitchButton";
import { CategoryParentSelect } from "../../components/ui/CategoryTreeSelect";
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useParams, useNavigate } from "react-router-dom";

const PET_TYPES = ["DOG", "CAT"];
const PRICING_TYPES = [
    { value: 'fixed', label: 'Cố định' },
    { value: 'by-weight', label: 'Theo cân nặng' },
];

export const ServiceEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expandedDetail, setExpandedDetail] = useState(true);
    const [expandedPricing, setExpandedPricing] = useState(true);

    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getServiceTheme(outerTheme);

    const { data: service, isLoading: isFetching } = useServiceDetail(id);
    const { data: categories = [] } = useNestedServiceCategories();
    const { mutate: update, isPending } = useUpdateService();

    const {
        control,
        handleSubmit,
        watch,
        reset
    } = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            categoryId: "",
            duration: 30,
            petTypes: ["DOG", "CAT"],
            pricingType: "fixed",
            basePrice: 0,
            priceList: [{ label: "", value: 0 }],
            status: "active",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "priceList"
    });

    const pricingType = watch("pricingType");

    useEffect(() => {
        if (service) {
            reset({
                name: service.name || "",
                slug: service.slug || "",
                description: service.description || "",
                categoryId: service.categoryId || "",
                duration: service.duration || 30,
                petTypes: service.petTypes || ["DOG", "CAT"],
                pricingType: service.pricingType || "fixed",
                basePrice: service.basePrice || 0,
                priceList: (service.priceList && service.priceList.length > 0) ? service.priceList : [{ label: "", value: 0 }],
                status: service.status || "active",
            });
        }
    }, [service, reset]);

    const onSubmit = (data: ServiceFormValues) => {
        update({ id: id as string, data }, {
            onSuccess: (response) => {
                if (response.code === 200 || response.success) {
                    toast.success("Cập nhật dịch vụ thành công!");
                    navigate(`/${prefixAdmin}/service/list`);
                } else {
                    toast.error(response.message || "Cập nhật thất bại");
                }
            },
            onError: () => {
                toast.error("Cập nhật dịch vụ thất bại");
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
                    <Title title="Chỉnh sửa dịch vụ" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Dịch vụ", to: `/${prefixAdmin}/service/list` },
                            { label: "Chỉnh sửa" }
                        ]}
                    />
                </div>
            </div>
            <ThemeProvider theme={localTheme}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack sx={{ margin: "0px 120px", gap: "40px" }}>
                        <CollapsibleCard
                            title="Thông tin cơ bản"
                            subheader="Tên, mô tả, danh mục..."
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
                                                label="Tên dịch vụ"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <CategoryParentSelect
                                        control={control}
                                        name="categoryId"
                                        label="Danh mục"
                                        categories={categories}
                                    />
                                    <Controller
                                        name="duration"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="Thời lượng (phút)"
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
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
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title="Giá dịch vụ"
                            subheader="Cấu hình giá cố định hoặc theo cân nặng"
                            expanded={expandedPricing}
                            onToggle={toggle(setExpandedPricing)}
                        >
                            <Stack p="24px" gap="24px">
                                <Controller
                                    name="pricingType"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth>
                                            <InputLabel>Loại giá</InputLabel>
                                            <Select {...field} label="Loại giá">
                                                {PRICING_TYPES.map(type => (
                                                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                />

                                {pricingType === 'fixed' ? (
                                    <Controller
                                        name="basePrice"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="Giá cố định (VNĐ)"
                                                fullWidth
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        )}
                                    />
                                ) : (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="subtitle2">Bảng giá theo quy mô/cân nặng</Typography>
                                            <Button startIcon={<AddIcon />} onClick={() => append({ label: '', value: 0 })}>Thêm mức</Button>
                                        </Box>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontSize: '1.3rem' }}>Mô tả (VD: Dưới 5kg)</TableCell>
                                                    <TableCell sx={{ fontSize: '1.3rem' }}>Giá (VNĐ)</TableCell>
                                                    <TableCell width={50}></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {fields.map((field, index) => (
                                                    <TableRow key={field.id}>
                                                        <TableCell>
                                                            <Controller
                                                                name={`priceList.${index}.label`}
                                                                control={control}
                                                                render={({ field }) => <TextField {...field} fullWidth size="small" />}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Controller
                                                                name={`priceList.${index}.value`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <TextField
                                                                        {...field}
                                                                        type="number"
                                                                        fullWidth
                                                                        size="small"
                                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                                    />
                                                                )}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton color="error" onClick={() => remove(index)}><DeleteIcon /></IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
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
