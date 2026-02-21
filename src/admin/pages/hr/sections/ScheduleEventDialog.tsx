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

interface ScheduleEventDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    selectedEvent?: any;
    selectedDate?: Date;
    departmentId?: string;
    loading?: boolean;
}

export const ScheduleEventDialog = ({
    open,
    onClose,
    onSave,
    onDelete,
    selectedEvent,
    selectedDate,
    departmentId,
    loading = false,
}: ScheduleEventDialogProps) => {
    const { data: accounts = [] } = useAccounts({ departmentId, status: 'active' });
    const { data: shifts = [] } = useShifts({ departmentId, status: 'active' });

    const filteredAccounts = accounts;
    const filteredShifts = shifts;

    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            staffId: '',
            shiftId: '',
            date: dayjs(),
            notes: '',
        }
    });

    const watchDate = watch('date');
    const { data: schedulesRes } = useSchedules({
        date: watchDate?.format('YYYY-MM-DD'),
        departmentId
    });
    const busyStaffIds = schedulesRes?.data?.map((s: any) => s.staffId?._id) || [];

    useEffect(() => {
        if (selectedEvent) {
            reset({
                staffId: selectedEvent.extendedProps?.staffId || '',
                shiftId: selectedEvent.extendedProps?.shiftId || '',
                date: dayjs(selectedEvent.start),
                notes: selectedEvent.extendedProps?.notes || '',
            });
        } else if (selectedDate) {
            reset({
                staffId: '',
                shiftId: '',
                date: dayjs(selectedDate),
                notes: '',
            });
        } else {
            reset({
                staffId: '',
                shiftId: '',
                date: dayjs(),
                notes: '',
            });
        }
    }, [selectedEvent, selectedDate, reset, open]);

    const onSubmit = (data: any) => {
        const selectedShift = shifts.find((s: any) => s._id === data.shiftId);
        onSave({
            ...data,
            date: data.date.toDate(),
            departmentId: selectedShift?.departmentId || departmentId || null,
            id: selectedEvent?.id,
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
                    {selectedEvent ? 'Chỉnh sửa lịch làm việc' : 'Phân ca làm việc mới'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#637381' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent sx={{ bgcolor: '#F4F6F8 !important', py: '24px !important' }}>
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="staffId"
                                    control={control}
                                    rules={{ required: 'Vui lòng chọn nhân viên' }}
                                    render={({ field, fieldState: { error } }) => (
                                        <TextField
                                            {...field}
                                            select
                                            fullWidth
                                            label="Nhân viên"
                                            error={!!error}
                                            helperText={error?.message}
                                            sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                                        >
                                            {filteredAccounts.map((account: any) => {
                                                const isBusy = busyStaffIds.includes(account._id) && account._id !== selectedEvent?.extendedProps?.staffId;
                                                return (
                                                    <MenuItem
                                                        key={account._id}
                                                        value={account._id}
                                                        disabled={isBusy}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            opacity: isBusy ? 0.6 : 1
                                                        }}
                                                    >
                                                        <Box>
                                                            {account.fullName} ({account.email})
                                                        </Box>
                                                        {isBusy && (
                                                            <Typography variant="caption" sx={{ color: '#FF5630', fontWeight: 600 }}>
                                                                Bận
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

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="date"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            label="Ngày làm việc"
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    sx: { bgcolor: '#fff', borderRadius: '8px' }
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Ghi chú"
                                            sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: '16px 24px', gap: 1.5 }}>
                        {selectedEvent && (
                            <Button
                                onClick={() => onDelete?.(selectedEvent.id)}
                                color="error"
                                variant="outlined"
                                disabled={loading}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    mr: 'auto',
                                    borderColor: 'rgba(255, 86, 48, 0.32)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 86, 48, 0.08)',
                                        borderColor: '#FF5630',
                                    }
                                }}
                            >
                                {loading ? 'Đang xóa...' : 'Xóa ca'}
                            </Button>
                        )}
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
                            disabled={loading}
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
                            {loading ? 'Đang xử lý...' : (selectedEvent ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </DialogActions>
                </form>
            </LocalizationProvider>
        </Dialog>
    );
};
