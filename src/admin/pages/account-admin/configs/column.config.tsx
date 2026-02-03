import { GridColDef, GridRenderCellParams, GridActionsCell, GridActionsCellItem } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyIcon from '@mui/icons-material/Key';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { COLORS } from './constants';

export const getColumnsConfig = (
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
    onChangePassword: (id: string) => void
): GridColDef[] => [
        {
            field: 'stt',
            headerName: 'STT',
            width: 70,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => {
                const index = params.api.getAllRowIds().indexOf(params.id) + 1;
                return <Box sx={{ fontSize: '1.4rem' }}>{index}</Box>;
            },
        },
        {
            field: 'fullName',
            headerName: 'Người dùng',
            flex: 1.2,
            minWidth: 240,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
                    <Avatar
                        src={params.row.avatar}
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'rgba(145, 158, 171, 0.08)',
                            color: COLORS.primary,
                            fontWeight: 600
                        }}
                    >
                        {params.value?.charAt(0)}
                    </Avatar>
                    <Stack spacing={0.2}>
                        <Typography sx={{ fontWeight: 600, fontSize: '1.4rem', color: COLORS.primary }}>
                            {params.value}
                        </Typography>
                        <Typography sx={{ fontSize: '1.3rem', color: COLORS.secondary }}>
                            {params.row.email}
                        </Typography>
                    </Stack>
                </Stack>
            ),
        },
        {
            field: 'phoneNumber',
            headerName: 'Số điện thoại',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography sx={{ fontSize: '1.4rem', color: COLORS.primary }}>
                    {params.value || '-'}
                </Typography>
            ),
        },
        {
            field: 'rolesName',
            headerName: 'Nhóm quyền',
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
                    {params.value?.length > 0 ? (
                        params.value.map((role: string) => (
                            <Chip
                                key={role}
                                label={role}
                                size="small"
                                sx={{
                                    fontSize: '1.1rem',
                                    height: '20px',
                                    bgcolor: 'rgba(145, 158, 171, 0.16)',
                                    color: '#454F5B',
                                    fontWeight: 600
                                }}
                            />
                        ))
                    ) : (
                        <Typography sx={{ fontSize: '1.4rem', color: COLORS.disabled }}>-</Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 130,
            renderCell: (params: GridRenderCellParams) => {
                const statusMap: any = {
                    active: { label: 'Hoạt động', bg: 'rgba(0, 167, 111, 0.16)', color: 'rgb(0, 120, 103)' },
                    inactive: { label: 'Tạm dừng', bg: 'rgba(255, 86, 48, 0.16)', color: 'rgb(183, 29, 71)' },
                    initial: { label: 'Khởi tạo', bg: 'rgba(255, 171, 0, 0.16)', color: 'rgb(183, 129, 3)' }
                };
                const status = statusMap[params.value] || statusMap.initial;
                return (
                    <Chip
                        label={status.label}
                        sx={{
                            bgcolor: status.bg,
                            color: status.color,
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            height: '24px',
                            '& .MuiChip-label': { px: 1 }
                        }}
                    />
                );
            },
        },
        {
            field: 'actions',
            headerName: '',
            width: 80,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <GridActionsCell {...params}>
                    <GridActionsCellItem
                        icon={<KeyIcon sx={{ fontSize: '2rem' }} />}
                        label="Đổi mật khẩu"
                        onClick={() => onChangePassword(params.row._id)}
                        showInMenu
                        {...({
                            sx: {
                                '& .MuiTypography-root': {
                                    fontSize: '1.3rem',
                                    fontWeight: "600"
                                },
                            },
                        } as any)}
                    />
                    <GridActionsCellItem
                        icon={<EditIcon sx={{ fontSize: '2rem' }} />}
                        label="Chỉnh sửa"
                        onClick={() => onEdit(params.row._id)}
                        showInMenu
                        {...({
                            sx: {
                                '& .MuiTypography-root': {
                                    fontSize: '1.3rem',
                                    fontWeight: "600"
                                },
                            },
                        } as any)}
                    />
                    <GridActionsCellItem
                        icon={<DeleteIcon sx={{ fontSize: '2rem', color: '#FF5630' }} />}
                        label="Xóa"
                        onClick={() => onDelete(params.row._id)}
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
                    />
                </GridActionsCell>
            ),
        },
    ];

export const columnsInitialState = {
    pagination: {
        paginationModel: {
            pageSize: 10,
        },
    },
};
