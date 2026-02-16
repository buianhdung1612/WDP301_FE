import { GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Chip, Stack, Typography, Avatar } from "@mui/material";
import { EyeIcon, CheckIcon } from "../../../assets/icons";

export const getAttendanceColumns = (onApprove: (id: string) => void, onEdit: (id: string) => void): GridColDef[] => [
    {
        field: "staffId",
        headerName: "Nhân viên",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
            <Stack direction="row" spacing={1} sx={{ py: 1, alignItems: 'center' }}>
                <Avatar src={params.value?.avatar} sx={{ width: 32, height: 32 }}>
                    {params.value?.fullName?.charAt(0)}
                </Avatar>
                <Stack spacing={0}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {params.value?.fullName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ID: {params.value?.employeeCode || "N/A"}
                    </Typography>
                </Stack>
            </Stack>
        )
    },
    {
        field: "period",
        headerName: "Kỳ công",
        width: 120,
        renderCell: (params) => (
            <Typography variant="body2">
                Tháng {params.row.month}/{params.row.year}
            </Typography>
        )
    },
    {
        field: "totalWorkDays",
        headerName: "Ngày công",
        width: 100,
        align: 'center',
    },
    {
        field: "totalWorkHours",
        headerName: "Giờ làm",
        width: 100,
        align: 'center',
        renderCell: (params) => `${params.value}h`
    },
    {
        field: "totalSalary",
        headerName: "Tổng lương",
        width: 150,
        renderCell: (params) => (
            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.value)}
            </Typography>
        )
    },
    {
        field: "status",
        headerName: "Trạng thái",
        width: 130,
        renderCell: (params) => {
            const statusMap: any = {
                draft: { label: 'Bản nháp', color: 'default', bgcolor: 'rgba(145, 158, 171, 0.16)', textColor: '#637381' },
                approved: { label: 'Đã duyệt', color: 'info', bgcolor: 'rgba(0, 184, 217, 0.16)', textColor: '#006C9C' },
                paid: { label: 'Đã chi', color: 'success', bgcolor: 'rgba(34, 197, 94, 0.16)', textColor: '#118D57' },
            };
            const s = statusMap[params.value] || statusMap.draft;
            return (
                <Chip
                    label={s.label}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: s.bgcolor, color: s.textColor }}
                />
            );
        }
    },
    {
        field: "actions",
        headerName: "",
        type: "actions",
        width: 64,
        align: 'right',
        headerAlign: 'right',
        getActions: (params) => {
            const actions: any[] = [];

            if (params.row.status === 'draft') {
                actions.push(
                    <GridActionsCellItem
                        key="approve"
                        icon={<CheckIcon />}
                        label="Duyệt bảng công"
                        onClick={() => onApprove(params.row._id)}
                        showInMenu
                        {...({
                            sx: {
                                '& .MuiTypography-root': {
                                    fontSize: '0.8125rem',
                                    fontWeight: "600",
                                    color: "#00B8D9"
                                },
                            },
                        } as any)}
                    />
                );
            }

            actions.push(
                <GridActionsCellItem
                    key="view"
                    icon={<EyeIcon />}
                    label="Chi tiết/Sửa"
                    onClick={() => onEdit(params.row._id)}
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
            );

            return actions;
        }
    }
];
