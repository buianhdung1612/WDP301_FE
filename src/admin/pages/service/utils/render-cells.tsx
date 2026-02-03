import { Box, Link, ListItemText, Chip } from "@mui/material";
import { GridActionsCell, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { DeleteIcon, EditIcon, EyeIcon } from "../../../assets/icons/index";
import { COLORS } from "../configs/constants";
import { useDeleteService } from "../hooks/useService";
import { useNavigate } from "react-router-dom";
import { prefixAdmin } from "../../../constants/routes";
import { toast } from "react-toastify";

export const RenderTitleCell = (params: GridRenderCellParams) => {
    const { name, _id } = params.row;
    const navigate = useNavigate();

    return (
        <ListItemText
            primary={
                <Link
                    href={`/${prefixAdmin}/service/edit/${_id}`}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${prefixAdmin}/service/edit/${_id}`);
                    }}
                    underline="hover"
                    sx={{
                        color: COLORS.primary,
                        fontWeight: 600,
                        fontSize: '1.3rem',
                    }}
                >
                    {name}
                </Link>
            }
            slotProps={{
                primary: {
                    component: 'span',
                    variant: 'body1',
                    noWrap: true,
                },
            }}
            sx={{ m: 0 }}
        />
    );
}

export const RenderCategoryCell = (params: GridRenderCellParams) => {
    const category = params.row.categoryId;
    const categoryName = typeof category === 'object' ? category?.name : "Không xác định";

    return (
        <span style={{ fontSize: '1.3rem', color: '#637381' }}>
            {categoryName}
        </span>
    );
}

export const RenderStatusCell = (params: GridRenderCellParams) => {
    const status = params.row.status;
    const label = status === 'active' ? "Hoạt động" : "Tạm dừng";
    const bg = status === 'active' ? "#00B8D929" : "#EF444429";
    const text = status === 'active' ? "#006C9C" : "#B91C1C";

    return (
        <span
            className="inline-flex items-center justify-center min-w-[2.4rem] h-[2.4rem] text-[1.2rem] px-[6px] font-[700] rounded-[6px]"
            style={{ backgroundColor: bg, color: text }}
        >
            {label}
        </span>
    );
}

export const RenderPricingCell = (params: GridRenderCellParams) => {
    const { pricingType, basePrice } = params.row;
    if (pricingType === 'fixed') {
        return (
            <span style={{ fontSize: '1.3rem' }}>
                {basePrice?.toLocaleString('vi-VN')} VNĐ
            </span>
        );
    }
    return <Chip label="Theo cân nặng" size="small" variant="outlined" />;
}

export const RenderPetTypesCell = (params: GridRenderCellParams) => {
    const petTypes = params.row.petTypes || [];
    return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {petTypes.map((type: string) => (
                <Chip key={type} label={type} size="small" variant="outlined" sx={{ fontSize: '1.1rem' }} />
            ))}
        </Box>
    );
};

export const RenderActionsCell = (params: GridRenderCellParams) => {
    const navigate = useNavigate();
    const { mutate: deleteService } = useDeleteService();
    const _id = params.row._id;

    const handleDelete = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
            deleteService(_id, {
                onSuccess: (res: any) => {
                    if (res.code === 200 || res.success) {
                        toast.success("Xóa dịch vụ thành công");
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
                icon={<EyeIcon />}
                label="Chi tiết"
                showInMenu
                onClick={() => navigate(`/${prefixAdmin}/service/detail/${_id}`)}
            />
            <GridActionsCellItem
                icon={<EditIcon />}
                label="Chỉnh sửa"
                showInMenu
                onClick={() => navigate(`/${prefixAdmin}/service/edit/${_id}`)}
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
}
