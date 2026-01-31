import {
    Box,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select
} from "@mui/material";
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Controller, Control } from "react-hook-form";

export interface CategoryNode {
    id: string; // Changed from categoryId: number to id: string
    name: string;
    children: CategoryNode[];
}

interface Props {
    control: Control<any>;
    categories: CategoryNode[];
    excludedId?: string;
}

export const CategoryParentSelect = ({ control, categories, excludedId }: Props) => {
    // Hàm render đệ quy các MenuItem và ép kiểu value về string
    const renderMenuItems = (
        nodes: CategoryNode[],
        currentValue: any,
        level = 0
    ): React.ReactNode[] => {
        return nodes.reduce((acc: React.ReactNode[], node) => {
            // ID is already string
            const stringId = node.id;

            // Skip excluded category
            if (excludedId && stringId === excludedId) {
                return acc;
            }

            const isSelected = currentValue?.toString() === stringId;

            const item = (
                <MenuItem
                    key={node.id}
                    value={stringId}
                    sx={{
                        pl: 2 + level * 3,
                        py: '8px',
                        fontSize: '1.4rem',
                        fontWeight: level === 0 ? 600 : 400,
                        gap: '8px'
                    }}
                >
                    <Checkbox
                        checked={isSelected}
                        size="small"
                        sx={{
                            p: 0,
                            color: '#919EAB',
                            '&.Mui-checked': { color: '#00A76F' }
                        }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        {level > 0 && (
                            <SubdirectoryArrowRightIcon
                                sx={{ fontSize: '1.6rem', color: '#919EAB', mr: 1, opacity: 0.5 }}
                            />
                        )}
                        {level === 0 ? (
                            <FolderIcon sx={{ fontSize: '1.8rem', mr: 1, color: '#FFAB00' }} />
                        ) : (
                            <FolderOpenIcon sx={{ fontSize: '1.8rem', mr: 1, color: '#919EAB' }} />
                        )}
                        <ListItemText
                            primary={node.name}
                            slotProps={{
                                primary: {
                                    sx: {
                                        fontSize: '1.4rem',
                                        fontWeight: 'inherit',
                                        color: level === 0 ? "#1C252E" : "#637381"
                                    }
                                }
                            }}
                        />
                    </Box>
                </MenuItem>
            );

            acc.push(item);

            if (node.children && node.children.length > 0) {
                acc.push(...renderMenuItems(node.children, currentValue, level + 1));
            }

            return acc;
        }, []);
    };

    const findCategoryName = (nodes: CategoryNode[], id: string): string | undefined => {
        for (const node of nodes) {
            if (node.id === id) return node.name;
            if (node.children?.length) {
                const found = findCategoryName(node.children, id);
                if (found) return found;
            }
        }
        return undefined;
    };

    return (
        <Controller
            name="parent"
            control={control}
            render={({ field, fieldState }) => (
                <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel shrink>Danh mục cha</InputLabel>
                    <Select
                        {...field}
                        displayEmpty
                        // Đảm bảo value luôn là string để khớp với Zod Schema
                        value={field.value?.toString() ?? ""}
                        input={<OutlinedInput label="Danh mục cha" notched />}
                        renderValue={(selected) => {
                            if (!selected || selected === "") {
                                return <Box sx={{ color: "#919EAB" }}>Chọn danh mục cha</Box>;
                            }
                            const name = findCategoryName(categories, selected.toString());
                            return name ?? "Danh mục không tồn tại";
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 350,
                                    '& .Mui-selected': {
                                        backgroundColor: '#00A76F14 !important',
                                    },
                                }
                            }
                        }}
                    >
                        {/* Option rỗng để người dùng có thể bỏ chọn về danh mục gốc */}
                        <MenuItem value="">
                            <em style={{ color: '#919EAB' }}>Không có (Danh mục gốc)</em>
                        </MenuItem>

                        {renderMenuItems(categories, field.value)}
                    </Select>

                    {/* Hiển thị lỗi đỏ dưới field nếu có lỗi validation */}
                    {fieldState.error && (
                        <Box sx={{ color: 'error.main', fontSize: '1.2rem', mt: 1, ml: 2 }}>
                            {fieldState.error.message}
                        </Box>
                    )}
                </FormControl>
            )}
        />
    );
};