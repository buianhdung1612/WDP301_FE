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
    Avatar
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useServices } from "../service/hooks/useService";
import { useUsers } from "../account-user/hooks/useAccountUser";
import { usePets } from "../account-user/hooks/usePet";
import { useStaffByService } from "../account-admin/hooks/useAccountAdmin";
import { useCreateBooking, useBookings, useSuggestAssignment } from "./hooks/useBookingManagement";
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
import { LoadingButton } from "../../components/ui/LoadingButton";
import { QuickCustomerDialog } from "./sections/QuickCustomerDialog";
import { useAuthStore } from "../../../stores/useAuthStore";

export const BookingCreatePage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isStaff = user?.roles?.some((role: any) => role.isStaff);

    const servicesRes = useServices();
    const services = useMemo(() => {
        if (!servicesRes.data) return [];
        const data = servicesRes.data as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [servicesRes.data]);

    const { data: usersResBody } = useUsers({ limit: 1000 });
    const users = useMemo(() => {
        if (!usersResBody) return [];
        const data = usersResBody as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [usersResBody]);
    const { mutate: createBooking, isPending } = useCreateBooking();
    const { mutateAsync: suggestAssignment, isPending: isSuggesting } = useSuggestAssignment();
    const [quickCustomerDialogOpen, setQuickCustomerDialogOpen] = useState(false);

    const formatWeightLabel = (label: string) => {
        const cleanLabel = label.trim().toLowerCase();
        if (cleanLabel.includes('<')) return `Dưới ${cleanLabel.replace('<', '').trim()} kg`;
        if (cleanLabel.includes('>')) return `Trên ${cleanLabel.replace('>', '').trim()} kg`;
        if (cleanLabel.includes('-')) return `Từ ${cleanLabel.trim()} kg`;
        if (!isNaN(parseFloat(cleanLabel))) return `Tối đa ${cleanLabel.trim()} kg`;
        return label;
    };

    const { defaultStartTime, defaultDate } = useMemo(() => {
        const now = dayjs();
        let d = now;
        let s = now.add(15, 'minute');

        // Round up to nearest 5 minutes
        const roundedMin = Math.ceil(s.minute() / 5) * 5;
        s = s.minute(roundedMin).second(0).millisecond(0);

        // Shop open hours 8:00 - 22:00
        if (now.hour() < 8) {
            s = now.set('hour', 8).set('minute', 0).second(0);
        } else if (now.hour() >= 22) {
            d = now.add(1, 'day');
            s = d.set('hour', 8).set('minute', 0).second(0);
        }

        return {
            defaultStartTime: s,
            defaultDate: d.startOf('day')
        };
    }, []);

    const [formData, setFormData] = useState({
        userId: "",
        petIds: [] as string[],
        serviceId: "",
        staffIds: (user?.roles?.some((role: any) => role.isStaff)) ? [user?.id || ""] : [] as string[],
        petStaffMap: [] as { petId: string, staffId: string }[],
        date: defaultDate,
        startTime: defaultStartTime,
        endTime: null as dayjs.Dayjs | null,
        notes: "",
        bookingStatus: "confirmed",
        paymentMethod: "money",
        paymentStatus: "unpaid",
        discount: 0
    });
    const { data: staffList = [] } = useStaffByService(formData.serviceId);

    // Fetch schedules and bookings for availability check
    const { data: schedulesRes } = useSchedules({
        date: formData.date.format('YYYY-MM-DD')
    });
    const { data: bookingsRes } = useBookings({
        date: formData.date.format('YYYY-MM-DD')
    });

    const schedules = useMemo(() => {
        if (!schedulesRes) return [];
        const data = schedulesRes as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [schedulesRes]);

    const bookings = useMemo(() => {
        if (!bookingsRes) return [];
        const data = bookingsRes as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [bookingsRes]);

    const staffAvailability = useMemo(() => {
        if (!formData.serviceId) return {};
        const startH = formData.startTime.hour() + formData.startTime.minute() / 60;
        const endH = formData.endTime
            ? formData.endTime.hour() + formData.endTime.minute() / 60
            : startH + 1; // Mặc định giả định 1 tiếng nếu chưa chọn xong

        return staffList.reduce((acc: any, staff: any) => {
            const staffSchedules = schedules.filter((s: any) => s.staffId?._id === staff._id);
            const staffBookings = bookings.filter((b: any) => b.staffIds?.some((s: any) => (s._id || s) === staff._id));

            // Check if staff has a shift covering the entire duration
            const hasShift = staffSchedules.some((s: any) => {
                if (!s.shiftId) return false;
                const [sH, sM] = s.shiftId.startTime.split(':').map(Number);
                const [eH, eM] = s.shiftId.endTime.split(':').map(Number);
                const shiftStart = sH + sM / 60;
                const shiftEnd = eH + eM / 60;
                return shiftStart <= startH && shiftEnd >= endH;
            });

            const hasOverlap = staffBookings.some((b: any) => {
                const bStart = dayjs(b.actualStart || b.start);
                const bEnd = dayjs(b.completedAt || b.expectedFinish || b.end);
                const bStartH = bStart.hour() + bStart.minute() / 60;
                const bEndH = bEnd.hour() + bEnd.minute() / 60;
                return startH < bEndH && endH > bStartH;
            });

            acc[staff._id] = {
                available: hasShift && !hasOverlap,
                hasShift,
                hasOverlap,
                reason: !hasShift ? "Không có ca" : (hasOverlap ? "Trùng lịch" : "")
            };
            return acc;
        }, {});
    }, [staffList, schedules, bookings, formData.startTime, formData.endTime?.format(), formData.serviceId]);

    const eligibleStaffList = useMemo(() => {
        if (!formData.serviceId) return [];
        return staffList.filter((s: any) => {
            const availability = staffAvailability[s._id];
            return availability?.hasShift && !availability?.hasOverlap;
        });
    }, [staffList, staffAvailability, formData.serviceId]);

    const selectedService = useMemo(() =>
        services.find((s: any) => s._id === formData.serviceId),
        [services, formData.serviceId]);



    const userPetsRes = usePets({ userId: formData.userId });
    const userPets = useMemo(() => {
        if (!userPetsRes.data) return [];
        const data = userPetsRes.data as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [userPetsRes.data]);

    // Auto-update end time based on sequential duration for pets assigned to same staff
    useEffect(() => {
        if (formData.serviceId && selectedService) {
            const baseDuration = selectedService.duration || 30;

            // Đếm số lượng thú cưng cho mỗi nhân viên
            const staffPetCounts: Record<string, number> = {};
            formData.petStaffMap.forEach(m => {
                if (m.staffId) {
                    staffPetCounts[m.staffId] = (staffPetCounts[m.staffId] || 0) + 1;
                }
            });

            // Lấy số lượng thú cưng lớn nhất mà một nhân viên phải xử lý
            const maxPetsPerStaff = Math.max(0, ...Object.values(staffPetCounts), 1);
            const totalDuration = baseDuration * maxPetsPerStaff;

            const allAssigned = formData.petIds.length > 0 &&
                formData.petStaffMap.length === formData.petIds.length &&
                formData.petStaffMap.every(m => m.staffId);

            if (allAssigned) {
                const newEndTime = formData.startTime.add(totalDuration, 'minute');
                if (!newEndTime.isSame(formData.endTime)) {
                    setFormData(prev => ({ ...prev, endTime: newEndTime }));
                }
            } else if (formData.endTime !== null) {
                setFormData(prev => ({ ...prev, endTime: null }));
            }
        }
    }, [formData.serviceId, formData.startTime, formData.petStaffMap, selectedService, formData.endTime]);

    // Reset staffId if it's not in the new staff list
    // Use staffIds[0] logic if needed for single staff role checks
    useEffect(() => {
        if (isStaff) {
            if (!formData.staffIds.includes(user?.id || "")) {
                setFormData(prev => ({ ...prev, staffIds: [user?.id || ""] }));
            }
        }
    }, [formData.serviceId, formData.staffIds, isStaff, user?.id]);

    // Tự động phân bổ nhân viên cho thú cưng (Round-robin)
    useEffect(() => {
        if (formData.petIds.length > 0 && formData.staffIds.length > 0) {
            // Kiểm tra xem mapping hiện tại có khớp với danh sách thú cưng đã chọn không
            const currentPetIds = formData.petStaffMap.map(m => m.petId);
            const isPetsListChanged = formData.petIds.length !== currentPetIds.length ||
                formData.petIds.some(id => !currentPetIds.includes(id));

            // Nếu danh sách thú cưng thay đổi, hoặc mapping đang trống, tự động tạo mapping mới
            if (isPetsListChanged || formData.petStaffMap.length === 0) {
                const newMap = formData.petIds.map((petId, index) => ({
                    petId,
                    staffId: formData.staffIds[index % formData.staffIds.length]
                }));
                setFormData(prev => ({ ...prev, petStaffMap: newMap }));
            }
        }
    }, [formData.petIds, formData.staffIds]);

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
        eligibleStaffList.map((staff: any) => {
            const availability = staffAvailability[staff._id];
            return {
                value: staff._id,
                label: staff.fullName + (availability?.available ? "" : ` (${availability?.reason})`),
                disabled: !availability?.available
            };
        }), [eligibleStaffList, staffAvailability]);

    const serviceOptions = useMemo(() =>
        services.map((service: any) => ({
            value: service._id,
            label: service.name,
            price: service.basePrice || 0
        })), [services]);



    const isTimeDisabled = (timeValue: dayjs.Dayjs, type: 'start' | 'end', view?: string) => {
        const isToday = formData.date.isSame(dayjs(), 'day');
        if (isToday) {
            const now = dayjs();
            if (view === 'hours') {
                return timeValue.hour() < now.hour();
            }
            if (type === 'start') {
                return timeValue.isBefore(now, 'minute');
            } else {
                return timeValue.isBefore(formData.startTime, 'minute');
            }
        }
        return false;
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
                '&:hover': { bgcolor: 'var(--palette-primary-main)14 !important' }
            },
            '& .MuiPickersDay-root.Mui-selected': {
                bgcolor: 'var(--palette-text-primary) !important',
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

        const endDateTime = formData.endTime
            ? formData.date
                .set('hour', formData.endTime.get('hour'))
                .set('minute', formData.endTime.get('minute'))
                .set('second', 0)
            : startDateTime.add(1, 'hour');

        if (!formData.endTime) {
            toast.error("Vui lòng phân công nhân viên để tính thời gian kết thúc");
            return;
        }

        // Validate working blocks (Temporarily disabled for testing)
        /*
        const startTotal = startDateTime.hour() * 60 + startDateTime.minute();
        const endTotal = endDateTime.hour() * 60 + endDateTime.minute();

        let workingBlocks = uniqueShifts.map(s => {
            const [sH, sM] = s.start.split(':').map(Number);
            const [eH, eM] = s.end.split(':').map(Number);
            return { start: sH * 60 + sM, end: eH * 60 + eM };
        });

        if (workingBlocks.length === 0) {
            workingBlocks = [
                { start: 8 * 60, end: 12 * 60 },
                { start: 13 * 60, end: 17 * 60 },
                { start: 17 * 60, end: 23 * 60 }
            ];
        }

        const isValidBlock = workingBlocks.some(block =>
            startTotal >= block.start && endTotal <= block.end
        );

        if (!isValidBlock) {
            const shiftInfo = uniqueShifts.length > 0
                ? uniqueShifts.map(s => `${s.start}-${s.end}`).join(', ')
                : "08:00-12:00, 13:00-17:00, 17:00-23:00";
            toast.error(`Thời gian đặt lịch phải nằm trong các ca (${shiftInfo})`);
            return;
        }
        */
        // Kiểm tra tính khả dụng của tất cả nhân viên đã phân công
        const assignedStaffIds = Array.from(new Set(formData.petStaffMap.map(m => m.staffId).filter(id => id)));

        if (assignedStaffIds.length === 0) {
            toast.error("Vui lòng phân công nhân viên thực hiện");
            return;
        }

        for (const staffId of assignedStaffIds) {
            const availability = staffAvailability[staffId];
            if (availability && !availability.available) {
                const staffName = staffList.find((s: any) => s._id === staffId)?.fullName || "Nhân viên";
                toast.error(`${staffName} đang bận hoặc không có ca làm việc (${availability.reason})`);
                return;
            }
        }

        const data = {
            userId: formData.userId,
            petIds: formData.petIds,
            serviceId: formData.serviceId,
            staffIds: formData.staffIds,
            petStaffMap: formData.petStaffMap,
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
                const phone = booking.userId?.phone || "";
                if (formData.paymentMethod === "zalopay" && formData.paymentStatus === "unpaid") {
                    window.location.href = `http://localhost:3000/api/v1/client/order/payment-zalopay?bookingCode=${booking.code}&phone=${phone}`;
                } else if (formData.paymentMethod === "vnpay" && formData.paymentStatus === "unpaid") {
                    window.location.href = `http://localhost:3000/api/v1/client/order/payment-vnpay?bookingCode=${booking.code}&phone=${phone}`;
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
            <Box sx={{ maxWidth: '1200px', mx: 'auto', p: "calc(3 * var(--spacing))" }}>
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
                            boxShadow: "var(--customShadows-card)",
                            border: `1px solid ${'rgba(145, 158, 171, 0.12)'}`
                        }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                                <Icon icon="solar:clipboard-list-bold-duotone" width={24} color={COLORS.primary} />
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>1. Dịch vụ & Thời gian</Typography>
                            </Stack>
                            <Stack spacing={3}>
                                <SelectSingle
                                    label="Dịch vụ"
                                    options={serviceOptions}
                                    value={formData.serviceId}
                                    onChange={(val) => setFormData({ ...formData, serviceId: val })}
                                    sx={{ width: '100%' }}
                                />

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
                                                        <CalendarIcon sx={{ fontSize: 24, color: 'var(--palette-text-secondary)' }} />
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
                                            minutesStep={1}
                                            shouldDisableTime={(timeValue, view) => isTimeDisabled(timeValue, 'start', view)}
                                            slotProps={{
                                                textField: { fullWidth: true },
                                                popper: popperStyle
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3.75 }}>
                                        {formData.endTime ? (
                                            <TimePicker
                                                label="Kết thúc"
                                                value={formData.endTime}
                                                onChange={(val) => setFormData({ ...formData, endTime: val })}
                                                ampm={false}
                                                format="HH:mm"
                                                minutesStep={1}
                                                shouldDisableTime={(timeValue, view) => isTimeDisabled(timeValue, 'end', view)}
                                                slotProps={{
                                                    textField: { fullWidth: true },
                                                    popper: popperStyle
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                height: '56px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'rgba(145, 158, 171, 0.08)',
                                                borderRadius: "var(--shape-borderRadius)",
                                                border: '1px dashed rgba(145, 158, 171, 0.20)'
                                            }}>
                                                <Typography variant="caption" sx={{ color: 'var(--palette-text-disabled)', textAlign: 'center' }}>
                                                    Chọn thú cưng <br />& NV để tính giờ
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                </Grid>

                                <Divider sx={{ borderStyle: 'dashed' }} />

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Icon icon="solar:users-group-rounded-bold-duotone" width={24} color={COLORS.primary} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>2. Nhân viên & Phân công</Typography>
                                </Stack>

                                {!isStaff && (
                                    <SelectMulti
                                        label="Chọn danh sách nhân viên thực hiện (chung)"
                                        options={staffOptions}
                                        value={formData.staffIds}
                                        onChange={(val) => {
                                            if (val.length > formData.petIds.length && formData.petIds.length > 0) {
                                                toast.error(`Bạn chỉ chọn ${formData.petIds.length} thú cưng, không thể chọn đến ${val.length} nhân viên. Vui lòng bỏ bớt hoặc thêm thú cưng.`);
                                                return;
                                            }
                                            setFormData({ ...formData, staffIds: val });
                                        }}
                                        sx={{ width: '100%' }}
                                        disabled={!formData.serviceId || formData.petIds.length === 0}
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

                                {formData.petIds.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(145, 158, 171, 0.08)', borderRadius: "var(--shape-borderRadius-lg)", border: '1px dashed', borderColor: 'rgba(145, 158, 171, 0.20)' }}>
                                        <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)' }}>
                                            Vui lòng chọn <b>Khách hàng</b> và <b>Thú cưng</b> ở cột bên phải để bắt đầu phân công.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 2, bgcolor: 'rgba(33, 43, 54, 0.04)', borderRadius: "var(--shape-borderRadius-lg)", border: '1px solid', borderColor: 'rgba(33, 43, 54, 0.10)' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: COLORS.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Icon icon="solar:user-speak-bold-duotone" />
                                            Bảng phân công chi tiết ({formData.petIds.length} thú cưng)
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {formData.petIds.map((petId) => {
                                                const pet = userPets.find(p => p._id === petId);
                                                const currentMapping = formData.petStaffMap.find(m => m.petId === petId);
                                                return (
                                                    <Stack
                                                        key={petId}
                                                        direction="row"
                                                        spacing={2}
                                                        alignItems="center"
                                                        justifyContent="space-between"
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: "var(--palette-background-paper)",
                                                            borderRadius: "var(--shape-borderRadius-md)",
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                        }}
                                                    >
                                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(33, 43, 54, 0.10)', color: COLORS.primary, fontSize: '0.875rem' }}>
                                                                {pet?.name?.charAt(0)}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{pet?.name || "Thú cưng"}</Typography>
                                                                <Typography variant="caption" sx={{ color: 'var(--palette-text-secondary)' }}>{pet?.breed || (pet?.type === 'dog' ? 'Chó' : 'Mèo')}</Typography>
                                                            </Box>
                                                        </Stack>

                                                        <Icon icon="solar:arrow-right-linear" width={18} color="var(--palette-text-disabled)" />

                                                        <SelectSingle
                                                            label="Chọn người làm"
                                                            options={formData.staffIds.length > 0 ? formData.staffIds.map(sid => {
                                                                const staff = staffList.find(s => s._id === sid);
                                                                const availability = staffAvailability[sid];
                                                                return {
                                                                    value: sid,
                                                                    label: (staff?.fullName || "Nhân viên") + (availability?.available ? "" : ` (${availability?.reason || "Bận"})`),
                                                                    disabled: !availability?.available
                                                                };
                                                            }) : staffOptions}
                                                            value={currentMapping?.staffId || ""}
                                                            onChange={(val) => {
                                                                const newMap = [...formData.petStaffMap];
                                                                const idx = newMap.findIndex(m => m.petId === petId);
                                                                if (idx > -1) newMap[idx].staffId = val;
                                                                else newMap.push({ petId, staffId: val });
                                                                setFormData({ ...formData, petStaffMap: newMap });
                                                            }}
                                                            sx={{ width: 220, '& .MuiOutlinedInput-root': { height: 40 } }}
                                                        />
                                                    </Stack>
                                                );
                                            })}
                                        </Stack>

                                        <LoadingButton
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            loading={isSuggesting}
                                            label="Tự động phân bổ nhân viên"
                                            onClick={async () => {
                                                if (formData.petIds.length === 0) {
                                                    toast.error("Vui lòng chọn khách hàng và thú cưng trước khi phân bổ!");
                                                    return;
                                                }

                                                const isOnlyMeAsAdmin = formData.staffIds.length === 1 && formData.staffIds[0] === user?.id && !isStaff;
                                                const hasManualSelection = formData.staffIds.length > 0 && !isOnlyMeAsAdmin;

                                                // Smart distribution (API call)
                                                try {
                                                    const merge = (d: dayjs.Dayjs, t: dayjs.Dayjs | null) =>
                                                        t ? d.hour(t.hour()).minute(t.minute()).second(0).format('YYYY-MM-DDTHH:mm:ss') : "";

                                                    const res = await suggestAssignment({
                                                        date: formData.date.format('YYYY-MM-DD'),
                                                        startTime: merge(formData.date, formData.startTime),
                                                        endTime: merge(formData.date, formData.endTime),
                                                        serviceId: formData.serviceId,
                                                        petIds: formData.petIds,
                                                        staffIds: hasManualSelection ? formData.staffIds : []
                                                    });

                                                    if (res.code === 200) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            petStaffMap: res.data.petStaffMap,
                                                            staffIds: res.data.staffIds,
                                                            endTime: dayjs(res.data.endTime) // Update endTime from API response
                                                        }));
                                                        toast.success(hasManualSelection
                                                            ? "Đã phân bổ xoay vòng trong danh sách nhân viên bạn chọn!"
                                                            : "Đã tự động tìm và phân bổ nhân viên tối ưu nhất!");
                                                    }
                                                } catch (err: any) {
                                                    toast.error(err?.response?.data?.message || "Không thể tự động phân bổ!");
                                                }
                                            }}
                                            sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
                                            startIcon={<Icon icon="solar:reorder-bold" />}
                                            disabled={staffList.length === 0}
                                        />
                                    </Box>
                                )}

                                {selectedService?.pricingType === 'by-weight' && selectedService?.priceList?.length > 0 && (
                                    <Box sx={{ p: 2, bgcolor: 'rgba(145, 158, 171, 0.08)', borderRadius: "var(--shape-borderRadius-md)" }}>
                                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, mb: 1, color: 'var(--palette-primary-main)' }}>Bảng giá theo cân nặng:</Typography>
                                        <Stack spacing={0.5}>
                                            {selectedService.priceList.map((item: any, idx: number) => (
                                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--palette-text-secondary)' }}>{formatWeightLabel(item.label)}:</Typography>
                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{item.value.toLocaleString()}đ</Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Ghi chú"
                                    placeholder="Yêu cầu riêng của khách..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />

                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'var(--palette-text-secondary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icon icon="solar:calendar-bold-duotone" width={20} />
                                        Lịch biểu nhân viên thực tế trong ngày {formData.date.format('DD/MM/YYYY')}
                                    </Typography>
                                    <StaffAvailabilityTimeline
                                        date={formData.date}
                                        serviceId={formData.serviceId}
                                        staffList={eligibleStaffList}
                                        selectionStart={formData.startTime}
                                        selectionEnd={formData.endTime || (undefined as any)}
                                        selectedStaffIds={Array.from(new Set(formData.petStaffMap.map(m => m.staffId).filter(id => id)))}
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
                                boxShadow: "var(--customShadows-card)",
                                border: `1px solid ${'rgba(145, 158, 171, 0.12)'}`
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
                                            borderRadius: "var(--shape-borderRadius)",
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            bgcolor: 'rgba(33, 43, 54, 0.08)',
                                            color: COLORS.primary,
                                            '&:hover': { bgcolor: 'rgba(33, 43, 54, 0.16)' }
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
                                        onChange={(val) => {
                                            setFormData(prev => {
                                                let newStaffIds = prev.staffIds;
                                                if (val.length > 0 && prev.staffIds.length > val.length) {
                                                    newStaffIds = prev.staffIds.slice(0, val.length);
                                                    toast.info(`Đã tự động giảm số nhân viên xuống còn ${val.length} để khớp với số thú cưng.`);
                                                }
                                                return { ...prev, petIds: val, staffIds: newStaffIds };
                                            });
                                        }}
                                        sx={{ width: '100%' }}
                                        disabled={!formData.userId}
                                    />

                                    <Divider sx={{ borderStyle: 'dashed' }} />

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

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    <Stack spacing={1.5}>
                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--palette-text-secondary)' }}>Chi tiết đơn giá:</Typography>
                                        {pricing.breakdown.map((item: any, idx: number) => (
                                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', pl: 1 }}>
                                                <Typography sx={{ fontSize: '0.8125rem', color: 'var(--palette-text-secondary)' }}>
                                                    • {item.name} ({item.desc}{item.weight ? ` - ${item.weight}kg` : ""})
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 550 }}>{item.price.toLocaleString()}đ</Typography>
                                            </Box>
                                        ))}

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px dashed rgba(145, 158, 171, 0.2)' }}>
                                            <Typography sx={{ fontSize: '0.875rem', color: 'var(--palette-text-secondary)' }}>Tạm tính:</Typography>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{pricing.subTotal.toLocaleString()}đ</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ fontSize: '0.875rem', color: 'var(--palette-text-secondary)' }}>Giảm giá:</Typography>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'error.main' }}>-{formData.discount.toLocaleString()}đ</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid rgba(145, 158, 171, 0.2)' }}>
                                            <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Tổng cộng:</Typography>
                                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--palette-primary-main)' }}>{pricing.total.toLocaleString()}đ</Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Card>

                            <LoadingButton
                                fullWidth
                                loading={isPending}
                                onClick={handleSubmit}
                                label={formData.paymentMethod !== 'money' ? "Tiến hành thanh toán" : "Tạo đơn dịch vụ"}
                                loadingLabel="Đang xử lý..."
                                size="large"
                                sx={{
                                    py: 1.5,
                                    borderRadius: "var(--shape-borderRadius-md)",
                                    fontSize: '1rem',
                                    boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.24)',
                                }}
                            />
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




