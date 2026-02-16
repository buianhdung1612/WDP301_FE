import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Card,
    Box,
    CircularProgress,
    Tabs,
    Tab,
    Typography,
    styled
} from '@mui/material';
// import { Icon } from '@iconify/react';
import {
    SortAscendingIcon,
    SortDescendingIcon,
    UnsortedIcon
} from '../../../assets/icons';
import { getColumnsConfig, columnsInitialState } from '../configs/column.config';
import { DATA_GRID_LOCALE_VN } from '../configs/localeText.config';
import {
    dataGridContainerStyles,
    dataGridStyles
} from '../configs/styles.config';
import { useAccounts, useDeleteAccount } from '../hooks/useAccountAdmin';
import { useRoles } from '../../role/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { prefixAdmin } from '../../../constants/routes';
import { toast } from 'react-toastify';
import { STATUS_OPTIONS } from '../configs/constants';
import { SelectMulti } from '../../../components/ui/SelectMulti';
import { Search } from '../../../components/ui/Search';
import { ExportImport } from '../../../components/ui/ExportImport';

// Styled component cho con số (Badge nhãn) - Tham khảo từ blog
const TabBadge = styled('span')(() => ({
    height: "24px",
    minWidth: "24px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: '8px',
    padding: '0px 6px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
    transition: 'all 0.2s',
}));

export const AccountAdminList = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [roleIds, setRoleIds] = useState<string[]>([]);

    const filters = {
        ...(status !== 'all' && { status }),
        ...(search && { q: search }),
        ...(roleIds.length > 0 && { roleIds: roleIds.join(',') }),
    };

    const { data: accountsRaw = [], isLoading } = useAccounts(filters);
    const { data: roles = [] } = useRoles();
    const { mutate: deleteAccount } = useDeleteAccount();

    const accounts = Array.isArray(accountsRaw) ? accountsRaw : [];

    // Map roles for SelectMulti
    const roleOptions = roles.map((role: any) => ({
        value: role._id,
        label: role.name
    }));

    const handleDelete = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
            deleteAccount(id, {
                onSuccess: () => {
                    toast.success("Xóa tài khoản thành công!");
                }
            });
        }
    };

    const handleEdit = (id: string) => {
        navigate(`/${prefixAdmin}/account-admin/edit/${id}`);
    };

    const handleChangePassword = (id: string) => {
        navigate(`/${prefixAdmin}/account-admin/change-password/${id}`);
    };

    const columns = getColumnsConfig(handleEdit, handleDelete, handleChangePassword);

    const handleStatusChange = (_event: React.SyntheticEvent, newValue: string) => {
        setStatus(newValue);
    };

    // Calculate counts for badges
    const counts = {
        all: accounts.length,
        active: accounts.filter(a => a.status === 'active').length,
        inactive: accounts.filter(a => a.status === 'inactive').length,
    };

    return (
        <Card elevation={0} sx={{
            borderRadius: '16px',
            bgcolor: 'background.paper',
            boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        }}>
            <Tabs
                value={status}
                onChange={handleStatusChange}
                variant="scrollable"
                scrollButtons={false}
                sx={{
                    px: 3,
                    minHeight: "42px",
                    borderBottom: '1px solid rgba(145, 158, 171, 0.2)',
                    overflow: 'visible',
                    '& .MuiTabs-scroller': {
                        overflow: 'visible !important',
                    },
                    '& .MuiTabs-flexContainer': {
                        gap: "40px"
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#1C252E',
                        height: 2,
                        bottom: -2,
                    },
                }}
            >
                {STATUS_OPTIONS.map((option) => (
                    <Tab
                        key={option.value}
                        value={option.value}
                        disableRipple
                        label={option.label}
                        icon={
                            <TabBadge
                                sx={{
                                    bgcolor: status === option.value
                                        ? (option.value === 'all' ? '#1C252E' : (option.value === 'active' ? '#118D57' : '#FF5630'))
                                        : (option.value === 'all' ? 'rgba(145, 158, 171, 0.16)' : (option.value === 'active' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(255, 86, 48, 0.16)')),
                                    color: status === option.value
                                        ? '#fff'
                                        : (option.value === 'all' ? '#637381' : (option.value === 'active' ? '#118D57' : '#B71D18')),
                                }}
                            >
                                {counts[option.value as keyof typeof counts] || 0}
                            </TabBadge>
                        }
                        iconPosition="end"
                        sx={{
                            minWidth: 0,
                            padding: '0',
                            minHeight: '42px',
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#637381',
                            flexDirection: 'row',
                            '&.Mui-selected': {
                                color: '#1C252E',
                                fontWeight: 600,
                            },
                        }}
                    />
                ))}
            </Tabs>

            <Box sx={{ p: '16px', display: 'flex', gap: 2, alignItems: 'center', borderBottom: '1px dashed #919eab33' }}>
                <SelectMulti
                    label="Vai trò"
                    options={roleOptions}
                    value={roleIds}
                    onChange={setRoleIds}
                    sx={{ minWidth: 160 }}
                />
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Search
                        maxWidth="100%"
                        placeholder="Tìm kiếm tài khoản..."
                        value={search}
                        onChange={setSearch}
                    />
                    <ExportImport />
                </Box>
            </Box>
            <Box sx={dataGridContainerStyles}>
                <DataGrid
                    rows={accounts}
                    getRowId={(row) => row._id}
                    loading={isLoading}
                    columns={columns}
                    density="comfortable"
                    slots={{
                        columnSortedAscendingIcon: SortAscendingIcon,
                        columnSortedDescendingIcon: SortDescendingIcon,
                        columnUnsortedIcon: UnsortedIcon,
                        noRowsOverlay: () => (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                {isLoading ? <CircularProgress size={32} /> : <Typography sx={{ fontSize: '1rem' }}>Không có dữ liệu để hiển thị</Typography>}
                            </Box>
                        )
                    }}
                    localeText={DATA_GRID_LOCALE_VN}
                    pagination
                    pageSizeOptions={[5, 10, 20]}
                    initialState={columnsInitialState}
                    getRowHeight={() => 'auto'}
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={{
                        ...dataGridStyles,
                        border: 'none',
                        '& .MuiDataGrid-columnHeader': {
                            bgcolor: 'rgba(145, 158, 171, 0.12)',
                            color: '#637381',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-columnHeaderTitleContainer': {
                            paddingX: '16px',
                        },
                        '& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer': {
                            padding: 0,
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px dashed rgba(145, 158, 171, 0.2)',
                        },
                        '& .MuiDataGrid-row:hover': {
                            bgcolor: 'rgba(145, 158, 171, 0.04)'
                        }
                    }}
                />
            </Box>
        </Card>
    );
};
