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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useShifts } from '../hooks/useShifts';
import { useAccounts } from '../../account-admin/hooks/useAccountAdmin';
import { useSchedules } from '../hooks/useSchedules';
import CloseIcon from '@mui/icons-material/Close';
import { dialogStyles } from '../configs/styles.config';

interface BulkScheduleDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    departmentId?: string;
    loading?: boolean;
}

export const BulkScheduleDialog = ({
    open,
    onClose,
    onSave,
    departmentId,
    loading = false,
}: BulkScheduleDialogProps) => {
    const { data: accounts = [] } = useAccounts({ departmentId, status: 'active' });
    const { data: shifts = [] } = useShifts({ departmentId, status: 'active' });

    const filteredAccounts = accounts;
    const filteredShifts = shifts;

    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            staffIds: [] as string[],
            shiftId: '',
            startDate: dayjs(),
            endDate: dayjs().add(6, 'day'),
            overwrite: false,
        }
    });

    const watchStartDate = watch('startDate');
    const watchEndDate = watch('endDate');
    const watchOverwrite = watch('overwrite');

    const { data: schedulesRes } = useSchedules({
        startDate: watchStartDate?.format('YYYY-MM-DD'),
        endDate: watchEndDate?.format('YYYY-MM-DD'),
        departmentId
    });

    const busyStaffIds = [...new Set(schedulesRes?.data?.map((s: any) => s.staffId?._id))];

    useEffect(() => {
        if (open) {
            reset({
                staffIds: [],
                shiftId: '',
                startDate: dayjs(),
                endDate: dayjs().add(6, 'day'),
                overwrite: false,
            });
        }
    }, [open, reset]);

    const onSubmit = (data: any) => {
        const selectedShift = shifts.find((s: any) => s._id === data.shiftId);
        onSave({
            ...data,
            departmentId: selectedShift?.departmentId || departmentId || null,
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
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Phân ca hàng loạt
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'var(--palette-text-secondary)' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent sx={{ bgcolor: 'var(--palette-background-neutral) !important', py: '24px !important' }}>
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
                                            label="Nhân viên"
                                            error={!!error}
                                            helperText={error?.message}
                                            SelectProps={{
                                                multiple: true,
                                                renderValue: (selected: any) =>
                                                    filteredAccounts
                                                        .filter((a: any) => selected.includes(a._id))
                                                        .map((a: any) => a.fullName)
                                                        .join(', ')
                                            }}
                                            sx={{ bgcolor: "var(--palette-background-paper)", borderRadius: "var(--shape-borderRadius)" }}
                                        >
                                            {filteredAccounts.map((account: any) => {
                                                const isBusy = busyStaffIds.includes(account._id);
                                                const disabled = isBusy && !watchOverwrite;

                                                return (
                                                    <MenuItem
                                                        key={account._id}
                                                        value={account._id}
                                                        disabled={disabled}
                                                        sx={{
                                                            opacity: disabled ? 0.6 : 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Checkbox checked={field.value.indexOf(account._id) > -1} />
                                                            <ListItemText primary={`${account.fullName} (${account.email})`} />
                                                        </Box>
                                                        {isBusy && (
                                                            <Typography variant="caption" sx={{ color: 'var(--palette-error-main)', fontWeight: 700, ml: 1 }}>
                                                                Bận {watchOverwrite ? '(Có thể ghi đè)' : ''}
                                                            </Typography>
                                                        )}
                                                    </MenuItem>
                                                );
                                            })}
                                            {filteredAccounts.length === 0 && (
                                                <MenuItem disabled>Không có nhân viên trong phòng ban này</MenuItem>
                                            )}
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="shiftId"
                                    control={control}
                                    rules={{ required: 'Vui lòng chọn ca làm việc' }}
                                    render={({ field, fieldState: { error } }) => {
                                        return (
                                            <TextField
                                                {...field}
                                                select
                                                fullWidth
                                                label="Ca làm việc"
                                                error={!!error}
                                                helperText={error?.message}
                                                sx={{ bgcolor: "var(--palette-background-paper)", borderRadius: "var(--shape-borderRadius)" }}
                                            >
                                                {filteredShifts.map((shift: any) => (
                                                    <MenuItem key={shift._id} value={shift._id}>
                                                        {shift.name} ({shift.startTime} - {shift.endTime})
                                                    </MenuItem>
                                                ))}
                                                {filteredShifts.length === 0 && (
                                                    <MenuItem disabled>Không có ca phù hợp cho phòng ban này</MenuItem>
                                                )}
                                            </TextField>
                                        );
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            label="Từ ngày"
                                            slotProps={{
                                                textField: {
                                                    sx: {
                                                        width: '100%',
                                                        bgcolor: "var(--palette-background-paper)",
                                                        borderRadius: "var(--shape-borderRadius)"
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            label="Đến ngày"
                                            slotProps={{
                                                textField: {
                                                    sx: {
                                                        width: '100%',
                                                        bgcolor: "var(--palette-background-paper)",
                                                        borderRadius: "var(--shape-borderRadius)"
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="overwrite"
                                    control={control}
                                    render={({ field }) => (
                                        <Box
                                            onClick={() => field.onChange(!field.value)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                p: 1.5,
                                                bgcolor: field.value ? alpha('#FFAB00', 0.08) : 'transparent',
                                                borderRadius: "var(--shape-borderRadius-md)",
                                                border: '1px solid',
                                                borderColor: field.value ? '#FFAB00' : alpha('#919EAB', 0.2),
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Checkbox
                                                {...field}
                                                checked={field.value}
                                                sx={{ p: 0, color: '#FFAB00', '&.Mui-checked': { color: '#FFAB00' } }}
                                            />
                                            <Box>
                                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: field.value ? '#B76E00' : 'var(--palette-text-primary)' }}>
                                                    Ghi đè lịch cũ
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.75rem', color: field.value ? '#B76E00' : 'var(--palette-text-secondary)' }}>
                                                    Nếu nhân viên đã có lịch trong tầm ngày này, hệ thống sẽ tự động đổi sang ca mới.
                                                </Typography>
                                            </Box>
                                        </Box>
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
                                borderRadius: "var(--shape-borderRadius)",
                                textTransform: 'none',
                                fontWeight: 700,
                                padding: '8px 20px',
                                color: 'var(--palette-text-primary)',
                                borderColor: 'rgba(145, 158, 171, 0.32)',
                                '&:hover': {
                                    bgcolor: 'rgba(145, 158, 171, 0.08)',
                                    borderColor: 'var(--palette-text-primary)',
                                }
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                borderRadius: "var(--shape-borderRadius)",
                                textTransform: 'none',
                                fontWeight: 700,
                                padding: '8px 20px',
                                bgcolor: 'var(--palette-text-primary)',
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: "var(--palette-grey-700)",
                                    boxShadow: "var(--customShadows-z8)",
                                }
                            }}
                        >
                            {loading ? 'Hệ thống đang xử lý...' : 'Xác nhận phân ca'}
                        </Button>
                    </DialogActions>
                </form>
            </LocalizationProvider>
        </Dialog>
    );
};




