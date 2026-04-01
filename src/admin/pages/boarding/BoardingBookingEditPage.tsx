import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import {
    Box,
    Button,
    Card,
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Divider,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import 'dayjs/locale/vi';

import { getBoardingBookingDetail, updateBoardingBookingDetail, checkBoardingAvailability } from "../../api/boarding-booking.api";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { getBoardingCages } from "../../api/boarding-cage.api";
import { getBoardingConfig } from "../../api/boarding-config.api";

// Helper to normalize cage sizes
const CANCELLATION_REASONS = [
    "Thú cưng có khả năng mắc bệnh nguy hiểm",
    "Thú cưng không đúng số tuổi quy định",
];

const normalizeCageSizeLabel = (size: string) => {
    switch (size) {
        case "S": return "S (≤5kg)";
        case "M": return "M (≤10kg)";
        case "L": return "L (≤20kg)";
        case "XL_XXL": return "XL/XXL (>20kg)";
        default: return size;
    }
};

const checkCapacity = (cageSize: string, weight: number): boolean => {
    if (!weight) return true;
    switch (cageSize) {
        case "S": return weight <= 5;
        case "M": return weight <= 10;
        case "L": return weight <= 20;
        case "XL_XXL": return weight > 20;
        default: return true;
    }
};

export const BoardingBookingEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<any>({
        checkInDate: "",
        checkOutDate: "",
        numberOfDays: 1,
        specialCare: "",
        items: [],
        boardingStatus: "",
        paymentStatus: "",
        discount: 0,
        cancelledReason: "",
    });

    const { data: res, isLoading } = useQuery({
        queryKey: ["admin-boarding-booking-detail", id],
        queryFn: () => getBoardingBookingDetail(id || ""),
        enabled: !!id,
    });

    const { data: configRes } = useQuery({ 
        queryKey: ["boarding-config"], 
        queryFn: getBoardingConfig 
    });
    const config = configRes?.data;

    const { data: cagesRes } = useQuery({
        queryKey: ["admin-boarding-cages"],
        queryFn: () => getBoardingCages({ limit: 100 }),
    });

    const cages = cagesRes?.data?.recordList || [];

    const { data: busyPetsRes } = useQuery({
        queryKey: ["admin-busy-pets-cages", res?.data?.userId?._id || res?.data?.userId, formData.checkInDate, formData.checkOutDate],
        queryFn: () => checkBoardingAvailability(formData.checkInDate, formData.checkOutDate),
        enabled: !!res?.data?.userId && !!formData.checkInDate && !!formData.checkOutDate,
    });

    const cageAvailability = busyPetsRes?.data?.cageAvailability || {};

    useEffect(() => {
        if (res?.data && config) {
            const b = res.data;
            let items: any[] = [];
            if (Array.isArray(b.items) && b.items.length > 0) {
                items = b.items.map((item: any) => ({
                    petIds: item.petIds?.map((p: any) => p._id || p) || [],
                    cageId: item.cageId?._id || item.cageId || "",
                }));
            } else {
                items = [{
                    petIds: b.petIds?.map((p: any) => p._id || p) || [],
                    cageId: b.cageId?._id || b.cageId || "",
                }];
            }

            // Recalculate days based on our new logic to ensure consistency
            const checkInStart = dayjs(b.checkInDate).startOf("day");
            const checkOutStart = dayjs(b.checkOutDate).startOf("day");
            const diffDays = checkOutStart.isValid() && checkInStart.isValid() ? checkOutStart.diff(checkInStart, 'day') : (b.numberOfDays || 1);
            const correctedDays = Math.max(1, diffDays);

            setFormData({
                checkInDate: b.checkInDate ? dayjs(b.checkInDate).format("YYYY-MM-DD") : "",
                checkOutDate: b.checkOutDate ? dayjs(b.checkOutDate).format("YYYY-MM-DD") : "",
                numberOfDays: correctedDays,
                specialCare: b.specialCare || b.notes || "",
                items,
                boardingStatus: b.boardingStatus,
                paymentStatus: b.paymentStatus,
                discount: b.discount || 0,
                cancelledReason: b.cancelledReason || "",
            });
        }
    }, [res, config]);

    const handleDateChange = (field: 'checkInDate' | 'checkOutDate', value: string) => {
        const newData = { ...formData, [field]: value };
        if (newData.checkInDate && newData.checkOutDate && config) {
            const [inH, inM] = (config.checkInTime || "14:00").split(":").map(Number);
            const [outH, outM] = (config.checkOutTime || "12:00").split(":").map(Number);
            
            const checkIn = dayjs(newData.checkInDate).startOf("day").set("hour", inH).set("minute", inM);
            const checkOut = dayjs(newData.checkOutDate).startOf("day").set("hour", outH).set("minute", outM);
            
            if (checkOut.isValid() && checkIn.isValid()) {
                // Match backend's Math.ceil logic for number of stay nights
                const days = checkOut.startOf('day').diff(checkIn.startOf('day'), 'day');
                newData.numberOfDays = Math.max(1, days);
            }
        }
        setFormData(newData);
    };

    const handleItemCageChange = (index: number, cageId: string) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], cageId };
        setFormData({ ...formData, items: newItems });
    };

    const calculatedPrices = useMemo(() => {
        const subTotal = formData.items.reduce((sum: number, item: any) => {
            const cage = cages.find((c: any) => c._id === item.cageId);
            const price = cage ? Number(cage.dailyPrice || 0) : 0;
            return sum + price;
        }, 0) * (formData.numberOfDays || 1);

        const discount = Number(formData.discount || 0);
        const total = Math.max(0, subTotal - discount);

        return { subTotal, total };
    }, [formData.items, formData.numberOfDays, formData.discount, cages]);

    const updateMut = useMutation({
        mutationFn: (data: any) => updateBoardingBookingDetail(id || "", data),
        onSuccess: () => {
            toast.success("Cập nhật đơn thành công");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-booking-detail", id] });
            navigate(`/${prefixAdmin}/boarding/detail/${id}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể cập nhật đơn");
        },
    });

    const isReadOnly = useMemo(() => {
        if (!res?.data?.boardingStatus) return false;
        return ["completed", "cancelled", "checked-out"].includes(res.data.boardingStatus);
    }, [res?.data?.boardingStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isReadOnly) return;

        // Check validation again just in case
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            const itemPets = res?.data?.petIds?.filter((p: any) => item.petIds.includes(p._id || p)) || [];
            const cage = cages.find((c: any) => c._id === item.cageId);
            if (!cage) {
                return toast.error("Vui lòng chọn chuồng hợp lệ");
            }
            // Weight validation
            const isWeightValid = itemPets.every((p: any) => checkCapacity(cage.size, p.weight));
            if (!isWeightValid) {
                return toast.error(`Thú cưng quá cân (Chuồng: ${cage.cageCode}, Giới hạn: ${normalizeCageSizeLabel(cage.size)})`);
            }
        }

        const [inH, inM] = (config?.checkInTime || "14:00").split(":").map(Number);
        const [outH, outM] = (config?.checkOutTime || "12:00").split(":").map(Number);
        
        const checkInIso = dayjs(formData.checkInDate).startOf("day").set("hour", inH).set("minute", inM).toISOString();
        const checkOutIso = dayjs(formData.checkOutDate).startOf("day").set("hour", outH).set("minute", outM).toISOString();

        const payload = {
            ...formData,
            checkInDate: checkInIso,
            checkOutDate: checkOutIso,
            ...calculatedPrices, // Send the newly calculated total and subTotal
            cageId: formData.items?.[0]?.cageId || null, 
            petIds: formData.items?.flatMap((i: any) => i.petIds) || []
        };
        updateMut.mutate(payload);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 20 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Box sx={{ maxWidth: "1200px", mx: "auto", p: { xs: 2, md: 3 } }}>
                <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, mt: 0.5 }}>
                            <Icon icon="eva:arrow-ios-back-fill" width={20} />
                        </IconButton>
                        <Box>
                            <Title title={`Chỉnh sửa đơn #${res?.data?.code?.slice(-6).toUpperCase() || "N/A"}`} />
                            <Breadcrumb
                                items={[
                                    { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                                    { label: "Khách sạn", to: `/${prefixAdmin}/boarding/booking-list` },
                                    { label: "Chỉnh sửa" },
                                ]}
                            />
                        </Box>
                    </Box>
                </Box>

                {isReadOnly && (
                    <Box sx={{ mb: 3, p: 2, borderRadius: "var(--shape-borderRadius-md)", bgcolor: 'rgba(255, 86, 48, 0.08)', border: '1px solid rgba(255, 86, 48, 0.24)' }}>
                        <Typography sx={{ color: '#B71D18', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Icon icon="eva:alert-circle-fill" />
                            Đơn hàng đã {formData.boardingStatus === 'cancelled' ? 'bị hủy' : 'hoàn thành'}, không thể chỉnh sửa thông tin.
                        </Typography>
                    </Box>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Card sx={{ p: 3, borderRadius: "20px", boxShadow: "var(--customShadows-card)" }}>
                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Icon icon="solar:clipboard-list-bold-duotone" width={24} color="var(--palette-primary-main)" />
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>1. Thông tin chung</Typography>
                                    </Stack>

                                    <Grid container spacing={2.5}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <DatePicker
                                                label="Ngày nhận chuồng"
                                                value={formData.checkInDate ? dayjs(formData.checkInDate) : null}
                                                onChange={(val) => handleDateChange('checkInDate', val ? val.format("YYYY-MM-DD") : "")}
                                                disabled={isReadOnly || formData.boardingStatus === "checked-in"}
                                                format="DD/MM/YYYY"
                                                minDate={
                                                    res?.data?.checkInDate && dayjs(res.data.checkInDate).isBefore(dayjs(), 'day') 
                                                    ? dayjs(res.data.checkInDate) 
                                                    : dayjs()
                                                }
                                                slotProps={{ textField: { fullWidth: true } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <DatePicker
                                                label="Ngày trả chuồng"
                                                value={formData.checkOutDate ? dayjs(formData.checkOutDate) : null}
                                                onChange={(val) => handleDateChange('checkOutDate', val ? val.format("YYYY-MM-DD") : "")}
                                                disabled={isReadOnly}
                                                format="DD/MM/YYYY"
                                                minDate={formData.checkInDate ? dayjs(formData.checkInDate).add(1, 'day') : dayjs().add(1, 'day')}
                                                slotProps={{ textField: { fullWidth: true } }}
                                            />
                                        </Grid>
                                    </Grid>
                                    
                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Icon icon="solar:home-bold-duotone" width={24} color="var(--palette-primary-main)" />
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>2. Chi tiết phân bổ chuồng</Typography>
                                    </Stack>

                                    <Stack spacing={2}>
                                        {formData.items.map((item: any, index: number) => {
                                            const itemPets = res?.data?.petIds?.filter((p: any) => item.petIds.includes(p._id || p)) || [];
                                            const petNames = itemPets.map((p: any) => `${p.name} (${p.weight || 0}kg)`).join(", ") || "Chưa chọn thú cưng";

                                            return (
                                                <Box key={index} sx={{ border: "1px solid var(--palette-divider)", borderRadius: "12px", p: 2, bgcolor: "var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, mb: 1, display: "flex", gap: 1, alignItems: "center" }}>
                                                        <Icon icon="mdi:dog-side" /> Thú cưng: {petNames}
                                                    </Typography>

                                                    <FormControl fullWidth size="medium">
                                                        <InputLabel>Chọn chuồng (Phòng {index + 1})</InputLabel>
                                                        <Select
                                                            value={item.cageId}
                                                            label={`Chọn chuồng (Phòng ${index + 1})`}
                                                            onChange={(e) => handleItemCageChange(index, e.target.value)}
                                                            sx={{ bgcolor: "var(--palette-background-paper)" }}
                                                            disabled={isReadOnly}
                                                        >
                                                            {cages.map((cage: any) => {
                                                                // Calculate if valid
                                                                const isWeightOk = itemPets.every((p: any) => checkCapacity(cage.size, p.weight));
                                                                
                                                                // Calculate remaining
                                                                const originallyOwnedCount = (res?.data?.items || []).filter((it: any) => String(it.cageId?._id || it.cageId) === String(cage._id)).length;
                                                                const actuallyAvailable = cageAvailability[cage._id] ?? cage.remainingRooms ?? cage.totalRooms ?? 4;
                                                                const baseRemainingForThisBooking = Number(actuallyAvailable) + originallyOwnedCount;
                                                                
                                                                const currentlySelectedCountForThisCage = formData.items.filter((it: any) => String(it.cageId) === String(cage._id)).length;
                                                                const remainingSlots = baseRemainingForThisBooking - currentlySelectedCountForThisCage;
                                                                
                                                                const isCurrentlySelectedInThisDropdown = String(item.cageId) === String(cage._id);
                                                                const isFull = !isCurrentlySelectedInThisDropdown && remainingSlots <= 0;

                                                                const disabled = !isWeightOk || isFull;

                                                                const priceSuffix = ` - ${Number(cage.dailyPrice || 0).toLocaleString("vi-VN")}đ/ngày`;
                                                                const availabilitySuffix = isFull ? ` - (Hết chỗ)` : ` (Còn ${remainingSlots} chỗ)`;
                                                                const weightSuffix = !isWeightOk ? ` - (Quá cân)` : "";

                                                                return (
                                                                    <MenuItem key={cage._id} value={cage._id} disabled={disabled}>
                                                                        {cage.cageCode} - {String(cage.type || "STANDARD").toUpperCase()} ({normalizeCageSizeLabel(cage.size)})
                                                                        {availabilitySuffix}
                                                                        {priceSuffix}
                                                                        {weightSuffix}
                                                                    </MenuItem>
                                                                );
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                            );
                                        })}
                                    </Stack>

                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ mt: 1, p: 2, borderRadius: "12px", bgcolor: "var(--palette-primary-lighter)", border: "1px dashed var(--palette-primary-main)" }}>
                                            <Typography sx={{ display: "flex", justifyContent: "space-between", mb: 1, color: "var(--palette-primary-dark)" }}>
                                                <span>Số ngày lưu trú:</span>
                                                <strong>{formData.numberOfDays} ngày</strong>
                                            </Typography>
                                            <Typography sx={{ display: "flex", justifyContent: "space-between", mb: 1, color: "var(--palette-primary-dark)" }}>
                                                <span>Tạm tính (trước giảm giá):</span>
                                                <strong>{calculatedPrices.subTotal.toLocaleString("vi-VN")}đ</strong>
                                            </Typography>
                                            <Divider sx={{ my: 1, borderColor: "var(--palette-primary-main)", opacity: 0.2 }} />
                                            <Typography sx={{ display: "flex", justifyContent: "space-between", color: "var(--palette-primary-dark)", fontWeight: 700, fontSize: "1.1rem" }}>
                                                <span>Tổng thanh toán mới:</span>
                                                <span>{calculatedPrices.total.toLocaleString("vi-VN")}đ</span>
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Ghi chú đặc biệt</Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            value={formData.specialCare}
                                            onChange={(e) => setFormData({ ...formData, specialCare: e.target.value })}
                                            disabled={isReadOnly}
                                        />
                                    </Grid>
                                </Stack>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <Stack spacing={3}>
                                <Card sx={{ p: 3, borderRadius: "20px", boxShadow: "var(--customShadows-card)" }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Trạng thái</Typography>
                                    <Stack spacing={2.5}>
                                        <FormControl fullWidth>
                                            <InputLabel>Trạng thái đơn</InputLabel>
                                            <Select
                                                value={formData.boardingStatus}
                                                label="Trạng thái đơn"
                                                onChange={(e) => setFormData({ ...formData, boardingStatus: e.target.value })}
                                                disabled={isReadOnly}
                                            >
                                                <MenuItem value="pending">Chờ xử lý</MenuItem>
                                                <MenuItem value="held">Giữ chỗ</MenuItem>
                                                <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                                                <MenuItem value="checked-in">Đã nhận thú</MenuItem>
                                                <MenuItem value="checked-out">Đã trả thú</MenuItem>
                                                <MenuItem value="cancelled">Đã hủy</MenuItem>
                                            </Select>
                                        </FormControl>

                                        {formData.boardingStatus === "cancelled" && (
                                            <FormControl fullWidth>
                                                <InputLabel>Lý do hủy đơn</InputLabel>
                                                <Select
                                                    value={CANCELLATION_REASONS.includes(formData.cancelledReason) ? formData.cancelledReason : (formData.cancelledReason ? "other" : "")}
                                                    label="Lý do hủy đơn"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData({ ...formData, cancelledReason: val === "other" ? "" : val });
                                                    }}
                                                    disabled={isReadOnly}
                                                >
                                                    {CANCELLATION_REASONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                                    <MenuItem value="other">Khác...</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}

                                        {formData.boardingStatus === "cancelled" && (CANCELLATION_REASONS.includes(formData.cancelledReason) === false || formData.cancelledReason === "") && (
                                            <TextField
                                                fullWidth
                                                label="Nhập lý do chi tiết"
                                                value={formData.cancelledReason === "other" ? "" : formData.cancelledReason}
                                                onChange={(e) => setFormData({ ...formData, cancelledReason: e.target.value })}
                                                placeholder="Lý do chi tiết..."
                                                disabled={isReadOnly}
                                            />
                                        )}
                                        <FormControl fullWidth>
                                            <InputLabel>Trạng thái thanh toán</InputLabel>
                                            <Select
                                                value={formData.paymentStatus}
                                                label="Trạng thái thanh toán"
                                                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                                disabled={isReadOnly}
                                            >
                                                <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                                                <MenuItem value="partial">Đặt cọc (20%)</MenuItem>
                                                <MenuItem value="paid">Đã thanh toán</MenuItem>
                                                <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </Card>

                                {!isReadOnly && (
                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={updateMut.isPending}
                                        startIcon={updateMut.isPending ? <CircularProgress size={20} color="inherit" /> : <Icon icon="solar:diskette-bold" />}
                                        sx={{ height: 48, borderRadius: "12px", fontWeight: 700, fontSize: "1rem" }}
                                    >
                                        {updateMut.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                                    </Button>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </LocalizationProvider>
    );
};


