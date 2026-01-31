
import { Box, Link } from "@mui/material";
import { GridActionsCell, GridActionsCellItem, GridRenderCellParams, GridColDef } from "@mui/x-data-grid";
import { DeleteIcon, EditIcon } from "../../../assets/icons/index";
import { COLORS, ATTRIBUTE_TYPES } from "./constants";
import { useDeleteProductAttribute } from "../hooks/useProductAttribute";
import { useNavigate } from "react-router-dom";
import { prefixAdmin } from "../../../constants/routes";
import { toast } from "react-toastify";
import Chip from '@mui/material/Chip';


// Render Tên thuộc tính
export const RenderNameCell = (params: GridRenderCellParams) => {
    const { name, _id } = params.row;
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                py: "16px",
                gap: "16px",
                width: "100%",
            }}>
            <Link
                href={`/${prefixAdmin}/product/attribute/edit/${_id}`}
                className="attribute-name"
                onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${prefixAdmin}/product/attribute/edit/${_id}`);
                }}
                underline="hover"
                sx={{
                    color: COLORS.primary,
                    fontWeight: 600,
                    fontSize: '1.4rem',
                    transition: 'color 0.2s',
                }}
            >
                {name}
            </Link>
        </Box>
    );
};

// Render Loại hiển thị - Simple text
export const RenderTypeCell = (params: GridRenderCellParams) => {
    const type = params.value;
    const typeOption = ATTRIBUTE_TYPES.find(t => t.value === type);

    return (
        <span
            style={{
                fontSize: '1.4rem',
                color: '#637381',
            }}
        >
            {typeOption ? typeOption.label : type}
        </span>
    );
};

// Render Giá trị (options) - Unified blue color
// Options is [{label, value}]
export const RenderOptionsCell = (params: GridRenderCellParams) => {
    const options = params.value || [];

    return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 1 }}>
            {options.slice(0, 5).map((v: any, index: number) => (
                <Chip
                    key={index}
                    label={`${v.label}`}
                    size="small"
                    sx={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        height: '24px',
                        borderRadius: '6px',
                        background: '#00B8D929',
                        color: '#006C9C',
                        border: 'none'
                    }}
                />
            ))}
            {options.length > 5 && (
                <Chip
                    label={`+${options.length - 5}`}
                    size="small"
                    sx={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        height: '24px',
                        borderRadius: '6px',
                        background: '#00B8D929',
                        color: '#006C9C',
                    }}
                />
            )}
        </Box>
    );
};

// Actions
export const RenderActionsCell = (params: GridRenderCellParams) => {
    const navigate = useNavigate();
    const { mutate: deleteAttribute } = useDeleteProductAttribute();
    const id = params.row._id;

    const handleEdit = () => {
        navigate(`/${prefixAdmin}/product/attribute/edit/${id}`);
    };

    const handleDelete = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thuộc tính này?")) {
            deleteAttribute(id, {
                onSuccess: (res: any) => {
                    if (res.success) {
                        toast.success("Xóa thuộc tính thành công");
                    } else {
                        toast.error(res.message);
                    }
                }
            });
        }
    };

    return (
        <GridActionsCell {...params}>
            <GridActionsCellItem
                icon={<EditIcon />}
                label="Chỉnh sửa"
                showInMenu
                {...({
                    sx: {
                        '& .MuiTypography-root': {
                            fontSize: '1.3rem',
                            fontWeight: "600"
                        },
                    },
                } as any)}
                onClick={handleEdit}
            />
            <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Xóa"
                showInMenu
                {...({
                    sx: {
                        '& .MuiTypography-root': {
                            fontSize: '1.3rem',
                            fontWeight: "600",
                            color: "#FF5630"
                        },
                    },
                } as any)}
                onClick={handleDelete}
            />
        </GridActionsCell>
    );
};

// Column configs
export const columnsConfig: GridColDef<any>[] = [
    {
        field: "name",
        headerName: "Tên thuộc tính",
        flex: 1,
        minWidth: 180,
        hideable: false,
        renderCell: RenderNameCell,
    },
    {
        field: "type",
        headerName: "Kiểu hiển thị",
        width: 150,
        renderCell: RenderTypeCell,
    },
    {
        field: "options",
        headerName: "Danh sách lựa chọn",
        flex: 2,
        minWidth: 350,
        renderCell: RenderOptionsCell,
    },
    {
        field: 'actions',
        headerName: 'Hành động',
        width: 100,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: RenderActionsCell,
    },
];

export const columnsInitialState = {
    pagination: {
        paginationModel: { page: 0, pageSize: 10 },
    },
};
