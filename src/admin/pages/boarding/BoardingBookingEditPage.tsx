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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getBoardingBookingDetail, updateBoardingBookingDetail } from "../../api/boarding-booking.api";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { getBoardingCages } from "../../api/boarding-cage.api";

export const BoardingBookingEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<any>({
        checkInDate: "",
        checkOutDate: "",
        numberOfDays: 1,
        specialCare: "",
        cageId: "",
        boardingStatus: "",
        paymentStatus: "",
    });

    const { data: res, isLoading } = useQuery({
        queryKey: ["admin-boarding-booking-detail", id],
        queryFn: () => getBoardingBookingDetail(id || ""),
        enabled: !!id,
    });

    const { data: cagesRes } = useQuery({
        queryKey: ["admin-boarding-cages"],
        queryFn: () => getBoardingCages({ limit: 100 }),
    });

    const cages = cagesRes?.data?.recordList || [];

    useEffect(() => {
        if (res?.data) {
            const b = res.data;
            setFormData({
                checkInDate: b.checkInDate?.split("T")[0] || "",
                checkOutDate: b.checkOutDate?.split("T")[0] || "",
                numberOfDays: b.numberOfDays,
                specialCare: b.specialCare || b.notes || "",
                cageId: b.cageId?._id || b.cageId || "",
                boardingStatus: b.boardingStatus,
                paymentStatus: b.paymentStatus,
            });
        }
    }, [res]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMut.mutate(formData);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 20 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: "1000px", mx: "auto", p: { xs: 2, md: 3 } }}>
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

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ p: 3, borderRadius: "16px", boxShadow: "var(--customShadows-card)" }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Thông tin chung</Typography>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Ngày nhận"
                                        type="date"
                                        value={formData.checkInDate}
                                        onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Ngày trả"
                                        type="date"
                                        value={formData.checkOutDate}
                                        onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Chọn chuồng</InputLabel>
                                        <Select
                                            value={formData.cageId}
                                            label="Chọn chuồng"
                                            onChange={(e) => setFormData({ ...formData, cageId: e.target.value })}
                                        >
                                            {cages.map((cage: any) => (
                                                <MenuItem key={cage._id} value={cage._id}>
                                                    {cage.cageCode} - {cage.type} ({cage.size})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Ghi chú đặc biệt"
                                        multiline
                                        rows={4}
                                        value={formData.specialCare}
                                        onChange={(e) => setFormData({ ...formData, specialCare: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={3}>
                            <Card sx={{ p: 3, borderRadius: "16px", boxShadow: "var(--customShadows-card)" }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Trạng thái</Typography>
                                <Stack spacing={2.5}>
                                    <FormControl fullWidth>
                                        <InputLabel>Trạng thái đơn</InputLabel>
                                        <Select
                                            value={formData.boardingStatus}
                                            label="Trạng thái đơn"
                                            onChange={(e) => setFormData({ ...formData, boardingStatus: e.target.value })}
                                        >
                                            <MenuItem value="pending">Chờ xử lý</MenuItem>
                                            <MenuItem value="held">Giữ chỗ</MenuItem>
                                            <MenuItem value="confirmed">Đã xác nhận</MenuItem>
                                            <MenuItem value="checked-in">Đã nhận thú</MenuItem>
                                            <MenuItem value="checked-out">Đã trả thú</MenuItem>
                                            <MenuItem value="cancelled">Đã hủy</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Trạng thái thanh toán</InputLabel>
                                        <Select
                                            value={formData.paymentStatus}
                                            label="Trạng thái thanh toán"
                                            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                        >
                                            <MenuItem value="unpaid">Chưa thanh toán</MenuItem>
                                            <MenuItem value="partial">Đặt cọc (20%)</MenuItem>
                                            <MenuItem value="paid">Đã thanh toán</MenuItem>
                                            <MenuItem value="refunded">Đã hoàn tiền</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>
                            </Card>

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                color="primary"
                                loading={updateMut.isPending}
                                startIcon={<Icon icon="solar:diskette-bold" />}
                                sx={{ height: 48, borderRadius: "12px", fontWeight: 700, fontSize: "1rem" }}
                            >
                                Lưu thay đổi
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};
