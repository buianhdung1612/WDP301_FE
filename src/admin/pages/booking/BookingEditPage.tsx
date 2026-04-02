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
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Title } from "../../components/ui/Title";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { prefixAdmin } from "../../constants/routes";
import { useServices } from "../service/hooks/useService";
import { useUsers } from "../account-user/hooks/useAccountUser";
import { usePets } from "../account-user/hooks/usePet";
import { useStaffByService } from "../account-admin/hooks/useAccountAdmin";
import { useBookingDetail, useUpdateBooking, useBookings, useSuggestAssignment, useReassignPetStaff } from "./hooks/useBookingManagement";
import { useSchedules } from "../hr/hooks/useSchedules";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
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
import { LoadingButton } from "../../components/ui/LoadingButton";
import { confirmAction } from "../../utils/swal";

const BulkRescheduleDialog = ({ open, onClose, affectedBookings, onConfirm }: any) => {
    const [minutes, setMinutes] = useState(15);

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: '16px', p: 1, width: '500px', maxWidth: '100%' } }}>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="solar:history-bold" color="var(--palette-error-main)" />
                Dời lịch hàng loạt
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2, color: 'var(--palette-text-secondary)' }}>
                    Nhập số phút muốn dời cho <b>{affectedBookings.length}</b> ca làm tiếp theo của nhân viên để tránh trùng lặp.
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    label="Số phút dời thêm"
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    slotProps={{ input: { sx: { fontWeight: 700 } } }}
                    helperText="Tất cả giờ của các ca dưới đây sẽ được cộng thêm."
                    sx={{ mb: 3 }}
                />
                {affectedBookings.length > 0 && (
                    <Box sx={{ maxHeight: 200, overflowY: 'auto', p: 1, bgcolor: 'var(--palette-background-neutral)', borderRadius: '8px' }}>
                        {affectedBookings.map((b: any, idx: number) => (
                            <Stack key={b._id} direction="row" alignItems="center" justifyContent="space-between" sx={{
                                py: 1, px: 2,
                                bgcolor: 'var(--palette-background-paper)',
                                borderRadius: '6px',
                                mb: idx < affectedBookings.length - 1 ? 1 : 0,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>#{b.code?.slice(-6).toUpperCase()}</Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--palette-text-secondary)' }}>
                                        {dayjs(b.start).format("HH:mm")} - {dayjs(b.end).format("HH:mm")}
                                    </Typography>
                                </Box>
                                <Icon icon="solar:arrow-right-linear" width={16} style={{ margin: '0 8px', color: 'var(--palette-text-disabled)' }} />
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--palette-warning-main)' }}>
                                        Dự kiến mới
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--palette-warning-dark)' }}>
                                        {dayjs(b.start).add(minutes || 0, 'minute').format("HH:mm")} - {dayjs(b.end).add(minutes || 0, 'minute').format("HH:mm")}
                                    </Typography>
                                </Box>
                            </Stack>
                        ))}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0, mt: 2 }}>
                <Button onClick={onClose} sx={{ color: 'var(--palette-text-secondary)', fontWeight: 700 }}>Hủy</Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => onConfirm(minutes)}
                    sx={{ fontWeight: 800, borderRadius: '8px' }}
                    disabled={affectedBookings.length === 0}
                >
                    Xác nhận dời {minutes}p
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const BookingEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isStaff = user?.roles?.some((role: any) => role.isStaff);

    const { data: bookingRes, isLoading: isLoadingBooking } = useBookingDetail(id || "");
    const booking = bookingRes?.data;

    const servicesRes = useServices({ limit: 1000 });
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
    const { mutateAsync: updateBookingAsync, isPending: isUpdating } = useUpdateBooking();
    const { mutateAsync: suggestAssignment, isPending: isSuggesting } = useSuggestAssignment();
    const { mutateAsync: reassignPetStaff } = useReassignPetStaff();
    const [quickCustomerDialogOpen, setQuickCustomerDialogOpen] = useState(false);
    const [rescheduleOpen, setRescheduleOpen] = useState(false);

    const [formData, setFormData] = useState({
        userId: "",
        petIds: [] as string[],
        serviceId: "",
        staffIds: [] as string[],
        petStaffMap: [] as { petId: string, staffId: string, status?: string, completedAt?: Date }[],
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
                userId: booking.userId?._id || booking.userId || "",
                petIds: booking.petIds?.map((p: any) => p._id || p) || [],
                serviceId: booking.serviceId?._id || booking.serviceId || "",
                staffIds: booking.staffIds?.map((s: any) => s._id || s) || [],
                petStaffMap: booking.petStaffMap?.map((m: any) => ({
                    ...m,
                    petId: m.petId?._id || m.petId,
                    staffId: m.staffId?._id || m.staffId
                })) || [],
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

    const isInProgress = useMemo(() =>
        booking?.bookingStatus === 'in-progress', [booking]);

    const { data: staffList = [] } = useStaffByService(formData.serviceId);

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

    const sid = formData.staffIds[0];
    const affectedList = useMemo(() => {
        if (!sid) return [];
        return bookings.filter((b: any) =>
            b._id !== id &&
            b.staffIds?.some((s: any) => s._id === sid || s === sid) &&
            ['pending', 'confirmed', 'in-progress'].includes(b.bookingStatus) &&
            dayjs(b.start).isAfter(formData.startTime)
        ).sort((a: any, b: any) => dayjs(a.start).diff(dayjs(b.start)));
    }, [bookings, sid, id, formData.startTime]);

    const handleBulkReschedule = async (offset: number) => {
        if (affectedList.length === 0) return;
        const loadToast = toast.loading("Đang xử lý dời lịch...");
        try {
            for (const b of affectedList) {
                const newStart = dayjs(b.start).add(offset, 'minute').toISOString();
                const newEnd = dayjs(b.end).add(offset, 'minute').toISOString();
                await updateBookingAsync({ id: b._id, data: { start: newStart, end: newEnd } });
            }
            toast.update(loadToast, { render: `Đã dời thành công ${affectedList.length} lịch đặt thêm ${offset} phút!`, type: "success", isLoading: false, autoClose: 3000 });
            setRescheduleOpen(false);
        } catch (e) {
            toast.update(loadToast, { render: "Lỗi khi dời lịch!", type: "error", isLoading: false, autoClose: 3000 });
        }
    };


    const handleQuickCheckout = () => {
        const updateData = {
            paymentStatus: 'paid',
            bookingStatus: 'completed'
        };

        confirmAction(
            "Xác nhận Thanh toán & Hoàn tất?",
            "Đơn hàng sẽ được chuyển sang 'Đã thanh toán' và 'Hoàn thành'. Bạn có chắc chắn?",
            () => {
                updateBookingAsync({ id: id!, data: updateData }).then(() => {
                    toast.success("Đã thanh toán và hoàn tất đơn hàng!");
                    navigate(`/${prefixAdmin}/booking/detail/${id}`);
                });
            },
            'success'
        );
    };

    const staffAvailability = useMemo(() => {
        if (!formData.serviceId) return {};
        const startH = formData.startTime.hour() + formData.startTime.minute() / 60;
        const endH = formData.endTime.hour() + formData.endTime.minute() / 60;

        return staffList.reduce((acc: any, staff: any) => {
            const staffSchedules = schedules.filter((s: any) => s.staffId?._id === staff._id);
            const staffBookings = bookings.filter((b: any) => b.staffIds?.some((s: any) => (s._id || s) === staff._id) && b._id !== id);

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

            const isWorkingHere = formData.petStaffMap.some(m =>
                (m.staffId === staff._id) && m.status === 'in-progress'
            );

            acc[staff._id] = {
                available: hasShift && !hasOverlap,
                hasShift,
                hasOverlap,
                isWorkingHere,
                reason: !hasShift ? "Không có ca" : (hasOverlap ? "Trùng lịch" : "")
            };
            return acc;
        }, {});
    }, [staffList, schedules, bookings, formData.startTime, formData.endTime, id, formData.serviceId, formData.petStaffMap]);

    const eligibleStaffList = useMemo(() => {
        if (!formData.serviceId) return [];
        return staffList.filter((s: any) => staffAvailability[s._id]?.hasShift);
    }, [staffList, staffAvailability, formData.serviceId]);

    const selectedService = useMemo(() =>
        services.find((s: any) => s._id === formData.serviceId),
        [services, formData.serviceId]);



    const { data: userPetsResBody } = usePets({ userId: formData.userId });

    // Cập nhật duration dựa trên số lượng thú cưng cho mỗi nhân viên
    useEffect(() => {
        if (!isReadOnly && formData.serviceId && selectedService) {
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

            const newEndTime = formData.startTime.add(totalDuration, 'minute');
            if (!newEndTime.isSame(formData.endTime)) {
                setFormData(prev => ({ ...prev, endTime: newEndTime }));
            }
        }
    }, [formData.serviceId, formData.startTime, formData.petStaffMap, selectedService, formData.endTime, isReadOnly]);

    // Use staffIds[0] logic if needed for single staff role checks
    useEffect(() => {
        if (isStaff && !isReadOnly) {
            if (!formData.staffIds.includes(user?.id || "")) {
                setFormData(prev => ({ ...prev, staffIds: [user?.id || ""] }));
            }
        }
    }, [formData.serviceId, formData.staffIds, isStaff, user?.id, isReadOnly]);

    // Tự động phân bổ nhân viên cho thú cưng (Round-robin)
    useEffect(() => {
        if (!isReadOnly && formData.petIds.length > 0 && formData.staffIds.length > 0) {
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
    }, [formData.petIds, formData.staffIds, isReadOnly]);

    const userOptions = useMemo(() => {
        const baseOptions = users.map((u: any) => ({
            value: u._id,
            label: `${u.fullName} - ${u.phone}`,
        }));

        if (booking?.userId && !baseOptions.find(o => o.value === (booking.userId?._id || booking.userId))) {
            const u = booking.userId;
            baseOptions.push({
                value: u._id || u,
                label: u.fullName ? `${u.fullName} - ${u.phone}` : "Khách hàng hiện tại"
            });
        }
        return baseOptions;
    }, [users, booking?.userId]);

    const userPets = useMemo(() => {
        if (!userPetsResBody) return [];
        const data = userPetsResBody as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [userPetsResBody]);

    const petOptions = useMemo(() => {
        const baseOptions = userPets.map((pet: any) => ({
            value: pet._id,
            label: `${pet.name} (${pet.breed || '?'})`
        }));

        // Ensure all current pets are in options
        if (booking?.petIds) {
            booking.petIds.forEach((p: any) => {
                if (!baseOptions.find(o => o.value === (p._id || p))) {
                    baseOptions.push({
                        value: p._id || p,
                        label: p.name ? `${p.name} (${p.breed || '?'})` : "Thú cưng hiện tại"
                    });
                }
            });
        }
        return baseOptions;
    }, [userPets, booking?.petIds]);

    const staffOptions = useMemo(() =>
        eligibleStaffList.map((staff: any) => {
            const availability = staffAvailability[staff._id];
            let statusLabel = "";
            if (!availability?.hasShift) statusLabel = ` (${availability?.reason})`;
            else if (availability?.hasOverlap) statusLabel = ` (${availability?.reason})`;
            else if (availability?.isWorkingHere) statusLabel = " [Đang làm]";
            else statusLabel = " [Rảnh]";

            return {
                value: staff._id,
                label: staff.fullName + statusLabel,
                disabled: !availability?.available
            };
        }), [eligibleStaffList, staffAvailability]);

    const paymentOptions = useMemo(() => {
        const isCurrentUnpaid = booking?.paymentStatus === 'unpaid';
        const isCurrentPartial = booking?.paymentStatus === 'partially_paid';
        const isCurrentPaid = booking?.paymentStatus === 'paid';
        const hasStarted = ['in-progress', 'completed'].includes(booking?.bookingStatus);

        const options = [
            { value: "unpaid", label: "Chưa thanh toán", disabled: !isCurrentUnpaid },
            { value: "partially_paid", label: "Đã cọc (Một phần)", disabled: isCurrentPaid },
            { value: "paid", label: "Đã thanh toán" },
            { value: "refunded", label: "Đã hoàn tiền", disabled: hasStarted }
        ];

        // Nếu đã có cọc hoặc đã thanh toán thì ẩn Chưa thanh toán đi cho đỡ chọn nhầm
        // Nếu đang yêu cầu hủy, không cho đổi sang đã thanh toán
        const isRequestCancel = booking?.bookingStatus === 'request_cancel';

        return options.filter(opt => {
            if ((isCurrentPartial || isCurrentPaid) && opt.value === 'unpaid') return false;
            if (isRequestCancel && ['paid'].includes(opt.value)) return false;
            return true;
        });
    }, [booking]);

    const bookingStatusOptions = useMemo(() => {
        const base = [
            { value: "pending", label: "Chờ xác nhận" },
            { value: "confirmed", label: "Đã xác nhận" },
            { value: "delayed", label: "Trễ hẹn" },
            { value: "in-progress", label: "Đang thực hiện" },
            { value: "cancelled", label: "Hủy đơn" },
        ];

        // Chỉ hiện Hoàn thành nếu đơn đã hoàn thành, ko cho chọn từ dropdown
        if (booking?.bookingStatus === 'completed') {
            base.push({ value: "completed", label: "Hoàn thành" });
        }
        return base;
    }, [booking]);

    const serviceOptions = useMemo(() => {
        const baseOptions = services.map((service: any) => ({
            value: service._id,
            label: service.name,
            price: service.basePrice || 0
        }));

        if (booking?.serviceId && !baseOptions.find(o => o.value === (booking.serviceId?._id || booking.serviceId))) {
            const s = booking.serviceId;
            baseOptions.push({
                value: s._id || s,
                label: s.name || "Dịch vụ hiện tại",
                price: s.basePrice || 0
            });
        }
        return baseOptions;
    }, [services, booking?.serviceId]);



    /* isTimeDisabled removed */

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

        // Kiểm tra tính khả dụng của tất cả nhân viên đã phân công
        const assignedStaffIds = Array.from(new Set(formData.petStaffMap.map(m => m.staffId).filter(id => id)));
        for (const staffId of assignedStaffIds) {
            const availability = staffAvailability[staffId];
            if (availability && !availability.available) {
                const staffName = staffList.find((s: any) => s._id === staffId)?.fullName || "Nhân viên";
                toast.error(`${staffName} đang bận hoặc không có ca làm việc (${availability.reason})`);
                return;
            }
        }
        */

        const currentStaffIds = Array.from(new Set(formData.petStaffMap.map(m => m.staffId).filter(id => id)));
        const data = {
            ...formData,
            staffIds: currentStaffIds,
            petStaffMap: formData.petStaffMap.map(m => ({
                ...m,
                petId: typeof m.petId === 'object' ? (m.petId as any)._id : m.petId,
                staffId: typeof m.staffId === 'object' ? (m.staffId as any)._id : m.staffId
            })),
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            subTotal: pricing.subTotal,
            total: pricing.total
        };

        updateBookingAsync({ id: id!, data }).then(() => {
            toast.success("Cập nhật đơn hàng thành công!");
            navigate(`/${prefixAdmin}/booking/detail/${id}`);
        }).catch((error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
        });
    };

    if (isLoadingBooking) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Box sx={{ maxWidth: '1200px', mx: 'auto', p: "calc(3 * var(--spacing))" }}>
                <BulkRescheduleDialog
                    open={rescheduleOpen}
                    onClose={() => setRescheduleOpen(false)}
                    affectedBookings={affectedList}
                    onConfirm={handleBulkReschedule}
                />
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
                                    borderRadius: "var(--shape-borderRadius-sm)",
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
                                            booking.bookingStatus === 'cancelled' ? 'var(--palette-error-main)' :
                                                booking.bookingStatus === 'pending' ? '#FFAB00' :
                                                    '#00B8D9'
                                }}
                            />
                        )}
                    </Stack>
                    <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<Icon icon="eva:arrow-back-fill" />}>Quay lại</Button>
                </Box>

                {isReadOnly && (
                    <Box sx={{ mb: 3, p: 2, borderRadius: "var(--shape-borderRadius-md)", bgcolor: 'rgba(255, 86, 48, 0.08)', border: '1px solid rgba(255, 86, 48, 0.24)' }}>
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
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Icon icon="solar:clipboard-list-bold-duotone" width={24} color={COLORS.primary} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>1. Dịch vụ & Thời gian</Typography>
                                </Stack>
                                <SelectSingle
                                    label="Dịch vụ sử dụng"
                                    options={serviceOptions}
                                    value={formData.serviceId}
                                    onChange={(val) => setFormData({ ...formData, serviceId: val })}
                                    disabled={isReadOnly || isInProgress}
                                    sx={{ width: '100%', mb: 2 }}
                                />
                                {/* Ngày thực hiện, bắt đầu, kết thúc gỡ bỏ theo yêu cầu người dùng */}

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
                                                toast.error(`Số lượng nhân viên (${val.length}) không được vượt quá số lượng thú cưng (${formData.petIds.length}).`);
                                                return;
                                            }
                                            setFormData({ ...formData, staffIds: val });
                                        }}
                                        disabled={isReadOnly || !formData.serviceId || formData.petIds.length === 0}
                                        sx={{ width: '100%' }}
                                    />
                                )}
                                {isStaff && (
                                    <TextField
                                        label="Nhân viên"
                                        fullWidth
                                        value={booking?.staffIds?.map((s: any) => s.fullName).join(", ") || user?.fullName || "Chính mình"}
                                        disabled
                                        sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: COLORS.primary, fontWeight: 700 } }}
                                    />
                                )}

                                {formData.petIds.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(145, 158, 171, 0.08)', borderRadius: "var(--shape-borderRadius-lg)", border: '1px dashed', borderColor: 'rgba(145, 158, 171, 0.20)' }}>
                                        <Typography variant="body2" sx={{ color: 'var(--palette-text-secondary)' }}>
                                            Vui lòng chọn <b>Thú cưng</b> ở cột bên phải để bắt đầu phân công.
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
                                                            <Box sx={{ position: 'relative' }}>
                                                                <Avatar sx={{
                                                                    width: 32, height: 32,
                                                                    bgcolor: 'rgba(33, 43, 54, 0.10)',
                                                                    color: COLORS.primary,
                                                                    fontSize: '0.875rem',
                                                                    border: currentMapping?.status === 'in-progress' ? `2px solid ${COLORS.primary}` : 'none'
                                                                }}>
                                                                    {pet?.name?.charAt(0)}
                                                                </Avatar>
                                                                {currentMapping?.status === 'in-progress' && (
                                                                    <Box sx={{
                                                                        position: 'absolute', bottom: -2, right: -2,
                                                                        width: 10, height: 10, bgcolor: COLORS.primary,
                                                                        borderRadius: '50%', border: '1.5px solid white'
                                                                    }} />
                                                                )}
                                                            </Box>
                                                            <Box>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{pet?.name || "Thú cưng"}</Typography>
                                                                    {currentMapping?.status === 'completed' && (
                                                                        <Chip label="✓ Đã xong" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, bgcolor: '#22C55E', color: 'white' }} />
                                                                    )}
                                                                    {currentMapping?.status === 'in-progress' && (
                                                                        <Chip label="Đang làm" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, bgcolor: COLORS.primary, color: 'white' }} />
                                                                    )}
                                                                    {(!currentMapping?.status || currentMapping?.status === 'pending') && (
                                                                        <Chip label="Chờ" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: 'rgba(145,158,171,0.16)', color: 'text.secondary' }} />
                                                                    )}
                                                                </Stack>
                                                                <Typography variant="caption" sx={{ color: 'var(--palette-text-secondary)' }}>{pet?.breed || (pet?.type === 'dog' ? 'Chó' : 'Mèo')}</Typography>
                                                            </Box>
                                                        </Stack>

                                                        <Icon icon="solar:arrow-right-linear" width={18} color="var(--palette-text-disabled)" />

                                                        <SelectSingle
                                                            label="Chọn người làm"
                                                            options={formData.staffIds.length > 0 ? formData.staffIds.map(sid => {
                                                                const s = staffList.find(st => st._id === sid);
                                                                const availability = staffAvailability[sid];
                                                                let statusLabel = "";
                                                                if (!availability?.hasShift) statusLabel = ` (${availability?.reason || 'Không ca'})`;
                                                                else if (availability?.hasOverlap) statusLabel = ` (${availability?.reason || 'Trùng lịch'})`;
                                                                else if (availability?.isWorkingHere) statusLabel = " [Đang làm]";
                                                                else statusLabel = " [Rảnh]";

                                                                return {
                                                                    value: sid,
                                                                    label: (s?.fullName || "Nhân viên") + statusLabel
                                                                };
                                                            }) : staffOptions}
                                                            value={currentMapping?.staffId || ""}
                                                            onChange={async (val) => {
                                                                // Optimistic UI update
                                                                const newMap = formData.petStaffMap.map(m =>
                                                                    m.petId === petId ? { ...m, staffId: val } : m
                                                                );
                                                                setFormData(prev => ({ ...prev, petStaffMap: newMap }));

                                                                // Call dedicated API
                                                                try {
                                                                    await reassignPetStaff({ id: id!, data: { petId, staffId: val } });
                                                                    toast.success("Đã đổi nhân viên thành công!");
                                                                } catch (err: any) {
                                                                    toast.error(err?.response?.data?.message || "Lỗi khi đổi nhân viên!");
                                                                    // Revert on error
                                                                    setFormData(prev => ({ ...prev, petStaffMap: formData.petStaffMap }));
                                                                }
                                                            }}
                                                            sx={{ width: 220, '& .MuiOutlinedInput-root': { height: 40 } }}
                                                            disabled={isReadOnly || (currentMapping?.status !== undefined && currentMapping.status !== 'pending')}
                                                        />
                                                    </Stack>
                                                );
                                            })}
                                        </Stack>

                                        {!isReadOnly && (
                                            <LoadingButton
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                loading={isSuggesting}
                                                label="Tự động phân bổ lại"
                                                onClick={async () => {
                                                    if (formData.petIds.length === 0) {
                                                        toast.error("Vui lòng chọn khách hàng và thú cưng trước khi phân bổ!");
                                                        return;
                                                    }

                                                    const isOnlyMeAsAdmin = formData.staffIds.length === 1 && formData.staffIds[0] === user?.id && !isStaff;
                                                    const hasManualSelection = formData.staffIds.length > 0 && !isOnlyMeAsAdmin;

                                                    // Smart distribution (API call)
                                                    try {
                                                        const merge = (d: dayjs.Dayjs, t: dayjs.Dayjs) =>
                                                            d.hour(t.hour()).minute(t.minute()).second(0).format('YYYY-MM-DDTHH:mm:ss');

                                                        const res = await suggestAssignment({
                                                            bookingId: id,
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
                                                                staffIds: res.data.staffIds
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
                                        )}
                                    </Box>
                                )}

                                <TextField
                                    fullWidth multiline rows={3} label="Ghi chú"
                                    value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    disabled={isReadOnly}
                                />

                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'var(--palette-text-secondary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Icon icon="solar:calendar-bold-duotone" width={20} />
                                        Lịch nhân viên thực tế {formData.date.format('DD/MM/YYYY')}
                                    </Typography>
                                    <StaffAvailabilityTimeline
                                        date={formData.date}
                                        serviceId={formData.serviceId}
                                        staffList={eligibleStaffList}
                                        selectionStart={formData.startTime}
                                        selectionEnd={formData.endTime}
                                        selectedStaffIds={Array.from(new Set(formData.petStaffMap.map(m => m.staffId).filter(id => id)))}
                                        onlyShowSelected={isStaff}
                                        currentBookingId={id}
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
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>3. Khách hàng & Thú cưng</Typography>
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
                                        onChange={(val) => setFormData(prev => ({ ...prev, userId: val, petIds: [] }))}
                                        disabled={true} // Always locked in Edit
                                    />
                                    <SelectMulti
                                        label="Thú cưng"
                                        options={petOptions}
                                        value={formData.petIds}
                                        onChange={(val) => {
                                            if (isReadOnly || isInProgress) return;
                                            setFormData(prev => {
                                                let newStaffIds = prev.staffIds;
                                                if (val.length > 0 && prev.staffIds.length > val.length) {
                                                    newStaffIds = prev.staffIds.slice(0, val.length);
                                                    toast.info(`Đã tự động giảm số nhân viên xuống còn ${val.length} để khớp với số thú cưng.`);
                                                }
                                                return { ...prev, petIds: val, staffIds: newStaffIds };
                                            });
                                        }}
                                        disabled={isReadOnly || isInProgress || !formData.userId}
                                    />
                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                    <SelectSingle
                                        label="Trạng thái đơn"
                                        options={bookingStatusOptions}
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
                                        disabled={isReadOnly || isInProgress || formData.paymentStatus === 'paid'}
                                    />
                                    <SelectSingle
                                        label="Trạng thái thanh toán"
                                        options={paymentOptions}
                                        value={formData.paymentStatus}
                                        onChange={(val) => setFormData({ ...formData, paymentStatus: val })}
                                        disabled={isReadOnly || (formData.paymentStatus === 'paid' && !isStaff)}
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
                                <Stack spacing={2}>
                                    <LoadingButton
                                        fullWidth
                                        loading={isUpdating}
                                        label="Lưu thay đổi"
                                        loadingLabel="Đang lưu..."
                                        onClick={handleSubmit}
                                        sx={{ py: 1.5, borderRadius: "var(--shape-borderRadius-md)", fontWeight: 800 }}
                                    />
                                    {affectedList.length > 0 && (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="warning"
                                            onClick={() => setRescheduleOpen(true)}
                                            startIcon={<Icon icon="solar:calendar-bold-duotone" />}
                                            sx={{ py: 1.5, borderRadius: "var(--shape-borderRadius-md)", fontWeight: 700 }}
                                        >
                                            Dời lịch các ca tiếp theo ({affectedList.length})
                                        </Button>
                                    )}


                                    {['in-progress'].includes(booking?.bookingStatus) && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            onClick={handleQuickCheckout}
                                            startIcon={<Icon icon="solar:check-read-bold" />}
                                            sx={{ py: 1.5, borderRadius: "var(--shape-borderRadius-md)", fontWeight: 800 }}
                                        >
                                            Thanh toán & Hoàn tất
                                        </Button>
                                    )}
                                </Stack>
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




