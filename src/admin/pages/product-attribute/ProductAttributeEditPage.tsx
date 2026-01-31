
import {
    Box,
    Stack,
    TextField,
    ThemeProvider,
    useTheme,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Typography,
    CircularProgress
} from "@mui/material";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import {
    useProductAttributeDetail,
    useUpdateProductAttribute
} from "./hooks/useProductAttribute";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { getProductAttributeTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { z } from "zod";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useParams } from "react-router-dom";

// Schema validation 
const attributeOptionSchema = z.object({
    _id: z.string().optional(), // For editing existing options
    label: z.string().min(1, "Nhãn không được để trống"),
    value: z.string().min(1, "Giá trị không được để trống"),
});

const editAttributeSchema = z.object({
    name: z.string().min(1, "Tên thuộc tính không được để trống").max(100),
    type: z.string().min(1, "Vui lòng chọn kiểu hiển thị"),
    options: z.array(attributeOptionSchema).optional(),
});

type EditAttributeFormValues = z.infer<typeof editAttributeSchema>;

import { ATTRIBUTE_TYPES } from "./configs/constants";

export const ProductAttributeEditPage = () => {
    const { id } = useParams();
    const [expandedDetail, setExpandedDetail] = useState(true);
    const [expandedValues, setExpandedValues] = useState(true);
    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getProductAttributeTheme(outerTheme);

    // Fetch detail
    const { data: detailRes, isLoading: isLoadingDetail } = useProductAttributeDetail(id);

    const {
        control,
        handleSubmit,
        reset,
        watch,
    } = useForm<EditAttributeFormValues>({
        resolver: zodResolver(editAttributeSchema),
        defaultValues: {
            name: "",
            type: "text",
            options: [{ label: "", value: "" }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "options",
    });

    // Watch type to conditionally render fields
    const watchedType = watch("type");
    const isColorType = watchedType === 'color';

    // Populate form with detail data
    useEffect(() => {
        if (detailRes) {
            const detail = detailRes; // Assuming response is direct data or interceptor handles it

            reset({
                name: detail.name || "",
                type: detail.type || "text",
                options: detail.options ? detail.options.map((opt: any) => ({
                    _id: opt._id,
                    label: opt.label,
                    value: opt.value
                })) : [{ label: "", value: "" }],
            });
        }
    }, [detailRes, reset]);

    // Update mutation
    const { mutate: update, isPending } = useUpdateProductAttribute();

    const onSubmit = (data: EditAttributeFormValues) => {
        // If text, clear options


        console.log(data);

        // Strip _id from options before sending to API
        const submitData = {
            ...data,
            options: data.options?.map(opt => ({
                label: opt.label,
                value: opt.value
            }))
        };

        console.log("Submitting data:", submitData);

        update({ id: id!, data: submitData }, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(response.message || "Cập nhật thuộc tính thành công!");
                } else {
                    toast.error(response.message);
                }
            },
            onError: (error) => {
                console.log(error);
                toast.error("Có lỗi xảy ra khi cập nhật thuộc tính");
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
                    <Title title="Chỉnh sửa thuộc tính" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Thuộc tính sản phẩm", to: `/${prefixAdmin}/product/attribute/list` },
                            { label: "Chỉnh sửa" }
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
                        {/* Thông tin cơ bản */}
                        <CollapsibleCard
                            title="Thông tin thuộc tính"
                            subheader="Cập nhật thông tin cơ bản của thuộc tính"
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
                                        name="name"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                label="Tên thuộc tính"
                                                placeholder="Ví dụ: Màu sắc, Kích cỡ..."
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="type"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <FormControl error={!!fieldState.error}>
                                                <InputLabel>Kiểu hiển thị</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Kiểu hiển thị"
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        if (fields.length === 0) {
                                                            replace([{ label: "", value: "" }]);
                                                        }
                                                    }}
                                                >
                                                    {ATTRIBUTE_TYPES.map((type) => (
                                                        <MenuItem
                                                            key={type.value}
                                                            value={type.value}
                                                            sx={{ fontSize: '1.4rem' }}
                                                        >
                                                            {type.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {fieldState.error && (
                                                    <Typography
                                                        sx={{
                                                            color: '#d32f2f',
                                                            fontSize: '1.2rem',
                                                            mt: 0.5,
                                                            ml: 1.75
                                                        }}
                                                    >
                                                        {fieldState.error.message}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </CollapsibleCard>

                        {/* Danh sách giá trị */}
                        <CollapsibleCard
                            title="Danh sách giá trị"
                            subheader={isColorType ? "Chỉnh sửa các màu sắc cho thuộc tính" : "Chỉnh sửa các giá trị cho thuộc tính này"}
                            expanded={expandedValues}
                            onToggle={toggle(setExpandedValues)}
                        >
                            <Stack p="24px" gap="16px">
                                {fields.map((field, index) => (
                                    <Box
                                        key={field.id}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "16px",
                                        }}
                                    >
                                        <Controller
                                            name={`options.${index}.label`}
                                            control={control}
                                            render={({ field: inputField, fieldState }) => (
                                                <TextField
                                                    {...inputField}
                                                    label="Nhãn (Label)"
                                                    placeholder={isColorType ? "Ví dụ: Đỏ" : "Ví dụ: Size S"}
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                    sx={{ flex: 1 }}
                                                />
                                            )}
                                        />

                                        {isColorType ? (
                                            // COLOR type: Value is Hex Code + Color Picker
                                            <Controller
                                                name={`options.${index}.value`}
                                                control={control}
                                                render={({ field: inputField, fieldState }) => {
                                                    const colorValue = inputField.value || '';
                                                    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(colorValue);

                                                    return (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 220 }}>
                                                            <TextField
                                                                {...inputField}
                                                                label="Mã màu"
                                                                placeholder="#FF0000"
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                                sx={{ flex: 1 }}
                                                                onChange={(e) => {
                                                                    inputField.onChange(e.target.value); // Allow manual typing
                                                                }}
                                                            />
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #919eab33',
                                                                    backgroundColor: isValidHex ? colorValue : '#f4f6f8',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s',
                                                                }}
                                                            >
                                                                <input
                                                                    type="color"
                                                                    value={isValidHex ? colorValue : '#000000'}
                                                                    onChange={(e) => inputField.onChange(e.target.value.toUpperCase())}
                                                                    style={{
                                                                        position: 'absolute',
                                                                        width: '200%',
                                                                        height: '200%',
                                                                        opacity: 0,
                                                                        cursor: 'pointer',
                                                                        top: '-50%',
                                                                        left: '-50%'
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    );
                                                }}
                                            />
                                        ) : (
                                            // Select Type: Simple Value Input
                                            <Controller
                                                name={`options.${index}.value`}
                                                control={control}
                                                render={({ field: inputField, fieldState }) => (
                                                    <TextField
                                                        {...inputField}
                                                        label="Giá trị (Value)"
                                                        placeholder="S, M, L..."
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        sx={{ flex: 1 }}
                                                    />
                                                )}
                                            />
                                        )}

                                        <IconButton
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                            sx={{
                                                color: fields.length === 1 ? '#919EAB' : '#FF5630',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 86, 48, 0.08)'
                                                }
                                            }}
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button
                                    type="button"
                                    onClick={() => append({ label: "", value: "" })}
                                    startIcon={<AddIcon />}
                                    sx={{
                                        alignSelf: 'flex-start',
                                        color: '#00A76F',
                                        fontSize: '1.4rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 167, 111, 0.08)'
                                        }
                                    }}
                                >
                                    {isColorType ? "Thêm màu" : "Thêm giá trị"}
                                </Button>
                            </Stack>
                        </CollapsibleCard>


                        {/* Submit button */}
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
                                    padding: "8px 22px",
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
                                {isPending ? "Đang cập nhật..." : "Cập nhật thuộc tính"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    )
}
