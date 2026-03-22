import { Avatar, Box, LinearProgress, ListItemText } from "@mui/material";
import { GridActionsCell, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { DeleteIcon, EditIcon, EyeIcon } from "../../../assets/icons/index";
import { COLORS } from "../configs/constants";
import { useNavigate } from "react-router-dom";
import { prefixAdmin } from "../../../constants/routes";
import { useProducts } from "../hooks/useProducts";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { confirmDelete } from "../../../utils/swal";
import { ReloadIcon } from "../../../assets/icons/index";

// Sản phẩm
export const RenderProductCell = (params: GridRenderCellParams) => {
    const { product, category, image } = params.row;
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                py: "calc(2 * var(--spacing))",
                gap: "calc(2 * var(--spacing))",
                width: "100%",
            }}>

            <Avatar
                alt={product}
                src={image}
                variant="rounded"
                sx={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "var(--shape-borderRadius-md)",
                    backgroundColor: 'var(--palette-background-neutral)'
                }}
            />

            <ListItemText
                primary={
                    <Box
                        onClick={() => navigate(`/${prefixAdmin}/product/edit/${params.row.id}`)}
                        className="product-title"
                        sx={{
                            color: COLORS.primary,
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            transition: 'color 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                                color: 'var(--palette-primary-main)',
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        {product}
                    </Box>
                }
                secondary={category}
                slotProps={{
                    primary: {
                        component: 'span',
                        variant: 'body1',
                        noWrap: true,
                    },
                    secondary: {
                        component: 'span',
                        variant: 'body2',
                        sx: { color: 'var(--palette-text-disabled)', fontSize: "0.8125rem" }
                    }
                }}
                sx={{ m: 0 }}
            />
        </Box>
    );
}

// Thời gian tạo
export const RenderCreatedAtCell = (params: GridRenderCellParams) => {
    const date = params.value;
    if (!date) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: "4px"
            }}>

            <span
                style={{
                    fontSize: "0.875rem",
                    color: COLORS.primary,
                    transition: 'color 0.2s',
                }}>
                {dayjs(date).format('DD/MM/YYYY')}
            </span>

            <Box
                className="date-text"
                component='span'
                sx={{
                    fontSize: "0.75rem",
                    color: COLORS.secondary
                }}
            >
                {dayjs(date).format('HH:mm')}
            </Box>
        </Box >
    );
}

// Số lượng (Stock)
export const RenderStockCell = (params: GridRenderCellParams) => {
    const { t } = useTranslation();
    const stockValue = params.row.stock;

    let label = "";
    let color = "";
    let bgColor = "";
    let percentage = 0;

    if (stockValue === 0) {
        label = t("admin.product.stock_status.out_of_stock");
        bgColor = "rgba(255, 86, 48, 0.24)";
        percentage = 0;
    } else if (stockValue > 0 && stockValue <= 20) {
        label = `${stockValue} ${t("admin.product.stock_status.low_stock")}`;
        color = "#FFAB00";
        bgColor = "rgba(255 171 0 / 24%)";
        percentage = (stockValue / 20) * 100;
    } else {
        label = `${stockValue} ${t("admin.product.stock_status.in_stock")}`;
        color = "#22C55E";
        bgColor = "rgba(34, 197, 94, 0.24)";
        percentage = 90;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                fontSize: "0.75rem",
                color: "var(--palette-text-secondary)"
            }}
        >
            <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                    width: "80px",
                    height: "6px",
                    borderRadius: "var(--shape-borderRadius-lg)",
                    marginBottom: "8px",
                    backgroundColor: bgColor,
                    "& .MuiLinearProgress-bar": {
                        backgroundColor: color,
                        borderRadius: "var(--shape-borderRadius-lg)",
                    },
                }}
            />
            {label}
        </Box>
    );
}

// Status
export const RenderStatusCell = (params: GridRenderCellParams) => {
    const { t } = useTranslation();
    const status = params.row.status;

    let label = t("admin.product.status.draft");
    let bg = "var(--palette-text-disabled)29";
    let text = "var(--palette-text-primary)";

    if (status === "active") {
        label = t("admin.product.status.active");
        bg = "var(--palette-info-lighter)";
        text = "var(--palette-info-dark)";
    } else if (status === "inactive") {
        label = t("admin.product.status.inactive");
        bg = "var(--palette-error-lighter)";
        text = "var(--palette-error-dark)";
    }

    return (
        <span
            className="inline-flex items-center justify-center leading-1.5 min-w-[1.5rem] h-[1.5rem] text-[0.75rem] px-[6px] font-[700] rounded-[6px]"
            style={{
                backgroundColor: bg,
                color: text,
            }}
        >
            {label}
        </span>
    );
}

interface RenderActionsCellProps extends GridRenderCellParams {
    isTrash: boolean;
}

// Actions
export const RenderActionsCell = (params: RenderActionsCellProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { deleteProduct, restoreProduct, forceDeleteProduct } = useProducts();
    const { isTrash, ...paramsRest } = params;

    const handleEdit = () => {
        navigate(`/${prefixAdmin}/product/edit/${params.row.id}`);
    };

    const handleDelete = () => {
        const message = isTrash ? "Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này?" : "Bạn có chắc chắn muốn xóa sản phẩm này?";
        const action = isTrash ? forceDeleteProduct : deleteProduct;

        confirmDelete(message, () => {
            action(params.row.id, {
                onSuccess: (res: any) => {
                    if (res.success) {
                        toast.success(res.message || "Thao tác thành công");
                    } else {
                        toast.error(res.message || "Thao tác thất bại");
                    }
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || err.message || "Thao tác không thành công");
                }
            });
        });
    };

    const handleRestore = () => {
        restoreProduct(params.row.id, {
            onSuccess: (res: any) => {
                if (res.success) {
                    toast.success("Khôi phục sản phẩm thành công");
                } else {
                    toast.error(res.message || "Khôi phục sản phẩm thất bại");
                }
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || err.message || "Khôi phục sản phẩm không thành công");
            }
        });
    };

    return (
        <GridActionsCell {...paramsRest}>
            {!isTrash ? (
                <>
                    <GridActionsCellItem
                        icon={<EyeIcon />}
                        label={t("admin.common.details")}
                        onClick={handleEdit}
                        showInMenu
                        {...({
                            sx: {
                                '& .MuiTypography-root': {
                                    fontSize: '0.8125rem',
                                    fontWeight: "600"
                                },
                            },
                        } as any)}
                    />
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label={t("admin.common.edit")}
                        onClick={handleEdit}
                        showInMenu
                        {...({
                            sx: {
                                '& .MuiTypography-root': {
                                    fontSize: '0.8125rem',
                                    fontWeight: "600"
                                },
                            },
                        } as any)}
                    />
                </>
            ) : (
                <GridActionsCellItem
                    icon={<ReloadIcon />}
                    label="Khôi phục"
                    onClick={handleRestore}
                    showInMenu
                    {...({
                        sx: {
                            '& .MuiTypography-root': {
                                fontSize: '0.8125rem',
                                fontWeight: "600",
                                color: "var(--palette-info-main)"
                            },
                        },
                    } as any)}
                />
            )}

            <GridActionsCellItem
                icon={<DeleteIcon />}
                label={isTrash ? "Xóa vĩnh viễn" : t("admin.common.delete")}
                onClick={handleDelete}
                showInMenu
                {...({
                    sx: {
                        '& .MuiTypography-root': {
                            fontSize: '0.8125rem',
                            fontWeight: "600",
                            color: "var(--palette-error-main)"
                        },
                    },
                } as any)}
            />
        </GridActionsCell>
    );
}




