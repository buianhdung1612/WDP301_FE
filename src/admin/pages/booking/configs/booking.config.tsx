import { GridColDef, GridRenderCellParams, GridActionsCell, GridActionsCellItem } from "@mui/x-data-grid";
import { Typography, Stack, Avatar, Chip, Box } from "@mui/material";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { COLORS } from "../../role/configs/constants";

export const getBookingColumns = (
    onStatusUpdate: (id: string, status: string) => void,
    onViewDetail: (id: string) => void,
    onEdit: (booking: any) => void,
    t: any
): GridColDef[] => [
        {
            field: "code",
            headerName: "Mã đơn",
            width: 100,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', px: "16px" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: COLORS.primary }}>
                        #{params.value?.slice(-6).toUpperCase() || 'N/A'}
                    </Typography>
                </Box>
            )
        },
        {
            field: "userId",
            headerName: "Khách hàng",
            flex: 1.5,
            minWidth: 220,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ py: "16px", px: "16px", height: '100%' }}>
                    <Avatar
                        src={params.value?.avatar}
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            bgcolor: 'rgba(145, 158, 171, 0.08)',
                        }}
                    >
                        <Icon icon="eva:person-fill" width={20} style={{ color: COLORS.secondary }} />
                    </Avatar>
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.8125rem', color: COLORS.primary }}>
                            {params.value?.fullName || 'Khách vãng lai'}
                        </Typography>
                        <Typography noWrap sx={{ color: COLORS.secondary, fontSize: '0.75rem' }}>
                            {params.value?.phone || "Không có SĐT"}
                        </Typography>
                    </Stack>
                </Stack>
            )
        },
        {
            field: "serviceId",
            headerName: "Dịch vụ",
            flex: 1,
            minWidth: 160,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', px: "16px" }}>
                    <Typography noWrap sx={{ fontSize: '0.8125rem', color: COLORS.primary, fontWeight: 500 }}>
                        {params.value?.name || "N/A"}
                    </Typography>
                </Box>
            )
        },
        {
            field: "start",
            headerName: "Thời gian",
            width: 180,
            renderCell: (params: GridRenderCellParams) => {
                const { start, end } = params.row;
                if (!start) return (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', px: "16px" }}>
                        <Typography sx={{ fontSize: '0.8125rem' }}>N/A</Typography>
                    </Box>
                );
                return (
                    <Stack spacing={0.5} justifyContent="center" sx={{ height: '100%', px: "16px" }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: COLORS.primary }}>
                            {dayjs(start).format("DD/MM/YYYY")}
                        </Typography>
                        <Typography sx={{ color: COLORS.success, fontSize: '0.75rem', fontWeight: 600 }}>
                            {dayjs(start).format("HH:mm")} - {dayjs(end).format("HH:mm")}
                        </Typography>
                    </Stack>
                );
            }
        },
        {
            field: "bookingStatus",
            headerName: "Trạng thái",
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => {
                const statusMap: any = {
                    pending: { label: t("admin.booking.status.pending"), color: "#FFAB00", bg: "rgba(255, 171, 0, 0.16)" },
                    confirmed: { label: t("admin.booking.status.confirmed"), color: "#00B8D9", bg: "rgba(0, 184, 217, 0.16)" },
                    delayed: { label: "Trễ hẹn", color: "#FF5630", bg: "rgba(255, 86, 48, 0.16)" },
                    "in-progress": { label: t("admin.booking.status.in_progress"), color: "#00A76F", bg: "rgba(0, 167, 111, 0.16)" },
                    completed: { label: t("admin.booking.status.completed"), color: "#22C55E", bg: "rgba(34, 197, 94, 0.16)" },
                    cancelled: { label: t("admin.booking.status.cancelled"), color: "#FF5630", bg: "rgba(255, 86, 48, 0.16)" }
                };
                const status = statusMap[params.value] || { label: params.value, color: COLORS.disabled, bg: "rgba(145, 158, 171, 0.16)" };
                return (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Chip
                            label={status.label}
                            sx={{
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '0.6875rem',
                                color: status.color,
                                bgcolor: status.bg,
                                height: '24px',
                                '& .MuiChip-label': { px: '8px' }
                            }}
                        />
                    </Box>
                );
            }
        },
        {
            field: "staffId",
            headerName: "Nhân viên",
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => {
                const hasStaff = params.value && params.value._id;
                return (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasStaff ? (
                            <Chip
                                label={params.value.fullName || "Đã phân bổ"}
                                icon={<Icon icon="eva:checkmark-circle-2-fill" width={16} />}
                                sx={{
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.6875rem',
                                    color: '#00A76F',
                                    bgcolor: 'rgba(0, 167, 111, 0.16)',
                                    height: '24px',
                                    '& .MuiChip-label': { px: '8px' },
                                    '& .MuiChip-icon': { ml: '6px', color: '#00A76F' }
                                }}
                            />
                        ) : (
                            <Chip
                                label="Chưa phân bổ"
                                icon={<Icon icon="eva:alert-triangle-fill" width={16} />}
                                sx={{
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.6875rem',
                                    color: '#FFAB00',
                                    bgcolor: 'rgba(255, 171, 0, 0.16)',
                                    height: '24px',
                                    '& .MuiChip-label': { px: '8px' },
                                    '& .MuiChip-icon': { ml: '6px', color: '#FFAB00' }
                                }}
                            />
                        )}
                    </Box>
                );
            }
        },
        {
            field: "actions",
            headerName: "",
            width: 64,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', px: "16px" }}>
                    <GridActionsCell {...params}>
                        <GridActionsCellItem
                            icon={<Icon icon="solar:pen-bold" width={20} />}
                            label="Chỉnh sửa"
                            onClick={() => onEdit(params.row)}
                            showInMenu
                        />
                        {params.row.bookingStatus === 'pending' && (
                            <GridActionsCellItem
                                icon={<Icon icon="eva:checkmark-circle-2-fill" width={20} />}
                                label="Xác nhận đơn"
                                onClick={() => onStatusUpdate(params.row._id, 'confirmed')}
                                showInMenu
                                {...({ sx: { color: COLORS.success, '& .MuiTypography-root': { color: COLORS.success } } } as any)}
                            />
                        )}
                        {['pending', 'confirmed'].includes(params.row.bookingStatus) && (
                            <GridActionsCellItem
                                icon={<Icon icon="eva:close-circle-fill" width={20} />}
                                label="Hủy đơn"
                                onClick={() => onStatusUpdate(params.row._id, 'cancelled')}
                                showInMenu
                                {...({ sx: { color: '#FF5630', '& .MuiTypography-root': { color: '#FF5630' } } } as any)}
                            />
                        )}
                        <GridActionsCellItem
                            icon={<Icon icon="eva:eye-fill" width={20} />}
                            label="Xem chi tiết"
                            onClick={() => onViewDetail(params.row._id)}
                            showInMenu
                        />
                    </GridActionsCell>
                </Box>
            )
        }
    ];

export const bookingColumnsInitialState = {
    pagination: {
        paginationModel: {
            pageSize: 10,
        },
    },
};
