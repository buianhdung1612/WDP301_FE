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
    Checkbox,
    ListItemText,
    alpha,
    Box,
    Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAccounts } from '../../account-admin/hooks/useAccountAdmin';
import CloseIcon from '@mui/icons-material/Close';
import { dialogStyles } from '../configs/styles.config';
import { Icon } from '@iconify/react';

interface BulkDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onDelete: (data: any) => void;
    departmentId?: string;
}

export const BulkDeleteDialog = ({
    open,
    onClose,
    onDelete,
    departmentId,
}: BulkDeleteDialogProps) => {
    const { data: accounts = [] } = useAccounts({ departmentId, status: 'active' });

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            staffIds: [] as string[],
            startDate: dayjs().startOf('week'),
            endDate: dayjs().endOf('week'),
        }
    });

    useEffect(() => {
        if (open) {
            reset({
                staffIds: [],
                startDate: dayjs().startOf('week'),
                endDate: dayjs().endOf('week'),
            });
        }
    }, [open, reset]);

    const onSubmit = (data: any) => {
        onDelete({
            ...data,
            departmentId,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
        });
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
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Icon icon="solar:trash-bin-trash-bold-duotone" width={24} color="#FF5630" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Xóa ca làm việc hàng loạt
                    </Typography>
                </Stack>
                <IconButton onClick={onClose} size="small" sx={{ color: '#637381' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ bgcolor: '#F4F6F8 !important', py: '24px !important' }}>
                    <Box sx={{ mb: 3, p: 2, bgcolor: alpha('#FF5630', 0.08), borderRadius: '12px', border: '1px solid', borderColor: alpha('#FF5630', 0.16) }}>
                        <Typography variant="body2" sx={{ color: '#B71D18', fontWeight: 600 }}>
                            Lưu ý: Hệ thống sẽ xóa các ca làm việc của nhân viên được chọn trong khoảng thời gian này.
                        </Typography>
                    </Box>

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="staffIds"
                                control={control}
                                rules={{ required: 'Vui lòng chọn ít nhất một nhân viên' }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Chọn nhân viên"
                                        error={!!error}
                                        helperText={error?.message}
                                        SelectProps={{
                                            multiple: true,
                                            renderValue: (selected: any) =>
                                                accounts
                                                    .filter((a: any) => selected.includes(a._id))
                                                    .map((a: any) => a.fullName)
                                                    .join(', ')
                                        }}
                                        sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                                    >
                                        <MenuItem value="all" onClick={(e) => {
                                            e.preventDefault();
                                            field.onChange(accounts.map((a: any) => a._id));
                                        }}>
                                            <Checkbox checked={field.value.length === accounts.length && accounts.length > 0} />
                                            <ListItemText primary="Chọn tất cả nhân viên" sx={{ fontWeight: 'bold' }} />
                                        </MenuItem>
                                        {accounts.map((account: any) => (
                                            <MenuItem key={account._id} value={account._id}>
                                                <Checkbox checked={field.value.indexOf(account._id) > -1} />
                                                <ListItemText primary={account.fullName} secondary={account.email} />
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            label="Từ ngày"
                                            sx={{
                                                width: '100%',
                                                bgcolor: '#fff',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            label="Đến ngày"
                                            sx={{
                                                width: '100%',
                                                bgcolor: '#fff',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
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
                        }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 700,
                            padding: '8px 20px',
                            boxShadow: 'none',
                            bgcolor: '#FF5630',
                            '&:hover': {
                                bgcolor: '#B71D18',
                            }
                        }}
                    >
                        Xác nhận xóa
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

