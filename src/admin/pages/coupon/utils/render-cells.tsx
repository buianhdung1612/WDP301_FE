import { Box, Link, ListItemText } from "@mui/material";
import { GridActionsCell, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { DeleteIcon, EditIcon, EyeIcon } from "../../../assets/icons/index";
import { COLORS } from "../configs/constants";
import { useDeleteCoupon } from "../hooks/useCoupon";
import { useNavigate } from "react-router-dom";
import { prefixAdmin } from "../../../constants/routes";
import { toast } from "react-toastify";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');
interface RenderCreatedAtCellProps {
    value: Date | null | any;
}

export const RenderTitleCell = (params: GridRenderCellParams) => {
    const { name, id } = params.row;
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
            <ListItemText
                primary={
                    <Link
                        href={`/${prefixAdmin}/coupon/edit/${id}`}
                        className="product-title"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/${prefixAdmin}/coupon/edit/${id}`);
                        }}
                        underline="hover"
                        sx={{
                            color: COLORS.primary,
                            fontWeight: 600,
                            fontSize: '1.3rem',
                            transition: 'color 0.2s',
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
        </Box>
    );
}

export const RenderCreatedAtCell = ({ value }: RenderCreatedAtCellProps) => {
    if (!value) return null;
    const dateObj = dayjs(value);
    if (!dateObj.isValid()) return null;

    const formattedDate = dateObj.format('DD MMM, YYYY');

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: "4px"
            }}>

            <span
                style={{
                    fontSize: "1.4rem",
                    color: COLORS.primary,
                    transition: 'color 0.2s',
                    textTransform: 'capitalize'
                }}>
                {formattedDate}
            </span>
        </Box>
    );
}

export const RenderTypeDiscountCell = (params: GridRenderCellParams) => {
    const type = params.value;
    const label = type === 'percentage' ? 'Phần trăm' : 'Cố định';
    const bg = type === 'percentage' ? '#FFAB0029' : '#00B8D929';
    const text = type === 'percentage' ? '#B76E00' : '#006C9C';

    return (
        <span
            className="inline-flex items-center justify-center leading-1.5 min-w-[2.4rem] h-[2.4rem] text-[1.2rem] px-[6px] font-[700] rounded-[6px]"
            style={{
                backgroundColor: bg,
                color: text,
            }}
        >
            {label}
        </span>
    );
};

export const RenderValueCell = (params: GridRenderCellParams) => {
    const { value, typeDiscount } = params.row;
    if (typeDiscount === 'percentage') {
        return <span>{value}%</span>;
    }
    return <span>{(value || 0).toLocaleString('vi-VN')}đ</span>;
};

export const RenderDateRangeCell = (params: GridRenderCellParams) => {
    const { startDateFormat, endDateFormat } = params.row;
    return (
        <Box sx={{ fontSize: '1.2rem' }}>
            <div>{startDateFormat || '--'}</div>
            <div style={{ color: '#637381' }}>→ {endDateFormat || '--'}</div>
        </Box>
    );
};

export const RenderStatusCell = (params: GridRenderCellParams) => {
    const status = params.row.status;

    let label = "Hoạt động";
    let bg = "#00B8D929";
    let text = "#006C9C";

    if (status === 'active') {
        label = "Hoạt động";
        bg = "#00B8D929";
        text = "#006C9C";
    } else {
        label = "Tạm dừng";
        bg = "#EF444429";
        text = "#B91C1C";
    }

    return (
        <span
            className="inline-flex items-center justify-center leading-1.5 min-w-[2.4rem] h-[2.4rem] text-[1.2rem] px-[6px] font-[700] rounded-[6px]"
            style={{
                backgroundColor: bg,
                color: text,
            }}
        >
            {label}
        </span>
    );
}

export const RenderActionsCell = (params: GridRenderCellParams) => {
    const navigate = useNavigate();
    const { mutate: deleteCoupon } = useDeleteCoupon();
    const id = params.row.id;

    const handleEdit = () => {
        navigate(`/${prefixAdmin}/coupon/edit/${id}`);
    };

    const handleDelete = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
            deleteCoupon(id, {
                onSuccess: (res: any) => {
                    if (res.success) {
                        toast.success("Xóa mã giảm giá thành công");
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
                {...({
                    sx: {
                        '& .MuiTypography-root': {
                            fontSize: '1.3rem',
                            fontWeight: "600"
                        },
                    },
                } as any)}
                onClick={() => navigate(`/${prefixAdmin}/coupon/detail/${id}`)}
            />
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
}
