import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    Stack,
    TextField,
    Typography,
    Divider,
    CircularProgress,
    Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useServices } from "../service/hooks/useService";
import { useUsers } from "../account-user/hooks/useAccountUser";
import { usePets } from "../account-user/hooks/usePet";
import { useStaffByService } from "../account-admin/hooks/useAccountAdmin";
import { useBookingDetail, useUpdateBooking, useBookings } from "./hooks/useBookingManagement";
import { useSchedules } from "../hr/hooks/useSchedules";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { COLORS } from "../role/configs/constants";
import { SelectSingle } from "../../components/ui/SelectSingle";
import { SelectMulti } from "../../components/ui/SelectMulti";
import 'dayjs/locale/vi';
import { StaffAvailabilityTimeline } from "./sections/StaffAvailabilityTimeline";
import { QuickCustomerDialog } from "./sections/QuickCustomerDialog";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useTranslation } from "react-i18next";

export const BookingEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isStaff = user?.roles?.some((role: any) => role.isStaff);

    const { data: bookingRes, isLoading: isLoadingBooking } = useBookingDetail(id || "");
    const booking = bookingRes?.data;

    const { data: services = [] } = useServices();
    const { data: usersRes } = useUsers({ limit: 1000 });
    const users = (usersRes as any)?.recordList || (Array.isArray(usersRes) ? usersRes : []);
    const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking();
    const [quickCustomerDialogOpen, setQuickCustomerDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        userId: "",
        petIds: [] as string[],
        serviceId: "",
        staffId: "",
        date: dayjs(),
        startTime: dayjs().set('hour', 9).set('minute', 0),
        endTime: dayjs().set('hour', 10).set('minute', 0),
        notes: "",
        bookingStatus: "pending",
        paymentMethod: "money",
        paymentStatus: "unpaid",
        discount: 0
    });

    useEffect(() => {
        if (booking) {
            setFormData({
                userId: booking.userId?._id || "",
                petIds: booking.petIds?.map((p: any) => p._id) || [],
                serviceId: booking.serviceId?._id || "",
                staffId: booking.staffId?._id || "",
                date: dayjs(booking.start),
                startTime: dayjs(booking.start),
                endTime: dayjs(booking.end),
                notes: booking.notes || "",
                bookingStatus: booking.bookingStatus || "pending",
                paymentMethod: booking.paymentMethod || "money",
                paymentStatus: booking.paymentStatus || "unpaid",
                discount: booking.discount || 0
            });
        }
    }, [booking]);

    const isReadOnly = useMemo(() =>
        ["completed", "cancelled"].includes(booking?.bookingStatus), [booking]);

    const { data: staffList = [], isLoading: isLoadingStaff } = useStaffByService(formData.serviceId);

    const { data: schedulesRes } = useSchedules({
        date: formData.date.format('YYYY-MM-DD')
    });
    const { data: bookingsRes } = useBookings({
        date: formData.date.format('YYYY-MM-DD')
    });

    const schedules = schedulesRes?.data || [];
    const bookings = bookingsRes?.data || [];

    const staffAvailability = useMemo(() => {
        const startH = formData.startTime.hour() + formData.startTime.minute() / 60;
        const endH = formData.endTime.hour() + formData.endTime.minute() / 60;

        return staffList.reduce((acc: any, staff: any) => {
            const staffSchedules = schedules.filter((s: any) => s.staffId?._id === staff._id);
            const staffBookings = bookings.filter((b: any) => b.staffId?._id === staff._id && b._id !== id);

            const hasShift = staffSchedules.some((s: any) => {
                if (!s.shiftId) return false;
                const [sH, sM] = s.shiftId.startTime.split(':').map(Number);
                const [eH, eM] = s.shiftId.endTime.split(':').map(Number);
                const shiftStart = sH + sM / 60;
                const shiftEnd = eH + eM / 60;
                return shiftStart <= startH && shiftEnd >= endH;
            });

            const hasOverlap = staffBookings.some((b: any) => {
                const bStart = dayjs(b.start);
                const bEnd = dayjs(b.end);
                const bStartH = bStart.hour() + bStart.minute() / 60;
                const bEndH = bEnd.hour() + bEnd.minute() / 60;
                return startH < bEndH && endH > bStartH;
            });

            acc[staff._id] = {
                available: hasShift && !hasOverlap,
                reason: !hasShift ? "Không có ca" : (hasOverlap ? "Trùng lịch" : "")
            };
            return acc;
        }, {});
    }, [staffList, schedules, bookings, formData.startTime, formData.endTime, id]);

    const { data: userPets = [] } = usePets({ userId: formData.userId });

    useEffect(() => {
        if (formData.serviceId && !isReadOnly) {
            const service = services.find((s: any) => s._id === formData.serviceId);
            if (service && service.duration) {
                const newEndTime = formData.startTime.add(service.duration, 'minute');
                if (!newEndTime.isSame(formData.endTime)) {
                    setFormData(prev => ({ ...prev, endTime: newEndTime }));
                }
            }
        }
    }, [formData.serviceId, formData.startTime, services, formData.endTime, isReadOnly]);

    useEffect(() => {
        if (isStaff && !isReadOnly) {
            if (formData.staffId !== user?.id) {
                setFormData(prev => ({ ...prev, staffId: user?.id || "" }));
            }
            return;
        }

        if (formData.staffId && staffList.length > 0 && !isReadOnly) {
            const isStaffValid = staffList.some((s: any) => s._id === formData.staffId);
            if (!isStaffValid && formData.staffId !== "") {
                setFormData(prev => ({ ...prev, staffId: "" }));
            }
        } else if (!formData.serviceId && formData.staffId !== "" && !isReadOnly) {
            setFormData(prev => ({ ...prev, staffId: "" }));
        }
    }, [staffList, formData.serviceId, formData.staffId, isStaff, user?.id, isReadOnly]);

    const userOptions = useMemo(() =>
        users.map((u: any) => ({
            value: u._id,
            label: `${u.fullName} - ${u.phone}`,
        })), [users]);

    const petOptions = useMemo(() =>
        userPets.map((pet: any) => ({
            value: pet._id,
            label: `${pet.name} (${pet.breed || '?'})`
        })), [userPets]);

    const staffOptions = useMemo(() =>
        staffList.map((staff: any) => {
            const availability = staffAvailability[staff._id];
            return {
                value: staff._id,
                label: staff.fullName + (availability?.available ? "" : ` (${availability?.reason})`),
                disabled: !availability?.available
            };
        }), [staffList, staffAvailability]);

    const serviceOptions = useMemo(() =>
        services.map((service: any) => ({
            value: service._id,
            label: service.name,
            price: service.basePrice || 0
        })), [services]);

    const selectedService = useMemo(() =>
        services.find((s: any) => s._id === formData.serviceId),
        [services, formData.serviceId]);

    const isTimeDisabled = (time: dayjs.Dayjs, type: 'start' | 'end') => {
        const isToday = formData.date.isSame(dayjs(), 'day');
        if (isToday && time.isBefore(dayjs().subtract(1, 'minute'))) return true;

        const totalMinutes = time.hour() * 60 + time.minute();
        const duration = selectedService?.duration || 0;

        // 1. Get working blocks (either individual staff shifts or global blocks)
        let workingBlocks = [
            { start: 8 * 60, end: 12 * 60 },
            { start: 13 * 60, end: 17 * 60 },
            { start: 17 * 60, end: 19 * 60 }
        ];

        if (formData.staffId) {
            const staffSchedule = schedules.find((s: any) => s.staffId?._id === formData.staffId);
            if (staffSchedule?.shiftId) {
                const [sH, sM] = staffSchedule.shiftId.startTime.split(':').map(Number);
                const [eH, eM] = staffSchedule.shiftId.endTime.split(':').map(Number);
                workingBlocks = [{ start: sH * 60 + sM, end: eH * 60 + eM }];
            }
        }

        // 2. Validate based on blocks and duration
        if (type === 'start') {
            return !workingBlocks.some(block =>
                totalMinutes >= block.start && (totalMinutes + duration) <= block.end
            );
        }

        return !workingBlocks.some(block =>
            totalMinutes > block.start && totalMinutes <= block.end
        );
    };

    const pricing = useMemo(() => {
        const service = selectedService;
        if (!service) return { subTotal: 0, total: 0, breakdown: [] };

        let subTotal = 0;
        const breakdown: any[] = [];

        if (service.pricingType === 'by-weight' && service.priceList?.length > 0) {
            if (formData.petIds.length > 0) {
                formData.petIds.forEach(petId => {
                    const pet = userPets.find((p: any) => p._id === petId);
                    if (pet) {
                        const priceItem = service.priceList.find((item: any) => {
                            const label = item.label.toLowerCase();
                            const weight = pet.weight || 0;
                            if (label.includes("<")) return weight < parseFloat(label.replace(/[^0-9.]/g, ''));
                            if (label.includes(">")) return weight >= parseFloat(label.replace(/[^0-9.]/g, ''));
                            if (label.includes("-")) {
                                const [min, max] = label.split("-").map((x: string) => parseFloat(x.replace(/[^0-9.]/g, '')));
                                return weight >= min && weight < (max || 999);
                            }
                            if (!isNaN(parseFloat(label))) return weight <= parseFloat(label);
                            return false;
                        });
                        const price = priceItem?.value || service.basePrice || 0;
                        subTotal += price;
                        breakdown.push({ name: pet.name, price });
                    }
                });
            } else subTotal = service.basePrice || 0;
        } else {
            const basePrice = service.basePrice || 0;
            if (formData.petIds.length > 0) {
                formData.petIds.forEach(petId => {
                    const pet = userPets.find((p: any) => p._id === petId);
                    subTotal += basePrice;
                    breakdown.push({ name: pet?.name || "Thú cưng", price: basePrice });
                });
            } else subTotal = basePrice;
        }

        const total = subTotal - formData.discount;
        return { subTotal, total, breakdown };
    }, [formData.serviceId, formData.petIds, formData.discount, services, userPets]);

    const handleSubmit = () => {
        if (isReadOnly) return;
        if (!formData.userId || !formData.serviceId || formData.petIds.length === 0) {
            toast.error("Vui lòng điền đủ thông tin bắt buộc");
            return;
        }

        const startDateTime = formData.date.set('hour', formData.startTime.hour()).set('minute', formData.startTime.minute()).set('second', 0);
        const endDateTime = formData.date.set('hour', formData.endTime.hour()).set('minute', formData.endTime.minute()).set('second', 0);

        if (startDateTime.isBefore(dayjs().subtract(1, 'minute'))) {
            toast.error("Thời gian bắt đầu không thể ở quá khứ");
            return;
        }

        // Validate 15-min intervals
        if (startDateTime.minute() % 15 !== 0 || endDateTime.minute() % 15 !== 0) {
            toast.error("Thời gian phải là bội số của 15 phút (00, 15, 30, 45)");
            return;
        }

        // Validate working blocks
        const startTotal = startDateTime.hour() * 60 + startDateTime.minute();
        const endTotal = endDateTime.hour() * 60 + endDateTime.minute();
        const workingBlocks = [
            { start: 8 * 60, end: 12 * 60 },
            { start: 13 * 60, end: 17 * 60 },
            { start: 17 * 60, end: 19 * 60 }
        ];

        const isValidBlock = workingBlocks.some(block =>
            startTotal >= block.start && endTotal <= block.end
        );

        if (!isValidBlock) {
            toast.error("Thời gian đặt lịch phải nằm trong các ca (08:00-12:00, 13:00-17:00, 17:00-19:00)");
            return;
        }

        if (formData.staffId) {
            const availability = staffAvailability[formData.staffId];
            if (availability && !availability.available) {
                toast.error(`Nhân viên này đang bận hoặc không có ca làm việc (${availability.reason})`);
                return;
            }
        }

        const data = {
            ...formData,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            subTotal: pricing.subTotal,
            total: pricing.total
        };

        updateBooking({ id: id!, data }, {
            onSuccess: () => {
                toast.success("Cập nhật đơn hàng thành công!");
                navigate(`/${prefixAdmin}/booking/detail/${id}`);
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
            }
        });
    };

    if (isLoadingBooking) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Box sx={{ maxWidth: '1200px', mx: 'auto', p: '1.5rem' }}>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box>
                            <Title title={isReadOnly ? `Đơn hàng #${booking?.code?.slice(-6).toUpperCase()}` : `Chỉnh sửa #${booking?.code?.slice(-6).toUpperCase()}`} />
                            <Breadcrumb
                                items={[
                                    { label: "Dashboard", to: `/${prefixAdmin}` },
                                    { label: "Danh sách đơn", to: `/${prefixAdmin}/booking/list` },
                                    { label: "Chỉnh sửa" }
                                ]}
                            />
                        </Box>
                        {booking?.bookingStatus && (
                            <Chip
                                label={t(`admin.booking.status.${booking.bookingStatus.replace('-', '_')}`)}
                                sx={{
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    height: '28px',
                                    bgcolor:
                                        booking.bookingStatus === 'completed' ? 'rgba(34, 197, 94, 0.16)' :
                                            booking.bookingStatus === 'cancelled' ? 'rgba(255, 86, 48, 0.16)' :
                                                booking.bookingStatus === 'pending' ? 'rgba(255, 171, 0, 0.16)' :
                                                    'rgba(0, 184, 217, 0.16)',
                                    color:
                                        booking.bookingStatus === 'completed' ? '#22C55E' :
                                            booking.bookingStatus === 'cancelled' ? '#FF5630' :
                                                booking.bookingStatus === 'pending' ? '#FFAB00' :
                                                    '#00B8D9'
                                }}
                            />
                        )}
                    </Stack>
                    <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<Icon icon="eva:arrow-back-fill" />}>Quay lại</Button>
                </Box>

                {isReadOnly && (
                    <Box sx={{ mb: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(255, 86, 48, 0.08)', border: '1px solid rgba(255, 86, 48, 0.24)' }}>
                        <Typography sx={{ color: '#B71D18', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon icon="eva:alert-circle-fill" />
                            Đơn hàng đã {formData.bookingStatus === 'completed' ? 'hoàn thành' : 'bị hủy'}, không thể chỉnh sửa thông tin.
                        </Typography>
                    </Box>
                )}

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ p: 3, borderRadius: '20px', boxShadow: COLORS.shadow }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2.5}>
                                    <SelectSingle
                                        label="Dịch vụ"
                                        options={serviceOptions}
                                        value={formData.serviceId}
                                        onChange={(val) => setFormData({ ...formData, serviceId: val })}
                                        disabled={isReadOnly}
                                        sx={{ width: '100%' }}
                                    />
                                    {!isStaff && (
                                        <SelectSingle
                                            label="Nhân viên"
                                            options={[{ value: "", label: "Chưa chỉ định" }, ...staffOptions]}
                                            value={formData.staffId}
                                            onChange={(val) => setFormData({ ...formData, staffId: val })}
                                            disabled={isReadOnly || isLoadingStaff || !formData.serviceId}
                                            sx={{ width: '100%' }}
                                        />
                                    )}
                                    {isStaff && (
                                        <TextField
                                            label="Nhân viên"
                                            fullWidth
                                            value={booking?.staffId?.fullName || user?.fullName || "Chính mình"}
                                            disabled
                                            sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: COLORS.primary, fontWeight: 700 } }}
                                        />
                                    )}
                                </Stack>

                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12, sm: 4.5 }}>
                                        <DatePicker
                                            label="Ngày thực hiện"
                                            value={formData.date}
                                            onChange={(val) => setFormData({ ...formData, date: val || dayjs() })}
                                            disabled={isReadOnly}
                                            format="DD/MM/YYYY"
                                            minDate={dayjs()}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3.75 }}>
                                        <TimePicker
                                            label="Bắt đầu"
                                            value={formData.startTime}
                                            onChange={(val) => setFormData({ ...formData, startTime: val || dayjs() })}
                                            disabled={isReadOnly}
                                            ampm={false} format="HH:mm"
                                            minutesStep={15}
                                            shouldDisableTime={(timeValue) => isTimeDisabled(timeValue, 'start')}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3.75 }}>
                                        <TimePicker
                                            label="Kết thúc"
                                            value={formData.endTime}
                                            onChange={(val) => setFormData({ ...formData, endTime: val || dayjs() })}
                                            disabled={isReadOnly}
                                            ampm={false} format="HH:mm"
                                            minutesStep={15}
                                            shouldDisableTime={(timeValue) => isTimeDisabled(timeValue, 'end')}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>
                                </Grid>

                                <TextField
                                    fullWidth multiline rows={4} label="Ghi chú"
                                    value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    disabled={isReadOnly}
                                />

                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#637381' }}>Lịch nhân viên {formData.date.format('DD/MM/YYYY')}</Typography>
                                    <StaffAvailabilityTimeline
                                        date={formData.date}
                                        serviceId={formData.serviceId}
                                        selectionStart={formData.startTime}
                                        selectionEnd={formData.endTime}
                                        selectedStaffId={formData.staffId}
                                        onlyShowSelected={isStaff}
                                    />
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={3}>
                            <Card sx={{ p: 3, borderRadius: '20px', boxShadow: COLORS.shadow }}>
                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#637381' }}>Khách hàng & Thú cưng</Typography>
                                        {!isReadOnly && (
                                            <Button
                                                size="small"
                                                startIcon={<Icon icon="eva:plus-fill" />}
                                                onClick={() => setQuickCustomerDialogOpen(true)}
                                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                                            >
                                                Tạo mới
                                            </Button>
                                        )}
                                    </Box>
                                    <SelectSingle
                                        label="Khách hàng"
                                        options={userOptions}
                                        value={formData.userId}
                                        onChange={(val) => setFormData({ ...formData, userId: val, petIds: [] })}
                                        disabled={isReadOnly}
                                    />
                                    <SelectMulti
                                        label="Thú cưng"
                                        options={petOptions}
                                        value={formData.petIds}
                                        onChange={(val) => setFormData({ ...formData, petIds: val })}
                                        disabled={isReadOnly || !formData.userId}
                                    />
                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                    <SelectSingle
                                        label="Trạng thái đơn"
                                        options={[
                                            { value: "pending", label: "Chờ xác nhận" },
                                            { value: "confirmed", label: "Đã xác nhận" },
                                            { value: "delayed", label: "Trễ hẹn" },
                                            { value: "in-progress", label: "Đang thực hiện" },
                                            { value: "completed", label: "Hoàn thành" },
                                            { value: "cancelled", label: "Hủy đơn" },
                                            { value: "returned", label: "Khách đã đến" }
                                        ]}
                                        value={formData.bookingStatus}
                                        onChange={(val) => setFormData({ ...formData, bookingStatus: val })}
                                        disabled={isReadOnly}
                                    />
                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                    <SelectSingle
                                        label="Phương thức thanh toán"
                                        options={[
                                            { value: "money", label: "Tiền mặt" },
                                            { value: "vnpay", label: "VNPAY" },
                                            { value: "zalopay", label: "ZaloPay" }
                                        ]}
                                        value={formData.paymentMethod}
                                        onChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                                        disabled={isReadOnly}
                                    />
                                    <SelectSingle
                                        label="Trạng thái thanh toán"
                                        options={[
                                            { value: "unpaid", label: "Chưa thanh toán" },
                                            { value: "paid", label: "Đã thanh toán" },
                                            { value: "refunded", label: "Đã hoàn tiền" }
                                        ]}
                                        value={formData.paymentStatus}
                                        onChange={(val) => setFormData({ ...formData, paymentStatus: val })}
                                        disabled={isReadOnly}
                                    />

                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Tổng quát hóa đơn</Typography>
                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
                                                <Typography variant="subtitle2">{pricing.subTotal.toLocaleString()}đ</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">Giảm giá</Typography>
                                                <TextField
                                                    size="small" type="number"
                                                    value={formData.discount}
                                                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                                                    disabled={isReadOnly}
                                                    sx={{ width: 100, '& .MuiInputBase-input': { py: 0.5, textAlign: 'right' } }}
                                                />
                                            </Box>
                                            <Divider sx={{ my: 1 }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle1" fontWeight={700}>Tổng cộng</Typography>
                                                <Typography variant="subtitle1" fontWeight={700} color="success.main">{pricing.total.toLocaleString()}đ</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Card>

                            {!isReadOnly && (
                                <Button
                                    fullWidth variant="contained" size="large"
                                    onClick={handleSubmit} disabled={isUpdating}
                                    sx={{ bgcolor: COLORS.primary, py: 1.5, borderRadius: '12px', fontWeight: 700 }}
                                >
                                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            )}
                        </Stack>
                    </Grid>
                </Grid>

                <QuickCustomerDialog
                    open={quickCustomerDialogOpen}
                    onClose={() => setQuickCustomerDialogOpen(false)}
                    onSuccess={(userId, petIds) => {
                        setFormData(prev => ({
                            ...prev,
                            userId,
                            petIds
                        }));
                        setQuickCustomerDialogOpen(false);
                    }}
                />
            </Box>
        </LocalizationProvider>
    );
};
