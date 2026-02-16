import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    Stack,
    TextField,
    Typography,
    Divider,
    alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useServices } from "../service/hooks/useService";
import { useUsers } from "../account-user/hooks/useAccountUser";
import { usePets } from "../account-user/hooks/usePet";
import { useStaffByService } from "../account-admin/hooks/useAccountAdmin";
import { useCreateBooking, useBookings } from "./hooks/useBookingManagement";
import { useSchedules } from "../hr/hooks/useSchedules";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CalendarIcon } from "../../assets/icons";
import { COLORS } from "../role/configs/constants";
import { SelectSingle } from "../../components/ui/SelectSingle";
import { SelectMulti } from "../../components/ui/SelectMulti";
import 'dayjs/locale/vi';
import { StaffAvailabilityTimeline } from "./sections/StaffAvailabilityTimeline";
import { QuickCustomerDialog } from "./sections/QuickCustomerDialog";
import { useAuthStore } from "../../../stores/useAuthStore";

export const BookingCreatePage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isStaff = user?.roles?.some((role: any) => role.isStaff);

    const { data: services = [] } = useServices();
    const { data: usersRes } = useUsers({ limit: 1000 });
    const users = (usersRes as any)?.recordList || (Array.isArray(usersRes) ? usersRes : []);
    const { mutate: createBooking, isPending } = useCreateBooking();
    const [quickCustomerDialogOpen, setQuickCustomerDialogOpen] = useState(false);

    const formatWeightLabel = (label: string) => {
        const cleanLabel = label.trim().toLowerCase();
        if (cleanLabel.includes('<')) return `Dưới ${cleanLabel.replace('<', '').trim()} kg`;
        if (cleanLabel.includes('>')) return `Trên ${cleanLabel.replace('>', '').trim()} kg`;
        if (cleanLabel.includes('-')) return `Từ ${cleanLabel.trim()} kg`;
        if (!isNaN(parseFloat(cleanLabel))) return `Tối đa ${cleanLabel.trim()} kg`;
        return label;
    };

    const [formData, setFormData] = useState({
        userId: "",
        petIds: [] as string[],
        serviceId: "",
        staffId: user?.id || "",
        date: dayjs(),
        startTime: dayjs().set('hour', 9).set('minute', 0),
        endTime: dayjs().set('hour', 10).set('minute', 0),
        notes: "",
        bookingStatus: "pending",
        paymentMethod: "money",
        paymentStatus: "unpaid",
        discount: 0
    });
    const { data: staffList = [], isLoading: isLoadingStaff } = useStaffByService(formData.serviceId);

    // Fetch schedules and bookings for availability check
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
            const staffBookings = bookings.filter((b: any) => b.staffId?._id === staff._id);

            // Check if staff has a shift covering the entire duration
            const hasShift = staffSchedules.some((s: any) => {
                if (!s.shiftId) return false;
                const [sH, sM] = s.shiftId.startTime.split(':').map(Number);
                const [eH, eM] = s.shiftId.endTime.split(':').map(Number);
                const shiftStart = sH + sM / 60;
                const shiftEnd = eH + eM / 60;
                return shiftStart <= startH && shiftEnd >= endH;
            });

            // Check for overlapping bookings
            const hasOverlap = staffBookings.some((b: any) => {
                const bStart = dayjs(b.start);
                const bEnd = dayjs(b.end);
                const bStartH = bStart.hour() + bStart.minute() / 60;
                const bEndH = bEnd.hour() + bEnd.minute() / 60;
                // Overlap condition: (start1 < end2) AND (end1 > start2)
                return startH < bEndH && endH > bStartH;
            });

            acc[staff._id] = {
                available: hasShift && !hasOverlap,
                reason: !hasShift ? "Không có ca" : (hasOverlap ? "Trùng lịch" : "")
            };
            return acc;
        }, {});
    }, [staffList, schedules, bookings, formData.startTime, formData.endTime]);

    const { data: userPets = [] } = usePets({ userId: formData.userId });

    // Auto-update end time when service changes or start time changes
    useEffect(() => {
        if (formData.serviceId) {
            const service = services.find((s: any) => s._id === formData.serviceId);
            if (service && service.duration) {
                const newEndTime = formData.startTime.add(service.duration, 'minute');
                if (!newEndTime.isSame(formData.endTime)) {
                    setFormData(prev => ({ ...prev, endTime: newEndTime }));
                }
            }
        }
    }, [formData.serviceId, formData.startTime, services, formData.endTime]);

    // Reset staffId if it's not in the new staff list
    useEffect(() => {
        if (isStaff) {
            if (formData.staffId !== user?.id) {
                setFormData(prev => ({ ...prev, staffId: user?.id || "" }));
            }
            return;
        }

        if (formData.staffId && staffList.length > 0) {
            const isStaffValid = staffList.some((s: any) => s._id === formData.staffId);
            if (!isStaffValid && formData.staffId !== "") {
                setFormData(prev => ({ ...prev, staffId: "" }));
            }
        } else if (!formData.serviceId && formData.staffId !== "") {
            setFormData(prev => ({ ...prev, staffId: "" }));
        }
    }, [staffList, formData.serviceId, formData.staffId, isStaff, user?.id]);

    const userOptions = useMemo(() => {
        return users
            .map((u: any) => {
                const isMine = u.createdBy === user?.id;
                return {
                    value: u._id,
                    label: `${isMine ? "⭐ " : ""}${u.fullName} - ${u.phone}`,
                    isMine
                };
            })
            .sort((a: any, b: any) => {
                if (a.isMine && !b.isMine) return -1;
                if (!a.isMine && b.isMine) return 1;
                return 0;
            });
    }, [users, user?.id]);

    const petOptions = useMemo(() =>
        userPets.map((pet: any) => {
            const petType = pet.type === 'dog' ? 'Chó' : (pet.type === 'cat' ? 'Mèo' : '');
            const breedInfo = pet.breed ? `${pet.breed}` : petType;
            return {
                value: pet._id,
                label: `${pet.name} (${breedInfo} - ${pet.weight || "?"}kg)`
            };
        }), [userPets]);

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

        // If pricing is based on weight, calculate for each pet
        if (service.pricingType === 'by-weight' && service.priceList?.length > 0) {
            if (formData.petIds.length > 0) {
                formData.petIds.forEach(petId => {
                    const pet = userPets.find((p: any) => p._id === petId);
                    if (pet) {
                        // Find matching weight range in priceList
                        const priceItem = service.priceList.find((item: any) => {
                            const label = item.label.toLowerCase();
                            const weight = pet.weight || 0;
                            if (label.includes("<")) {
                                const val = parseFloat(label.replace(/[^0-9.]/g, ''));
                                return weight < val;
                            }
                            if (label.includes(">")) {
                                const val = parseFloat(label.replace(/[^0-9.]/g, ''));
                                return weight >= val;
                            }
                            if (label.includes("-")) {
                                const [min, max] = label.split("-").map((x: string) => parseFloat(x.replace(/[^0-9.]/g, '')));
                                return weight >= min && weight < (max || 999);
                            }
                            // Nếu chỉ là số, coi như là mức trần (tối đa)
                            if (!isNaN(parseFloat(label))) {
                                return weight <= parseFloat(label);
                            }
                            return false;
                        });
                        const price = priceItem?.value || service.basePrice || 0;
                        subTotal += price;
                        const petType = pet.type === 'dog' ? 'Chó' : (pet.type === 'cat' ? 'Mèo' : '');
                        breakdown.push({
                            name: pet.name,
                            desc: pet.breed || petType,
                            weight: pet.weight,
                            price
                        });
                    }
                });
            } else {
                subTotal = service.basePrice || 0;
            }
        } else {
            const basePrice = service.basePrice || 0;
            if (formData.petIds.length > 0) {
                formData.petIds.forEach(petId => {
                    const pet = userPets.find((p: any) => p._id === petId);
                    subTotal += basePrice;
                    breakdown.push({ name: pet?.name || "Thú cưng", price: basePrice });
                });
            } else {
                subTotal = basePrice;
            }
        }

        const total = subTotal - formData.discount;
        return { subTotal, total, breakdown };
    }, [formData.serviceId, formData.petIds, formData.discount, services, userPets]);

    const popperStyle = {
        sx: {
            '& .MuiPickersLayout-root': { padding: 0 },
            '& .MuiPickersDay-root': {
                fontSize: '0.75rem',
                fontWeight: 500,
                '&:hover': { bgcolor: '#00a76f14 !important' }
            },
            '& .MuiPickersDay-root.Mui-selected': {
                bgcolor: '#1C252E !important',
                color: '#fff !important',
            }
        }
    };

    const handleSubmit = () => {
        if (!formData.userId || !formData.serviceId) {
            toast.error("Vui lòng chọn khách hàng và dịch vụ");
            return;
        }

        const startDateTime = formData.date
            .set('hour', formData.startTime.get('hour'))
            .set('minute', formData.startTime.get('minute'))
            .set('second', 0);

        if (startDateTime.isBefore(dayjs())) {
            toast.error("Thời gian bắt đầu không thể ở quá khứ");
            return;
        }

        const endDateTime = formData.date
            .set('hour', formData.endTime.get('hour'))
            .set('minute', formData.endTime.get('minute'))
            .set('second', 0);

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
            userId: formData.userId,
            petIds: formData.petIds,
            serviceId: formData.serviceId,
            staffId: formData.staffId,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            notes: formData.notes,
            bookingStatus: formData.bookingStatus,
            paymentMethod: formData.paymentMethod,
            paymentStatus: formData.paymentStatus,
            subTotal: pricing.subTotal,
            total: pricing.total,
            discount: formData.discount
        };

        createBooking(data, {
            onSuccess: (res: any) => {
                toast.success("Tạo lịch đặt thành công!");

                // Handle payment redirection if needed (mimic client behavior)
                const booking = res.data;
                if (formData.paymentMethod === "zalopay" && formData.paymentStatus === "unpaid") {
                    window.location.href = `http://localhost:3000/api/v1/client/order/payment-zalopay?bookingCode=${booking.code}&phone=${booking.customerPhone || ''}`;
                } else if (formData.paymentMethod === "vnpay" && formData.paymentStatus === "unpaid") {
                    window.location.href = `http://localhost:3000/api/v1/client/order/payment-vnpay?bookingCode=${booking.code}&phone=${booking.customerPhone || ''}`;
                } else {
                    navigate(`/${prefixAdmin}/booking/list`);
                }
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Lỗi khi tạo lịch đặt");
            }
        });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Box sx={{ maxWidth: '1200px', mx: 'auto', p: '1.5rem' }}>
                <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Title title="Tạo đơn dịch vụ mới" />
                        <Breadcrumb
                            items={[
                                { label: "Dashboard", to: `/${prefixAdmin}` },
                                { label: "Danh sách đơn", to: `/${prefixAdmin}/booking/list` },
                                { label: "Tạo mới" }
                            ]}
                        />
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{
                            p: 3,
                            borderRadius: '20px',
                            boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                            border: `1px solid ${alpha('#919EAB', 0.12)}`
                        }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <Icon icon="solar:clipboard-list-bold-duotone" width={24} color={COLORS.primary} />
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>Thông tin dịch vụ</Typography>
                            </Stack>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2.5}>
                                    <SelectSingle
                                        label="Dịch vụ"
                                        options={serviceOptions}
                                        value={formData.serviceId}
                                        onChange={(val) => setFormData({ ...formData, serviceId: val })}
                                        sx={{ width: '100%' }}
                                    />
                                    {!isStaff && (
                                        <SelectSingle
                                            label="Nhân viên thực hiện"
                                            options={[
                                                { value: "", label: isLoadingStaff ? "Đang tải nhân viên phù hợp..." : "Chưa chỉ định" },
                                                ...staffOptions
                                            ]}
                                            value={formData.staffId}
                                            onChange={(val) => setFormData({ ...formData, staffId: val })}
                                            sx={{ width: '100%' }}
                                            disabled={isLoadingStaff || !formData.serviceId}
                                        />
                                    )}
                                    {isStaff && (
                                        <TextField
                                            label="Nhân viên thực hiện"
                                            fullWidth
                                            value={user?.fullName || "Chính mình"}
                                            disabled
                                            sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: COLORS.primary, fontWeight: 700 } }}
                                        />
                                    )}
                                </Stack>

                                {selectedService?.pricingType === 'by-weight' && selectedService?.priceList?.length > 0 && (
                                    <Box sx={{ p: 2, bgcolor: 'rgba(145, 158, 171, 0.08)', borderRadius: '12px' }}>
                                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, mb: 1, color: '#00A76F' }}>Bảng giá theo cân nặng:</Typography>
                                        <Stack spacing={0.5}>
                                            {selectedService.priceList.map((item: any, idx: number) => (
                                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#637381' }}>{formatWeightLabel(item.label)}:</Typography>
                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.value.toLocaleString()}đ</Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12, sm: 4.5 }}>
                                        <DatePicker
                                            label="Ngày thực hiện"
                                            value={formData.date}
                                            onChange={(val) => setFormData({ ...formData, date: val || dayjs() })}
                                            format="DD/MM/YYYY"
                                            minDate={dayjs()}
                                            slots={{
                                                openPickerIcon: ({ ownerState, ...props }: any) => (
                                                    <Box component="span" {...props} sx={{ display: 'flex', cursor: 'pointer' }}>
                                                        <CalendarIcon sx={{ fontSize: 24, color: '#637381' }} />
                                                    </Box>
                                                ),
                                            }}
                                            slotProps={{
                                                textField: { fullWidth: true },
                                                popper: popperStyle
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3.75 }}>
                                        <TimePicker
                                            label="Bắt đầu"
                                            value={formData.startTime}
                                            onChange={(val) => setFormData({ ...formData, startTime: val || dayjs() })}
                                            ampm={false}
                                            format="HH:mm"
                                            minutesStep={15}
                                            shouldDisableTime={(timeValue) => isTimeDisabled(timeValue, 'start')}
                                            slotProps={{
                                                textField: { fullWidth: true },
                                                popper: popperStyle
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3.75 }}>
                                        <TimePicker
                                            label="Kết thúc"
                                            value={formData.endTime}
                                            onChange={(val) => setFormData({ ...formData, endTime: val || dayjs() })}
                                            ampm={false}
                                            format="HH:mm"
                                            minutesStep={15}
                                            shouldDisableTime={(timeValue) => isTimeDisabled(timeValue, 'end')}
                                            slotProps={{
                                                textField: { fullWidth: true },
                                                popper: popperStyle
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Ghi chú"
                                    placeholder="Yêu cầu riêng của khách..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />

                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#637381', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icon icon="solar:calendar-bold-duotone" width={20} />
                                        Lịch biểu nhân viên thực tế trong ngày {formData.date.format('DD/MM/YYYY')}
                                    </Typography>
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
                            <Card sx={{
                                p: 3,
                                borderRadius: '20px',
                                boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                                border: `1px solid ${alpha('#919EAB', 0.12)}`
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                    <Icon icon="solar:user-rounded-bold-duotone" width={24} color={COLORS.primary} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem', flex: 1 }}>Khách hàng & Thanh toán</Typography>
                                    <Button
                                        size="small"
                                        startIcon={<Icon icon="eva:plus-fill" />}
                                        onClick={() => setQuickCustomerDialogOpen(true)}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            bgcolor: alpha(COLORS.primary, 0.08),
                                            color: COLORS.primary,
                                            '&:hover': { bgcolor: alpha(COLORS.primary, 0.16) }
                                        }}
                                    >
                                        Tạo mới
                                    </Button>
                                </Stack>
                                <Stack spacing={3}>
                                    <SelectSingle
                                        label="Khách hàng"
                                        options={userOptions}
                                        value={formData.userId}
                                        onChange={(val) => setFormData({ ...formData, userId: val, petIds: [] })}
                                        sx={{ width: '100%' }}
                                    />

                                    <SelectMulti
                                        label="Thú cưng"
                                        options={petOptions}
                                        value={formData.petIds}
                                        onChange={(val) => setFormData({ ...formData, petIds: val })}
                                        sx={{ width: '100%' }}
                                    />

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    <SelectSingle
                                        label="Trạng thái đơn"
                                        options={[
                                            { value: "pending", label: "Chờ xác nhận" },
                                            { value: "confirmed", label: "Đã xác nhận" },
                                            { value: "completed", label: "Hoàn thành" },
                                            { value: "cancelled", label: "Hủy đơn" }
                                        ]}
                                        value={formData.bookingStatus}
                                        onChange={(val) => setFormData({ ...formData, bookingStatus: val })}
                                        sx={{ width: '100%' }}
                                    />

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mt: 1 }}>Thanh toán</Typography>

                                    <SelectSingle
                                        label="Phương thức thanh toán"
                                        options={[
                                            { value: "money", label: "Tiền mặt (COD)" },
                                            { value: "vnpay", label: "VNPAY" },
                                            { value: "zalopay", label: "ZaloPay" }
                                        ]}
                                        value={formData.paymentMethod}
                                        onChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                                        sx={{ width: '100%' }}
                                    />

                                    <SelectSingle
                                        label="Trạng thái thanh toán"
                                        options={[
                                            { value: "unpaid", label: "Chưa thanh toán" },
                                            { value: "paid", label: "Đã thanh toán" },
                                            { value: "refunded", label: "Hoàn tiền" }
                                        ]}
                                        value={formData.paymentStatus}
                                        onChange={(val) => setFormData({ ...formData, paymentStatus: val })}
                                        sx={{ width: '100%' }}
                                    />

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    <Stack spacing={1.5}>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#637381' }}>Chi tiết đơn giá:</Typography>
                                        {pricing.breakdown.map((item: any, idx: number) => (
                                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', pl: 1 }}>
                                                <Typography sx={{ fontSize: '0.8125rem', color: '#637381' }}>
                                                    • {item.name} ({item.desc}{item.weight ? ` - ${item.weight}kg` : ""})
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 550 }}>{item.price.toLocaleString()}đ</Typography>
                                            </Box>
                                        ))}

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                            <Typography sx={{ fontSize: '0.875rem', color: '#637381' }}>Tạm tính:</Typography>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{pricing.subTotal.toLocaleString()}đ</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ fontSize: '0.875rem', color: '#637381' }}>Giảm giá:</Typography>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'error.main' }}>-{formData.discount.toLocaleString()}đ</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(145, 158, 171, 0.2)' }}>
                                            <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Tổng cộng:</Typography>
                                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#00A76F' }}>{pricing.total.toLocaleString()}đ</Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Card>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                disabled={isPending}
                                sx={{
                                    bgcolor: COLORS.primary,
                                    color: '#fff',
                                    py: 1.5,
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.24)',
                                    '&:hover': { bgcolor: '#454F5B' }
                                }}
                            >
                                {isPending ? "Đang xử lý..." : formData.paymentMethod !== 'money' ? "Tiến hành thanh toán" : "Tạo đơn dịch vụ"}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

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
        </LocalizationProvider>
    );
};
