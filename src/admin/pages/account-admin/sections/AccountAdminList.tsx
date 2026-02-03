import { DataGrid } from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SortAscendingIcon, SortDescendingIcon, UnsortedIcon } from '../../../assets/icons';
import { getColumnsConfig, columnsInitialState } from '../configs/column.config';
import { AccountAdminToolbar } from './AccountAdminToolbar';
import { DATA_GRID_LOCALE_VN } from '../configs/localeText.config';
import {
    dataGridCardStyles,
    dataGridContainerStyles,
    dataGridStyles
} from '../configs/styles.config';
import { useAccounts, useDeleteAccount } from '../hooks/useAccountAdmin';
import { useNavigate } from 'react-router-dom';
import { prefixAdmin } from '../../../constants/routes';
import { toast } from 'react-toastify';

export const AccountAdminList = () => {
    const navigate = useNavigate();
    const { data: accounts = [], isLoading } = useAccounts();
    const { mutate: deleteAccount } = useDeleteAccount();

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

    const handleChangePassword = (_id: string) => {
        // logic for changing password
        toast.info("Tính năng đổi mật khẩu đang được phát triển");
    };

    const columns = getColumnsConfig(handleEdit, handleDelete, handleChangePassword);

    return (
        <Card elevation={0} sx={{
            ...dataGridCardStyles,
            border: '1px solid rgba(145, 158, 171, 0.2)',
            transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            '&:hover': {
                boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)'
            }
        }}>
            <div style={dataGridContainerStyles}>
                <DataGrid
                    rows={accounts}
                    getRowId={(row) => row._id}
                    showToolbar
                    loading={isLoading}
                    columns={columns}
                    density="comfortable"
                    slots={{
                        toolbar: AccountAdminToolbar,
                        columnSortedAscendingIcon: SortAscendingIcon,
                        columnSortedDescendingIcon: SortDescendingIcon,
                        columnUnsortedIcon: UnsortedIcon,
                        noRowsOverlay: () => (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                {isLoading ? <CircularProgress size={32} /> : <span className='text-[1.8rem]'>Không có dữ liệu để hiển thị</span>}
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
                        '& .MuiDataGrid-row:hover': {
                            bgcolor: 'rgba(145, 158, 171, 0.04)'
                        }
                    }}
                />
            </div>
        </Card>
    );
};
