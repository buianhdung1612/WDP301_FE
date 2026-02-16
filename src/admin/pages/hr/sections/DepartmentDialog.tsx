import { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    IconButton,
    Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAccounts } from '../../account-admin/hooks/useAccountAdmin';
import CloseIcon from '@mui/icons-material/Close';
import { dialogStyles } from '../configs/styles.config';

interface DepartmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    selectedItem?: any;
}

export const DepartmentDialog = ({
    open,
    onClose,
    onSave,
    selectedItem,
}: DepartmentDialogProps) => {
    const { data: accountsRaw = [] } = useAccounts();
    const accounts = Array.isArray(accountsRaw) ? accountsRaw : [];

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            name: '',
            managerId: '',
            description: '',
            status: 'active',
        }
    });

    useEffect(() => {
        if (selectedItem) {
            reset({
                name: selectedItem.name || '',
                managerId: selectedItem.managerId?._id || '',
                description: selectedItem.description || '',
                status: selectedItem.status || 'active',
            });
        } else {
            reset({
                name: '',
                managerId: '',
                description: '',
                status: 'active',
            });
        }
    }, [selectedItem, reset, open]);

    const onSubmit = (data: any) => {
        onSave(data);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            sx={dialogStyles}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedItem ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#637381' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ bgcolor: '#F4F6F8 !important', py: '24px !important' }}>
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Bắt buộc' }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Tên phòng ban"
                                        error={!!error}
                                        helperText={error?.message}
                                        sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="managerId"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Người quản lý"
                                        sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                                    >
                                        <MenuItem value=""><em>Chưa có</em></MenuItem>
                                        {accounts.map((account: any) => (
                                            <MenuItem key={account._id} value={account._id}>
                                                {account.fullName}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Trạng thái"
                                        sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                                    >
                                        <MenuItem value="active">Hoạt động</MenuItem>
                                        <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Mô tả"
                                        sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px', gap: 1.5 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 700,
                            padding: '8px 20px',
                            color: '#1C252E',
                            borderColor: 'rgba(145, 158, 171, 0.32)',
                            '&:hover': {
                                bgcolor: 'rgba(145, 158, 171, 0.08)',
                                borderColor: '#1C252E',
                            }
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 700,
                            padding: '8px 20px',
                            bgcolor: '#1C252E',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#454F5B',
                                boxShadow: '0 8px 16px 0 rgba(145 158 171 / 16%)',
                            }
                        }}
                    >
                        {selectedItem ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
