import { useState } from 'react';
import {
    Box,
    Card,
    Button,
    Stack,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useAttendances, useGenerateAttendance, useApproveAttendance } from './hooks/useAttendances';
import { getAttendanceColumns } from './configs/attendance.config';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { dataGridCardStyles, dataGridContainerStyles, dataGridStyles, dialogStyles, primaryButtonStyles } from './configs/styles.config';
import { HRToolbar } from './sections/HRToolbar';
import { useDataGridLocale } from '../../hooks/useDataGridLocale';
import { SortAscendingIcon, SortDescendingIcon, UnsortedIcon } from '../../assets/icons';

export const AttendanceListPage = () => {
    const [openGenDialog, setOpenGenDialog] = useState(false);
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [year, setYear] = useState(dayjs().year());
    const localeText = useDataGridLocale();

    const { data: attendances = [], isLoading } = useAttendances({ month, year });

    const { mutate: generateAt } = useGenerateAttendance();
    const { mutate: approveAt } = useApproveAttendance();

    const handleGenerate = () => {
        generateAt({ month, year }, {
            onSuccess: () => {
                toast.success('Khởi tạo bảng công thành công');
                setOpenGenDialog(false);
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
            }
        });
    };

    const handleApprove = (id: string) => {
        if (window.confirm('Xác nhận duyệt bảng công này?')) {
            approveAt(id, {
                onSuccess: () => {
                    toast.success('Đã duyệt bảng công');
                }
            });
        }
    };

    const columns = getAttendanceColumns(handleApprove, (id) => console.log('Edit', id));

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = [2024, 2025, 2026];

    return (
        <Box sx={{ p: '24px' }}>
            <Box sx={{ mb: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Title title="Chấm công & Lương" />
                    <Breadcrumb
                        items={[
                            { label: "Dashboard", to: `/${prefixAdmin}` },
                            { label: "Chấm công & Lương" }
                        ]}
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AutoFixHighIcon />}
                    onClick={() => setOpenGenDialog(true)}
                    sx={{ ...primaryButtonStyles, bgcolor: '#00A76F', '&:hover': { bgcolor: '#007B55' } }}
                >
                    Khởi tạo bảng công
                </Button>
            </Box>

            <Card sx={dataGridCardStyles}>
                <Box sx={dataGridContainerStyles}>
                    <DataGrid
                        rows={attendances}
                        columns={columns}
                        getRowId={(row) => row._id}
                        loading={isLoading}
                        checkboxSelection
                        disableRowSelectionOnClick
                        localeText={localeText}
                        slots={{
                            toolbar: () => (
                                <HRToolbar searchPlaceholder="Tìm kiếm nhân viên...">
                                    <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                                        <TextField
                                            select
                                            size="small"
                                            value={month}
                                            onChange={(e) => setMonth(Number(e.target.value))}
                                            sx={{
                                                width: 120,
                                                '& .MuiInputBase-root': { height: '40px', fontSize: '0.875rem' }
                                            }}
                                        >
                                            {months.map(m => <MenuItem key={m} value={m}>Tháng {m}</MenuItem>)}
                                        </TextField>
                                        <TextField
                                            select
                                            size="small"
                                            value={year}
                                            onChange={(e) => setYear(Number(e.target.value))}
                                            sx={{
                                                width: 100,
                                                '& .MuiInputBase-root': { height: '40px', fontSize: '0.875rem' }
                                            }}
                                        >
                                            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                                        </TextField>
                                    </Stack>
                                </HRToolbar>
                            ),
                            columnSortedAscendingIcon: SortAscendingIcon,
                            columnSortedDescendingIcon: SortDescendingIcon,
                            columnUnsortedIcon: UnsortedIcon,
                        }}
                        sx={dataGridStyles}
                    />
                </Box>
            </Card>

            <Dialog
                open={openGenDialog}
                onClose={() => setOpenGenDialog(false)}
                sx={dialogStyles}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Khởi tạo bảng công mới
                    </Typography>
                    <IconButton onClick={() => setOpenGenDialog(false)} size="small" sx={{ color: '#637381' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ bgcolor: '#F4F6F8 !important', py: '24px !important' }}>
                    <Typography variant="body2" sx={{ mb: 3, color: '#637381', fontWeight: 500 }}>
                        Hệ thống sẽ tự động tổng hợp tất cả lịch làm việc đã hoàn thành (Checked-out) trong tháng để tính lương.
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label="Tháng"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                        >
                            {months.map(m => <MenuItem key={m} value={m}>Tháng {m}</MenuItem>)}
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            label="Năm"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                        >
                            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px', gap: 1.5 }}>
                    <Button
                        onClick={() => setOpenGenDialog(false)}
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
                        onClick={handleGenerate}
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
                        Khởi tạo
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

