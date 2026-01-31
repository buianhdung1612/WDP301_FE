
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
    Tooltip
} from "@mui/material";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { useState, Dispatch, SetStateAction } from "react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import {
    useCreateProductAttribute
} from "./hooks/useProductAttribute";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { getProductAttributeTheme } from "./configs/theme";
import { prefixAdmin } from "../../constants/routes";
import { toast } from "react-toastify";
import { z } from "zod";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { ATTRIBUTE_TYPES } from "./configs/constants";

// DnD Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Schema validation 
const attributeOptionSchema = z.object({
    label: z.string().min(1, "Nhãn không được để trống"),
    value: z.string().min(1, "Giá trị không được để trống"),
});

const createAttributeSchema = z.object({
    name: z.string().min(1, "Tên thuộc tính không được để trống").max(100),
    type: z.string().min(1, "Vui lòng chọn kiểu hiển thị"),
    options: z.array(attributeOptionSchema).optional(),
});

type CreateAttributeFormValues = z.infer<typeof createAttributeSchema>;

const ATTRIBUTE_TYPES_WITH_DEFAULT = [
    { value: '', label: '-- Chọn kiểu hiển thị --' },
    ...ATTRIBUTE_TYPES
];

// Sortable Item Component
interface SortableAttributeOptionProps {
    id: string;
    index: number;
    control: any;
    remove: (index: number) => void;
    fieldsLength: number;
    isColorType: boolean;
}

const SortableAttributeOption = ({ id, index, control, remove, fieldsLength, isColorType }: SortableAttributeOptionProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            sx={{
                display: "flex",
                alignItems: "center", // Vertically center everything
                gap: "16px",
                backgroundColor: '#fff',
                padding: '8px 0', // Add some breathing room
            }}
        >
            {/* Drag Handle - Minimal and Clean */}
            <Box
                {...attributes}
                {...listeners}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#919EAB',
                    cursor: 'grab',
                    padding: '8px',
                    borderRadius: '50%',
                    '&:hover': {
                        backgroundColor: 'rgba(145, 158, 171, 0.08)',
                        color: '#637381'
                    },
                    '&:active': {
                        cursor: 'grabbing',
                    }
                }}
            >
                <DragIndicatorIcon />
            </Box>

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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                <TextField
                                    {...inputField}
                                    label="Giá trị (Hex)"
                                    placeholder="#FF0000"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    sx={{ flex: 1 }}
                                    size="small"
                                    onChange={(e) => {
                                        inputField.onChange(e.target.value);
                                    }}
                                />
                                <Box
                                    sx={{
                                        width: 40, // Match small input height
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

            <Tooltip title="Xóa lựa chọn">
                <IconButton
                    onClick={() => remove(index)}
                    disabled={fieldsLength === 1}
                    sx={{
                        color: fieldsLength === 1 ? '#919EAB' : '#FF5630',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 86, 48, 0.08)'
                        }
                    }}
                >
                    <DeleteOutlineIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );
};


export const ProductAttributeCreatePage = () => {
    const [expandedDetail, setExpandedDetail] = useState(true);
    const [expandedValues, setExpandedValues] = useState(true);
    const toggle = (setter: Dispatch<SetStateAction<boolean>>) =>
        () => setter(prev => !prev);

    const outerTheme = useTheme();
    const localTheme = getProductAttributeTheme(outerTheme);

    const {
        control,
        handleSubmit,
        reset,
        watch,
    } = useForm<CreateAttributeFormValues>({
        resolver: zodResolver(createAttributeSchema),
        defaultValues: {
            name: "",
            type: "select",
            options: [{ label: "", value: "" }],
        },
    });

    const { fields, append, remove, replace, move } = useFieldArray({
        control,
        name: "options",
    });

    // Sensors for Drag and Drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = fields.findIndex((item) => item.id === active.id);
            const newIndex = fields.findIndex((item) => item.id === over?.id);
            move(oldIndex, newIndex);
        }
    };

    // Watch type to conditionally render fields
    const watchedType = watch("type");
    const isColorType = watchedType === 'color';

    // Create mutation
    const { mutate: create, isPending } = useCreateProductAttribute();

    const onSubmit = (data: CreateAttributeFormValues) => {


        console.log(data);

        create(data, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(response.message || "Tạo thuộc tính thành công!");
                    reset({
                        name: "",
                        type: "select",
                        options: [{ label: "", value: "" }],
                    });
                } else {
                    toast.error(response.message);
                }
            },
            onError: () => {
                toast.error("Có lỗi xảy ra khi tạo thuộc tính");
            }
        });
    };

    return (
        <>
            <div className="mb-[40px] gap-[16px] flex items-start justify-end">
                <div className="mr-auto">
                    <Title title="Tạo thuộc tính sản phẩm" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: "/" },
                            { label: "Thuộc tính sản phẩm", to: `/${prefixAdmin}/product/attribute/list` },
                            { label: "Thêm mới" }
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
                            title="Tạo thuộc tính sản phẩm"
                            subheader="Nhập thông tin cơ bản của thuộc tính"
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
                                                <InputLabel shrink={true}>Kiểu hiển thị</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Kiểu hiển thị"
                                                    displayEmpty
                                                    renderValue={(selected) => {
                                                        if (!selected) {
                                                            return <span style={{ color: '#919EAB' }}>-- Chọn kiểu hiển thị --</span>;
                                                        }
                                                        const selectedOption = ATTRIBUTE_TYPES_WITH_DEFAULT.find(opt => opt.value === selected);
                                                        return selectedOption ? selectedOption.label : selected;
                                                    }}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        if (fields.length === 0) {
                                                            replace([{ label: "", value: "" }]);
                                                        }
                                                    }}
                                                >
                                                    {ATTRIBUTE_TYPES_WITH_DEFAULT.map((type) => (
                                                        <MenuItem
                                                            key={type.value}
                                                            value={type.value}
                                                            sx={{ fontSize: '1.4rem', display: type.value === '' ? 'none' : 'block' }}
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
                            title="Danh sách lựa chọn"
                            subheader={isColorType ? "Thêm các màu sắc cho thuộc tính" : "Thêm các giá trị cho thuộc tính này"}
                            expanded={expandedValues}
                            onToggle={toggle(setExpandedValues)}
                        >
                            <Stack p="24px" gap="16px">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={fields}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {fields.map((field, index) => (
                                            <SortableAttributeOption
                                                key={field.id}
                                                id={field.id}
                                                index={index}
                                                control={control}
                                                remove={remove}
                                                fieldsLength={fields.length}
                                                isColorType={isColorType}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>

                                <Button
                                    type="button"
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => append({ label: "", value: "" })}
                                    sx={{
                                        borderStyle: 'dashed',
                                        borderWidth: '1px',
                                        justifyContent: 'center',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.5,
                                        mt: 1,
                                        color: '#00A76F', // Primary green
                                        borderColor: 'rgba(0, 167, 111, 0.3)',
                                        fontSize: '1.4rem',
                                        '&:hover': {
                                            borderColor: '#00A76F',
                                            backgroundColor: 'rgba(0, 167, 111, 0.08)'
                                        }
                                    }}
                                >
                                    {isColorType ? "Thêm màu" : "Thêm lựa chọn"}
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
                                {isPending ? "Đang tạo..." : "Tạo thuộc tính"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </ThemeProvider>
        </>
    )
}
