import { ChangeEvent, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { Title } from "../../components/ui/Title";
import { prefixAdmin } from "../../constants/routes";
import { Search } from "../../components/ui/Search";
import {
    BoardingExerciseItem,
    BoardingFeedingItem,
    getBoardingBookingDetail,
    getBoardingBookings,
    getBoardingHotelStaffs,
    updateBoardingCareSchedule,
} from "../../api/boarding-booking.api";

const trangThaiChamSocOptions: Array<{ value: "pending" | "done" | "skipped"; label: string }> = [
    { value: "pending", label: "Chưa thực hiện" },
    { value: "done", label: "Đã hoàn thành" },
    { value: "skipped", label: "Bỏ qua" },
];

const taoDongLichAn = (): BoardingFeedingItem => ({
    time: "",
    food: "",
    amount: "",
    note: "",
    staffId: "",
    staffName: "",
    status: "pending",
});

const taoDongVanDong = (): BoardingExerciseItem => ({
    time: "",
    activity: "",
    durationMinutes: 0,
    note: "",
    staffId: "",
    staffName: "",
    status: "pending",
});

export const BoardingCareSchedulePage = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [careDate, setCareDate] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [careDialogOpen, setCareDialogOpen] = useState(false);
    const [careLoading, setCareLoading] = useState(false);
    const [editingBooking, setEditingBooking] = useState<any>(null);

    const [feedingDraft, setFeedingDraft] = useState<BoardingFeedingItem[]>([]);
    const [exerciseDraft, setExerciseDraft] = useState<BoardingExerciseItem[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-boarding-bookings"],
        queryFn: () => getBoardingBookings(),
    });

    const { data: hotelStaffRes } = useQuery({
        queryKey: ["admin-boarding-hotel-staffs", careDate],
        queryFn: () => getBoardingHotelStaffs(careDate || undefined),
    });

    const hotelStaffOptions = useMemo(() => {
        const list = Array.isArray(hotelStaffRes?.data) ? hotelStaffRes.data : [];
        return list.map((staff: any) => ({
            value: staff._id,
            label: `${staff.fullName || "Nhân viên"}${staff.employeeCode ? ` - ${staff.employeeCode}` : ""}`,
        }));
    }, [hotelStaffRes]);

    const getStaffId = (value: any) => {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (typeof value === "object") return String(value._id || "");
        return "";
    };

    const getStaffName = (staffId: string, fallback?: string) => {
        const found = hotelStaffOptions.find((item) => item.value === staffId);
        if (found) return found.label;
        return String(fallback || "");
    };

    const updateCareMut = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: {
                feedingSchedule: BoardingFeedingItem[];
                exerciseSchedule: BoardingExerciseItem[];
                careDate?: string;
            };
        }) => updateBoardingCareSchedule(id, payload),
        onSuccess: () => {
            toast.success("Đã cập nhật lịch chăm sóc");
            queryClient.invalidateQueries({ queryKey: ["admin-boarding-bookings"] });
            setCareDialogOpen(false);
            setEditingBooking(null);
        },
    });

    const allRows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

    const eligibleRows = useMemo(() => {
        return allRows.filter((item: any) => {
            const paymentStatus = String(item?.paymentStatus || "");
            const boardingStatus = String(item?.boardingStatus || "");
            const daThanhToan = paymentStatus === "paid";
            const daXacNhan = ["confirmed", "checked-in", "checked-out"].includes(boardingStatus);
            return daThanhToan || daXacNhan;
        });
    }, [allRows]);

    const filteredRows = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return eligibleRows.filter((item: any) => {
            if (!q) return true;
            return (
                String(item.code || "").toLowerCase().includes(q) ||
                String(item.fullName || item.userId?.fullName || "").toLowerCase().includes(q) ||
                String(item.phone || item.userId?.phone || "").toLowerCase().includes(q)
            );
        });
    }, [eligibleRows, searchQuery]);

    const moDialogChamSoc = async (bookingId: string) => {
        try {
            setCareLoading(true);
            const res = await getBoardingBookingDetail(bookingId);
            const booking = res?.data || res;
            if (!booking?._id) {
                toast.error("Không tải được chi tiết booking");
                return;
            }

            setEditingBooking(booking);
            setFeedingDraft(
                Array.isArray(booking.feedingSchedule) && booking.feedingSchedule.length > 0
                    ? booking.feedingSchedule.map((item: any) => ({
                        ...item,
                        staffId: getStaffId(item?.staffId),
                        staffName: item?.staffName || item?.staffId?.fullName || "",
                    }))
                    : [taoDongLichAn()]
            );
            setExerciseDraft(
                Array.isArray(booking.exerciseSchedule) && booking.exerciseSchedule.length > 0
                    ? booking.exerciseSchedule.map((item: any) => ({
                        ...item,
                        staffId: getStaffId(item?.staffId),
                        staffName: item?.staffName || item?.staffId?.fullName || "",
                    }))
                    : [taoDongVanDong()]
            );
            const nextCareDate = dayjs(booking.checkInDate).isValid()
                ? dayjs(booking.checkInDate).format("YYYY-MM-DD")
                : dayjs().format("YYYY-MM-DD");
            setCareDate(nextCareDate);
            setCareDialogOpen(true);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi tải dữ liệu lịch chăm sóc");
        } finally {
            setCareLoading(false);
        }
    };

    const dongDialogChamSoc = () => {
        setCareDialogOpen(false);
        setEditingBooking(null);
        setFeedingDraft([]);
        setExerciseDraft([]);
    };

    const luuLichChamSoc = () => {
        if (!editingBooking?._id) return;

        const feedingSchedule = feedingDraft
            .map((item) => ({
                time: String(item.time || "").trim(),
                food: String(item.food || "").trim(),
                amount: String(item.amount || "").trim(),
                note: String(item.note || "").trim(),
                staffId: String(getStaffId(item.staffId) || "").trim(),
                staffName: getStaffName(String(getStaffId(item.staffId) || "").trim(), item.staffName),
                status: (item.status || "pending") as "pending" | "done" | "skipped",
            }))
            .filter((item) => item.time || item.food || item.amount || item.note || item.staffId);

        const exerciseSchedule = exerciseDraft
            .map((item) => ({
                time: String(item.time || "").trim(),
                activity: String(item.activity || "").trim(),
                durationMinutes: Number(item.durationMinutes || 0),
                note: String(item.note || "").trim(),
                staffId: String(getStaffId(item.staffId) || "").trim(),
                staffName: getStaffName(String(getStaffId(item.staffId) || "").trim(), item.staffName),
                status: (item.status || "pending") as "pending" | "done" | "skipped",
            }))
            .filter((item) => item.time || item.activity || item.durationMinutes > 0 || item.note || item.staffId);

        updateCareMut.mutate({
            id: editingBooking._id,
            payload: {
                feedingSchedule,
                exerciseSchedule,
                careDate,
            },
        });
    };

    const getCareSummary = (row: any) => {
        const soLichAn = Array.isArray(row?.feedingSchedule) ? row.feedingSchedule.length : 0;
        const soVanDong = Array.isArray(row?.exerciseSchedule) ? row.exerciseSchedule.length : 0;
        const soNhanVienLichAn = Array.isArray(row?.feedingSchedule)
            ? row.feedingSchedule.filter((item: any) => Boolean(item?.staffId)).length
            : 0;
        const soNhanVienVanDong = Array.isArray(row?.exerciseSchedule)
            ? row.exerciseSchedule.filter((item: any) => Boolean(item?.staffId)).length
            : 0;
        return { soLichAn, soVanDong, soNhanVienLichAn, soNhanVienVanDong };
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: "calc(3 * var(--spacing))" }}>
            <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Title title="Lịch chăm sóc khách sạn" />
                    <Breadcrumb
                        items={[
                            { label: "Bảng điều khiển", to: `/${prefixAdmin}` },
                            { label: "Lịch chăm sóc khách sạn" },
                        ]}
                    />
                </Box>
            </Box>

            <Card
                sx={{
                    borderRadius: "var(--shape-borderRadius-lg)",
                    bgcolor: "var(--palette-background-paper)",
                    boxShadow: "var(--customShadows-card)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box sx={{ p: "20px", display: "flex", alignItems: "center", gap: 2, borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                    <Search
                        placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        maxWidth="26rem"
                    />
                </Box>

                <TableContainer sx={{ position: "relative", overflow: "unset" }}>
                    <Table sx={{ minWidth: 860 }}>
                        <TableHead sx={{ bgcolor: "var(--palette-background-neutral)" }}>
                            <TableRow>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Mã đơn</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Khách hàng</TableCell>
                                <TableCell sx={{ borderBottom: "none", color: "var(--palette-text-secondary)", fontWeight: 600, fontSize: "0.875rem" }}>Tổng quan lịch</TableCell>
                                <TableCell sx={{ borderBottom: "none", width: 160 }} align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <Typography sx={{ color: "var(--palette-text-secondary)" }}>Không có dữ liệu</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row: any) => {
                                        const summary = getCareSummary(row);
                                        return (
                                            <TableRow
                                                key={row._id}
                                                hover
                                                sx={{ "&:hover": { bgcolor: "var(--palette-action-hover)" }, transition: "background-color 0.2s" }}
                                            >
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)", textDecoration: "underline" }}>
                                                        #{row.code?.slice(-6).toUpperCase() || "N/A"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar src={row.userId?.avatar} sx={{ width: 40, height: 40, borderRadius: "var(--shape-borderRadius-sm)" }}>
                                                            {String(row.fullName || row.userId?.fullName || "?").slice(0, 1)}
                                                        </Avatar>
                                                        <Stack spacing={0.25}>
                                                            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--palette-text-primary)" }}>
                                                                {row.fullName || row.userId?.fullName || "Khách vãng lai"}
                                                            </Typography>
                                                            <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.75rem" }}>
                                                                {row.phone || row.userId?.phone || row.userId?.email || "Không có thông tin"}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Typography sx={{ color: "var(--palette-text-secondary)", fontSize: "0.8125rem" }}>
                                                        Ăn: {summary.soLichAn} (gán NVKS: {summary.soNhanVienLichAn}) | Vận động: {summary.soVanDong} (gán NVKS: {summary.soNhanVienVanDong})
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ borderBottom: "1px dashed var(--palette-background-neutral)" }}>
                                                    <Button variant="outlined" size="small" onClick={() => moDialogChamSoc(row._id)} disabled={careLoading}>
                                                        Quản lý lịch
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[10, 20, 50]}
                    component="div"
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            <Dialog open={careDialogOpen} onClose={dongDialogChamSoc} fullWidth maxWidth="lg">
                <DialogTitle>
                    Quản lý lịch chăm sóc: {editingBooking?.code || "-"}
                </DialogTitle>
                <DialogContent dividers>
                    {careLoading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                            <CircularProgress />
                        </Stack>
                    ) : (
                        <Stack spacing={3}>
                            <TextField
                                label="Ngày chăm sóc"
                                type="date"
                                size="small"
                                value={careDate}
                                onChange={(e) => setCareDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 220 }}
                            />

                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6">Lịch ăn</Typography>
                                    <Button startIcon={<AddIcon />} onClick={() => setFeedingDraft((prev) => [...prev, taoDongLichAn()])}>
                                        Thêm dòng
                                    </Button>
                                </Stack>
                                <Stack spacing={1}>
                                    {feedingDraft.map((item, idx) => (
                                        <Stack key={`feeding-${idx}`} direction="row" spacing={1} alignItems="center">
                                            <TextField
                                                label="Giờ"
                                                type="time"
                                                size="small"
                                                value={item.time || ""}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, time: e.target.value } : x))}
                                                sx={{ width: 130 }}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                label="Thức ăn"
                                                size="small"
                                                value={item.food || ""}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, food: e.target.value } : x))}
                                                sx={{ minWidth: 170 }}
                                            />
                                            <TextField
                                                label="Khẩu phần"
                                                size="small"
                                                value={item.amount || ""}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, amount: e.target.value } : x))}
                                                sx={{ minWidth: 150 }}
                                            />
                                            <TextField
                                                label="NVKS phụ trách"
                                                select
                                                size="small"
                                                value={String(getStaffId(item.staffId) || "")}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) =>
                                                    i === idx
                                                        ? {
                                                            ...x,
                                                            staffId: e.target.value,
                                                            staffName: getStaffName(e.target.value),
                                                        }
                                                        : x
                                                ))}
                                                sx={{ minWidth: 220 }}
                                            >
                                                <MenuItem value="">Chưa gán</MenuItem>
                                                {hotelStaffOptions.map((staff) => (
                                                    <MenuItem key={staff.value} value={staff.value}>{staff.label}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                label="Trạng thái"
                                                select
                                                size="small"
                                                value={item.status || "pending"}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, status: e.target.value as any } : x))}
                                                sx={{ width: 170 }}
                                            >
                                                {trangThaiChamSocOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                label="Ghi chú"
                                                size="small"
                                                value={item.note || ""}
                                                onChange={(e) => setFeedingDraft((prev) => prev.map((x, i) => i === idx ? { ...x, note: e.target.value } : x))}
                                                sx={{ flex: 1 }}
                                            />
                                            <IconButton color="error" onClick={() => setFeedingDraft((prev) => prev.filter((_, i) => i !== idx))}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>

                            <Divider />

                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6">Lịch vận động</Typography>
                                    <Button startIcon={<AddIcon />} onClick={() => setExerciseDraft((prev) => [...prev, taoDongVanDong()])}>
                                        Thêm dòng
                                    </Button>
                                </Stack>
                                <Stack spacing={1}>
                                    {exerciseDraft.map((item, idx) => (
                                        <Stack key={`exercise-${idx}`} direction="row" spacing={1} alignItems="center">
                                            <TextField
                                                label="Giờ"
                                                type="time"
                                                size="small"
                                                value={item.time || ""}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, time: e.target.value } : x))}
                                                sx={{ width: 130 }}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            <TextField
                                                label="Hoạt động"
                                                size="small"
                                                value={item.activity || ""}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, activity: e.target.value } : x))}
                                                sx={{ minWidth: 180 }}
                                            />
                                            <TextField
                                                label="Số phút"
                                                type="number"
                                                size="small"
                                                value={item.durationMinutes || 0}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, durationMinutes: Number(e.target.value || 0) } : x))}
                                                sx={{ width: 120 }}
                                            />
                                            <TextField
                                                label="NVKS phụ trách"
                                                select
                                                size="small"
                                                value={String(getStaffId(item.staffId) || "")}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) =>
                                                    i === idx
                                                        ? {
                                                            ...x,
                                                            staffId: e.target.value,
                                                            staffName: getStaffName(e.target.value),
                                                        }
                                                        : x
                                                ))}
                                                sx={{ minWidth: 220 }}
                                            >
                                                <MenuItem value="">Chưa gán</MenuItem>
                                                {hotelStaffOptions.map((staff) => (
                                                    <MenuItem key={staff.value} value={staff.value}>{staff.label}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                label="Trạng thái"
                                                select
                                                size="small"
                                                value={item.status || "pending"}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, status: e.target.value as any } : x))}
                                                sx={{ width: 170 }}
                                            >
                                                {trangThaiChamSocOptions.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </TextField>
                                            <TextField
                                                label="Ghi chú"
                                                size="small"
                                                value={item.note || ""}
                                                onChange={(e) => setExerciseDraft((prev) => prev.map((x, i) => i === idx ? { ...x, note: e.target.value } : x))}
                                                sx={{ flex: 1 }}
                                            />
                                            <IconButton color="error" onClick={() => setExerciseDraft((prev) => prev.filter((_, i) => i !== idx))}>
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={dongDialogChamSoc} disabled={updateCareMut.isPending}>Đóng</Button>
                    <Button variant="contained" onClick={luuLichChamSoc} disabled={updateCareMut.isPending || !editingBooking?._id}>
                        {updateCareMut.isPending ? "Đang lưu..." : "Lưu lịch chăm sóc"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

