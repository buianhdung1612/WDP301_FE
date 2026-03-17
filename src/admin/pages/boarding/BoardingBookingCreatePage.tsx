import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { createBoardingBooking } from "../../api/boarding-booking.api";
import { getBoardingCages } from "../../api/boarding-cage.api";
import { useUsers } from "../account-user/hooks/useAccountUser";
import { usePets } from "../account-user/hooks/usePet";

const boardingStatusOptions = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "held", label: "Giữ chỗ" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "checked-in", label: "Đã nhận chuồng" },
];

const paymentMethodOptions = [
    { value: "pay_at_site", label: "Thanh toán tại quầy" },
    { value: "money", label: "Tiền mặt" },
    { value: "zalopay", label: "ZaloPay" },
    { value: "vnpay", label: "VNPay" },
    { value: "prepaid", label: "Trả trước" },
];

const paymentStatusOptions = [
    { value: "unpaid", label: "Chưa thanh toán" },
    { value: "partial", label: "Đã cọc 20%" },
    { value: "paid", label: "Đã thanh toán" },
];

const normalizeCageSizeLabel = (value?: string) => {
    const raw = String(value || "").toUpperCase();
    if (raw === "S" || raw === "C") return "S (dưới 8kg)";
    if (raw === "M" || raw === "B") return "M (8-15kg)";
    if (raw === "L" || raw === "A") return "L (15-20kg)";
    if (raw === "XL_XXL" || raw === "XL" || raw === "XXL") return "XL/XXL (trên 20kg)";
    return value || "-";
};

