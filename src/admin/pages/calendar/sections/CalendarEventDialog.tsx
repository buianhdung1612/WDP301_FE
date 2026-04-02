import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Stack,
    Box,
    Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CloseIcon, CalendarIcon } from '../../../assets/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import { useServices } from '../../service/hooks/useService';
import { useAccounts } from '../../account-admin/hooks/useAccountAdmin';
import { SelectSingle } from '../../../components/ui/SelectSingle';
import { StaffAvailabilityTimeline } from '../../booking/sections/StaffAvailabilityTimeline';
import { Icon } from '@iconify/react';

interface CalendarEventDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (event: any) => void;
    initialDate?: Date;
}

export const CalendarEventDialog: React.FC<CalendarEventDialogProps> = ({
    open,
    onClose,
    onSave,
    initialDate,
}) => {
    const servicesRes = useServices({ limit: 1000 });
    const staffListRes = useAccounts();

    const services = useMemo(() => {
        if (!servicesRes.data) return [];
        const data = servicesRes.data as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [servicesRes.data]);

    const staffList = useMemo(() => {
        if (!staffListRes.data) return [];
        const data = staffListRes.data as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [staffListRes.data]);

    const [serviceId, setServiceId] = useState('');
    const [staffId, setStaffId] = useState('');
    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs(initialDate || new Date()));
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(initialDate || new Date()).add(1, 'hour'));
    const [userId, setUserId] = useState(''); // Customer ID (placeholder)
    const [petIds, setPetIds] = useState<string[]>([]); // Pet IDs (placeholder)
    const [notes, setNotes] = useState('');
    const [bookingStatus, setBookingStatus] = useState('pending');

    // Filter staff based on selected service
    // Logic: Staff có role.isStaff=true và role.serviceIds chứa serviceId đã chọn
    const filteredStaff = React.useMemo(() => {
        if (!serviceId) return staffList;

        return staffList.filter((staff: any) => {
            // Kiểm tra xem staff có role nào có serviceId này không
            if (!staff.roles || staff.roles.length === 0) return false;

            return staff.roles.some((role: any) => {
                // Role phải là staff role và có serviceIds chứa serviceId đã chọn
                return role.isStaff && role.serviceIds && role.serviceIds.includes(serviceId);
            });
        });
    }, [serviceId, staffList]);

    // Convert services to options format
    const serviceOptions = React.useMemo(() =>
        services.map((service: any) => ({
            value: service._id,
            label: `${service.name} (${service.duration} phút)`
        }))
        , [services]);

    // Convert staff to options format
    const staffOptions = React.useMemo(() =>
        filteredStaff.map((staff: any) => ({
            value: staff._id,
            label: staff.fullName
        }))
        , [filteredStaff]);

    // Status options
    const statusOptions = [
        { value: 'pending', label: 'Chờ xác nhận' },
        { value: 'confirmed', label: 'Đã xác nhận' },
        { value: 'delayed', label: 'Trễ hẹn' },
        { value: 'in-progress', label: 'Đang thực hiện' },
        { value: 'completed', label: 'Đã hoàn thành' },
        { value: 'cancelled', label: 'Đã hủy' }
    ];

    useEffect(() => {
        if (open && initialDate) {
            setStartDate(dayjs(initialDate));
            setEndDate(dayjs(initialDate).add(1, 'hour'));
        }
    }, [open, initialDate]);

    // Auto-calculate end time when service or start date changes
    useEffect(() => {
        if (serviceId && startDate) {
            const service = services.find((s: any) => s._id === serviceId);
            if (service && service.duration) {
                setEndDate(startDate.add(service.duration, 'minute'));
            }
        }
    }, [serviceId, startDate, services]);

    // Reset staff when service changes
    useEffect(() => {
        setStaffId('');
    }, [serviceId]);

    const handleSave = () => {
        if (!serviceId || !startDate || !endDate) return;

        onSave({
            serviceId,
            staffId,
            userId,
            petIds,
            notes,
            start: startDate?.toISOString(),
            end: endDate?.toISOString(),
            bookingStatus,
        });

        // Reset and close
        setServiceId('');
        setStaffId('');
        setStartDate(dayjs());
        setEndDate(dayjs().add(1, 'hour'));
        setUserId('');
        setPetIds([]);
        setNotes('');
        setBookingStatus('pending');
        onClose();
    };

    const commonPickerStyles = {
        '& .MuiOutlinedInput-root': {
            fontSize: '0.9375rem',
            borderRadius: "var(--shape-borderRadius)",
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--palette-text-disabled)33 !important',
                borderWidth: '1px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--palette-text-primary) !important',
                borderWidth: '2px !important',
            },
        },
        '& .MuiInputLabel-root': {
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--palette-text-secondary)',
            '&.Mui-focused': { color: 'var(--palette-text-primary)' }
        },
        '& .MuiInputBase-input': {
            fontSize: '0.9375rem',
            padding: '12px 14px',
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: "var(--shape-borderRadius-lg)",
                        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.16)',
                        backgroundImage: 'none',
                        maxWidth: '600px',
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: '16px 24px',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--palette-text-primary)'
                }}>
                    Thêm sự kiện
                    <IconButton onClick={onClose} size="small" sx={{ color: 'var(--palette-text-secondary)' }}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: '8px 24px 24px !important', bgcolor: 'var(--palette-background-neutral)' }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <SelectSingle
                            label="Dịch vụ"
                            options={serviceOptions}
                            value={serviceId}
                            onChange={setServiceId}
                            sx={{ width: '100%' }}
                        />

                        <DateTimePicker
                            label="Ngày bắt đầu"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            format="DD/MM/YYYY HH:mm"
                            ampm={false}
                            minutesStep={15}
                            slots={{
                                openPickerIcon: (props) => <CalendarIcon {...props} sx={{ fontSize: 24, color: 'var(--palette-text-secondary)' }} />,
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    InputLabelProps: { shrink: true },
                                    sx: { ...commonPickerStyles, '& .MuiOutlinedInput-root': { ...commonPickerStyles['& .MuiOutlinedInput-root'], bgcolor: 'transparent' } }
                                },
                                popper: {
                                    sx: {
                                        '& .MuiPaper-root': {
                                            borderRadius: "var(--shape-borderRadius-lg)",
                                            boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                                            border: '1px solid rgba(145, 158, 171, 0.12)',
                                            mt: 1,
                                            bgcolor: "var(--palette-background-paper)",
                                            backgroundImage: 'none',
                                            '& .MuiPickersLayout-root': {
                                                padding: '8px',
                                            },
                                            '& .MuiPickersDay-root': {
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                '&:hover': { bgcolor: 'var(--palette-primary-main)14 !important' }
                                            },
                                            '& .MuiPickersDay-root.Mui-selected': {
                                                bgcolor: 'var(--palette-primary-main) !important',
                                                color: '#fff !important'
                                            }
                                        }
                                    }
                                }
                            }}
                        />

                        <DateTimePicker
                            label="Ngày kết thúc"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            format="DD/MM/YYYY HH:mm"
                            ampm={false}
                            minutesStep={15}
                            slots={{
                                openPickerIcon: (props) => <CalendarIcon {...props} sx={{ fontSize: 24, color: 'var(--palette-text-secondary)' }} />,
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    InputLabelProps: { shrink: true },
                                    sx: { ...commonPickerStyles, '& .MuiOutlinedInput-root': { ...commonPickerStyles['& .MuiOutlinedInput-root'], bgcolor: 'transparent' } }
                                },
                                popper: {
                                    sx: {
                                        '& .MuiPaper-root': {
                                            borderRadius: "var(--shape-borderRadius-lg)",
                                            boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
                                            border: '1px solid rgba(145, 158, 171, 0.12)',
                                            mt: 1,
                                            bgcolor: "var(--palette-background-paper)",
                                            backgroundImage: 'none',
                                            '& .MuiPickersLayout-root': {
                                                padding: '8px',
                                            },
                                            '& .MuiPickersDay-root': {
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                '&:hover': { bgcolor: 'var(--palette-primary-main)14 !important' }
                                            },
                                            '& .MuiPickersDay-root.Mui-selected': {
                                                bgcolor: 'var(--palette-primary-main) !important',
                                                color: '#fff !important'
                                            }
                                        }
                                    }
                                }
                            }}
                        />

                        <SelectSingle
                            label="Nhân viên thực hiện"
                            options={staffOptions}
                            value={staffId}
                            onChange={setStaffId}
                            sx={{ width: '100%' }}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Ghi chú"
                            placeholder="Nhập ghi chú cho đặt lịch..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                ...commonPickerStyles,
                                '& .MuiOutlinedInput-root': {
                                    ...commonPickerStyles['& .MuiOutlinedInput-root'],
                                    bgcolor: 'transparent',
                                    padding: 0
                                },
                                '& .MuiInputBase-input': {
                                    padding: '12px 14px'
                                }
                            }}
                        />

                        <SelectSingle
                            label="Trạng thái"
                            options={statusOptions}
                            value={bookingStatus}
                            onChange={setBookingStatus}
                            sx={{ width: '100%' }}
                        />

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'var(--palette-text-secondary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon icon="solar:calendar-bold-duotone" width={20} />
                                Lịch biểu nhân viên thực tế
                            </Typography>
                            <StaffAvailabilityTimeline
                                date={startDate || dayjs()}
                                selectionStart={startDate || undefined}
                                selectionEnd={endDate || undefined}
                                selectedStaffIds={staffId ? [staffId] : []}
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: '16px 24px', gap: 1 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: "var(--shape-borderRadius)",
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            padding: "var(--shape-borderRadius-sm) calc(2 * var(--spacing))",
                            color: 'var(--palette-text-primary)',
                            borderColor: 'rgba(145, 158, 171, 0.32)',
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{
                            borderRadius: "var(--shape-borderRadius)",
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            padding: "var(--shape-borderRadius-sm) calc(2 * var(--spacing))",
                            bgcolor: 'var(--palette-text-primary)',
                            '&:hover': { bgcolor: "var(--palette-grey-700)" }
                        }}
                    >
                        Tạo mới
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};



