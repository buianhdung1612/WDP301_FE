import { Box, Stack, TextField, ThemeProvider, useTheme, Button, MenuItem, FormControl, InputLabel, Select, Chip, OutlinedInput, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, Divider } from "@mui/material"
import { Breadcrumb } from "../../components/ui/Breadcrumb"
import { Title } from "../../components/ui/Title"
import { Tiptap } from "../../components/layouts/titap/Tiptap"
import { useState, useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useUpdateService, useServiceDetail } from "./hooks/useService";
import { useNestedServiceCategories } from "../service-category/hooks/useServiceCategory";
import { useDepartments } from "../hr/hooks/useDepartments";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { serviceSchema, ServiceFormValues } from "../../schemas/service.schema";
import { getServiceTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { LoadingButton } from "../../components/ui/LoadingButton";
import { SwitchButton } from "../../components/ui/SwitchButton";
import { CategoryParentSelect } from "../../components/ui/CategoryTreeSelect";
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useParams, useNavigate } from "react-router-dom";
import { UploadFiles } from "../../components/ui/UploadFiles";

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
    const departmentsRes = useDepartments();
    const departments = useMemo(() => {
        if (!departmentsRes.data) return [];
        const data = departmentsRes.data;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [departmentsRes.data]);
    const { mutate: update, isPending } = useUpdateService();

    const {
        control,
        handleSubmit,
        watch,
        reset
    } = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema as any),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            procedure: "",
            categoryId: "",
            departmentId: "",
            duration: 30,
            minDuration: 30,
            maxDuration: 60,
            petTypes: ["DOG", "CAT"],
            pricingType: "fixed",
            basePrice: 0,
            priceList: [{ label: "", value: 0 }],
            status: "active",
            images: [],
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
                procedure: service.procedure || "",
                categoryId: service.categoryId || "",
                departmentId: service.departmentId || "",
                duration: service.duration || 30,
                minDuration: service.minDuration || 30,
                maxDuration: service.maxDuration || 60,
                petTypes: service.petTypes || ["DOG", "CAT"],
                pricingType: service.pricingType || "fixed",
                basePrice: service.basePrice || 0,
                priceList: (service.priceList && service.priceList.length > 0) ? service.priceList : [{ label: "", value: 0 }],
                status: service.status || "active",
                images: service.images || [],
            });
        }
    }, [service, reset]);

    const onSubmit = (data: ServiceFormValues) => {
        console.log("Submitting service data:", data);
        update({ id: id as string, data }, {
            onSuccess: (response) => {
                if (response.code === 200 || response.success) {
                    toast.success("Cập nhật dịch vụ thành công!");
                    navigate(`/${prefixAdmin}/service/list`);
                } else {
                    toast.error(response.message || "Cập nhật thất bại");
                }
            },
            onError: (error: any) => {
                const message = error.response?.data?.message || "Cập nhật dịch vụ thất bại";
                toast.error(message);
            }
        });
    };

    const onError = (errors: any) => {
        console.error("Form validation errors:", errors);
        toast.error("Vui lòng kiểm tra lại thông tin các trường bị lỗi");
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
            <div className="mb-[calc(5*var(--spacing))] gap-[calc(2*var(--spacing))] flex items-start justify-end">
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
                <form onSubmit={handleSubmit(onSubmit, onError)}>
                    <Stack sx={{ margin: "0px calc(15 * var(--spacing))", gap: "calc(5 * var(--spacing))" }}>
                        <CollapsibleCard
                            title="Thông tin cơ bản"
                            subheader="Tên, mô tả, danh mục..."
                            expanded={expandedDetail}
                            onToggle={toggle(setExpandedDetail)}
                        >
                            <Stack p="calc(3 * var(--spacing))" gap="calc(3 * var(--spacing))">
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "calc(3 * var(--spacing)) calc(2 * var(--spacing))" }}>
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
                                        name="departmentId"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <FormControl fullWidth error={!!fieldState.error}>
                                                <InputLabel>Phòng ban phụ trách</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Phòng ban phụ trách"
                                                >
                                                    {departments.map((dept: any) => (
                                                        <MenuItem key={dept._id} value={dept._id}>
                                                            {dept.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {fieldState.error && (
                                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                        {fieldState.error.message}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                    <Controller
                                        name="duration"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="Thời lượng dự kiến (phút)"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="minDuration"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="Thời lượng tối thiểu (phút)"
                                                placeholder="Ngăn hoàn thành sớm"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="maxDuration"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="Thời lượng tối đa (phút)"
                                                placeholder="Tự động hoàn thành đơn"
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="petTypes"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <FormControl fullWidth error={!!fieldState.error}>
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
                                                {fieldState.error && (
                                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                        {fieldState.error.message}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Box>

                                <Controller
                                    name="images"
                                    control={control}
                                    render={({ field }) => (
                                        <UploadFiles
                                            files={field.value as any || []}
                                            onFilesChange={field.onChange}
                                        />
                                    )}
                                />

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Mô tả dịch vụ</Typography>
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
                                </Box>

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Quy trình thực hiện (Các bước thực hiện)</Typography>
                                    <Controller
                                        name="procedure"
                                        control={control}
                                        render={({ field }) => (
                                            <Tiptap
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        <CollapsibleCard
                            title="Giá dịch vụ"
                            subheader="Cấu hình giá cố định hoặc theo cân nặng"
                            expanded={expandedPricing}
                            onToggle={toggle(setExpandedPricing)}
                        >
                            <Stack p="calc(3 * var(--spacing))" gap="calc(3 * var(--spacing))">
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
                                            <Button color="primary" sx={{ color: '#00A76F', fontWeight: 700 }} startIcon={<AddIcon />} onClick={() => append({ label: '', value: 0 })}>Thêm mức</Button>
                                        </Box>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontSize: '0.8125rem', width: 220 }}>Mức cân nặng (kg)</TableCell>
                                                    <TableCell sx={{ fontSize: '0.8125rem', width: 120, textAlign: 'center' }}>Quy mô</TableCell>
                                                    <TableCell sx={{ fontSize: '0.8125rem', width: 220 }}>Giá (VNĐ)</TableCell>
                                                    <TableCell width={50}></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {fields.map((field, index) => {
                                                    const priceList = watch("priceList");
                                                    const prevVal = index > 0 ? priceList[index - 1]?.label : null;
                                                    const currentVal = priceList[index]?.label;

                                                    let rangeText = "";
                                                    if (currentVal) {
                                                        if (index === 0) {
                                                            rangeText = `< ${currentVal} kg`;
                                                        } else if (prevVal) {
                                                            rangeText = `${prevVal} -> ${currentVal} kg`;
                                                        }
                                                    }

                                                    return (
                                                        <TableRow key={field.id}>
                                                            <TableCell>
                                                                <Controller
                                                                    name={`priceList.${index}.label`}
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <TextField
                                                                            {...field}
                                                                            fullWidth
                                                                            size="small"
                                                                            placeholder="Ví dụ: 5"
                                                                        />
                                                                    )}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ textAlign: 'center' }}>
                                                                {rangeText && (
                                                                    <Typography variant="caption" sx={{ whiteSpace: 'nowrap', color: '#00A76F', fontWeight: 600 }}>
                                                                        {rangeText}
                                                                    </Typography>
                                                                )}
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
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}


                            </Stack>
                        </CollapsibleCard>

                        <Box gap="calc(3 * var(--spacing))" sx={{ display: "flex", alignItems: "center" }}>
                            <SwitchButton
                                control={control}
                                name="status"
                                checkedValue="active"
                                uncheckedValue="inactive"
                            />
                            <LoadingButton
                                type="submit"
                                loading={isPending}
                                label="Lưu thay đổi"
                                loadingLabel="Đang lưu..."
                                sx={{ minHeight: "3rem", minWidth: "4rem" }}
                            />
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    );
};




