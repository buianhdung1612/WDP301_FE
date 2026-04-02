import { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack
} from "@mui/material";
import { useServices } from "../../service/hooks/useService";
import { useUsers } from "../../account-user/hooks/useAccountUser";
import { usePets } from "../../account-user/hooks/usePet";
import { useAvailableSlots, useCreateBooking } from "../hooks/useBookingManagement";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { COLORS } from "../../role/configs/constants";
import { useTranslation } from "react-i18next";
import { SelectSingle } from "../../../components/ui/SelectSingle";
import { SelectMulti } from "../../../components/ui/SelectMulti";
import { useMemo } from "react";

interface BookingDialogProps {
    open: boolean;
    onClose: () => void;
}

export const BookingDialog = ({ open, onClose }: BookingDialogProps) => {
    const { t } = useTranslation();
    const { data: servicesBody } = useServices({ limit: 1000 });
    const services = useMemo(() => {
        if (!servicesBody) return [];
        const data = servicesBody as any;
        if (Array.isArray(data.data?.recordList)) return data.data.recordList;
        if (Array.isArray(data.recordList)) return data.recordList;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
    }, [servicesBody]);
    const { data: usersRes } = useUsers({ limit: 100 });
    const users = (usersRes as any)?.recordList || (Array.isArray(usersRes) ? usersRes : []);

    const { mutate: createBooking, isPending: isCreating } = useCreateBooking();

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);

    const { data: userPets = [] } = usePets({ userId: selectedUser?._id });
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
    const { data: availableSlotsRes } = useAvailableSlots({
        serviceId: selectedService?._id,
        date: selectedDate?.format("YYYY-MM-DD") || ""
    });
    const availableSlots = availableSlotsRes?.data || [];

    const [formData, setFormData] = useState({
        userId: "",
        petIds: [] as string[],
        serviceId: "",
        startTime: "",
        notes: "",
        bookingStatus: "pending"
    });

    const userOptions = useMemo(() =>
        users.map((user: any) => ({
            value: user._id,
            label: `${user.fullName} - ${user.phone}`
        })), [users]);

    const petOptions = useMemo(() =>
        userPets.map((pet: any) => ({
            value: pet._id,
            label: `${pet.name} (${pet.breed || (pet.type === 'dog' ? 'Chó' : 'Mèo')})`
        })), [userPets]);

    const serviceOptions = useMemo(() =>
        services.map((service: any) => ({
            value: service._id,
            label: service.name
        })), [services]);

    const timeOptions = useMemo(() =>
        availableSlots.map((slot: any) => ({
            value: `${selectedDate?.format("YYYY-MM-DD")}T${slot.time}:00`,
            label: `${slot.time} (${slot.freeStaff} ${t("admin.booking.staff_free") || "NV rảnh"})`
        })), [availableSlots, selectedDate, t]);

    const commonInputStyles = {
        '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            borderRadius: "var(--shape-borderRadius)",
            '& fieldset': { borderColor: 'rgba(145, 158, 171, 0.2)' },
            '&:hover fieldset': { borderColor: COLORS.primary },
            '&.Mui-focused fieldset': { borderColor: COLORS.primary },
        },
        '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--palette-text-secondary)',
            '&.Mui-focused': { color: COLORS.primary }
        }
    };

    const handleSubmit = () => {
        if (!formData.userId || !formData.serviceId || !formData.startTime) {
            toast.error(t("admin.validation.required"));
            return;
        }

        createBooking(formData, {
            onSuccess: () => {
                toast.success(t("admin.validation.create_success"));
                onClose();
            }
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: { borderRadius: "var(--shape-borderRadius-lg)", backgroundImage: 'none', p: 1 }
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', p: '1.5rem 1.5rem 1rem', color: COLORS.primary }}>
                {t("admin.booking.title.create")}
            </DialogTitle>
            <DialogContent sx={{ p: '0 1.5rem 1.5rem' }}>
                <Stack spacing={3} sx={{ mt: 1.5 }}>
                    <Stack direction="row" spacing={2.5}>
                        <SelectSingle
                            label="Khách hàng"
                            options={userOptions}
                            value={formData.userId}
                            onChange={(val) => {
                                const user = users.find((u: any) => u._id === val);
                                setSelectedUser(user);
                                setFormData({ ...formData, userId: val, petIds: [] });
                            }}
                            sx={{ width: '100%' }}
                        />
                        <SelectMulti
                            label="Thú cưng của khách"
                            options={petOptions}
                            value={formData.petIds}
                            onChange={(val) => setFormData({ ...formData, petIds: val })}
                            sx={{ width: '100%' }}
                        />
                    </Stack>

                    <Stack direction="row" spacing={2.5}>
                        <SelectSingle
                            label="Dịch vụ"
                            options={serviceOptions}
                            value={formData.serviceId}
                            onChange={(val) => {
                                const service = services.find((s: any) => s._id === val);
                                setSelectedService(service);
                                setFormData({ ...formData, serviceId: val, startTime: "" });
                            }}
                            sx={{ width: '100%' }}
                        />
                        <TextField
                            label="Ngày đặt"
                            type="date"
                            value={selectedDate?.format("YYYY-MM-DD")}
                            onChange={(e) => setSelectedDate(dayjs(e.target.value))}
                            InputLabelProps={{ shrink: true }}
                            sx={{ ...commonInputStyles, width: '100%' }}
                        />
                        <SelectSingle
                            label="Giờ bắt đầu"
                            options={timeOptions}
                            value={formData.startTime}
                            onChange={(val) => setFormData({ ...formData, startTime: val })}
                            sx={{ width: '100%' }}
                            disabled={!selectedService || !selectedDate}
                        />
                    </Stack>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Ghi chú thêm"
                        placeholder="Yêu cầu đặc biệt của khách hàng..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={commonInputStyles}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '1rem 1.5rem 1.5rem', gap: 1.5, borderTop: `1px dashed ${COLORS.border}` }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: "var(--shape-borderRadius)",
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        padding: "var(--shape-borderRadius-sm) calc(2 * var(--spacing))",
                        color: COLORS.primary,
                        borderColor: COLORS.borderMedium,
                        '&:hover': { bgcolor: 'rgba(145, 158, 171, 0.08)', borderColor: COLORS.primary }
                    }}
                >
                    {t("admin.common.cancel")}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isCreating}
                    sx={{
                        bgcolor: COLORS.primary,
                        color: "var(--palette-common-white)",
                        minHeight: "2.5rem",
                        px: 3,
                        borderRadius: "var(--shape-borderRadius)",
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: "var(--palette-grey-700)" }
                    }}
                >
                    {isCreating ? t("admin.common.processing") : t("admin.common.add")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};