export const BoardingBookingCreatePage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        petId: "",
        cageId: "",
        checkInDate: dayjs().format("YYYY-MM-DD"),
        checkOutDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
        fullName: "",
        phone: "",
        email: "",
        notes: "",
        specialCare: "",
        discount: 0,
        paymentMethod: "pay_at_site",
        paymentStatus: "unpaid",
        boardingStatus: "confirmed",
    });

    const { data: usersRes } = useUsers({ limit: 1000 });
    const users = useMemo(() => {
        return (usersRes as any)?.recordList || (Array.isArray(usersRes?.data) ? usersRes.data : (Array.isArray(usersRes) ? usersRes : []));
    }, [usersRes]);

    const { data: petsRes } = usePets({ userId: formData.userId, limit: 1000 });
    const pets = useMemo(() => {
        return (petsRes as any)?.recordList || (Array.isArray(petsRes?.data) ? petsRes.data : (Array.isArray(petsRes) ? petsRes : []));
    }, [petsRes]);

    const { data: cageRes } = useQuery({
        queryKey: ["admin-boarding-cages"],
        queryFn: () => getBoardingCages(),
    });

    const cages = useMemo(() => {
        const list = Array.isArray(cageRes?.data) ? cageRes.data : [];
        return list.filter((item: any) => item.status !== "maintenance");
    }, [cageRes]);

    const selectedPet = useMemo(
        () => pets.find((item: any) => item._id === formData.petId),
        [pets, formData.petId]
    );
    const selectedCage = useMemo(
        () => cages.find((item: any) => item._id === formData.cageId),
        [cages, formData.cageId]
    );

    const totalDays = useMemo(() => {
        const start = dayjs(formData.checkInDate);
        const end = dayjs(formData.checkOutDate);
        const diff = end.diff(start, "day");
        return diff > 0 ? diff : 0;
    }, [formData.checkInDate, formData.checkOutDate]);

    const pricing = useMemo(() => {
        const pricePerDay = Number(selectedCage?.dailyPrice || 0);
        const subTotal = totalDays * pricePerDay;
        const discount = Math.max(Number(formData.discount || 0), 0);
        const total = Math.max(subTotal - discount, 0);
        return { pricePerDay, subTotal, discount, total };
    }, [selectedCage, totalDays, formData.discount]);

    const createMut = useMutation({
        mutationFn: createBoardingBooking,
        onSuccess: () => {
            toast.success("Tạo đơn khách sạn thành công");
            navigate(`/${prefixAdmin}/boarding/booking-list`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể tạo đơn khách sạn");
        },
    });

    const handleChangeUser = (userId: string) => {
        const user = users.find((item: any) => item._id === userId);
        setFormData((prev) => ({
            ...prev,
            userId,
            petId: "",
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            email: user?.email || "",
        }));
    };

    const handleSubmit = () => {
        if (!formData.userId || !formData.petId || !formData.cageId) {
            toast.error("Vui lòng chọn khách hàng, thú cưng và chuồng");
            return;
        }
        if (totalDays <= 0) {
            toast.error("Ngày trả chuồng phải sau ngày nhận chuồng");
            return;
        }

        createMut.mutate({
            ...formData,
            discount: Math.max(Number(formData.discount || 0), 0),
            checkInDate: dayjs(formData.checkInDate).startOf("day").toISOString(),
            checkOutDate: dayjs(formData.checkOutDate).startOf("day").toISOString(),
        });
    };

    return (
        <Box sx={{ maxWidth: 1280, mx: "auto", p: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Title title="Tạo khách sạn mới" />
                <Breadcrumb
                    items={[
                        { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                        { label: "Khách sạn" },
                        { label: "Danh sách đơn", to: `/${prefixAdmin}/boarding/booking-list` },
                        { label: "Tạo đơn" },
                    ]}
                />
            </Box>

            <Card
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    background: "linear-gradient(120deg, #fff7ed 0%, #fff1f2 45%, #f0f9ff 100%)",
                    border: "1px solid #fed7aa",
                }}
            >
                <CardContent>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Box>
                            <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#7c2d12" }}>
                                Tạo khách sạn như lồng dịch vụ
                            </Typography>
                            <Typography sx={{ color: "#9a3412", mt: 0.5 }}>
                                Chọn khách hàng, thú cưng, chuồng và trạng thái thanh toán trước khi xác nhận.
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <Chip color="warning" label="Hotel Admin" />
                            <Chip color="info" label={`Số đêm: ${totalDays}`} />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ borderRadius: 3, border: "1px solid #fde68a" }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#7c2d12" }}>
                                    <Icon icon="solar:home-2-bold-duotone" width={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
                                    Thông tin lưu trú
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Khách hàng"
                                            value={formData.userId}
                                            onChange={(e) => handleChangeUser(e.target.value)}
                                        >
                                            {users.map((user: any) => (
                                                <MenuItem key={user._id} value={user._id}>
                                                    {user.fullName} - {user.phone || "-"}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Thú cưng"
                                            value={formData.petId}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, petId: e.target.value }))}
                                            disabled={!formData.userId}
                                        >
                                            {pets.map((pet: any) => (
                                                <MenuItem key={pet._id} value={pet._id}>
                                                    {pet.name} ({pet.breed || pet.type || "Không rõ"}) - {pet.weight || 0}kg
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Ngày nhận chuồng"
                                            value={formData.checkInDate}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, checkInDate: e.target.value }))}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Ngày trả chuồng"
                                            value={formData.checkOutDate}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, checkOutDate: e.target.value }))}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>

                                <TextField
                                    fullWidth
                                    select
                                    label="Chuồng"
                                    value={formData.cageId}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, cageId: e.target.value }))}
                                >
                                    {cages.map((cage: any) => (
                                        <MenuItem key={cage._id} value={cage._id}>
                                            {cage.cageCode} - {String(cage.type || "").toUpperCase()} - {normalizeCageSizeLabel(cage.size)} - {Number(cage.dailyPrice || 0).toLocaleString("vi-VN")}đ/ngày
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <Divider />

                                <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#0f766e" }}>
                                    Liên hệ khách hàng
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Họ tên liên hệ"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Số điện thoại"
                                            value={formData.phone}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={formData.email}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                        />
                                    </Grid>
                                </Grid>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    label="Chăm sóc đặc biệt"
                                    value={formData.specialCare}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, specialCare: e.target.value }))}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    label="Ghi chú đơn"
                                    value={formData.notes}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={2}>
                        <Card sx={{ borderRadius: 3, border: "1px solid #bfdbfe", backgroundColor: "#f8fbff" }}>
                            <CardContent>
                                <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#1d4ed8", mb: 2 }}>
                                    Trạng thái đơn
                                </Typography>
                                <Stack spacing={2}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Trạng thái lưu trú"
                                        value={formData.boardingStatus}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, boardingStatus: e.target.value }))}
                                    >
                                        {boardingStatusOptions.map((item) => (
                                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Phương thức thanh toán"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                                    >
                                        {paymentMethodOptions.map((item) => (
                                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Trạng thái thanh toán"
                                        value={formData.paymentStatus}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                                    >
                                        {paymentStatusOptions.map((item) => (
                                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Giảm giá (VNĐ)"
                                        value={formData.discount}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number(e.target.value) || 0 }))}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card sx={{ borderRadius: 3, border: "1px solid #fecaca", background: "linear-gradient(180deg, #fff7f7 0%, #fff 100%)" }}>
                            <CardContent>
                                <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#b91c1c", mb: 1.5 }}>
                                    Tóm tắt chi phí
                                </Typography>
                                <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Thú cưng</Typography>
                                        <Typography fontWeight={700}>{selectedPet?.name || "-"}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Chuồng</Typography>
                                        <Typography fontWeight={700}>{selectedCage?.cageCode || "-"}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Đơn giá/ngày</Typography>
                                        <Typography fontWeight={700}>{pricing.pricePerDay.toLocaleString("vi-VN")}VNĐ</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Số đêm</Typography>
                                        <Typography fontWeight={700}>{totalDays}</Typography>
                                    </Stack>
                                    <Divider />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Tạm tính</Typography>
                                        <Typography fontWeight={700}>{pricing.subTotal.toLocaleString("vi-VN")}VNĐ</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Giảm giá</Typography>
                                        <Typography fontWeight={700} color="error.main">-{pricing.discount.toLocaleString("vi-VN")}VNĐ</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography fontWeight={800}>Tổng cộng</Typography>
                                        <Typography fontWeight={800} color="primary.main">{pricing.total.toLocaleString("vi-VN")}VNĐ</Typography>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Alert severity="info">
                            Đơn mới sẽ kiểm tra trùng lịch chuồng trước khi tạo.
                        </Alert>

                        <Button
                            size="large"
                            variant="contained"
                            startIcon={<Icon icon="solar:diskette-bold-duotone" />}
                            onClick={handleSubmit}
                            disabled={createMut.isPending}
                        >
                            {createMut.isPending ? "Đang tạo đơn..." : "Tạo đơn khách sạn"}
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
