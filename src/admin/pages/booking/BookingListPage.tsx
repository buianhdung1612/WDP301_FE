import { useNavigate } from "react-router-dom";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { exportStaffSchedule } from "../../api/booking.api";
import { toast } from "react-toastify";
import { Stack, CircularProgress, Box, Button } from "@mui/material";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { BookingList } from "./sections/BookingList";
import { COLORS } from "../role/configs/constants";
import 'dayjs/locale/vi';

export const BookingListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [exportDate, setExportDate] = useState<Dayjs | null>(dayjs());
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!exportDate) {
            toast.warning("Vui lòng chọn ngày để xuất file");
            return;
        }
        try {
            setIsExporting(true);
            const data = await exportStaffSchedule(exportDate.format("YYYY-MM-DD"));
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `lich_phan_cong_nhan_vien_${exportDate.format("DD_MM_YYYY")}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Đã xuất file phân công thành công");
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Lỗi khi xuất file phân công");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Box sx={{ maxWidth: '1200px', mx: 'auto', p: '1.5rem' }}>
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Title title={t("admin.booking.title.list")} />
                        <Breadcrumb
                            items={[
                                { label: t("admin.dashboard"), to: `/${prefixAdmin}` },
                                { label: t("admin.booking.title.list") }
                            ]}
                        />
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 200 }}>
                            <DatePicker
                                label="Ngày phân công"
                                value={exportDate}
                                onChange={(newValue) => setExportDate(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                    }
                                }}
                            />
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={isExporting ? <CircularProgress size={16} /> : <Icon icon="eva:download-fill" />}
                            onClick={handleExport}
                            disabled={isExporting}
                            sx={{
                                color: COLORS.primary,
                                borderColor: COLORS.primary,
                                minHeight: "2.5rem",
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                padding: "0 1rem",
                                borderRadius: '8px',
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: COLORS.primary,
                                    bgcolor: 'rgba(33, 43, 54, 0.08)'
                                }
                            }}
                        >
                            {isExporting ? "Đang xuất..." : "Xuất lịch phân công"}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Icon icon="eva:plus-fill" />}
                            onClick={() => navigate(`/${prefixAdmin}/booking/create`)}
                            sx={{
                                bgcolor: COLORS.primary,
                                color: '#fff',
                                minHeight: "2.5rem",
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                padding: "0 1rem",
                                borderRadius: '8px',
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#454F5B',
                                    boxShadow: "0 8px 16px 0 rgba(145 158 171 / 16%)"
                                }
                            }}
                        >
                            {t("admin.booking.title.create")}
                        </Button>
                    </Stack>
                </Box>

                <BookingList />
            </Box>
        </LocalizationProvider>
    );
};
