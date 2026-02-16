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
}

export const BulkScheduleDialog = ({
    open,
    onClose,
    onSave,
    departmentId,
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
                <IconButton onClick={onClose} size="small" sx={{ color: '#637381' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ bgcolor: '#F4F6F8 !important', py: '24px !important' }}>
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
                                        sx={{ bgcolor: '#fff', borderRadius: '8px' }}
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
                                                        <Typography variant="caption" sx={{ color: '#FF5630', fontWeight: 700, ml: 1 }}>
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
                                            sx={{ bgcolor: '#fff', borderRadius: '8px' }}
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
                                            borderRadius: '12px',
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
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: field.value ? '#B76E00' : '#1C252E' }}>
                                                Ghi đè lịch cũ
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem', color: field.value ? '#B76E00' : '#637381' }}>
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
                        Xác nhận phân ca
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
