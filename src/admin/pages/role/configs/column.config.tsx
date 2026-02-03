import { GridColDef, GridRenderCellParams, GridActionsCell, GridActionsCellItem } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { COLORS } from './constants';
import { SKILLS } from '../../../constants/roles';

export const getColumnsConfig = (
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
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
            field: 'name',
            headerName: 'Tên nhóm quyền',
            flex: 1,
            minWidth: 220,
            renderCell: (params: GridRenderCellParams) => (
                <Stack spacing={0.5} sx={{ py: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '1.4rem', color: COLORS.primary }}>
                        {params.value}
                    </Typography>
                    {params.row.isStaff && (
                        <Box sx={{
                            display: 'inline-flex',
                            px: 1,
                            py: 0.2,
                            fontSize: '1.1rem',
                            bgcolor: 'rgba(0, 167, 111, 0.16)',
                            color: 'rgb(0, 120, 103)',
                            borderRadius: '6px',
                            fontWeight: 700,
                            width: 'fit-content'
                        }}>
                            Nhân viên kỹ thuật
                        </Box>
                    )}
                </Stack>
            ),
        },
        {
            field: 'skillSet',
            headerName: 'Kỹ năng chuyên môn',
            flex: 1.2,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => {
                const skills = params.value || [];
                if (skills.length === 0) return <Typography sx={{ fontSize: '1.4rem', color: COLORS.disabled }}>-</Typography>;

                return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 1 }}>
                        {skills.map((skillId: string) => {
                            const skillName = SKILLS.find(s => s.id === skillId)?.name || skillId;
                            return (
                                <Chip
                                    key={skillId}
                                    label={skillName}
                                    size="small"
                                    sx={{
                                        fontSize: '1.1rem',
                                        height: '20px',
                                        bgcolor: '#F4F6F8',
                                        color: '#637381',
                                        fontWeight: 600,
                                        border: '1px solid #919eab33'
                                    }}
                                />
                            );
                        })}
                    </Box>
                );
            }
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 140,
            renderCell: (params: GridRenderCellParams) => {
                const isActive = params.value === 'active';
                return (
                    <Chip
                        label={isActive ? 'Hoạt động' : 'Tạm dừng'}
                        sx={{
                            bgcolor: isActive ? 'rgba(0, 167, 111, 0.16)' : 'rgba(255, 86, 48, 0.16)',
                            color: isActive ? 'rgb(0, 120, 103)' : 'rgb(183, 29, 71)',
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
